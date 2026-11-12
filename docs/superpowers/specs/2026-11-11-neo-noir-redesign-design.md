# Film Fatale — clean neo-noir redesign

Date: 2026-11-11
Status: awaiting owner approval

## Intent

The owner wants to retire the "noir blinds" look and move the site to a cleaner
neo-noir style: the same violet-black palette with a little VS Code Tokyo Night in
it, built from clearly defined components that each read as their own block but
flow together down the page. The owner will design a new favicon and site logo
after this ships, to match.

Why: the current site gets its mood from paint effects (venetian-blind stripes,
gradient fades and scrims, text shadows over photos). With those gone, the pages
need a structure that carries the identity instead: crisp surfaces, clear edges
and a consistent set of parts.

The owner's words to build by:

- "clean, defined components that are visually distinct but flow on the page nicely"
- "I don't like gradients. Clean simple color scheme, always dark mode"
- Title pages: "all pertinent information in a clean simple easily scannable way"
- Other pages should "take on the new design but in a seamless beautiful way, not forced"

## Goals

1. Remove the blinds and every gradient effect from the site.
2. Give every content section a defined panel so the page reads as distinct blocks.
3. Make title pages scannable: key facts in labelled rows, not one run-on line.
4. Replace copied Tailwind class strings with a small set of named components and
   design tokens, so each pattern is defined once.
5. Carry the new look across every page (home, browse, title, season, person,
   search, library, legal and about pages, nav, footer) so it feels native
   everywhere, not bolted on.

## Non-goals

- No new features, data or API changes. Same content, new presentation.
- No logo or favicon work. The owner is doing that afterwards (see Logo slot below).
- No light mode or theme toggle. The site is always dark.
- No change to fonts (Newsreader + Instrument Sans), the poster-grid column logic
  (3/4/6/8 columns, full rows), page sizes or URL structure.

## Anti-goals (failure even if it technically works)

- Any gradient, including gradient masks, fades to the page, scrims and gradient
  borders. The only allowed dimming is a flat, uniform `filter: brightness()` on an image.
- Glows, neon halos, blur and glassmorphism.
- Heavy drop shadows on page content. A shadow is allowed only on floating layers
  (menus, dialogs, the library sheet), and only one shared one.
- Pages that look like a dashboard: panels inside panels inside panels, or busy
  title bars. Panels should feel calm, not boxy or "forced".
- Bringing back anything the owner already rejected: grayscale or a noir tone
  toggle, grain, all-caps tracked labels, hover lifts or zooms, "noir voice"
  copy, cyberpunk clichés (glitch, scanlines, monospace HUD labels).

## Constraints

- Next.js 16 / React 19 / Tailwind v4 (`@theme inline` tokens in
  `src/app/globals.css`), Radix primitives, CVA for variants, Phosphor icons.
  Build on these; no new UI library.
- Deploys automatically when `main` is pushed (Cloudflare via OpenNext). Don't
  deploy by hand.
- Images stay in full colour everywhere (the backdrop strip is dimmed, not desaturated
  beyond a light touch).
- Keep current accessibility: focus-visible ring, skip link, 44px touch targets,
  `prefers-reduced-motion`, semantic headings and labelled regions.
- Must work from 320px wide up, with no sideways page scroll.
- Plain, sentence-case copy.

## Rollout (owner's decision)

Build the whole redesign on a branch and push it to `main` once, when it's
complete. Intermediate steps don't need to leave the site in a finished state.
Before the push, check every page type locally (`npm run dev`) at phone and
desktop widths: home, /tv, movie, TV, season, person, browse lists with
filters, search, library (with the sheet open), about/privacy/terms, 404 and
error. Run `npm run lint` and `npm run build` as well.

## Decided by the owner (mockups reviewed in the brainstorm)

### 1. Title page header: "fact sheet with a mounted poster"

This is used for movie and TV pages.

- **Backdrop strip:** the title's backdrop as a short wide strip (about 4:1 on
  desktop) in a hard-edged frame with rounded corners and a hairline border. It is
  dimmed to about 45% brightness with a slight desaturation (`brightness(.45)
  saturate(.85)`), with no overlay, no text on it and no fade at the edges.
