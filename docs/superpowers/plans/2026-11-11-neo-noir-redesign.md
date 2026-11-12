# Clean neo-noir redesign: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the blinds and gradient look with a flat, panel-based neo-noir system built from shared components, across every page.

**Architecture:** Design tokens live in `src/app/globals.css` (Tailwind v4 `@theme inline`). A small kit in `src/components/ui/` (Panel, FactCard, MountedPoster, BackdropStrip, Chip, SegmentedControl, field styles) and a shared detail header carry the patterns. Pages are rebuilt on these parts. There are no data or API changes.

**Tech stack:** Next.js 16, React 19, Tailwind v4, Radix, CVA, Phosphor icons.

**Spec:** `docs/superpowers/specs/2026-11-11-neo-noir-redesign-design.md`. Read it before starting. Its tables and anti-goals are binding.

## Global constraints

- No gradients of any kind: no `linear-gradient`, `mask-image` fades, scrims or gradient borders. Dimming is only `filter: brightness(.45) saturate(.85)` on the backdrop strip.
- No glows or blur. Use `shadow-float` only, and only on menus, dialogs and the sheet.
- Always dark. Images stay in full colour, apart from the strip filter above.
- Copy is sentence case, with no all-caps tracked labels, hover lifts or zooms.
- Keep 44px touch targets, focus-visible ring, skip link and reduced-motion support.
- No horizontal page scroll from 320px up.
- No new dependencies and no data-layer changes.
- Work on branch `redesign/neo-noir` (already created). Push to `main` only once at the end (Task 9).

## Verification method (applies to every task)

The repo has no test runner, and the spec rules out new dependencies. Each task's "tests" are therefore these checks:

