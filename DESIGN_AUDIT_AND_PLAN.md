# Film Fatale UI/UX Audit and Overhaul Plan

Updated: July 18, 2026

## Implementation status

The approved overhaul was implemented on July 18, 2026. The application now uses
Next.js 16.2, React 19.2, Tailwind CSS 4, a single dark OKLCH theme, a Turbopack
production build, redesigned shell and page surfaces, reduced client boundaries, and
zero known npm audit vulnerabilities.

Two validation notes remain:

- Live LCP, INP, CLS, and accessibility-tree captures still require a configured Chrome
  DevTools MCP connection.
- `middleware.ts` is intentionally retained for Cloudflare Access. Next 16 deprecates the
  filename, but OpenNext does not yet support Node middleware/proxy; both the Next build
  and OpenNext Worker build pass with the current Edge-compatible middleware.

## 1. Product direction

Film Fatale should feel like a private, beautifully edited cinema library: dark, fast,
quiet, and unmistakably noir. The interface should borrow from film noir through
contrast, editorial typography, shadow, framing, and a restrained crimson accent—not
through constant novelty effects, fake film scratches, or decorative clutter.

The redesign has one fixed theme. Light mode, system-theme detection, and the theme
toggle will be removed.

### Design principles

1. **Posters are the color.** The shell stays mostly ink, charcoal, bone, and smoke so
   movie artwork remains the visual focus.
2. **Editorial, not “dashboard.”** Strong serif display type, compact metadata, deliberate
   alignment, and generous negative space replace generic floating cards.
3. **Noir through restraint.** Crimson is used for selection, progress, primary actions,
   and rare emphasis. It is not applied to every hover.
4. **Motion communicates.** Transitions explain state changes and navigation. Nothing
   auto-moves without user control, and reduced-motion preferences are respected.
5. **Fast by architecture.** Server-rendered content, small client islands, responsive
   images, and stable skeletons take priority over blur and animation effects.

## 2. Evidence and current baseline

This audit is based on the repository, its production build, dependency tree, and static
UI inspection.

| Check | Result |
| --- | --- |
| ESLint | Passes |
| Production build | Passes with required local secrets present |
| Routes | 25 generated application pages/routes |
| Shared first-load JavaScript | 274 kB reported by Next.js 15 build |
| Shared vendor chunk | 197 kB |
| Source size | Approximately 15,284 lines of TS, TSX, and CSS |
| Client modules | 61 files declare `use client` |
| Dependency audit | 4 moderate advisories in the Next/OpenNext dependency chain |
| Live Core Web Vitals | Not measured; Chrome DevTools MCP is not configured |

The build output is a useful bundle baseline, but it is not a substitute for browser
measurements. Before and after implementation, capture mobile and desktop LCP, INP, CLS,
request count, transferred bytes, and an accessibility snapshot on `/`, `/search`,
`/movie/[id]`, `/tv/[id]`, and `/library`.

## 3. Stack and library audit

Versions below are the installed versions observed during the audit. “Latest” versions
were checked on July 18, 2026.

