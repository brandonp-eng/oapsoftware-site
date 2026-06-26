# OAP Website — Publish-Prep Changelog

Prepared for deployment to **oapsoftware.com**. Static multi-page site — HTML at root + `css/`, `js/`, `assets/`.

## Update — OSINT App Platform screenshots added
- Added an "Inside the platform / A look at the workspace" gallery to `platform.html`: a featured 3D entity graph plus a 2×2 grid (command dashboard, interactive correlation graph, monitoring, and the Sentinel live globe), with a "Try the interactive demo" CTA.
- Six product screenshots optimized to WebP under `assets/app/`.
- Trade-secret handling per owner direction: on the 3D-graph image, the "(IROC)" label and the one sentence describing relevance-anchoring were redacted (seamlessly, matching the panel background); other images used as provided. Captions/alt text are written in plain, non-revealing language.

---

## Update — Interactive demo page + SEO optimization (both products)
- **Demo page restored:** pulled the live interactive `demo.html` and its assets (`css/demo.css`, `js/demo.js`, `js/storage-shim.js`, `assets/brand/osint_logo.png`, Cytoscape) into the project. The Demo nav link now points to `demo.html`, and the page is regenerated with the current shared header/footer (Products dropdown, US flag) so it matches the rest of the site. The interactive sandbox boots cleanly.
- **SEO, optimized for BOTH products:**
  - Unique, keyword-targeted `<title>` and meta description on every page — BCC pages target business-operations / business-intelligence terms; OSINT pages target open-source-intelligence terms; shared pages cover both.
  - Added per-page `keywords`, `robots` (index, follow, max-image-preview:large), `author`, `theme-color`, and **canonical URLs**.
  - Full **Open Graph + Twitter Card** tags (absolute image URLs) on every page.
  - **JSON-LD structured data:** sitewide Organization + WebSite, plus `SoftwareApplication` schema for the Business Command Center and the OSINT App Platform (homepage and products carry both; each product page carries its own). All 20 blocks validated.
  - Verified single H1 per page and descriptive alt text on all images (decorative hero backgrounds use empty alt + aria-hidden).
  - Rebuilt `sitemap.xml` (added demo, lastmod, changefreq, priority); `robots.txt` references the sitemap.
- 0 console errors / 0 failed assets across all pages.

---

## Update — Revision pass (dashes, flag, demo, split hero, copy)
- **Removed all em-dashes** from every page (body copy, headings, titles, meta) and replaced them with grammatically correct commas, colons, periods, or parentheses. Also removed the decorative dash/line that prefixed every eyebrow label (CSS `.eyebrow::before`).
- **US flag** added next to "A veteran-owned company." in the footer on every page (inline SVG, small and clean, navy-border).
- **Demo** nav link added to the right of the Products tab on every page, pointing to the OSINT App Platform walkthrough (`platform.html`).
- **Homepage hero** reworked: company-level headline, both products presented side by side as equal cards (OSINT App Platform left, Business Command Center right) instead of OSINT alone.
- **Split hero background**: OSINT network/line motif on the left merges into a ghosted BCC dashboard on the right, converging in the dark center behind the two product paragraphs — visually expressing "two intelligence products."
- **Copy rewrites** on the BCC page: executive section now "OAP's Business Command Center / Monitor and assess your entire operation from one application"; AI-layer heading now "You control your data. Business Command Center monitors it."

---

## Update — OAP Business Command Center added (two-product site)
- **New positioning:** OAP is now presented as one company with **two co-equal products** — the **OAP Business Command Center** (launching first) and the **OSINT App Platform** (early access) — under the theme "two kinds of intelligence, one standard." One makes you smarter about the world; the other makes your business smarter about itself.
- **New pages:**
  - `products.html` — overview presenting both products side by side, shared DNA (AI shows its work, your data stays yours, you stay in command), and a get-started CTA.
  - `business-command-center.html` — full product page: hero, "business intelligence, literally" value strip, executive command center overview, the AI layer (records/bookkeeping, always-on monitoring, insights & recommendations, you-approve), **integrations** (banking, payroll, telematics — marked in testing / available at release), the **four command centers** (Finance, HR, Safety & Compliance, Service), shared Analytics / Reports / Tasks & Approvals views, "why owners keep it," a roadmap (Inventory Command Center + companion mobile app), and a launching-soon CTA.
