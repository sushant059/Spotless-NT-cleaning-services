# Design system and responsive rules

## Brand
- Put colours in `tailwind.config.ts` as named tokens (`navy`, `brand`, `sky`, `leaf`, `sun`, `ink`, `slate`, `mist`, `line`), sampled from the client's logo. Write the palette and usage in `docs/BRAND.md`.
- Two fonts via `next/font`: a characterful display face for headings and a clean sans for body (template: Bricolage Grotesque + Plus Jakarta Sans). Pick per brand: hotels lean serif display, trades lean bold grotesk.
- Contrast: body text on white ≥ 4.5:1; white text only on the darkest brand tones or on photos under a 80–90% dark gradient.
- Palette ideas by type when there is no logo: cleaning/clinic = deep blue + fresh green; hotel = charcoal/sand + one accent; restaurant = warm dark + tomato/olive; salon = blush/plum + gold; trades = navy + safety orange; gym = black + electric accent.

## Layout patterns that worked
- **Photo-led**: every page hero has a photo (Ken Burns), home hero has a muted looping background video with a photo poster. Section backgrounds alternate white / mist / dark so neighbours never match.
- Category tiles with photo + gradient overlay + icon; service cards with photo on top, price chip, 3-line summary.
- Phones: horizontal snap-scroll rows for cards (`w-[82%] snap-start`), a sticky bottom bar (Call / WhatsApp / Chat / Free quote). Desktop: grids.
- Use honest promise stats (number of services, suburbs covered, $0 quote, drying time) instead of invented customer counts.

## Media
- Real uploads first, then stock (`lib/stock.ts`, Pexels IDs, `images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=…`), then a brand gradient. `Photo` advances on error and also checks `complete && naturalWidth === 0` after hydration, because an image can fail before React attaches `onError`.
- Videos: list several `<source>` candidates; the browser tries each in turn; the poster photo stays if none play. Respect `prefers-reduced-motion` and Save-Data; pause off-screen.
- Before/after with no real photos: example pair (same photo dulled and stained for "before") with a Photo/Illustration toggle, always labelled "Example".
- Stock photos show people who are not the client's staff: don't caption them as "our team"; tell the owner to replace them.

## Responsive traps (all hit on the reference build)
- A header with `backdrop-blur` (or any `backdrop-filter`/`transform`/`filter`) becomes the containing block for `position: fixed` children, so a mobile menu inside it gets trapped in the header bar and looks like it "won't open". Render menus/drawers with `createPortal(..., document.body)`.
- Grid/flex children with long or truncated text overflow on phones: add `min-w-0` to wrappers and use `grid-cols-1` before breakpoints.
- Floating chat/WhatsApp bubbles cover hero buttons on phones when a bottom bar exists: hide the bubbles below `md`.
- Tables on phones: switch to stacked rows below `sm` (invoice lines) rather than horizontal scroll.
- Lock body scroll while menus are open; close menus on route change and Escape; touch targets ≥ 44px.
- Test at 360/390px and 1280px; assert `document.documentElement.scrollWidth === clientWidth`.

## Accessibility and polish
Visible focus rings, `aria-expanded` on toggles, dialogs with `role="dialog"`/`aria-modal`, alt text, reveal animations that show content without JS, reduced-motion support, print styles (`print-color-adjust: exact`) for invoices.