| Area | Current | Audit decision |
| --- | --- | --- |
| Next.js | 15.5.20; latest checked 16.2.10 | Upgrade to 16 after validating OpenNext. Run the official codemod, migrate `middleware.ts` to `proxy.ts`, and remove the custom Webpack split-chunk override before accepting Turbopack defaults. |
| React / React DOM | 19.2.4; latest checked 19.2.7 | Patch-upgrade with Next. Do not make the UI redesign depend on experimental React features. |
| Tailwind CSS | 3.4.19; latest checked 4.3.3 | Upgrade to v4 and move the token system into CSS using `@theme`. Replace HSL wrappers with direct OKLCH tokens. |
| shadcn/ui pattern | `new-york`, copied source components | Keep the source-owned component approach, but refresh primitives to current React 19/Tailwind 4 patterns (`data-slot`, no unnecessary `forwardRef`). |
| Radix UI | Individual primitive packages | Keep the primitives actually used: dialog, dropdown, label, popover, select, slot, tabs, tooltip, avatar, and separator. Remove navigation-menu and progress, which have no source imports. |
| Framer Motion | 12.34.2; latest checked 12.42.2 | Migrate to the current `motion` package and `motion/react` imports. Limit it to hero/state transitions and use `LazyMotion` if the measured bundle supports the change. Prefer CSS for simple hover/focus states. |
| next-themes | 0.4.6 | Remove completely. The product is dark-only. |
| SWR | 2.4.0; latest checked 2.4.2 | Keep and patch-upgrade for client-owned remote state. Avoid duplicating it with effect-driven fetch logic. |
| web-vitals | 5.1.0 | Keep only if metrics are wired to a real development or production reporter. The current monitor is not imported elsewhere, so it provides no value today. |
| `@tailwindcss/line-clamp` | 0.4.4 | Remove. It is not imported in the Tailwind config and line-clamp utilities are built into modern Tailwind. |
| `class-variance-authority`, `clsx`, `tailwind-merge` | Current utility stack | Keep. It remains a good lightweight primitive composition pattern. |
| Fonts | Inter, Crimson Pro, JetBrains Mono | Keep Inter and Crimson Pro for the first redesign pass. Remove JetBrains Mono because no UI consumes `font-mono`. Reconsider typography only after layout prototypes exist. |
| Icons | Local inline SVG object | Keep the no-dependency approach, but split icons into named exports or small domain files so importing one icon does not make the whole suite ambiguous to the bundler. Remove unused Sun/Moon icons with theming. |
| Image handling | Next Image configured as `unoptimized` | Keep direct TMDB size variants for Cloudflare cost control, but make the abstraction honest: `quality`, AVIF/WebP config, and `/_next/image` cache headers do not optimize direct images in this mode. |
| OpenNext / Cloudflare | `@opennextjs/cloudflare` 1.20.1, current checked | Keep. Validate the Next 16 build and preview before merging the framework upgrade. |

### Dependency hygiene

- Remove `@radix-ui/react-navigation-menu`, `@radix-ui/react-progress`,
  `@tailwindcss/line-clamp`, and `next-themes`.
- Remove `@emnapi/runtime` if a clean install confirms it remains extraneous.
- Do not run the current `npm audit fix --force` suggestion: it proposes a destructive
  downgrade to Next 9. Upgrade Next/OpenNext deliberately, then rerun the audit.
- Upgrade framework, styling, and UI primitives in a dedicated change before visual page
  work. This keeps dependency regressions separate from design regressions.

## 4. Current UI/UX audit

### What is already working

- The App Router and server-rendered page entry points are a solid foundation.
- The core content model is understandable: Movies, TV, Search, Library, and details.
- TMDB artwork has stable poster/backdrop aspect ratios, which helps prevent layout shift.
- Radix primitives provide a useful accessibility base for dialogs, menus, tabs, selects,
  popovers, and tooltips.
- Crimson Pro and the existing black-and-white femme-fatale emblem already support the
  requested theme.
- Semantic sections, loading states, error states, and focus utilities exist in several
  areas. The redesign should standardize them rather than start from nothing.

### Visual system issues

1. **The aesthetic is generic dark shadcn plus glassmorphism.** `glass`, `glass-strong`,
   three Material-style elevation levels, red glows, backdrop blur, and rounded cards are
   applied broadly. They compete with one another and do not create a coherent noir voice.
2. **Two visual eras coexist.** Some pages use cinematic backdrops and large serif type;
   others are conventional centered cards, pills, and filter panels. Movie, TV, person,
   search, and library surfaces do not feel like the same product.
3. **The design tokens are still dual-theme HSL tokens.** Light values in `:root`, dark
   overrides in `.dark`, and dark-specific selectors make the requested single-theme
   product harder to reason about.
4. **Spacing is large but not always hierarchical.** Repeated `space-y-20/24`, dividers,
   nested sections, and centered headings make pages long without creating a stronger
   reading rhythm.
5. **Effects are overused.** Nearly every card lifts, scales, blurs, glows, or changes
   elevation. This makes important actions feel no more significant than decoration.

### Information architecture and navigation

1. The desktop header combines logo, centered navigation, inline search, auth, theme
   control, scroll detection, mobile menu state, and motion in one large client component.