- **Navigation:** added a **Products** dropdown (BCC, OSINT App Platform, Compare) to every page header; flattens inline on mobile. Footer's first column is now **Products** listing both. Homepage gained a "two ways" products section.
- **Imagery:** 10 product screenshots optimized to WebP under `assets/bcc/`; a custom navy/cyan dashboard **hero** (`assets/bcc/hero-bcc.webp`) generated to match the existing aesthetic.
- **Contact form:** added a "Which product?" selector (Business Command Center / OSINT App Platform / Both) and broadened the role list to include business owners/managers and operations/finance leads. Still no email addresses anywhere — all submissions route to the founders' inboxes server-side.
- **Trade-secret + brand rules:** BCC copy follows the same discipline — no internal codenames, no agent counts, "you approve" framing, navy/cyan only, conversation-based pricing, veteran-owned footer retained. Full email + trade-secret rescan: **clean**. 0 console errors / 0 failed assets across all pages; verified desktop + mobile, light + dark.

---


## A. Trade-secret scrub
- Removed all internal-mechanism wording. Final scan is clean of: release codename ("Nairobi"), "Planning Ledger" schema, "consensus gate," "tiebreaker," F1–F6 taxonomy, agent roster / agent counts, "IROC"/"EEI" jargon, fixed correlation order, and internal anecdotes (78.5/5.0, "West Taiwan," "Lai").
- Softened deliberation wording: "reads/debates the requirement" → "interprets the requirement and records what it means."
- "written to a ledger" → "written to an inspectable record."
- Kept allowed marketing claims: "patent-pending deterministic correlation," "proprietary analytic doctrine," "reconciles multiple models into a single recorded judgment," and standard public terms (ACH, key judgments).

## B. Cleanup
- No Perplexity preview script (`data-pplx-inline-edit`) exists in the source files — pages end with `<script src="js/main.js"></script></body></html>`.
- **Contact form** rewritten:
  - Removed the developer comment and the `YOUR_FORM_ID` placeholder.
  - Form posts to a Formspree endpoint placeholder `https://formspree.io/f/OAP_FORM_ID` — **replace `OAP_FORM_ID` with your real Formspree form ID** (see "Action required" below). Recipients are configured server-side in Formspree (both founder inboxes), so no email addresses are exposed in the page source.
  - AJAX submit with success/error states; graceful message until the real ID is set.
- Removed the generic `hello@oapsoftware.com` address from the contact card and legal page (no exposed inbox there); contact card now routes people to the form / founders.
- Filenames are clean: `index, platform, capabilities, security, pricing, company, contact, legal` (.html). No `-2/-3` suffixes.

## C. Branding
- Header + footer logo: real OAP emblem (`assets/brand/oap-emblem-green.png`) with a subtle app-style green ring, paired with a live, theme-aware "OAP / Software & Development" wordmark (auto-contrasts: navy on light, white on dark).
- Favicons present and linked: `favicon.ico` (root) + `assets/brand/favicon-16/32/180.png`.
- OG/social image: `assets/brand/oap-avatar.png`.

## D. Brand colors
- Palette is navy `#0C1A40` + cyan `#5AC8FF`; no teal remains (old `#2fd4c8` fully removed, including the stray CSS comment).
- Light mode uses an accessible deeper cyan-blue for text/links to keep WCAG AA contrast; dark mode uses the bright cyan accent. Theme toggle verified in both modes.

## E. Pricing
- Left as-is: conversation-based ("Request access" / "Let's talk"), founder-led / early-access framing. No public price tiers.

## F. Refinements
- Trimmed "patent-pending" on the home page from 3 mentions to 1 prominent placement (kept on the capability card; hero chip → "Early access"; stat → "Deterministic").
- Added a **Founders** section to `company.html` (Brandon R. Pavlovich; Brandon Kriegel) with titles and bios. Per request, **no email addresses are shown anywhere on the site** — each founder card has a "Contact Brandon →" link to the contact form, and the form's "How can we help?" selector covers Request access / Request information / Request pricing / Partnership / General question. All submissions route to the founders' inboxes via the form handler (recipients hidden server-side).
- Added **"A veteran-owned company"** in two places: the company-page hero (eyebrow style) and every page footer (cyan, understated). No SDVOSB/VOSB logos or federal-certification claims.

## G. Pre-publish QA
- All 8 pages render with CSS + JS + logo + favicons. **0 console errors, 0 failed assets** across all pages.
- All internal nav links resolve (index, platform, capabilities, security, pricing, company, contact, legal).
- Responsive verified at 375px (mobile), 768px (tablet), 1280px+ (desktop). Founders cards: side-by-side desktop, stacked mobile. Mobile menu + theme toggle work.
- Unique meta titles + descriptions + OG tags per page. `robots.txt` and `sitemap.xml` included.

## Action required before go-live
1. **Set the form endpoint:** create a form at formspree.io, add both founder emails as recipients (hidden), then replace `OAP_FORM_ID` in `contact.html` with your form ID. Test a submission.
2. **Legal review:** `legal.html` contains good-faith draft Privacy / Terms / Acceptable-Use with `[Review]` flags — have counsel finalize before publishing.
3. **DNS:** point `oapsoftware.com` at your host and deploy this folder.
