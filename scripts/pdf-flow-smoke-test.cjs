/*
 * Continuous-flow PDF layout smoke test.
 *
 * Renders the REAL <ItineraryPDF /> document through @react-pdf/renderer in
 * Node with a dense, realistic booking (5 itinerary days, optional tours,
 * extra services, inclusions/exclusions, terms, privacy, agent + company) and
 * then inspects the produced PDF:
 *
 *   1. verifies the `<View break />` page-break mechanism (micro document);
 *   2. reports the page count + file size of the full itinerary (regression
 *      guard against the old "one section per physical page" bloat);
 *   3. inflates every page content stream and histogrammes the text baselines,
 *      asserting that NO body text is drawn inside the footer safe zone — the
 *      dead band between the bottom page padding and the fixed footer band.
 *
 * Run: node scripts/pdf-flow-smoke-test.cjs
 */
const path = require("path");
const fs = require("fs");
const os = require("os");
const zlib = require("zlib");
const Module = require("module");
const React = require("react");
const ts = require("typescript");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");

/* ── Transpile .ts/.tsx on require + resolve the "@/…" path alias ─────────── */
const transpile = (module_, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      allowJs: true,
    },
  });
  module_._compile(outputText, filename);
};
require.extensions[".ts"] = transpile;
require.extensions[".tsx"] = transpile;

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    request = path.join(SRC, request.slice(2));
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

/* ─ react-pdf resolves string <Image src> through fs in Node: map the
 *    browser-only "/logo-kemerya.png" web path to the real public file so the
 *    Node render matches the browser build. ───────────────────────────────── */
const PUBLIC_LOGO = path.join(ROOT, "public", "logo-kemerya.png");
const originalReadFile = fs.readFile;
fs.readFile = function patchedReadFile(file, ...rest) {
  const normalized = typeof file === "string" ? file.replace(/\\/g, "/") : "";
  if (normalized.endsWith("logo-kemerya.png") && !normalized.includes("public/")) {
    return originalReadFile.call(fs, PUBLIC_LOGO, ...rest);
  }
  return originalReadFile.call(fs, file, ...rest);
};

process.chdir(ROOT);
require(path.join(SRC, "lib", "pdf-fonts.ts"));
const { Document, Page, View, Text, renderToFile, Font } = require("@react-pdf/renderer");
const { S } = require(path.join(SRC, "components", "pdf", "pdf-styles.ts"));
const ItineraryPDF = require(path.join(SRC, "components", "pdf", "itinerary-pdf.tsx")).default;

Font.registerHyphenationCallback((word) => [word]);

const OUT_DIR = path.join(os.tmpdir(), "kemerya-pdf-flow");
fs.mkdirSync(OUT_DIR, { recursive: true });