2. The logo appears without a wordmark, reducing brand recognition and making the header
   feel icon-led rather than editorial.
3. Primary navigation exposes only Movies and TV; Library appears conditionally and Search
   is a small utility field. For this personal product, Search and Library deserve clearer
   first-class positions.
4. Mobile search is duplicated: there is a search icon and another search field inside the
   opened menu.
5. The footer uses a three-column grid even at narrow widths, which is cramped and gives a
   small private application more corporate/legal weight than it needs.

### Home and discovery

1. The rotating hero is visually large (up to 720 px), auto-advances, and has no pause
   control. It can move while the user is reading and fails the spirit of reduced-motion
   and user-control requirements.
2. “Trailer” currently links to the same details URL as “More Info”; its label promises an
   action it does not perform.
3. Hero controls and dots sit over unpredictable artwork. Contrast is helped by overlays
   but should be tested image-by-image.
4. The home and TV pages contain only a hero plus two poster grids. They do not help the
   owner resume a show, reach the library, or make a quick choice.
5. Twelve cards per section combined with large vertical gaps creates browsing volume but
   little editorial emphasis.

### Cards and grids

1. Poster cards have clear images and metadata, but nearly identical treatment across all
   contexts. A browse grid, compact rail, search result, and library item need distinct
   density and actions.
2. Staggering every card with JavaScript animation delays content visibility and creates
   repeated motion during ordinary browsing.
3. The first eight grid images can be marked priority. This may over-prioritize images and
   compete with the actual LCP hero; priority must be limited to the measured above-fold
   LCP candidate.
4. Hover-only affordances do not translate to touch. All important card actions must remain
   visible or accessible through a clearly named menu.
5. Poster `sizes` values are broad approximations and should match the actual responsive
   grid columns.

### Details pages

1. Detail pages have strong ingredients—backdrop, poster, title, metadata, provider, cast,
   trailer, and status—but too much content is divided into similar glass cards.
2. Backdrop imagery is mounted as a fixed background and the body background is mutated
   with a client effect. This couples route styling to the DOM and complicates transitions.
3. The primary hierarchy between “watch trailer,” “add/update library,” provider links, and
   secondary metadata is inconsistent.
4. Movie and TV detail pages have drifted into separate bespoke structures. They should
   share one detail shell and domain-specific sections.

### Search and library

1. Search is primarily a client-driven browse surface. Query state is mirrored from URL
   params into local state, adding work and opportunities for mismatch.
2. Library is a large client page with authentication, redirect, query parsing, fetching,
   filters, tabs, pagination, and presentation in one component.
3. “Currently Watching” and “All Library” mix a tab model with an independent status
   filter model. The second tab defaults to “Want to Watch,” so “All Library” is not
   literally all items.
4. Library filters use labeled selects inside a card. For a small fixed set, a compact
   segmented/chip pattern will be faster to scan and easier to use on touch.
5. Loading and error states are functional but visually generic and sometimes text-only.

### Accessibility and interaction

1. There is a `main-content` target but no visible-on-focus skip link.
2. The account menu trigger lacks an explicit accessible name.
3. No reduced-motion CSS or `useReducedMotion` usage was found, despite page transitions,
   card entrance animations, auto-rotating content, loading animation, and hover scaling.
4. The hero auto-rotation needs pause-on-hover/focus, a visible pause control, or removal.
5. Focus rings exist on core primitives, but global `ring-offset` behavior must be retuned
   for a single dark canvas and tested on imagery.
6. Muted text, text over art, crimson text on black, and translucent overlays require
   measured contrast validation. Do not assume a dark theme is automatically accessible.
7. Touch targets should be at least 44 by 44 CSS pixels for header, carousel, card, and
   episode controls.
8. Status changes, search results, filter result counts, and asynchronous errors should use
   appropriate live regions without becoming noisy.

## 5. Performance and architecture audit

### Highest-priority risks

1. **Oversized global client payload.** Every page reports roughly 274 kB shared first-load
   JS. The 197 kB forced vendor chunk and root-level providers make small static/legal
   pages cost almost the same as interactive application pages.