- **Mounted poster:** the poster overlaps the bottom of the strip. It sits in a
  "mat" (about 6px of page-coloured padding, a hairline border and a slightly
  larger radius than the poster) so it reads as a print cut out of the strip. It
  stays full colour and is the brightest thing in the header. It must stack above
  the dimmed strip (the filter creates a stacking context, so the poster needs
  `position: relative` and a z-index).
- **Below the strip, three columns:** the mounted poster; then the title (serif),
  tagline (serif italic, muted), overview (reading text) and action buttons
  (Watch trailer as the primary button, Add to library, Share); then a **fact card**.
- **Fact card:** a bordered surface with label/value rows separated by hairlines.
  Labels are muted and values are normal text. For TV the rows are Rating, Aired
  (with an Ended/Returning pill in mint), Seasons (seasons and episodes), Genres,
  Created by (links), Network and Stream on (provider logos). It replaces the
  current single metadata line plus the "Directed by"/"Created by" line plus the
  "Stream on" row.

### 2. Sections: panels with a title bar

- Every content section is a **panel**: one surface step above the page, a
  hairline border and a radius of about 8px.
- Each panel has a **title bar** across its top: one more surface step, a
  hairline under it, a short sans-serif label on the left (about 13px, semibold,
  sentence case, not all caps) and an optional quiet link or count on the right
  ("See all", "5 + specials", "More drama from the 2000s"). It's like a VS Code
  pane header, but calm.
- Panels stack with even vertical gaps. The page background between panels is
  what separates them, with no extra rules.
- Poster and person tiles inside panels keep their own small tile (a surface step,
  hairline border, image flush at the top, then the title and a year/rating row).

### 3. Home page: a featured panel

- The top of the home page is still one featured new movie or show (currently the
  first "now playing" title with a backdrop).
- It is a **panel** like every other section, with the title bar "Featured" and a
  right-side note ("New in theaters"). The body has two columns: on the left a
  violet kicker line, the serif title, the rating and year line it has today, a
  two-line overview and a **View details** primary button. On the right is the
  backdrop at **full colour** in its own framed 16:9 box. The /tv landing page
  uses the same component.
- *Designer's call:* the mockup also showed a Trailer button. It is dropped
  because the "now playing" data has no trailers, and adding a fetch would break
  the no-data-changes non-goal.
- The home shelves follow as panels with title bars.
- So the dimmed strip with a mounted poster belongs to detail pages, and the
  full-colour framed backdrop belongs to the home feature.

### 4. Everything else

Nav, browse lists, search, season pages, person pages, library and footer adopt
the same tokens, panels and components, so they belong to the same family.
"Seamless, not forced" means:

- Use a panel where a section has content to group. Don't wrap single lines of
  text, page titles or whole pages in panels just for consistency.
- Page titles and their controls (list switchers, filters, tabs) sit open on the
  page above the panels.

## Palette and tokens

This keeps the current palette with stronger steps between surfaces so the
edges read. These are the values used in the approved mockups (tune by eye
during the build, but keep the four-step structure):

| Token | Value | Use |
|---|---|---|
| `--page` | `#0e0d15` | page background, poster mat |
| `--surface` | `#16151f` | panels, fact card |
| `--surface-2` | `#1e1c2b` | title bars, tiles, secondary buttons, chips |
| `--surface-3` | builder's call, one step up | hover state of surface-2 items |
| `--line` | `#2c2940` | every hairline border and divider |
| `--text` | `#e6e4f0` | body text |
| `--muted` | `#9a97b0` | labels, secondary text |
| `--violet` | `#a277ff` | primary actions, selected state, focus ring, star icons, kicker |
| `--mint` | `#61ffca` | progress, watched, new-episode badges, status pills |
| `--blue` | `#7aa2f7` | reserved; no current use (was blinds light only) |
| `--red` | `#f7768e` | destructive actions only |

