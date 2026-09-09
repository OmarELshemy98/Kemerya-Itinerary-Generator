import * as cheerio from "cheerio";
import type {
  MainCategory,
  SubCategory,
  Tour,
  ItineraryDay,
} from "@/types";
import { MAIN_CATEGORIES, SUB_CATEGORIES } from "@/data/tours";

export const KEMERYA_BASE_URL = "https://www.kemeryatours.com";

export const MAIN_CATEGORY_URLS: Record<string, string> = {
  "mc-001": `${KEMERYA_BASE_URL}/egypt-day-tours`,
  "mc-002": `${KEMERYA_BASE_URL}/egypt-nile-cruise-tours`,
  "mc-003": `${KEMERYA_BASE_URL}/egypt-shore-excursions`,
  "mc-004": `${KEMERYA_BASE_URL}/egypt-travel-packages`,
};

const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const REQUEST_DELAY_MS = 300;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": DEFAULT_UA,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  }
  return await res.text();
}

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanText(s: string | undefined | null): string {
  return (s || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function extractPriceUSD(text: string): number | null {
  const m = text.match(/\$\s*([\d,]+(?:\.\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ""));
  return isFinite(n) ? n : null;
}

function extractDaysFromText(text: string): number | null {
  const mDaysNights = text.match(/(\d+)\s*[Dd]ays?\s*[\/\-]\s*(\d+)\s*[Nn]ights?/);
  if (mDaysNights) return parseInt(mDaysNights[1], 10);
  const mDash = text.match(/(\d+)\s*[Dd]ays?\s*-\s*(\d+)\s*[Nn]ights?/);
  if (mDash) return parseInt(mDash[1], 10);
  const m1 = text.match(/(\d+)\s*[-\s]*\s*(day|days|Day|Days)\b/i);
  if (m1) return parseInt(m1[1], 10);
  const m2 = text.match(/(\d+)\s*[-\s]*\s*(night|nights|Night|Nights)\b/i);
  if (m2) return parseInt(m2[1], 10) + 1;
  const m3 = text.match(/(\d+)\s*[-\/]\s*(\d+)\s*(day|night)/i);
  if (m3) return parseInt(m3[1], 10);
  if (/\bFull\s*Day\b/i.test(text)) return 1;
  if (/\bHalf\s*Day\b/i.test(text)) return 1;
  if (/\bOvernight\b/i.test(text)) return 2;
  return null;
}

function findMainCategoryByUrl(url: string): MainCategory | undefined {
  for (const mc of MAIN_CATEGORIES) {
    const mcUrl = MAIN_CATEGORY_URLS[mc.id];
    if (mcUrl && url.startsWith(mcUrl)) return mc;
  }
  return undefined;
}

function matchExistingSubCategory(
  mainCatId: string,
  slug: string,
  name: string
): SubCategory | undefined {
  const candidates = SUB_CATEGORIES.filter(
    (s) => s.mainCategoryId === mainCatId
  );
  const exactSlug = candidates.find((s) => s.slug === slug);
  if (exactSlug) return exactSlug;
  const sameName = candidates.find(
    (s) => cleanText(s.name).toLowerCase() === cleanText(name).toLowerCase()
  );
  if (sameName) return sameName;
  const slugLike = candidates.find((s) => {
    const a = toSlug(s.name);
    const b = slug;
    return a === b || a.includes(b) || b.includes(a);
  });
  return slugLike;
}

function absUrl(href: string): string {
  const h = (href || "").trim();
  if (!h) return "";
  if (h.startsWith("http")) return h;
  if (h.startsWith("//")) return `https:${h}`;
  if (h.startsWith("/")) return `${KEMERYA_BASE_URL}${h}`;
  return h;
}

export interface ScrapedSubCategory {
  name: string;
  slug: string;
  url: string;
  description?: string;
  image?: string;
  matchedSubCategory?: SubCategory;
  mainCategoryId: string;
}

export function parseMainCategoryPage(
  html: string,
  mainCatUrl: string
): ScrapedSubCategory[] {
  const $ = cheerio.load(html);
  const out: ScrapedSubCategory[] = [];
  const mainCat = findMainCategoryByUrl(mainCatUrl);
  const mainCatId = mainCat?.id || "";

  const links = $("a");
  const seen = new Set<string>();

  links.each((_, el) => {
    const href = $(el).attr("href") || "";
    const absHref = href.startsWith("http")
      ? href
      : href.startsWith("/")
      ? `${KEMERYA_BASE_URL}${href}`
      : "";
    if (!absHref || !absHref.startsWith(mainCatUrl + "/")) return;
    const parts = absHref.split("/").filter(Boolean);
    if (parts.length !== 4) return;
    const slug = parts[parts.length - 1];
    if (seen.has(absHref)) return;
    seen.add(absHref);
    const h3 = $(el).find("h3").first();
    const h2 = $(el).find("h2").first();
    const titleEl = h3.length ? h3 : h2.length ? h2 : null;
    let title = cleanText(titleEl?.text());
    if (!title) {
      title = cleanText($(el).text()).slice(0, 80);
    }
    if (!title) return;

    const img = $(el).find("img").first();
    const imgSrc =
      img.attr("src") || img.attr("data-src") || img.attr("data-lazy-src");

    const descCandidates = $(el)
      .find("p, span, div")
      .filter((_, ch) => {
        const t = cleanText($(ch).clone().children().remove().end().text());
        return t.length > 30 && t.length < 600;
      });
    let description: string | undefined;
    if (descCandidates.length) {
      description = cleanText(
        $(descCandidates.first()).clone().children().remove().end().text()
      ).slice(0, 280);
    }
    if (!description) {
      const inner = cleanText($(el).text()).slice(title.length);
      if (inner.length > 20) description = inner.slice(0, 280);
    }

    const matched = matchExistingSubCategory(mainCatId, slug, title);

    out.push({
      name: title,
      slug,
      url: absHref,
      description,
      image: imgSrc,
      matchedSubCategory: matched,
      mainCategoryId: mainCatId,
    });
  });

  return out;
}

export interface ScrapedTourListItem {
  title: string;
  slug: string;
  url: string;
  priceUSD?: number;
  shortDescription?: string;
  durationText?: string;
  image?: string;
  mainCategoryId: string;
  subCategoryId?: string;
  rawDurationDays?: number;
}

export function parseSubCategoryPage(
  html: string,
  subCategoryUrl: string,
  mainCatId: string,
  subCatId?: string
): ScrapedTourListItem[] {
  const $ = cheerio.load(html);
  const out: ScrapedTourListItem[] = [];
  const seen = new Set<string>();

  $(".tour-card.card, a.tour-card").each((_, el) => {
    const href = $(el).attr("href") || "";
    const absHref = href.startsWith("http")
      ? href
      : href.startsWith("/")
      ? `${KEMERYA_BASE_URL}${href}`
      : "";
    if (!absHref) return;
    const parts = absHref.split("/").filter(Boolean);
    if (parts.length !== 5) return;
    const slug = parts[parts.length - 1];
    if (seen.has(absHref)) return;
    seen.add(absHref);

    const h3 = $(el).find("h3").first();
    let title = cleanText(h3.text());
    if (!title) {
      title = cleanText($(el).text()).slice(0, 100);
    }
    if (!title) return;

    const img = $(el).find("img").first();
    const image =
      img.attr("src") || img.attr("data-src") || img.attr("data-lazy-src");

    const innerText = cleanText($(el).text());
    const price = extractPriceUSD(innerText);

    const durationRegex =
      /(\d+\s*[-–]\s*\d+\s*(?:Hours?|Days?|Nights?)|\d+\s*(?:Hours?|Days?|Nights?|Days?\s*\/\s*\d+\s*Nights?))\b/gi;
    const durationMatches = innerText.match(durationRegex);
    let durationText: string | undefined;
    if (durationMatches && durationMatches.length) {
      durationText = durationMatches[0].trim();
    }
    let rawDays = durationText ? extractDaysFromText(durationText) : null;
    if (!rawDays) rawDays = extractDaysFromText(title);

    const afterTitle = innerText.slice(title.length);
    let shortDescription: string | undefined;
    const descCandidate = afterTitle
      .replace(/From\s*\$[\d.,]+\s*Per\s*person/i, "")
      .replace(durationRegex, "")
      .replace(/\s+/g, " ")
      .trim();
    if (descCandidate.length > 20) {
      shortDescription = descCandidate.slice(0, 250);
    }

    out.push({
      title,
      slug,
      url: absHref,
      priceUSD: price ?? undefined,
      shortDescription,
      durationText,
      image,
      mainCategoryId: mainCatId,
      subCategoryId: subCatId,
      rawDurationDays: rawDays ?? undefined,
    });
  });

  return out;
}

export interface ScrapedDayItinerary {
  day: number;
  title: string;
  items: string[];
}

export interface ScrapedTourDetails {
  title: string;
  priceUSD?: number;
  pricesTable?: { personsLabel: string; priceUSD: number }[];
  inclusions: string[];
  exclusions: string[];
  itineraryItems: string[];
  dayItinerary: ScrapedDayItinerary[];
  overviewText?: string;
  /** Same overview split into clean paragraphs (website #overview-text) */
  overviewParagraphs?: string[];
  /** Raw inner HTML of #overview-text (paragraphs preserved) */
  overviewHtml?: string;
  durationText?: string;
  locationText?: string;
  groupText?: string;
  languageText?: string;
  meetingPoint?: string;
  meetingPointHtml?: string;
  meetingPointImages?: string[];
  /** FAQ accordion (.travel-faq .faq-item) */
  tripNotes?: { question: string; answer: string }[];
  mainImage?: string;
  gallery?: string[];
  durationDays?: number;
  durationNights?: number;
  longDescription?: string;
  highlights?: string[];
}

export function parseTourDetailsPage(html: string): ScrapedTourDetails {
  const $ = cheerio.load(html);

  const title = cleanText($("h1").first().text());

  const bodyText = cleanText($("body").text());
  const priceMatches = [
    ...bodyText.matchAll(/\$\s*([\d,]+(?:\.\d+)?)/g),
  ].map((m) => parseFloat(m[1].replace(/,/g, "")));
  const fromPriceMatch = bodyText.match(
    /From[^\n\r\$]{0,6}\$\s*([\d,]+(?:\.\d+)?)\s*Per\s*person/i
  );
  const priceUSD = fromPriceMatch
    ? parseFloat(fromPriceMatch[1].replace(/,/g, ""))
    : priceMatches.length
    ? Math.min(...priceMatches)
    : undefined;

  // ---------- Hero meta (.td-quick: span label + strong value) ----------
  // e.g. Price $56 / Duration Full Day / Group Cairo Day Tours /
  //      Location Cairo & Giza / Language All Language
  const heroMeta = (() => {
    const meta: Record<string, string> = {};
    $(".td-quick > div").each((_, el) => {
      const label = cleanText($(el).find("span").first().text()).toLowerCase();
      const value = cleanText($(el).find("strong").first().text());
      if (label && value) meta[label] = value;
    });
    return meta;
  })();

  let durationText: string | undefined = heroMeta["duration"];
  let locationText: string | undefined = heroMeta["location"];
  let groupText: string | undefined = heroMeta["group"];
  let languageText: string | undefined = heroMeta["language"];
  // Fallback to regex scan for older/variant markup
  if (!durationText || !locationText || !groupText) {
    const metaBox = $("main").first().text() || bodyText;
    const durM = metaBox.match(/Duration\s*([\s\S]{0,80}?)(?=Location|Group|Language|Price|\n{2,})/i);
    if (durM && !durationText) durationText = cleanText(durM[1]);
    const locM = metaBox.match(/Location\s*([\s\S]{0,80}?)(?=Duration|Group|Language|Price|\n{2,})/i);
    if (locM && !locationText) locationText = cleanText(locM[1]);
    const grpM = metaBox.match(/Group\s*([\s\S]{0,80}?)(?=Location|Duration|Language|Price|\n{2,})/i);
    if (grpM && !groupText) groupText = cleanText(grpM[1]);
  }

  // ---------- Gallery (.tour-gallery .tour-img — href = full-size webp) ----------
  const gallerySrcs = $(".tour-gallery .tour-img, #lightgallery a")
    .map((_, a) => $(a).attr("href") || $(a).find("img").attr("src") || "")
    .toArray();
  const gallery = Array.from(
    new Set(
      (gallerySrcs as unknown as string[])
        .map((s) => absUrl(s || ""))
        .filter((s) => s && s.startsWith("http"))
        .slice(0, 8)
    )
  ) as string[];
  const mainImage = gallery[0];

  // ---------- Targeted extraction (matches the live Kemerya tour page markup) ----------
  const itinerarySection = $("#itinerary");
  const includedSection = $("#included");
  const pricesSection = $("#prices");

  const targetedInclusions: string[] = [];
  const targetedExclusions: string[] = [];
  const targetedTables: { personsLabel: string; priceUSD: number }[] = [];

  const readTablesInto = (
    root: any,
    out: { personsLabel: string; priceUSD: number }[]
  ) => {
    root.find("table").each((_i: number, tbl: any) => {
      $(tbl)
        .find("tr")
        .each((_j: number, tr: any) => {
          const cellsEls = $(tr)
            .find("td, th")
            .map((_, c) => cleanText($(c).text()))
            .toArray();
          const cells = cellsEls as unknown as string[];
          if (cells.length < 2) return;
          // Header row guard: "Number of Persons | Price per person"
          if (/number of persons/i.test(cells[0]) && /price/i.test(cells[1])) return;
          const pCell = cells.find((c) => /\$/.test(c));
          if (!pCell) return;
          const personsCell =
            cells.find((c) => c !== pCell && /(person|group|single|double|twin|suite|people)/i.test(c)) ||
            cells.find((c) => c !== pCell);
          const p = extractPriceUSD(pCell);
          if (!p || !personsCell) return;
          // Normalize labels like "2 -\n3 Persons" -> "2 - 3 Persons"
          const label = personsCell.replace(/\s+/g, " ").replace(/(\d)\s*-\s*(\d)/, "$1 - $2").trim();
          out.push({ personsLabel: label, priceUSD: p });
        });
    });
  };

  if (includedSection.length > 0) {
    includedSection.find(".td-inc-box").each((_, box) => {
      const boxTitle = cleanText($(box).find(".td-inc-title h3, h3").first().text());
      const boxClass = $(box).attr("class") || "";
      const isExcluded =
        /excluded/i.test(boxClass) || /not\s*included|excluded/i.test(boxTitle);
      const isIncluded = /included/i.test(boxClass) && !isExcluded;
      if (!isIncluded && !isExcluded) return;
      const raw = $(box)
        .find("li")
        .map((_, li) => cleanText($(li).text()))
        .toArray() as unknown as string[];
      const items = raw.filter((t) => t.length > 1);
      if (isExcluded) targetedExclusions.push(...items);
      else targetedInclusions.push(...items);
    });
  }

  const dayItinerary: ScrapedDayItinerary[] = [];
  if (itinerarySection.length > 0) {
    const tlItems = itinerarySection.find(".timeline-item");
    tlItems.each((_, item) => {
      const head = $(item).find(".timeline-head").first();
      const label = cleanText(head.find("strong").first().text());
      const h3 = cleanText(head.find("h3").first().text());
      const lm = label.match(/day\s*(\d+)/i);
      const dayNum = lm ? parseInt(lm[1], 10) : dayItinerary.length + 1;
      const titleParts = [label, h3].filter(Boolean);
      const title = titleParts.length ? titleParts.join(": ") : `Day ${dayNum}`;
      const body = $(item).find(".timeline-body").first();
      const bodyRoot = body.length > 0 ? body : $(item);
      let items = (
        bodyRoot
          .find("li")
          .map((_, li) => cleanText($(li).text()))
          .toArray() as unknown as string[]
      ).filter((t) => t.length > 1);
      if (items.length === 0) {
        items = (
          bodyRoot
            .find("p")
            .map((_, p) => cleanText($(p).text()))
            .toArray() as unknown as string[]
        ).filter((t) => t.length > 1);
      }
      dayItinerary.push({ day: dayNum, title, items });
    });
  }

  if (pricesSection.length > 0) readTablesInto(pricesSection, targetedTables);

  const hasTimelineDays = dayItinerary.length > 0;

  // ---------- Generic fallback scan (pages without structured sections) ----------
  const lists: { prevHeading: string | null; items: string[] }[] = [];
  
  let currentDayNumber: number | null = null;
  let currentDayTitle: string = "";
  let currentDayItems: string[] = [];
  
  // Find all headings and lists in order
  const genericScanRoot = itinerarySection.length > 0
    ? itinerarySection
    : $("main").length > 0
    ? $("main")
    : $("body");
  genericScanRoot.find("h1, h2, h3, h4, h5, h6, ul, ol").each((_, el) => {
    const tagName = (el as any).tagName?.toLowerCase() || "";
    
    if (/^h[1-6]$/i.test(tagName)) {
      // Save previous day if exists
      if (!hasTimelineDays && currentDayNumber !== null && currentDayItems.length > 0) {
        dayItinerary.push({
          day: currentDayNumber,
          title: currentDayTitle || `Day ${currentDayNumber}`,
          items: [...currentDayItems],
        });
      }
      
      const headingText = cleanText($(el).text());
      // Check if this is a day heading
      const dayMatch = headingText.match(/^day\s*(\d+)\s*[:\-–]?\s*(.*)$/i);
      if (dayMatch) {
        currentDayNumber = parseInt(dayMatch[1], 10);
        currentDayTitle = dayMatch[2]?.trim() || `Day ${currentDayNumber}`;
        currentDayItems = [];
      } else {
        // Not a day heading, reset
        currentDayNumber = null;
        currentDayTitle = "";
        currentDayItems = [];
      }
    } else if (tagName === "ul" || tagName === "ol") {
      const itemEls = $(el)
        .find("li")
        .map((_, li) => cleanText($(li).text()))
        .toArray();
      const items = (itemEls as unknown as string[]).filter(
        (t) => t.length > 2 && t.length < 500
      );
      
      if (items.length > 0) {
        if (currentDayNumber !== null) {
          // Add items to current day
          currentDayItems.push(...items);
        } else {
          // No day heading, use previous heading logic
          let p: any = (el as any).previousSibling;
          let prevHeading: string | null = null;
          let guard = 0;
          while (p && guard < 15) {
            guard++;
            if (p.type === "tag" && /^h[1-6]$/i.test((p as any).tagName || "")) {
              prevHeading = cleanText($(p).text());
              break;
            }
            p = (p as any).previousSibling;
          }
          if (!prevHeading) {
            let par: any = (el as any).parent;
            guard = 0;
            while (par && guard < 6) {
              guard++;
              const sib = (par as any).previousSibling;
              if (sib && sib.type === "tag" && /^h[1-6]$/i.test(sib.tagName || "")) {
                prevHeading = cleanText($(sib).text());
                break;
              }
              par = (par as any).parent;
            }
          }
          lists.push({ prevHeading, items });
        }
      }
    }
  });
  
  // Save last day if exists
  if (!hasTimelineDays && currentDayNumber !== null && currentDayItems.length > 0) {
    dayItinerary.push({
      day: currentDayNumber,
      title: currentDayTitle || `Day ${currentDayNumber}`,
      items: [...currentDayItems],
    });
  }

  let inclusions: string[] = [];
  let exclusions: string[] = [];
  let itineraryItems: string[] = [];
  let highlights: string[] = [];

  for (const lst of lists) {
    const h = (lst.prevHeading || "").toLowerCase();
    if (
      /included|include|includes|what's included|what is included/i.test(h)
    ) {
      inclusions = inclusions.concat(lst.items);
    } else if (
      /not included|excluded|exclude|not include|what's not/i.test(h)
    ) {
      exclusions = exclusions.concat(lst.items);
    } else if (
      /itinerary|tour plan|day by day|daily|program|schedule/i.test(h)
    ) {
      itineraryItems = itineraryItems.concat(lst.items);
    } else if (/highlights|feature|what you|experience/i.test(h)) {
      highlights = highlights.concat(lst.items);
    } else {
      const joined = lst.items.join(" ");
      if (itineraryItems.length === 0 && lst.items.length >= 3) {
        const looksLikeItinerary = lst.items.some(
          (i) =>
            /(pyramid|temple|museum|sphinx|nile|lunch|dinner|cruise|visit|oasis|desert)/i.test(
              i
            ) && i.length > 30
        );
        if (looksLikeItinerary) {
          itineraryItems = lst.items.slice();
        } else if (
          /(pickup|guide|entrance|fees|hotel|transport|water|tax)/i.test(
            joined
          ) &&
          inclusions.length === 0
        ) {
          inclusions = lst.items.slice();
        } else if (exclusions.length === 0 && lst.items.length < 8) {
          const looksExcl = lst.items.some((i) =>
            /(expenses|optional|gratuity|tip|flight|visa|insurance|lunch|dinner|drink)/i.test(
              i
            )
          );
          if (looksExcl) exclusions = lst.items.slice();
        }
      }
    }
  }

  if (itineraryItems.length === 0) {
    const longLst = lists
      .filter((l) => l.items.length >= 3)
      .sort((a, b) => b.items.join("").length - a.items.join("").length)[0];
    if (longLst) itineraryItems = longLst.items.slice();
  }

  // Structured sections win over heuristic guesses
  if (targetedInclusions.length > 0) inclusions = targetedInclusions;
  if (targetedExclusions.length > 0) exclusions = targetedExclusions;

  const tables: { personsLabel: string; priceUSD: number }[] = [...targetedTables];
  if (tables.length === 0) {
    const tableRoot = $("main").length > 0 ? $("main") : $("body");
    readTablesInto(tableRoot, tables);
  }

  const within = (id: string) => {
    // Sections are nested: <section id="overview"> ... <section id="itinerary">
    // inside "overview", so plain .text() leaks child sections. Clone, strip
    // nested <section> anchors, then read.
    const root = $(`section#${id}, #${id}`).first();
    if (!root.length) return { text: "", html: "", paragraphs: [] as string[] };
    const clone = root.clone();
    clone.find("section").remove();
    const paragraphs = clone
      .find("p")
      .map((_, p) => cleanText($(p).text()))
      .toArray() as unknown as string[];
    const cleanParas = paragraphs.filter((t) => t.length > 5);
    const html = (clone.find("#overview-text").first().html() ||
      clone.find(".td-about").first().html() ||
      cleanParas.map((p) => `<p>${p}</p>`).join("")) as string;
    const text =
      cleanParas.join("\n\n") ||
      cleanText(clone.text()).slice(0, 6000);
    return { text, html, paragraphs: cleanParas };
  };

  const overview = within("overview");
  const meeting = within("meeting_point");
  const overviewText = overview.text || undefined;
  const overviewParagraphs = overview.paragraphs.length
    ? overview.paragraphs
    : undefined;
  const overviewHtml = overview.html || undefined;
  const meetingPoint = meeting.text || undefined;
  const meetingPointHtml = meeting.html || undefined;
  const meetingPointImages = (() => {
    const root = $(`section#meeting_point, #meeting_point`).first();
    if (!root.length) return undefined;
    const imgs = root
      .find("img")
      .map((_, img) => absUrl($(img).attr("src") || ""))
      .toArray() as unknown as string[];
    const clean = Array.from(new Set(imgs.filter((u) => u.startsWith("http"))));
    return clean.length ? clean : undefined;
  })();

  // FAQ / trip notes: this tour page has NO #notes section — the tab links
  // to a missing anchor (global FAQ lives in the site footer instead).
  // We keep tripNotes empty rather than scraping unrelated site-wide FAQs.
  const tripNotes = undefined;

  let durationDays = durationText ? extractDaysFromText(durationText) : null;
  if (!durationDays) durationDays = extractDaysFromText(title);
  if (!durationDays && (itineraryItems.length > 0 || dayItinerary.length > 0)) {
    durationDays = Math.max(dayItinerary.length, 1);
  }
  const durationNights = durationDays ? Math.max(durationDays - 1, 0) : 0;

  const paragraphsEls = $("main p")
    .map((_, p) => cleanText($(p).text()))
    .toArray();
  const allParagraphs = (paragraphsEls as unknown as string[]).filter(
    (t) => t.length > 60
  );
  const longDescription = allParagraphs.slice(0, 3).join("\n\n").slice(0, 1500) || undefined;

  if (highlights.length === 0 && (itineraryItems.length > 0 || dayItinerary.length > 0)) {
    const allItems = dayItinerary.length > 0 
      ? dayItinerary.flatMap(d => d.items)
      : itineraryItems;
    highlights = allItems.slice(0, 5).map((i) =>
      i.length > 120 ? i.slice(0, 117) + "..." : i
    );
  }

  return {
    title: title || "",
    priceUSD: priceUSD ?? undefined,
    pricesTable: tables.length ? tables : undefined,
    inclusions,
    exclusions,
    itineraryItems,
    dayItinerary,
    overviewText,
    overviewParagraphs,
    overviewHtml,
    durationText,
    locationText,
    groupText,
    languageText,
    meetingPoint,
    meetingPointHtml,
    meetingPointImages,
    tripNotes,
    mainImage,
    gallery: gallery.length ? gallery : undefined,
    durationDays: durationDays ?? undefined,
    durationNights: durationNights || undefined,
    longDescription,
    highlights: highlights.length ? highlights : undefined,
  };
}

export async function scrapeMainCategoryPage(
  mainCategoryId: string
): Promise<ScrapedSubCategory[]> {
  const url = MAIN_CATEGORY_URLS[mainCategoryId];
  if (!url) return [];
  const html = await fetchHtml(url);
  const list = parseMainCategoryPage(html, url);
  return list;
}

export async function scrapeSubCategoryPage(
  subCat: ScrapedSubCategory | SubCategory,
  mainCatId: string,
  pageUrl?: string
): Promise<ScrapedTourListItem[]> {
  let url: string | undefined = pageUrl;
  if (!url && "url" in subCat) url = (subCat as any).url;
  if (!url && MAIN_CATEGORY_URLS[mainCatId]) {
    url = `${MAIN_CATEGORY_URLS[mainCatId]}/${subCat.slug}`;
  }
  if (!url) return [];
  const html = await fetchHtml(url);
  const scId = (subCat as ScrapedSubCategory).matchedSubCategory?.id || (subCat as SubCategory).id;
  return parseSubCategoryPage(html, url, mainCatId, scId);
}

export async function scrapeTourDetails(url: string): Promise<ScrapedTourDetails> {
  const html = await fetchHtml(url);
  return parseTourDetailsPage(html);
}

function tourFromDetails(
  counter: number,
  mainCatId: string,
  subCatId: string,
  listItem: ScrapedTourListItem,
  details: ScrapedTourDetails
): Tour {
  const actualTitle = details.title || listItem.title;
  const days =
    details.durationDays ||
    listItem.rawDurationDays ||
    extractDaysFromText(actualTitle) ||
    1;
  const nights = Math.max(days - 1, 0);
  const basePriceUSD =
    details.priceUSD ||
    listItem.priceUSD ||
    (details.pricesTable && details.pricesTable.length
      ? details.pricesTable[details.pricesTable.length - 1].priceUSD
      : 0);
  const eurRate = 0.92;
  const basePriceEUR = basePriceUSD ? Math.round(basePriceUSD * eurRate) : 0;

  const inclusionsFromDetails =
    details.inclusions && details.inclusions.length
      ? details.inclusions
      : listItem.shortDescription
      ? []
      : [];
  const exclusionsFromDetails =
    details.exclusions && details.exclusions.length ? details.exclusions : [];

  const itinerary: ItineraryDay[] = [];
  
  // Use the day-by-day itinerary exactly as it appears on the website
  if (details.dayItinerary.length > 0) {
    for (const dayData of details.dayItinerary) {
      itinerary.push({
        day: dayData.day,
        title: dayData.title,
        description: dayData.items.join("\n"),
        highlights: dayData.items.slice(0, 4),
      });
    }
  } else {
    // Fallback to splitting items evenly
    const itineraryList = details.itineraryItems?.length
      ? details.itineraryItems
      : [];
    if (itineraryList.length) {
      if (days <= 1) {
        itinerary.push({
          day: 1,
          title: actualTitle,
          description: itineraryList.join("\n"),
          highlights: itineraryList.slice(0, 4),
        });
      } else {
        const perDay = Math.ceil(itineraryList.length / days);
        for (let d = 1; d <= days; d++) {
          const slice = itineraryList.slice((d - 1) * perDay, d * perDay);
          itinerary.push({
            day: d,
            title: `Day ${d}`,
            description: slice.join("\n"),
            highlights: slice.slice(0, 4),
          });
        }
      }
    }
  }

  const tags: string[] = [];
  if (counter <= 2) tags.push("Best Seller");
  if (basePriceUSD && basePriceUSD < 60) tags.push("Budget Friendly");
  if (days >= 5) tags.push("Multi-Day");

  // Deterministic, stable ID derived from the tour slug so that re-scrapes
  // keep the same ID even if the tour's position/order changes on the site.
  // This makes merge/upsert sync reliable and keeps price history consistent.
  const stableId = `tour-web-${toSlug(actualTitle) || toSlug(listItem.slug) || String(counter).padStart(3, "0")}`;

  return {
    id: stableId,
    subCategoryId: subCatId,
    mainCategoryId: mainCatId,
    title: actualTitle,
    slug: toSlug(actualTitle) || listItem.slug,
    durationDays: days,
    durationNights: nights || undefined,
    durationLabel: details.durationText,
    location: details.locationText,
    group: details.groupText,
    language: details.languageText,
    shortDescription:
      details.overviewText?.slice(0, 200) ||
      listItem.shortDescription ||
      `Explore ${actualTitle} with Kemerya Tours`,
    longDescription:
      details.longDescription ||
      details.overviewText ||
      listItem.shortDescription,
    overview: details.overviewParagraphs,
    overviewHtml: details.overviewHtml,
    meetingPoint: details.meetingPoint,
    meetingPointHtml: details.meetingPointHtml,
    meetingPointImages: details.meetingPointImages,
    tripNotes: details.tripNotes,
    image: details.mainImage || listItem.image,
    galleryImages: details.gallery,
    sourceUrl: listItem.url,
    basePriceEUR: basePriceEUR || undefined,
    basePriceUSD: basePriceUSD || undefined,
    pricesTable: details.pricesTable,
    highlights: details.highlights,
    inclusions: inclusionsFromDetails,
    exclusions: exclusionsFromDetails,
    itinerary,
    tags,
    isPopular: counter <= 2,
  };
}

export interface FullScrapeResult {
  tours: Tour[];
  source: "website";
  scrapedAt: string;
  discoveredMainCategories: MainCategory[];
  discoveredSubCategories: SubCategory[];
  stats: {
    mainCategories: number;
    subCategories: number;
    toursTotal: number;
    withDetails: number;
  };
}

async function scrapeSubCategoryPagesWithPagination(
  subCat: ScrapedSubCategory,
  mainCatId: string,
  maxTours: number
): Promise<ScrapedTourListItem[]> {
  const allTours: ScrapedTourListItem[] = [];
  const seen = new Set<string>();
  let page = 1;
  let hasMore = true;

  while (hasMore && allTours.length < maxTours) {
    let url = subCat.url;
    if (page > 1) {
      url = `${subCat.url}/page/${page}`;
    }

    try {
      await delay(REQUEST_DELAY_MS);
      const html = await fetchHtml(url);
      const tours = parseSubCategoryPage(html, subCat.url, mainCatId, subCat.matchedSubCategory?.id);

      let newTours = 0;
      for (const tour of tours) {
        if (!seen.has(tour.url) && allTours.length < maxTours) {
          seen.add(tour.url);
          allTours.push(tour);
          newTours++;
        }
      }

      if (newTours === 0) {
        hasMore = false;
      } else {
        page++;
      }

      if (page > 20) {
        hasMore = false;
      }
    } catch (e) {
      console.error(`Failed to scrape page ${page} of ${subCat.url}:`, e);
      hasMore = false;
    }
  }

  return allTours;
}

export async function scrapeAllTours(options?: {
  maxToursPerSub?: number;
  skipDetails?: boolean;
}): Promise<FullScrapeResult> {
  const maxPerSub = options?.maxToursPerSub ?? 100;
  const skipDetails = options?.skipDetails ?? false;
  const allTours: Tour[] = [];
  const discoveredMainCats = new Map<string, MainCategory>();
  const discoveredSubCats = new Map<string, SubCategory>();
  let counter = 0;
  let subCount = 0;
  let withDetails = 0;

  for (const mc of MAIN_CATEGORIES) {
    const url = MAIN_CATEGORY_URLS[mc.id];
    if (!url) continue;
    try {
      const html = await fetchHtml(url);
      const subList = parseMainCategoryPage(html, url);

      // Register the main category as discovered (fully dynamic catalog)
      if (!discoveredMainCats.has(mc.id)) {
        discoveredMainCats.set(mc.id, {
          id: mc.id,
          name: mc.name,
          slug: mc.slug,
          description: mc.description,
          icon: mc.icon,
        });
      }

      if (subList.length === 0) {
        console.log(`No sub-categories found for ${mc.name}, trying to get tours directly...`);
        try {
          const directTours = parseSubCategoryPage(html, url, mc.id, `direct-${mc.id}`);
          for (const tItem of directTours.slice(0, maxPerSub)) {
            counter++;
            try {
              let details: ScrapedTourDetails = {
                title: tItem.title,
                inclusions: [],
                exclusions: [],
                itineraryItems: [],
                dayItinerary: [],
              };
              if (!skipDetails) {
                await delay(REQUEST_DELAY_MS);
                details = await scrapeTourDetails(tItem.url);
                withDetails++;
              }
              const tour = tourFromDetails(counter, mc.id, `direct-${mc.id}`, tItem, details);
              allTours.push(tour);
            } catch (e) {
              allTours.push(
                tourFromDetails(counter, mc.id, `direct-${mc.id}`, tItem, {
                  title: tItem.title,
                  inclusions: [],
                  exclusions: [],
                  itineraryItems: [],
                  dayItinerary: [],
                  priceUSD: tItem.priceUSD,
                })
              );
            }
          }
        } catch (e) {
          console.error(`Failed to get direct tours for ${mc.name}:`, e);
        }
      }

      for (const sc of subList) {
        subCount++;
        const subCatId = sc.matchedSubCategory?.id || `scraped-${sc.slug}`;

        // Register discovered sub-category so new ones on the site appear automatically
        if (!discoveredSubCats.has(subCatId)) {
          discoveredSubCats.set(subCatId, {
            id: subCatId,
            mainCategoryId: mc.id,
            name: sc.matchedSubCategory?.name || sc.name,
            slug: sc.matchedSubCategory?.slug || sc.slug,
            description: sc.description,
          });
        }
        try {
          const tourList = await scrapeSubCategoryPagesWithPagination(sc, mc.id, maxPerSub);
          for (const tItem of tourList) {
            counter++;
            try {
              let details: ScrapedTourDetails = {
                title: tItem.title,
                inclusions: [],
                exclusions: [],
                itineraryItems: [],
                dayItinerary: [],
              };
              if (!skipDetails) {
                await delay(REQUEST_DELAY_MS);
                details = await scrapeTourDetails(tItem.url);
                withDetails++;
              }
              const tour = tourFromDetails(
                counter,
                mc.id,
                subCatId,
                tItem,
                details
              );
              allTours.push(tour);
            } catch (e) {
              allTours.push(
                tourFromDetails(counter, mc.id, subCatId, tItem, {
                  title: tItem.title,
                  inclusions: [],
                  exclusions: [],
                  itineraryItems: [],
                  dayItinerary: [],
                  priceUSD: tItem.priceUSD,
                })
              );
            }
          }
        } catch (e) {
          console.error(`Failed subcat ${sc.url}:`, e);
        }
      }
    } catch (e) {
      console.error(`Failed main cat ${mc.name}:`, e);
    }
  }

  // Disambiguate duplicate IDs: the same tour title can legitimately appear
  // under two different sub-categories on kemeryatours.com. The slug-based
  // stable ID would collapse them into one row, losing the 120th tour.
  // Give each occurrence after the first a sub-category-suffixed ID.
  const seenIds = new Set<string>();
  for (const t of allTours) {
    if (seenIds.has(t.id)) {
      t.id = `${t.id}-${toSlug(t.subCategoryId || "dup")}`;
      if (seenIds.has(t.id)) t.id = `${t.id}-${Date.now()}`;
    }
    seenIds.add(t.id);
  }

  return {
    tours: allTours,
    source: "website",
    scrapedAt: new Date().toISOString(),
    discoveredMainCategories: Array.from(discoveredMainCats.values()),
    discoveredSubCategories: Array.from(discoveredSubCats.values()),
    stats: {
      mainCategories: Math.max(MAIN_CATEGORIES.length, discoveredMainCats.size),
      subCategories: Math.max(subCount, discoveredSubCats.size),
      toursTotal: allTours.length,
      withDetails,
    },
  };
}