2. **Custom Webpack split chunks.** `next.config.ts` forces all node modules into a
   `vendors` chunk and shared code into `common`. This likely defeats route-aware splitting.
   It also blocks a clean move to Next 16’s default Turbopack build.
3. **Broad client boundaries.** Sixty-one client modules include display-heavy media
   sections, grids, category pages, detail surfaces, providers, and entire library/search
   pages. Many should be server components containing small interactive islands.
4. **Root hydration cost.** Auth, theme, tooltip, background, navigation, and page-motion
   providers all wrap the application shell.
5. **Blur and large composited layers.** Fixed full-screen gradients, backdrop filters,
   poster transforms, large hero transitions, and multiple translucent overlays increase
   GPU/compositing work, particularly on mobile.
6. **Misleading image optimization configuration.** Images are deliberately unoptimized,
   so Next Image quality/format/cache settings do not provide the expected transformations.
   Direct TMDB URLs must request the correct dimensions at the source.
7. **Monitoring is inert.** A custom Web Vitals monitor exists but is never imported or
   instantiated. It should either report useful data or be deleted.

### Architecture target

```text
Root server layout
├── static dark theme, fonts, skip link
├── server-rendered shell
│   ├── small client navigation island
│   └── route content
│       ├── server-rendered headings, metadata, grids, and initial data
│       └── client islands only for search input, carousel controls,
│           library mutations, dialogs, tabs, and episode progress
└── static compact footer
```

The root should no longer require theme or route-background providers. Authenticated
navigation state can be supplied server-side where practical, with mutation controls
remaining client-side.

## 6. “Fatal Noir” visual system

### Palette

Use OKLCH tokens with semantic names. Initial targets must be contrast-tested before they
are finalized.

| Token | Intent | Visual target |
| --- | --- | --- |
| `canvas` | Page background | Near-black ink, not blue-gray |
| `surface-1` | Quiet grouping | Charcoal barely above canvas |
| `surface-2` | Menus/dialogs | Elevated graphite |
| `bone` | Primary text | Warm off-white |
| `smoke` | Secondary text | Warm neutral gray |
| `crimson` | Primary action/selection | Deep lipstick/oxblood red |
| `crimson-bright` | Focus/active highlight | Used sparingly |
| `brass` | Ratings/special metadata | Muted warm gold, never a second CTA color |
| `line` | Dividers/borders | Low-contrast warm gray |

Avoid pure `#000` for every surface and pure `#fff` for body text. Use pure black only in
art overlays where necessary.

### Type

- **Display:** Crimson Pro for page titles, hero titles, and editorial section headings.
- **UI/body:** Inter for navigation, controls, metadata, and prose.
- **Remove:** JetBrains Mono until the product has a real monospaced data use case.
- Use fluid `clamp()` display sizes, tighter display leading, comfortable body leading,
  tabular numerals for ratings/progress, and a consistent small uppercase eyebrow style.

### Shape and depth

- Reduce the default radius from generic rounded cards to a tighter 2–6 px range.
- Use hairline borders and tonal surface changes before shadows.
- Reserve the strongest shadow for dialogs and floating menus.
- Replace global glass utilities with one intentional `scrim` treatment for content over
  artwork.
- Use asymmetry selectively: offset title blocks, poster overlaps, and thin editorial
  rules. Keep controls conventionally placed.

### Motion

- 120–180 ms for controls and hover/focus feedback.
- 200–280 ms for panels and dialogs.
- One restrained crossfade/scale treatment for hero artwork.
- No entrance animation for every poster in a grid.
- No auto-rotation by default. If retained, provide pause and respect reduced motion.
- Add a global reduced-motion policy and test keyboard focus through every animated state.

## 7. Page-level redesign

### Global shell

- Compact 64 px desktop header and 56–60 px mobile header.
- Emblem plus “Film Fatale” wordmark on desktop; emblem alone is acceptable on small
  screens.
- Primary destinations: Discover, Movies, TV, Library.
- Search becomes a prominent command-style trigger on desktop and a single clear action on
  mobile. A `/` shortcut is optional after accessibility testing.
