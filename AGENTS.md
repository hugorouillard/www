# Repository Guide

## Current Architecture

- This is currently a dependency-free static site: `index.html` is the page and content source, `styles.css` supplies custom theming, and `script.js` owns theme, animation, and in-page blog navigation behavior.
- There is no package manifest, build step, test suite, linter, formatter, CI workflow, or checked-in deployment configuration. Do not invent npm commands or add tooling for an otherwise small change.
- Hugo has been considered for future content growth but is not installed or adopted. Do not migrate the site or introduce a framework unless the task explicitly calls for it.
- `.nojekyll` is intentional for direct static hosting. The target domain is `hugorouillard.dev`, but this repository contains no `CNAME` or deploy workflow, so do not assume the hosting/DNS flow is configured here.

## Run And Verify

- Serve the repository root with `python3 -m http.server 8000`; opening the file directly does not accurately exercise root-relative URLs and history behavior.
- The page requires network access for Tailwind Browser v4, Font Awesome, and Motion, all loaded from CDNs in `index.html`.
- After JavaScript edits, run `node --check script.js`. There are no automated browser tests; manually check desktop and mobile widths, both themes, the blog link, a direct `/?blog=01` load, and browser Back/Forward.

## Runtime Traps

- Tailwind classes are compiled in the browser, not by a local Tailwind build. Custom CSS also uses native CSS nesting; do not "fix" either by assuming a missing build pipeline.
- The inline `<head>` theme script prevents a color flash. `applyTheme()` must keep `data-theme`, the toggle label/title, `theme-color`, and `localStorage` synchronized.
- Current blog content lives in hidden `section[id^="blog-0"]` elements. `script.js` copies it into `#blog-content` and uses `?blog=<id>` plus History API state; edits to this flow must cover click, direct-load, Back, and Forward paths.
- Several elements start at zero opacity and Motion reveals them. When changing animation, keep core content readable if the CDN or JavaScript fails and respect reduced-motion users.

## Product Direction

- Treat the homepage as a curated storefront: a short personal introduction followed by selected projects and writing, not the complete archive.
- Future structure should support dedicated full project and writing indexes plus flexible public material for interests such as cubing, casual physics study, and Factorio guides. Favor a small permanent navigation and a `Misc`, `Notes`, or similarly flexible area over one top-level item per hobby.
- `https://stanislas.blog/` and `https://mitchellh.com/` are structural and design references: content-first pages, concise identity, restrained navigation, curated home content, chronological writing archives, and room for miscellaneous interests. Use the principles; do not clone their branding or layouts.
- Preserve the hand-crafted, minimal, text-first visual language: centered content, Catppuccin-based dark mode, warm light mode, accent-colored links, diagonal separators, and restrained motion. Do not replace it with a generic portfolio theme or card-heavy dashboard.
- Current prose and entries are placeholders. Do not fabricate biography, accomplishments, project details, dates, or personal-best data; ask for content or leave explicit placeholders.
