# Sight Savers Optics – clickable mockup (preview only)

Static prototype, separate from the ecommerce repo. EXAMPLE data throughout; nothing is sent anywhere
(WhatsApp, directions, checkout and booking show a mockup notice or a local confirmation).

## Structure (3 Oct 2026)
| Path | Look | Generator |
|---|---|---|
| `/` (root `*.html`, `assets/`) | **P2 · Modern clinic luxe** (Baymax, `site-report/ux/premium/p2-clinic-luxe/`): the main look | `python3 src/p2/build.py` |
| `/v1/` | Original look (round 1–2) | `python3 src/v1/build.py` (also writes `/b2/` and `/c2/`) |
| `/b2/`, `/c2/` | B2 Clinical minimal, C2 Boutique minimal (V1 pages, other theme) | as above; they use `v1/assets/` |

The "Look: P2 · V1 · B2 · C2" switch in the mockup strip opens the matching page in another look.

## P2 business rules built in
- **Online shop = soft and coloured contact lenses + lens care only.** `lens.html?p=<id>` has power per eye (same/different), CYL/axis for toric, boxes per eye,
  prescription (upload photo / WhatsApp / on file at a store), delivery or collect, total, inline validation. Cart in localStorage `sso-p2-cart`.
- **Frames, eyeglasses, sunglasses = in-store lookbook** (`eyewear.html`): no prices to cart, buttons "Try in store" and "Book a fitting". No frame configurator.
- **Specialty pages** (myopia-control, ortho-k, keratoconus, low-vision, vision-therapy) are info-only: Book an assessment, Visit a store, WhatsApp. `specialty.html` is the clinic index.
- One-row header (brand, nav, العربية, search icon with expanding panel, cart, WhatsApp, Book). Mobile action bar on every page (Book + WhatsApp; the lens page uses a buy bar; booking uses WhatsApp + Request).
- Booking (`book.html`): 4 native-radio steps, pre-fill from `?s=&store=&d=`, UAE mobile check, live WhatsApp message, confirmation with an EXAMPLE ref.
- `ar.html`: Arabic RTL homepage in the P2 style (draft copy for native review).

## Navigation, smart search and recommendations (Round 5, 3–4 Oct 2026)
- **Mega menu** (desktop ≥981px): Eye tests, Specialist clinic, Eyewear, Contact lenses, Stores. Each item has 3 link columns and a feature card. Data is in `src/p2/nav.py` (`MEGA`).
  - Every link lands on a real page: `contact-lenses.html?t=…` or `?b=…` (pre-applied filters), specialty topic pages, `book.html?s=…&store=…`, `stores.html#…`, or `eye-tests.html#prices` and `#expect`.
  - Behaviour is in `assets/nav.js`: opens on hover (140 ms intent delay, closes 260 ms after the pointer leaves) and on focus. Left and Right move between top items, Down enters the panel, Up and Down move between links, Left and Right move between columns, and Esc closes the panel and returns focus. `aria-expanded` stays in sync.
  - The mobile drawer has accordions built from the same data. The Arabic page keeps the plain nav.
- **Smart search**: `build.py` writes `assets/search-index.json` (products, care items, brands, services, clinic pages, stores and FAQs, with English and Arabic aliases).
  - `assets/search.js` handles normalisation (accents, Arabic diacritics, alef/ta-marbuta, the ال prefix), token prefix matching, Damerau-Levenshtein matching (≤1 edit for 4–7 characters, ≤2 for 8+), synonyms, field weights and a popularity boost. Medical queries put the clinic result first.
  - The combobox dropdown uses `aria-activedescendant`. `search.html` is the results page, with type filters.
- **Recommendations** (`assets/recs.js`, rule-based):
  - Similar lenses: same replacement schedule and type, ranked by brand and then price, up to 4.
  - Frequently bought together: an "Add both" bundle that adds to the cart for real.
  - Recently viewed: localStorage `sso-p2-recent`, last 8 items.
  - Multi-box nudge (EXAMPLE).
  - Placement: product page, cart ("You might also need" and "Reorder"), home ("Popular in Dubai" and Recently viewed), and the search empty state.
- **Styling**: `assets/nav.css` holds the default styles for the mega menu, accordions, search, results, rec rail, bundle and nudge. It's isolated so a design patch can replace it. `assets/buttons.css` is Baymax's button system v2 (`site-report/ux/premium/p2-nav/patch/buttons-only/`) and loads last.
- **EXAMPLE data**: the care items `solution-2`, `drops-1` and `case-1`, the popularity ranking, "Popular pick" and the multi-box offer.
- **Tests**:
  - `node src/p2/searchq.js`: search quality.
  - `kbd.js`: now also covers the mega menu, drawer, search, bundle and cart recs.
  - `node src/p2/navshots.js`: screenshots into `screenshots/p2-nav/`.

## Theme
- All colours, fonts, radii, shadows and layout sizes are CSS variables in `assets/theme.css`. `assets/site.css` and the HTML use only `var(--…)`.
- Fonts (self-hosted, `assets/fonts/`): Inter Tight, IBM Plex Mono, IBM Plex Sans Arabic.
- Behaviour: `assets/app.js`. Lens data: `assets/data.js` (generated from the catalogue via `src/v1/data.py`). Photo credits: `assets/img/CREDITS.md`.

## Checks and screenshots (server on :8765, Playwright)
- `node src/p2/verify.js`: overflow, header collisions, tap targets, text under 12px, missing mobile bar, JS errors and HTTP errors at 320/390/1024/1280/1440 (`W=` and `PAGES=` to narrow it down).
- `node src/p2/kbd.js`: keyboard-only walk through the lens purchase (toric, different eyes, then cart) and the booking.
- `python3 src/linkcheck.py <BASE>`: every internal href/src/CSS url in root, v1, b2 and c2.
- `node src/p2/shots.js` then `python3 src/p2/compare.py` → `screenshots/p2/` (desktop/mobile shots and side-by-sides with Baymax's P2 PNGs).
- Older V1 tools: `src/verify.js` (`PREFIX=v1/`, `b2/`, `c2/`), `src/kbd.js`, `src/shots*.js`.