- Radii: 6px for controls, tiles, chips' container and the fact card, 8–9px for
  panels and the poster mat, and fully rounded for pills.
- One shadow token for floating layers only.
- The existing shadcn-style semantic names (`--background`, `--card`, `--primary`
  and so on) can remain as aliases so Radix/shadcn components keep working.

## Component kit (builder's call on file layout and APIs)

Define each pattern once and use it everywhere. The expected set:

- **Tokens and type scale** in `globals.css`, replacing the one-off sizes in use
  today (`0.6875`, `0.8125`, `0.9375` and `1.0625rem`).
- **`Panel`** with an optional title bar (`title`, `aside`/`action`), replacing
  `Section` from `src/components/shared/section.tsx`.
- **`FactCard`** (label/value rows), used by the detail header and wherever
  `FactList` is used today where it fits.
- **`MountedPoster`**, the matted poster and its fallback icon, used in the detail
  header, person header, season header and library sheet header.
- **`BackdropStrip`**, the framed, dimmed backdrop.
- **`DetailHeader`**, one header for movie, TV, season and person pages (person and
  season pages have no strip; see open items).
- **`PosterTile`** and **`PersonTile`** on one shared tile base (today
  `.poster-card`, `.poster-frame` and the series strip are three different ideas).
- **`SeriesStrip`** entries (seasons and collections) restyled as small tiles in
  the same family.
- **`Chip`/`Pill`** for status pills, certification and badges.
- **`SegmentedControl`**, one "selected" style for the category list switcher,
  library status buttons, season picker and library tabs (currently copied by hand
  in four places).
- **One `Select`**: the browse filters use a native `<select>` and the episode
  tracker uses Radix Select. Pick one look; a native select styled to match is
  fine for the filters if it looks identical.
- **`Button`** variants trimmed to what the design uses: primary (violet),
  secondary (surface-2 with hairline), ghost, destructive and link.
- **Nav** and the mobile menu share one link style and active state (no hard-coded
  `-bottom-[11px]` offset).

## Logo slot

The current logo is `public/logo.png` on a white circle (`bg-foreground
rounded-full`) in the nav, and `src/app/favicon.ico`. The owner will replace both.
For now, keep the image but drop the white circle treatment, and make the nav
logo a single component, so the new SVG or PNG can be swapped in one place. Open
Graph images that reference `/logo.png` stay as they are.

## What to remove

- `.blinds`, `.art-scrim` and `.text-shadow` and all their uses.
- The gradient `mask-image` on the detail hero backdrop.
- The ad-hoc shadows on the hero poster and the sheet (replace with the floating
  shadow token where a shadow is still needed).
- `.poster-frame` and `.page-header` once their replacements are in.
- Update the header comment in `globals.css`, which still describes the blinds.

## Left to the builder

- Exact spacing, padding and type sizes, tuned by eye against the mockups.
- Component file layout, prop names and variant APIs.
- Phone layouts. Expected: the backdrop strip stays but gets shorter, a small
  mounted poster sits beside the title, the fact card drops below the overview at
  full width, and the home feature stacks the backdrop above the text. Panels
  keep the 16px page gutter with tighter inner padding.
- What happens to the existing "Details" section on title pages now that the
  header has a fact card. Expected: the header card holds the scannable
  essentials, and a Details panel keeps only the long tail (original title,
  languages, budget, revenue, companies and so on), with no fact shown twice.
- Whether person and season pages show a backdrop strip. Expected: person pages
  have no strip (there's no backdrop) but use the same mounted photo and fact
  card; season pages may reuse the show's backdrop.
- Loading skeletons should match the new shapes.

## Reference

- Approved mockups: `.superpowers/brainstorm/65175-1794446347/content/`
  (`poster-edge-v2.html` P3, `section-panels.html` S2, `home-featured-v2.html` H2,
  and `title-header-v3.html` A2 for the fact-sheet layout). These are local only
  and not committed.
- Current design notes: owner memory "design-direction". Its blinds and "no
  boxed Card panels" rules are superseded by this document.