- Remove theme control and duplicate mobile search.
- Use a simple mobile sheet with focus management and no decorative stagger.
- Replace the corporate three-column footer with a compact single/two-row footer containing
  TMDB attribution and the few useful support links.

### Discover home

- Lead with one featured title, not an uncontrolled five-item carousel.
- Primary action: Details. Secondary action: play an actual trailer when available.
- Add a compact “Continue Watching” rail for authenticated use.
- Follow with one strong “Now Playing” rail and one “Critically Acclaimed” grid.
- Use editorial labels and counts rather than decorative badges.
- Preserve a stable hero height and a stable text block before artwork loads.

### Browse and category pages

- Consistent page header with title, short context, result count, and optional sort/filter.
- Responsive grid target: 2 columns on small phones, 3 on large phones, 4–5 on tablets,
  6–7 on wide desktop depending on container width.
- Use one poster-card primitive with density variants, not separate visual languages.
- Prefer pagination or a deliberate “Load more” pattern with URL state; preserve scroll and
  filter state on back navigation.

### Movie and TV details

- Shared `MediaDetailShell`: backdrop/scrim, poster, title, metadata, synopsis, actions.
- One unmistakable primary library action and one trailer action.
- Streaming providers directly beneath actions when available.
- Collapse long metadata into a clean facts list; avoid wrapping every section in glass.
- Cast becomes a horizontal compact rail; related titles use the standard poster card.
- TV-only season/episode controls appear as domain sections inside the same shell.

### Search

- Search field is the page focus, with recent/suggested queries when empty.
- Group results by All, Movies, TV, and People without requiring a full remount.
- Use debounced URL state, cancellable requests, stable result placeholders, and an
  accessible result count.
- Empty, no-result, loading, and error states receive intentional copy and illustration/
  icon treatment consistent with the noir system.

### Library

- Treat Library as the owner’s command center.
- Top row: Continue Watching with progress and next-episode actions.
- Clear status navigation: Watching, Want to Watch, Watched, All.
- Separate media-type filtering from status navigation and keep both in the URL.
- Offer poster and compact-list density at wider viewports only if both remain maintainable.
- Status changes should update optimistically, announce completion, and preserve scroll.
- Move auth enforcement and initial library data to the server boundary where the current
  Cloudflare auth model permits it.

### Auth, legal, and utility states

- Auth pages use one focused noir panel with clear labels, error summaries, and password
  manager-friendly inputs.
- Legal/about pages use an editorial prose layout, not application cards.
- `loading.tsx`, route errors, empty states, and not-found should share a restrained
  skeleton/state system.

## 8. Implementation roadmap

### Phase 0 — Baseline and visual inventory

- Configure Chrome DevTools MCP or another reproducible Lighthouse/trace setup.
- Capture mobile and desktop traces for the five representative routes.
- Capture screenshots at 375, 768, 1280, and 1536 px.
- Inventory duplicated components and record current critical flows.
- Add smoke tests for navigation, search, details, auth gate, library status, and episodes.

**Exit:** Baseline evidence is stored and critical behavior is protected.

### Phase 1 — Framework and dependency foundation

- Upgrade Next 15 to 16 with the official codemod; migrate middleware/proxy conventions.
- Patch React and types; validate OpenNext local preview and Cloudflare build.
- Remove the custom Webpack `splitChunks` configuration and compare route payloads.
- Upgrade Tailwind 3 to 4 and update the shadcn source primitives.
- Migrate Framer Motion imports to `motion/react`.
- Remove next-themes, unused Radix packages, line-clamp plugin, unused mono font, and dead
  monitoring code or wire it properly.
- Rerun lint, type checking, production build, dependency audit, and route smoke tests.

**Exit:** The modern stack is stable before visual rewrites begin.

### Phase 2 — Dark-only design system

- Define OKLCH semantic tokens, type scale, spacing, radii, borders, focus, shadow, and
  motion tokens in CSS.
- Delete light tokens, `.dark` overrides, theme provider, theme control, and theme icons.
- Replace global glass/elevation/glow utilities with surface, scrim, and overlay primitives.
- Modernize Button, Input, Card, Badge, Dialog, Select, Tabs, Tooltip, Skeleton, Link, and
  focus styles.