let failures = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: ${JSON.stringify(actual)}${ok ? "" : ` (expected ${JSON.stringify(expected)})`}`);
};

/* ─ PDF inspection helpers ──────────────────────────────────────────────── */
const countPages = (buffer) => (buffer.toString("latin1").match(/\/Type\s*\/Page(?![s])/g) || []).length;

/** Inflates every stream in the PDF and keeps the page content streams. */
const contentStreams = (buffer) => {
  const raw = buffer.toString("latin1");
  const streams = [];
  let index = 0;
  for (;;) {
    const start = raw.indexOf("stream", index);
    if (start === -1) break;
    let begin = start + "stream".length;
    if (raw[begin] === "\r") begin += 1;
    if (raw[begin] === "\n") begin += 1;
    const end = raw.indexOf("endstream", begin);
    if (end === -1) break;
    const chunk = Buffer.from(raw.slice(begin, end), "latin1");
    index = end + "endstream".length;
    let text;
    try {
      text = zlib.inflateSync(chunk).toString("latin1");
    } catch {
      text = chunk.toString("latin1");
    }
    // A page content stream always opens a text object and shows text.
    if (/\bBT\b/.test(text) && /\b(Tj|TJ)\b/.test(text)) streams.push(text);
  }
  return streams;
};

/** 2D transformation matrix multiply (row-vector convention, like PDF). */
const multiply = (m1, m2) => [
  m1[0] * m2[0] + m1[1] * m2[2],
  m1[0] * m2[1] + m1[1] * m2[3],
  m1[2] * m2[0] + m1[3] * m2[2],
  m1[2] * m2[1] + m1[3] * m2[3],
  m1[4] * m2[0] + m1[5] * m2[2] + m2[4],
  m1[4] * m2[1] + m1[5] * m2[3] + m2[5],
];

/** Absolute text baselines of a page stream, in PDF device coordinates
 *  (bottom-up: 0 = page bottom). react-pdf wraps every text run in its own
 *  flip transform, so the raw Tm values must be composed with the whole
 *  q/Q/cm transform stack before they mean anything. */
const textBaselines = (content) => {
  const stack = [];
  let ctm = [1, 0, 0, 1, 0, 0];
  let tm = [1, 0, 0, 1, 0, 0];
  const baselines = [];
  const token =
    /(?:(q)\b)|(?:(Q)\b)|(?:(BT)\b)|(?:(?:(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(cm|Tm)))|(?:(?:(-?[\d.]+)\s+(-?[\d.]+)\s+(Td|TD)))/g;
  let match;
  while ((match = token.exec(content))) {
    if (match[1]) {
      stack.push(ctm.slice());
      continue;
    }
    if (match[2]) {
      if (stack.length) ctm = stack.pop();
      continue;
    }
    if (match[3]) {
      tm = [1, 0, 0, 1, 0, 0];
      continue;
    }
    if (match[10]) {                                        // cm | Tm  (6 numbers)
      const m = [match[4], match[5], match[6], match[7], match[8], match[9]].map(Number);
      if (match[10] === "cm") {
        ctm = multiply(ctm, m);
      } else {
        tm = m;
        baselines.push(multiply(tm, ctm)[5]);               // text line baseline
      }
      continue;
    }
    if (match[13]) {                                        // Td | TD (2 numbers)
      tm = multiply(tm, [1, 0, 0, 1, Number(match[11]), Number(match[12])]);
      baselines.push(multiply(tm, ctm)[5]);
    }
  }
  return baselines;
};

const countCurves = (content) => (content.match(/[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+c\b/g) || []).length;

/* ── 1. `<View break />` mechanism (micro documents) ─────────────────────── */
/* react-pdf only honours `break` on a node the pagination engine is actually
 * splitting, so the placement of the break marker matters:
 *   direct → `<Page wrap>` → <View break /> as a direct child of the Page
 *   nested → the break marker lives inside a wrapping container View        */
const block = (label) => React.createElement(Text, { key: label, style: { fontSize: 10 } }, label);
const microDoc = (withBreaks, placement) =>
  React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: S.page, wrap: true },
      placement === "direct"
        ? [
            block("one"),
            withBreaks ? React.createElement(View, { key: "brk-1", break: true }) : null,
            block("two"),
            withBreaks ? React.createElement(View, { key: "brk-2", break: true }) : null,
            block("three"),
          ]
        : React.createElement(
            View,
            { style: S.section },
            block("one"),
            withBreaks ? React.createElement(View, { key: "brk-1", break: true }) : null,
            block("two"),
            withBreaks ? React.createElement(View, { key: "brk-2", break: true }) : null,
            block("three")
          )
    )
  );

/* ── 2. Full document fixture (dense, realistic) ─────────────────────────── */
const itineraryDays = [
  { day: 1, title: "Arrival in Cairo & Giza Pyramids", description: "Meet and greet at Cairo International Airport, private transfer to your pyramids-view hotel, then the Great Pyramids of Giza and the Sphinx at golden hour.", accommodation: "Pyramids View Hotel", meals: ["Breakfast", "Lunch"] },
  { day: 2, title: "Egyptian Museum & Old Cairo", description: "The Grand Egyptian Museum, the treasures of Tutankhamun, then the Hanging Church and Khan El Khalili bazaar.", accommodation: "Pyramids View Hotel", meals: ["Breakfast"] },
  { day: 3, title: "Fly to Luxor & Karnak Temple", description: "Morning flight to Luxor, check-in on board your Nile cruise, guided tour of Karnak Temple and Luxor Temple.", accommodation: "MS Nile Cruise", meals: ["Breakfast", "Lunch", "Dinner"] },
  { day: 4, title: "Valley of the Kings & Hatshepsut", description: "Cross to the West Bank for the Valley of the Kings, the Temple of Hatshepsut and the Colossi of Memnon. Optional sunset felucca ride.", accommodation: "MS Nile Cruise", meals: ["Breakfast", "Lunch", "Dinner"] },
  { day: 5, title: "Edfu Temple & Kom Ombo", description: "Sail south visiting the Temple of Horus at Edfu and the double temple of Kom Ombo before a farewell dinner on deck.", accommodation: "MS Nile Cruise", meals: ["Breakfast", "Lunch", "Dinner"] },
];

const tour = {
  id: "tour-001",
  subCategoryId: "sc-019",
  mainCategoryId: "mc-004",
  title: "5 Days Cairo, Giza & Nile Cruise",
  slug: "5-days-cairo-giza-nile-cruise",
  durationDays: 5,
  durationNights: 4,
  durationLabel: "5 Days / 4 Nights",
  location: "Cairo, Giza & Luxor",
  group: "Private Tour",
  language: "All Languages",
  overview: [
    "Discover the very best of Egypt on this private five-day journey: the pyramids of Giza, the treasures of the Grand Egyptian Museum and a relaxing Nile cruise between Luxor and Aswan.",
    "Every transfer, entry ticket and guided visit is arranged in advance so you only have to enjoy the moment — with a dedicated operations manager available around the clock.",
  ],
  longDescription: "Discover the very best of Egypt on this private five-day journey.",
  itinerary: itineraryDays,
  inclusions: [
    "5 nights accommodation in 5-star hotels and Nile cruise",
    "Daily breakfast, plus lunch and dinner on cruise days",
    "All transfers in private air-conditioned vehicles",
    "English-speaking Egyptologist guide throughout",
    "Entrance fees to every site mentioned in the itinerary",
    "Domestic flight Cairo - Luxor",
    "Bottled water on all touring days",
    "24/7 emergency support line",
  ],
  exclusions: [
    "International flight tickets",
    "Egypt entry visa",
    "Travel insurance",
    "Personal expenses and gratuities",
    "Beverages during meals",
  ],
};

const booking = {
  id: "bk-20260914-001",
  isCustomTour: false,
  tourId: tour.id,
  travelers: { adults: 2, children: 1, infants: 0 },
  currency: "USD",
  totalPrice: 2450,
  offerPrice: 2200,
  offerTitle: "Early Bird Offer",
  offerNote: "Confirmed and paid before 1 October 2026 — includes a complimentary Nile dinner cruise.",
  startDate: "2026-10-01",
  endDate: "2026-10-05",
  clientName: "John Smith",
  clientPhone: "+44 7700 900123",
  clientCountry: "United Kingdom",
  notes: "Please arrange a birthday cake on day 3 and a table for three at the welcome dinner.",
  specialRequests: "One traveler requires wheelchair access at all sites and hotels.",
  specialRequestItems: [{ id: "sr-1", description: "Private Nile dinner cruise", price: 95 }],
  optionalTours: [
    { title: "Cairo Old City Walking Tour", location: "Cairo", time: "14:00", day: 1, price: 60 },
    { title: "Abu Simbel Day Trip", location: "Aswan", time: "04:00", day: 3, price: 180 },
    { title: "Hot Air Balloon at Sunrise", location: "Luxor", time: "05:00", day: 4, price: 130 },
  ],
  createdAt: "2026-09-14T09:30:00.000Z",
  agentName: "Omar Elshemy",
};

/* ── 3. Inspect the rendered documents ───────────────────────────────────── */
const report = (label, file) => {
  const buffer = fs.readFileSync(file);
  const pages = countPages(buffer);
  const streams = contentStreams(buffer);

  console.log(`\n── ${label} ───────────────────────────────────────────────`);
  console.log(`pages: ${pages}   size: ${(buffer.length / 1024).toFixed(1)} KB   content streams: ${streams.length}`);
  console.log("page | text ops | footer(<55) | DEAD(55-135) | body(135-690) | header(>690) | curves");

  let deadZoneHits = 0;
  streams.forEach((stream, i) => {
    const baselines = textBaselines(stream);
    const band = (lo, hi) => baselines.filter((y) => y >= lo && y < hi).length;
    const dead = band(55, 135);
    deadZoneHits += dead;
    console.log(
      `  ${String(i + 1).padStart(3)} | ${String(baselines.length).padStart(8)} | ${String(band(-1e9, 55)).padStart(11)} | ${String(dead).padStart(12)} | ${String(band(135, 690)).padStart(12)} | ${String(band(690, 1e9)).padStart(11)} | ${String(countCurves(stream)).padStart(6)}`
    );
  });

  check(`${label}: no text inside the footer safe zone`, deadZoneHits, 0);
  return { pages, bytes: buffer.length };
};

const run = async () => {
  console.log("── `<View break />` mechanism ────────────────────────────────────────");
  const micro = async (name, withBreaks, placement) => {
    const file = path.join(OUT_DIR, `micro-${name}.pdf`);
    await renderToFile(microDoc(withBreaks, placement), file);
    return countPages(fs.readFileSync(file));
  };
  check("direct child: 3 short blocks without breaks stay on one page", await micro("direct-plain", false, "direct"), 1);
  check("direct child: 2 breaks → three pages", await micro("direct-break", true, "direct"), 3);
  check("nested in a View: 3 short blocks without breaks stay on one page", await micro("nested-plain", false, "nested"), 1);
  // react-pdf only honours `break` on DIRECT Page children — a break nested
  // inside a wrapping View is ignored (stays on one page). The real document
  // keeps every section + `<View break />` as a direct Page child, so the
  // intentional DayByDay break still works (see direct-break above).
  check("nested in a View: breaks are ignored → one page (react-pdf rule)", await micro("nested-break", true, "nested"), 1);

  const full = path.join(OUT_DIR, "itinerary.pdf");
  await renderToFile(React.createElement(ItineraryPDF, { tour, booking, languageCode: "en" }), full);
  report("en · full itinerary", full);

  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  console.log(`artifacts: ${OUT_DIR}`);
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((error) => {
  console.error("FAIL: react-pdf render error:", (error && error.stack) || error);
  process.exit(1);
});