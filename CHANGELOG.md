# OAP Website — Publish-Prep Changelog

Prepared for deployment to **oapsoftware.com**. Static multi-page site (8 pages) — HTML at root + `css/`, `js/`, `assets/`.

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