- Add skip link, reduced-motion policy, touch target rules, and state/live-region patterns.
- Build a local `/design-system` development page or Storybook-equivalent only if it will
  remain maintained.

**Exit:** All primitives pass dark-theme contrast, keyboard, and reduced-motion checks.

### Phase 3 — Shell and core media system

- Rebuild navigation and footer.
- Create the shared media-card variants, responsive grids/rails, section header, rating,
  metadata, empty state, and skeleton primitives.
- Replace DOM-mutating background logic with route-owned server-rendered detail backdrops.
- Split server-rendered display components from interactive client islands.
- Correct TMDB image size selection and `sizes`; limit priority to actual LCP candidates.

**Exit:** The shell and media primitives are coherent, responsive, and materially lighter.

### Phase 4 — Page migrations

1. Discover home and TV landing
2. Category/browse and search
3. Movie detail and shared detail shell
4. TV detail, seasons, and episode tracking
5. Library and status workflows
6. Person, auth, about/legal, loading/error/not-found

Migrate one vertical slice at a time and delete the superseded CSS/components immediately.
Do not maintain parallel “old” and “new” systems longer than one migration phase.

**Exit:** Every route uses the new system; no light-theme or legacy glass/elevation code
remains.

### Phase 5 — Polish and measured validation

- Re-run browser traces and accessibility snapshots on all representative routes.
- Test keyboard-only, screen-reader names, 200% zoom, reduced motion, and high contrast.
- Test slow 4G/mobile CPU, touch interactions, image failures, empty data, long titles,
  missing backdrops, and authenticated/unauthenticated states.
- Verify Cloudflare preview caching and production asset behavior.
- Run bundle analysis and remove remaining dead code/dependencies.

**Exit:** All acceptance criteria below are met or a documented exception is approved.

## 9. Acceptance criteria

### Experience

- Dark-only with no flash of light UI, theme script, theme toggle, or system-theme branch.
- Film noir/femme-fatale character is recognizable without compromising usability.
- Every primary route has a clear title, primary task, loading state, empty state, and error
  state.
- Important actions work on keyboard, mouse, and touch; no task depends on hover.
- Responsive behavior is intentionally verified from 320 px through wide desktop.

### Accessibility

- WCAG 2.2 AA contrast for text and controls, including text over artwork.
- Complete visible keyboard focus, skip link, correct names/labels, and no focus traps.
- Motion respects `prefers-reduced-motion`; no uncontrolled auto-updating content.
- Touch targets are at least 44 by 44 CSS pixels where applicable.
- Automated checks have no serious/critical issues, followed by manual keyboard and screen
  reader spot checks.

### Performance budgets

- LCP at or below 2.5 s at the 75th percentile target.
- INP at or below 200 ms.
- CLS at or below 0.1.
- No route should inherit a large UI library or animation payload it does not use.
- Shared first-load JavaScript should be reduced substantially from the current 274 kB
  baseline; set the final numeric budget after removing forced vendor chunking and measuring
  actual browser transfer.
- Only the measured LCP image is eager/high priority; below-fold posters lazy-load.
- No avoidable full-screen backdrop blur or continuously animating compositor layers.

### Engineering quality

- Lint, type checking, production Next build, OpenNext build, and critical smoke tests pass.
- `npm audit` is rerun after upgrades; advisories are resolved or explicitly documented.
- No unused theme, font, icon, UI primitive, or obsolete design utility remains.
- Server and client ownership is explicit; display-only components remain server-renderable.

## 10. Recommended execution order

Start with Phase 0 and Phase 1, then prototype the new shell, one poster card, one section
header, and the shared detail hero in Phase 2/3. Apply those approved primitives to the
Discover page first. That page establishes almost every visual decision needed by the rest
of the application while exposing performance problems early.

The first implementation milestone should therefore be:

1. dark-only token foundation,
2. lean application shell,
3. static featured hero with a real trailer action,
4. responsive poster card/grid,
5. one fully redesigned Discover page,
6. measured comparison against the current baseline.
