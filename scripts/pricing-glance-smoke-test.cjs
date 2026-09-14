/*
 * Smoke test for the PRICING AT A GLANCE section (PDF page 1).
 *
 *  1. asserts computePricing() — including the spec example: $910.00 total
 *     → $318.50 deposit / $591.50 remaining;
 *  2. renders the REAL <PricingAtAGlance /> component through
 *     @react-pdf/renderer in Node (catches react-pdf style / runtime errors)
 *     for: no-offer, offer, and every registered body font (weight 700).
 *
 * Run: node scripts/pricing-glance-smoke-test.cjs
 */
const path = require("path");
const fs = require("fs");
const os = require("os");
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

/* ── Load the real font registration + the section under test ────────────── */
require(path.join(SRC, "lib", "pdf-fonts.ts"));
const { Document, Page, View, renderToFile, Font } = require("@react-pdf/renderer");
const { S } = require(path.join(SRC, "components", "pdf", "pdf-styles.ts"));
const { PricingAtAGlance, computePricing } = require(
  path.join(SRC, "components", "pdf", "sections", "PricingAtAGlance.tsx")
);
const { formatCurrency } = require(path.join(SRC, "lib", "utils.ts"));

Font.registerHyphenationCallback((word) => [word]);

const OUT_DIR = path.join(os.tmpdir(), "kemerya-pricing-glance");
fs.mkdirSync(OUT_DIR, { recursive: true });

/* ── 1. Math assertions ──────────────────────────────────────────────────── */
let failures = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: ${JSON.stringify(actual)}${ok ? "" : ` (expected ${JSON.stringify(expected)})`}`);
};

const booking = (over = {}) => ({
  id: "bk-20260914-001",
  isCustomTour: false,
  currency: "USD",
  totalPrice: 910,
  startDate: "2026-10-01",
  endDate: "2026-10-05",
  createdAt: "2026-09-14T00:00:00.000Z",
  travelers: { adults: 1, children: 0, infants: 0 },
  ...over,
});

// Spec example: single adult, $910.00 package.
const single = computePricing(booking());
check("no-offer finalTotal", single.finalTotal, 910);
check("no-offer perPerson", single.perPerson, 910);
check("no-offer deposit (35%)", single.deposit, 318.5);
check("no-offer remaining (65%)", single.remaining, 591.5);
check("no-offer formatted total", formatCurrency(single.listTotal, single.currency), "$910.00");
check("no-offer formatted deposit", formatCurrency(single.deposit, single.currency), "$318.50");
check("no-offer formatted remaining", formatCurrency(single.remaining, single.currency), "$591.50");

// Offer price replaces the list price everywhere.
const offered = computePricing(booking({ totalPrice: 1000, offerPrice: 800, travelers: { adults: 2, children: 1, infants: 0 } }));
check("offer finalTotal", offered.finalTotal, 800);
check("offer savings", offered.savings, 200);
check("offer discountPct", offered.discountPct, 20);
check("offer perPerson", Math.round(offered.perPerson * 100) / 100, 266.67);
check("offer deposit", offered.deposit, 280);
check("offer remaining", offered.remaining, 520);

// Odd cents keep deposit + remaining === finalTotal.
const odd = computePricing(booking({ totalPrice: 1234.56 }));
check("odd deposit", odd.deposit, 432.1);
check("odd remaining", odd.remaining, 802.46);
check("odd deposit + remaining = total", Math.round((odd.deposit + odd.remaining) * 100) / 100, 1234.56);

// Manual per-person override + zero-traveler safety.
check("manual pricePerPerson", computePricing(booking({ pricePerPerson: 455 })).perPerson, 455);
check("zero travelers -> 1", computePricing(booking({ travelers: { adults: 0, children: 0, infants: 0 } })).travelers, 1);
check("EUR currency passthrough", computePricing(booking({ currency: "EUR" })).currency, "EUR");

/* ─ 2. Render the real component (react-pdf runtime validation) ─────────── */
const hello = (k, fb) => fb; // English fallbacks = untranslated PDF output
const ctx = { S, label: hello, headingStyle: {}, cinzelStyle: {} };

const page = (family, bookingData, travelersText) =>
  React.createElement(
    Page,
    { size: "A4", style: [S.page, { fontFamily: family }], wrap: true },
    React.createElement(
      View,
      null,
      React.createElement(PricingAtAGlance, {
        ctx,
        booking: bookingData,
        travelersText,
        sectionNumber: "01",
      })
    )
  );

const doc = React.createElement(
  Document,
  null,
  // Latin default (Lora 700 + Cinzel) — money values are bold
  page("Lora", booking(), "1 Adult"),
  // Offer case: struck-through old price + offer price + savings caption
  page(
    "Lora",
    booking({ totalPrice: 1000, offerPrice: 800, offerTitle: "Exclusive Tour Offer", offerNote: "Valid this week only.", travelers: { adults: 2, children: 1, infants: 0 } }),
    "2 Adults, 1 Child"
  ),
  // Only a title (no note) and only a note (no title)
  page("Lora", booking({ offerPrice: 850, offerTitle: "October Deal" }), "1 Adult"),
  page("Lora", booking({ offerPrice: 890, offerNote: "Includes all transfers." }), "1 Adult, 1 Infant"),
  // Non-Latin body fonts must resolve weight 700 (registered per family)
  page("Cairo", booking({ currency: "EUR" }), "1 Adult, 2 Children"),
  page("NotoSansHebrew", booking({ currency: "EUR" }), "2 Adults"),
  page("NotoSansSC", booking(), "3 Adults"),
  page("NotoSansJP", booking(), "1 Adult")
);

const outFile = path.join(OUT_DIR, "pricing-at-a-glance.pdf");

renderToFile(doc, outFile)
  .then(() => {
    const bytes = fs.statSync(outFile).size;
    console.log(`PASS  rendered ${path.relative(ROOT, outFile)} (${bytes} bytes, 8 pages)`);
    if (bytes < 2000) failures++;
    console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
    process.exit(failures === 0 ? 0 : 1);
  })
  .catch((e) => {
    console.error("FAIL: react-pdf render error:", (e && e.stack) || e);
    process.exit(1);
  });