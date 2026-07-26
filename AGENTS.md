# Repository Guide

## Current Architecture

- This is a Hugo static site. `content/` stores page content and front matter, `layouts/` contains the Go HTML templates, and `assets/` contains CSS and JavaScript processed through Hugo Pipes.
- Projects may link directly to an external repository or render an optional local detail page. Writing uses normal Hugo section and single pages.
- There is no package manifest, test suite, linter, formatter, CI workflow, or checked-in deployment configuration. Do not invent npm commands or add JavaScript tooling for an otherwise small change.
- The site intentionally uses hand-written CSS and browser-native JavaScript without a frontend framework or CDN runtime dependencies.
- `static/.nojekyll` is intentional for static hosting. The configured target domain is `hugorouillard.dev`, but this repository contains no `CNAME` or deploy workflow, so do not assume the hosting/DNS flow is configured here.

## Product Direction

- Treat the homepage as a curated storefront: a short personal introduction followed by selected projects and writing, not the complete archive.
- Future structure should support dedicated full project and writing indexes plus flexible public material for interests such as cubing, casual physics study, and Factorio guides. Favor a small permanent navigation and a `Misc`, `Notes`, or similarly flexible area over one top-level item per hobby.
- `https://stanislas.blog/` and `https://mitchellh.com/` are structural and design references: content-first pages, concise identity, restrained navigation, curated home content, chronological writing archives, and room for miscellaneous interests. Use the principles; do not clone their branding or layouts.
- Preserve the hand-crafted, minimal, text-first visual language: centered content, Catppuccin-based dark mode, warm light mode, accent-colored links, diagonal separators, and restrained motion. Do not replace it with a generic portfolio theme or card-heavy dashboard.
- Current prose and entries are placeholders. Do not fabricate biography, accomplishments, project details, dates, or personal-best data; ask for content or leave explicit placeholders.