1. `npx tsc --noEmit` passes with no errors.
2. `npm run lint` passes with no errors.
3. A visual check in `npm run dev` (http://localhost:3000) with the puppeteer MCP tools. Take screenshots at 1440×900 and 390×844 of the routes the task lists.
4. The overflow probe returns `true` on each listed route at 390 and at 320 wide:
   `document.documentElement.scrollWidth <= window.innerWidth`
5. The gradient probe returns no matches (run it from Task 1 onwards):
   `grep -rnE "gradient|mask-image|text-shadow|blinds|art-scrim" src`

Sample routes:
- Home: `/`
- TV landing: `/tv`
- Movie: `/movie/27205`
- TV show: `/tv/1396`
- Season: `/tv/1396/season/1`
- Person: `/person/17419`
- Browse: `/movies/popular?genre=80&decade=1990`
- Search: `/search?q=breaking`
- Library (signed out): `/library`
- Legal: `/about`, `/privacy`
- 404: `/movie/999999999`

## Review focus

These are the likely failures the spec implies, plus the check that pins each one:

1. **A title with no backdrop or no poster.** The strip is missing, so the poster must not pull up into empty space, and a missing poster shows the fallback icon inside the mat. Task 3 adds a `DetailHeader` check: with `backdrop={null}` the poster has no negative margin.
2. **Long titles and many providers on phones.** Fact rows wrap and nothing overflows at 320px. Run the overflow probe on `/tv/1396` and `/movie/122` (*The Return of the King*) in Task 3.
3. **Empty fact values** (rating 0, no certification, no streaming, no creators). These rows are skipped, not shown blank. `FactCard` filters with the same rule as today's `FactList` (Task 2).
4. **Shows still airing.** The TV "Aired" row reads `YYYY – present` with a "Returning" pill when `in_production` is true. Check a running show such as `/tv/94997` (*House of the Dragon*) in Task 3.
5. **Signed-out visitors.** `LibraryButton` renders nothing, so the actions row must still look right, and the library page shows the sign-in state. Check signed out in Tasks 3 and 7.

---

### Task 1: Tokens and base CSS

**Files:**
- Modify: `src/app/globals.css` (whole file)
- Modify: `.gitignore` (add `.superpowers/`)
- Add to git: `docs/superpowers/specs/…-design.md` and this plan

**Interfaces:**
- **Produces CSS variables:** `--page`, `--surface-1`, `--surface-2`, `--surface-3`, `--line`, `--line-strong`, `--ink`, `--ink-muted`, `--violet`, `--mint`, `--blue`, `--red`, `--shadow-float`.
- **Produces Tailwind utilities:** `bg-page`, `bg-surface-1/2/3`, `border-line`, `border-line-strong`, `text-ink`, `text-ink-muted`, `text-violet`, `text-mint`, `shadow-float`.
- **Text sizes:** `text-2xs` (0.6875rem), `text-ui` (0.8125rem), `text-md` (0.9375rem), plus Tailwind's own `text-xs`, `text-sm` and `text-base`.
- **Radii:** `rounded-sm` = 4px, `rounded-md` = 6px, `rounded-lg` = 8px.
- **Semantic aliases kept:**

  | Alias | Points to |
  |---|---|
  | `--background` | page |
  | `--card` | surface-1 |
  | `--popover` | surface-2 |
  | `--secondary` | surface-2 |
  | `--muted` | surface-2 |
  | `--muted-foreground` | ink-muted |
  | `--accent` | surface-3 |
  | `--border` | line |
  | `--input` | line-strong |
  | `--primary` | violet |
  | `--ring` | violet |
  | `--destructive` | red |

- **Produces component classes:** `.tile`, `.tile-art` and `.tile-body`, which replace `.poster-card*`. They are the same structure, with a surface-2 background, a line border and `rounded-md`. Hover changes the border to `--violet` at 60% opacity.

Steps:

- [ ] **Step 1:** Rewrite the `:root` palette with the spec's values.
  - `--surface-3: #262338`
  - `--line-strong: #3a3652`
  - `--shadow-float: 0 12px 32px rgb(0 0 0 / .5)`
  - Rewrite the header comment so it describes the flat panel system, with no mention of blinds.
- [ ] **Step 2:** Map the tokens in `@theme inline`, including `--text-2xs`, `--text-ui`, `--text-md`, `--radius-sm/md/lg` and `--shadow-float`.
- [ ] **Step 3:** Delete `.blinds`, `.art-scrim`, `.text-shadow`, `.surface-float` and `.display-title`. Rename `.poster-card`, `.poster-card-art` and `.poster-card-body` to `.tile`, `.tile-art` and `.tile-body`. Keep `.poster-frame` and `.page-header` for now; Task 8 deletes them.
- [ ] **Step 4:** Update every `poster-card` class use: `media-card.tsx`, `person-tile.tsx`, `library-tile.tsx` and `poster-skeleton.tsx`. Then delete the uses of the removed classes (`blinds`, `art-scrim`, `text-shadow`, `surface-float`, `display-title`) in `featured-hero.tsx`, `details-hero.tsx`, `dialog.tsx`, `dropdown-menu.tsx` and `select.tsx`. Use `bg-popover border border-line rounded-lg shadow-float` where `surface-float` was. Delete the backdrop `mask-image` in `details-hero.tsx`. These files get fully rebuilt later; this step only needs the build to stay green.
- [ ] **Step 5:** Run the verification method. The gradient probe must return no matches. Spot-check `/` at 1440.
- [ ] **Step 6:** Commit:
  ```bash
  git add .gitignore src docs
  git commit -m "style: flat neo-noir tokens; remove blinds and gradients"
  ```

### Task 2: Component kit

**Files:**
- Create:
  - `src/components/ui/panel.tsx`
  - `src/components/ui/fact-card.tsx`
  - `src/components/ui/mounted-poster.tsx`
  - `src/components/ui/backdrop-strip.tsx`
  - `src/components/ui/chip.tsx`
  - `src/components/ui/segmented-control.tsx`
  - `src/components/layout/site-logo.tsx`
- Modify:
  - `src/components/ui/button.tsx`
  - `src/components/ui/input.tsx`
  - `src/components/ui/textarea.tsx`
  - `src/components/ui/select.tsx`
  - `src/components/ui/skeleton.tsx`
  - `src/components/ui/dialog.tsx`
  - `src/components/ui/sheet.tsx`
  - `src/components/ui/dropdown-menu.tsx`
- Delete: `src/components/shared/section.tsx` (after moving its users in Tasks 3 to 7, so delete it in Task 8)

**Interfaces (produced):**

```ts
// panel.tsx
export function Panel(props: {
  title?: string;            // title bar label; no bar when omitted
  aside?: ReactNode;         // right side of the title bar
  className?: string;
  bodyClassName?: string;    // default "p-3 sm:p-4"
  children: ReactNode;
}): JSX.Element               // <section aria-labelledby> when titled
export const panelLinkClass: string  // quiet aside link: text-ui text-ink-muted hover:text-ink min-h-11 -my-3 flex items-center

// fact-card.tsx
export interface Fact { label: string; value: ReactNode }
export function FactCard(props: { facts: Fact[]; className?: string }): JSX.Element | null   // <dl> rows
export function FactGrid(props: { facts: Fact[]; className?: string }): JSX.Element | null   // today's FactList grid, renamed
// Both drop facts whose value is null, undefined, "" or false; return null when none remain.

// mounted-poster.tsx
export function MountedPoster(props: {
  src: string | null; alt: string; sizes: string; priority?: boolean;
  fallback: "movie" | "tv" | "person"; className?: string;
}): JSX.Element

// backdrop-strip.tsx
export function BackdropStrip(props: { src: string | null; className?: string }): JSX.Element | null

// chip.tsx
export function Chip(props: { tone?: "default" | "mint"; className?: string; children: ReactNode }): JSX.Element

// segmented-control.tsx
export const segmentVariants: (opts: { selected: boolean }) => string   // cva, for Link-based segments
export function SegmentedControl<T extends string>(props: {
  label: string;                                  // aria-label of the group
  options: { value: T; label: ReactNode; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}): JSX.Element                                   // buttons with aria-pressed

// input.tsx
export const fieldClass: string   // shared look for Input, Textarea, native <select>, Radix SelectTrigger

// site-logo.tsx
export function SiteLogo(props: { withName?: boolean; className?: string }): JSX.Element
```

Visual specs:

- **Panel:** `bg-surface-1 border border-line rounded-lg overflow-hidden`.
  - Title bar: `bg-surface-2 border-b border-line px-3 sm:px-4 py-2.5 flex items-center justify-between gap-4`.
  - Title: `h2 text-ui font-semibold text-ink`.
- **FactCard:** `bg-surface-1 border border-line rounded-md`. Each row is a `grid grid-cols-[7rem_1fr] gap-3 px-4 py-2.5 text-sm`, with a `border-t border-line` between rows. Labels use `dt text-ink-muted`.
- **MountedPoster:**
  - Mat: `relative z-10 rounded-[9px] border border-line bg-page p-1.5`.
  - Inner box: `relative aspect-[2/3] overflow-hidden rounded-sm bg-surface-2`, using `next/image` fill and `object-cover`.
  - Fallback: a `Film`, `MonitorPlay` or `User` icon.
- **BackdropStrip:** a `relative aspect-[5/2] sm:aspect-[4/1] overflow-hidden rounded-lg border border-line` wrapper around an `Image` with `object-cover object-[center_25%] brightness-[.45] saturate-[.85]`. It returns `null` when `src` is null.
- **Chip:** `inline-flex items-center h-6 px-2.5 rounded-full border text-xs`.
  - Default tone: `bg-surface-2 border-line`.
  - Mint tone: `text-mint border-mint/35`.
- **Segments:**
  - Base: `min-h-10 px-3.5 rounded-md border text-sm font-medium`.
  - Selected: `bg-violet border-violet text-page`.
  - Unselected: `bg-surface-2 border-line text-ink-muted hover:text-ink hover:border-line-strong`.
  - `count` renders after the label in `tabular-nums`, at 60% opacity.
- **Button variants:** `rounded-md`.
  - `default`: violet fill.
  - `secondary` and `outline`: `bg-surface-2 border-line hover:bg-surface-3`. Both are kept, with the same look.
  - `ghost`, `destructive` and `link`: unchanged apart from the tokens.
  - `lg` becomes `min-h-11 px-5` (calmer).
- **fieldClass:** `min-h-10 w-full rounded-md border border-line-strong bg-surface-1 px-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-violet`.
- **Floating layers:** dialog, sheet and dropdown use `bg-popover border-line shadow-float`; dialog and dropdown also get `rounded-lg`. Delete the ad-hoc `shadow-[…]` values in `sheet.tsx`.
- **Skeleton:** `bg-surface-2 rounded-md`.
- **SiteLogo:** `/logo.png` at 32px with no white circle, plus "Film Fatale" in the serif when `withName` is set (hidden below `sm`). It is the single place to swap the owner's new logo.

Steps:

- [ ] **Step 1:** Create the seven files above with the listed signatures and classes.
- [ ] **Step 2:** Update the eight `ui` files. Point `Input`, `Textarea` and `SelectTrigger` at `fieldClass`.
- [ ] **Step 3:** Run `npx tsc --noEmit` and `npm run lint`. Both must pass.
- [ ] **Step 4:** Commit: `feat(ui): panel, fact card, mounted poster, chips and segments`.

### Task 3: Detail header plus the movie and TV pages

**Files:**
- Create: `src/components/ui/detail-header.tsx`, which replaces `details-hero.tsx`
- Modify:
  - `src/components/shared/watch-providers.tsx`
  - `src/components/shared/series-strip.tsx`
  - `src/components/shared/media-section.tsx`
  - `src/components/person/cast-grid.tsx`
  - `src/components/movie/movie-details-page.tsx`
  - `src/components/tv/tv-details-page.tsx`
- Delete: `src/components/ui/details-hero.tsx`

**Interfaces:**
- **Consumes:** Panel, FactCard, FactGrid, MountedPoster, BackdropStrip and Chip from Task 2.
- **Produces:**

```ts
export function DetailHeader(props: {
  backdrop?: string | null;        // strip shown only when truthy
  poster: { src: string | null; alt: string; fallback: "movie" | "tv" | "person" };
  eyebrow?: ReactNode;             // e.g. season page's link back to the show
  title: string;
  tagline?: string | null;
  overview?: ReactNode;            // rendered in .reading-text
  afterOverview?: ReactNode;       // e.g. person "You've watched them in…"
  actions?: ReactNode;
  facts: Fact[];
}): JSX.Element
export function DetailsPageSkeleton(): JSX.Element   // moved here; matches new header + two panels
export function StreamingOn(props: { providers?: WatchProviderRegion; className?: string }): JSX.Element | null
  // now just the provider list + "All options"; no "Stream on" label (the fact row supplies it)
```

**Layout:**
- **Desktop** (`lg`): `grid-cols-[13rem_minmax(0,1fr)_20rem] gap-8`.
- **Tablet** (`sm`): `grid-cols-[9rem_minmax(0,1fr)]`, with the fact card spanning both columns below.
- **Phone:** `grid-cols-[6.5rem_minmax(0,1fr)]`. The title sits beside the poster; the overview, actions and fact card go full width below.
- **Poster overlap:** only when a backdrop exists: `-mt-16 sm:-mt-20 lg:-mt-28`. The grid also takes `px-0 sm:px-4 lg:px-5` so the poster sits inside the strip's edge.
- **Title:** `.hero-title`; tagline in serif italic, muted.

**Fact rows** (built in the page components, each passed as `facts`):

| Movie | TV |
|---|---|
| Rating: `★ 7.9`, star in violet | Rating |
| Released: `formatDate(release_date)`, plus a default `Chip` with the status when status ≠ "Released" | Aired: `2008 – 2013`, or `2008 – present` when `in_production`, plus a mint `Chip` with "Ended", "Returning" (for "Returning Series") or the raw status |
| Runtime | Seasons: `5 seasons, 62 episodes` |
| Rated: the certification | Genres |
| Genres | Created by: links, at most 3 |
| Directed by: links | Network: the first 2 |
| Stream on: `<StreamingOn/>` | Stream on |

**Details panel (long tail only):**
- Movie: Budget, Box office, Production, Language, plus `ExternalLinks`.
- TV: First aired (full date), Last aired or Latest episode (full date), Language, plus `ExternalLinks`.

**Sections become panels:**
- `MediaSection` wraps its grid in `Panel`, with the aside as a `panelLinkClass` link.
- Seasons/collection use `Panel` with an aside of `"N + specials"` or `"N films"`.
- Cast, Details and Crew become panels.
- Page body: `site-container space-y-5 md:space-y-6 pb-14 pt-6`. The header sits open on the page above.

**Restyles:**
- `SeriesStrip` entries become `bg-surface-2 border-line rounded-md` tiles. The current entry uses `border-violet`.
- `CastGrid` row hover changes to `hover:bg-surface-2`.

Steps:

- [ ] **Step 1:** Build `DetailHeader`, `DetailsPageSkeleton` and the trimmed `StreamingOn`.
- [ ] **Step 2:** Rebuild the movie and TV page bodies on `DetailHeader` and panels, with the fact rows above. Keep the existing hooks and data logic unchanged.
- [ ] **Step 3:** Restyle `SeriesStrip`, `MediaSection` and the `CastGrid` hover. Delete `details-hero.tsx`.
- [ ] **Step 4:** Run the verification method on:
  - `/movie/27205`
  - `/movie/122`
  - `/tv/1396`
  - `/tv/94997` ("present" and the Returning pill)
  - one title without a backdrop, if you can find one through search. Otherwise read the code to confirm the overlap margin is conditional on `backdrop`.

  Check signed out: the actions row shows Watch trailer only and is aligned.
- [ ] **Step 5:** Commit: `feat: fact-sheet detail header and panel sections on title pages`.

### Task 4: The Featured panel on home and /tv

**Files:**
- Create: `src/components/shared/featured-panel.tsx`
- Delete: `src/components/shared/featured-hero.tsx`
- Modify: `src/app/page.tsx`, `src/app/tv/page.tsx`

**Interfaces:**
- `FeaturedPanel(props: { items: (Movie | TVShow)[]; mediaType: "movie" | "tv" })` takes the same props as `FeaturedHero`.
- It renders a `Panel` with:
  - title `"Featured"`
  - aside: a "See all" link to `/movies/now-playing` or `/tv/on-the-air`
- **Body:** `grid lg:grid-cols-[1fr_1.15fr] gap-6 lg:gap-8 items-center p-4 sm:p-6`. The left side holds:
  - the kicker (`text-ui font-semibold text-violet`): "New in theaters" or "New episodes this week"
  - the title (serif, `.hero-title`)
  - the rating and year line
  - the overview with `line-clamp-2`
  - a `View details` primary button

  The right side holds the backdrop at full colour: `aspect-video rounded-md border border-line`, `priority`, no filter. On phones the backdrop comes first (`order-first lg:order-none`). With no backdrop, the text column spans the full width.
- **Page bodies:** `site-container space-y-5 md:space-y-6 py-6 md:py-8`, with the featured panel first and the shelves after.

Steps:

- [ ] **Step 1:** Build `FeaturedPanel` and swap it into both pages.
- [ ] **Step 2:** Run the verification method on `/` and `/tv`.
- [ ] **Step 3:** Commit: `feat: featured panel on home and TV`.

### Task 5: The person page

**Files:** modify `src/components/person/person-details-page.tsx`.

**Interfaces:** consumes `DetailHeader` (with no `backdrop`), Panel, FactCard, FactGrid and SegmentedControl.

- **Header:**
  - poster: the profile photo, with `fallback: "person"`
  - title: the name
  - overview: `career.summary`
  - afterOverview: `<SeenIn/>`
  - facts: Known for (role), Born (date), Birthplace, Died, Age
- **Panels:**
  - "You probably know them from"
  - "Career by decade"
  - "Most often in"
  - "Highlights" (the old CareerFacts, now a `FactCard` inside a panel)
  - "Filmography": the filter becomes a `SegmentedControl` in the panel's aside on `sm+`, and sits above the list on phones
  - "About"
- Keep the two-column grids, with `gap-5 md:gap-6`.
- Decade and genre bars stay flat violet: `bg-violet/70` on `bg-line`.
- Filmography row hover changes to `hover:bg-surface-2`.
- Replace `.poster-frame` thumbnails with `rounded-sm border border-line bg-surface-2`.
- Delete the `lg:text-[1.0625rem]` override.

Steps:

- [ ] **Step 1:** Rebuild the header and panels as above. Keep the data logic unchanged.
- [ ] **Step 2:** Run the verification method on `/person/17419` and on `/person/1` (sparse data: no photo or summary is fine).
- [ ] **Step 3:** Commit: `feat: person page on the shared header and panels`.

### Task 6: The season page

**Files:** modify `src/components/tv/tv-season-details-page.tsx`.

- **Header:** `DetailHeader` with:
  - backdrop: `tvShow?.backdrop_path` as w1280
  - poster: the season poster
  - eyebrow: a link to the show
  - title: `season.name`
  - overview: the season overview
  - facts: Rating, Aired (full date), Episodes (count)
- **Panels:** "Episodes", with episode stills as `rounded-md border border-line`; "Cast"; "Crew".
- **Previous/next nav:** two `secondary` buttons in a row under the panels. Remove the top border.
- **Skeleton:** reuse `DetailsPageSkeleton`.

Steps:

- [ ] **Step 1:** Rebuild the header, panels and nav as above.
- [ ] **Step 2:** Run the verification method on `/tv/1396/season/1` and `/tv/1396/season/0`.
- [ ] **Step 3:** Commit: `feat: season page on the shared header and panels`.

### Task 7: Browse, search and library

**Files:**
- Modify:
  - `src/components/category/category-page.tsx`
  - `src/components/category/browse-filters.tsx`
  - `src/components/category/page-links.tsx`
  - `src/components/search/browse-page.tsx`
  - `src/components/search/search-results.tsx`
  - `src/app/library/page.tsx`
  - `src/components/library/up-next-list.tsx`
  - `src/components/library/library-panel.tsx`
  - `src/components/library/library-tile.tsx`
  - `src/components/tv/episode-tracker.tsx`
  - `src/components/shared/empty-state.tsx`
  - `src/components/ui/poster-skeleton.tsx`

**Category pages:**
- The title, lede, list switcher (`segmentVariants` on the Links) and filters (`fieldClass` on the native select) sit open on the page. Drop `.page-header` and its bottom border.
- The grid goes in a `Panel`:
  - title: the list title, plus the filter summary when filtered (e.g. "Popular movies · Crime · 1990s")
  - aside: `Page X of Y`
- `PageLinks` sits below the panel. The current page uses `bg-surface-2 border-line`.

**Search:**
- The input uses `fieldClass` at `min-h-14 text-lg pl-12`, open on the page.
- The type filter becomes a `SegmentedControl`.
- `SearchResults` sections become panels titled "Movies", "TV shows" and "People", with the count in the aside.

**Library:**
- The tabs become a `SegmentedControl`-styled nav of buttons with counts (keep `aria-current`).
- The list goes in a `Panel`:
  - title: the current tab label
  - aside: the Type `SegmentedControl` (compact), plus the filter input when the list has 12 or more items
- `UpNextList` rows sit inside the panel and drop their outer `border-y`.
- In the library sheet:
  - the header poster uses `MountedPoster`
  - the status buttons use `segmentVariants`
  - the episode tracker's season buttons use `segmentVariants`
  - watched episodes stay mint-filled, and unaired episodes stay dashed
- `EmptyState` becomes `rounded-lg border border-line bg-surface-1 px-6 py-14 text-center`.

**Skeletons:** `MediaCardSkeleton` uses `.tile` and `PosterPageSkeleton` gets a panel shape.

Steps:

- [ ] **Step 1:** Rebuild the category and search pages.
- [ ] **Step 2:** Rebuild the library page, the up-next list, the sheet and the episode tracker.
- [ ] **Step 3:** Run the verification method on:
  - `/movies/popular`
  - `/movies/popular?genre=80&decade=1990`
  - `/tv/top-rated?page=2`
  - `/search?q=breaking`
  - `/search?q=zzzzqq` (empty)
  - `/library` (signed out)

  Signed-in library views can't be reached locally without auth. Read the library code paths again to check them, and say so in the final report.
- [ ] **Step 4:** Commit: `feat: browse, search and library on panels`.

### Task 8: Nav, footer, static pages and cleanup

**Files:**
- Modify:
  - `src/components/layout/navigation.tsx`
  - `src/components/layout/footer.tsx`
  - `src/app/about/page.tsx`
  - `src/app/privacy/page.tsx`
  - `src/app/terms/page.tsx`
  - `src/app/not-found.tsx`
  - `src/app/error.tsx`
  - `src/app/loading.tsx`
  - `src/app/globals.css`
- Delete: `src/components/shared/section.tsx`

**Nav:**
- `SiteLogo withName`.
- Links come from one `navLinkClass(active)` used on desktop and mobile:
  - base: `min-h-9 px-3 rounded-md text-sm font-medium`
  - active: `bg-surface-2 text-ink`
  - idle: `text-ink-muted hover:text-ink`
- Remove the `after:` underline and the `-bottom-[11px]` offset.
- The search input uses `fieldClass`.
- The account avatar circle uses `border-line-strong`.

**Footer:**
- `SiteLogo withName`, with `border-t border-line` and the existing links.

**Static pages:**
- Legal and about: the prose stays open on the page; the `.legal-copy` section rules use `--line`.
- Not-found and error: a centred `EmptyState`-style block.
- Loading: matches the new skeleton shapes.

**Cleanup:**
- Delete `.poster-frame`, `.page-header` and any classes left unused (check with `grep -rn` for each class name before deleting).
- `grep -rnE "rounded-sm border|bg-accent|text-\[0\.|poster-frame|page-header|Section\b|FactList"` over `src` must find no leftover old patterns, except intentional `rounded-sm` on small inner images.

Steps:

- [ ] **Step 1:** Do the nav and footer work.
- [ ] **Step 2:** Do the static pages.
- [ ] **Step 3:** Do the CSS cleanup and run the grep sweep.
- [ ] **Step 4:** Run the verification method on all sample routes. Also open the mobile menu at 390 and screenshot it.
- [ ] **Step 5:** Commit: `style: nav, footer and static pages; remove old classes`.

### Task 9: Full check and ship

- [ ] **Step 1:** Run `npm run lint`, `npx tsc --noEmit` and `npm run build`. All must succeed.
- [ ] **Step 2:** Do a full visual pass: every sample route at 1440, 390 and 320. Each must pass the overflow probe, and the gradient probe must return no matches.
- [ ] **Step 3:** Run one whole-branch review (`superpowers:requesting-code-review`) against the spec's anti-goals. Fix what it finds and commit.
- [ ] **Step 4:** Merge to main and push. Pushing deploys automatically.
  ```bash
  git checkout main && git merge --ff-only redesign/neo-noir && git push origin main
  ```
- [ ] **Step 5:** After the deploy finishes, load https://filmfatale.app and `/tv/1396` and screenshot them to confirm the new design is live.
