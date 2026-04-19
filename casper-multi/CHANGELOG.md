# Changelog

All notable changes to this theme are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.0.8] — 2026-04-20

### Added
- Client-side hreflang injection for bilingual posts/pages (tagged `#multi`),
  extracted into `partials/hreflang-multi.hbs`. The partial reads all the
  post's tag names (including internal tags via `visibility="all"`), detects
  `#multi` and the language tag (`#en` / `#ko`) regardless of tag order,
  computes partner URLs from the slug suffix convention, and injects three
  `<link rel="alternate" hreflang=...>` tags into `<head>` at runtime.
  Invoked from `default.hbs` inside `{{#is "post"}}{{#post}}...{{/post}}{{/is}}`
  and the matching `"page"` block so the post/page context is available.
  Googlebot executes this JS and indexes the injected tags. Removes the need
  for per-post manual Code Injection on most bilingual pairs.
- Generalized language configuration: `LANGS = ["en", "ko"]` and
  `DEFAULT_LANG = "en"` constants drive both the hreflang partial and the
  tag-page filter; extending the theme to a new locale is a one-line edit
  in each place plus `routes.yaml` and a new `index-<lang>.hbs`
  (see `ADDING_A_LANGUAGE.md`).
- `ADDING_A_LANGUAGE.md` in the theme folder: step-by-step procedure for
  adding a new language using Japanese as the worked example.
- `CHANGELOG.md` (this file).

### Changed
- `tag.hbs` language filter rewritten to be tag-order-independent. Instead
  of reading `{{tags.[1].name}}` (which required the language tag to be
  exactly the second tag), each card now serializes every tag name into
  `data-tags='[...]'` and the client-side script searches that array for
  `#en` or `#ko`. Misordered or topic-tag-missing posts still filter
  correctly. Matches the pattern used by `partials/hreflang-multi.hbs`.

### Notes
- Server-side hreflang generation for posts is not possible on managed
  Ghost hosts (Magic Pages, Ghost(Pro), etc.) that sandbox theme code:
  Handlebars has no string-replace helper and custom helpers cannot be
  registered. Client-side injection is the pragmatic alternative and is
  accepted by Google. Crawlers with weaker JS rendering (legacy Bing,
  some aggregators) may still miss the tags.
- `{{#has tag="multi"}}` (Ghost's built-in helper) was unreliable for
  internal tags because their slugs are `hash-xxx` while names are `#xxx`.
  Detection is now done in JS by inspecting `{{#foreach tags visibility="all"}}`
  output, which is both predictable and order-independent.

## [0.0.7] — 2026-04-19

### Added
- Automatic hreflang on both locale home pages (`/` and `/ko/`) via a
  `contentFor "hreflang-home"` block. `default.hbs` renders
  `{{{block "hreflang-home"}}}` before `{{ghost_head}}`, and both
  `index-en.hbs` and `index-ko.hbs` inject the identical three-link
  block (`hreflang="en"`, `hreflang="ko"`, `hreflang="x-default"`).

### Changed
- Renamed `package.json` `name` from `casper` to `casper-multi` to avoid
  collision with Ghost's built-in Casper theme during upload.
- Theme folder renamed from `multi` to `casper-multi`.

### Fixed
- `/ko/` home page was silently missing hreflang tags in the first
  attempt because Ghost's `{{#is "home"}}` helper matches only `/`, not
  `/ko/` (which is a collection home, not the site home). Switching to
  the `contentFor` pattern fixes this.
- Language-selector icon was oversized on an intermediate build because
  rebuilding `assets/built/*.css` in a fresh `node_modules/` environment
  produced different `cssnano`/`postcss` output (dropped the
  `.icon-language` rules). The committed `assets/built/` snapshot is now
  treated as the known-good artifact; releases reuse it instead of
  regenerating.

## [0.0.6] — pre-2026-04-19

### Fixed
- Tag page: post excerpts now fade in along with the card when a
  language is selected (previously only the card itself animated,
  leaving excerpts transparent).

## [0.0.5] — pre-2026-04-19

### Added
- Language filtering on tag and author pages. Post cards now carry
  `data-language="{{tags.[1].name}}"` and an inline script
  (backed by `assets/js/util.js`'s `getSelectedLanguage()`) hides
  cards whose language does not match the user's selected locale
  (tracked in `localStorage`).
- Smooth fade-in transition when filtered cards become visible.

## [0.0.4] — pre-2026-04-19

### Added
- Header language selector: a globe icon + `<select>` dropdown
  (English / 한국어) in the site header. Selection is persisted to
  `localStorage` and navigates to `/` or `/ko/` on change.
- `assets/js/util.js` with `getSelectedLanguage()` and `updateLink()`
  helpers shared across templates.

### Changed
- `<html lang>` now has an explicit fallback: renders the value from
  the `lang` content block, or `en` if no block is provided.

## [0.0.3] — pre-2026-04-19

Incremental changes (see commit history).

## [0.0.2] — pre-2026-04-19

Incremental changes (see commit history).

## [0.0.1] — initial bilingual fork

### Added
- Forked TryGhost/Casper 5.7.0 as the base theme.
- Added `index-en.hbs` and `index-ko.hbs` that inherit from `index.hbs`
  and set `<html lang>` via a `lang` content block
  (`{{#contentFor "lang"}}`).
- Bilingual routing relies on `routes.yaml` (Ghost server configuration):
  `/` collection filters `tag:en` with permalink `/{slug}/`, and `/ko/`
  collection filters `tag:ko` with permalink `/ko/{slug}/`.
- Slug convention: English posts end with `-en`, Korean posts end with
  `-ko` (Ghost auto-301s crossed URLs like `/codex-ko/` → `/ko/codex-ko/`).

---

## Conventions

### Release tagging in Ghost
Each release is uploaded as `multi-<version>.zip` (e.g., `multi-0.0.7.zip`).
Ghost derives the installed theme name from the zip filename, not from
`package.json` `name`. Older versions remain in the Ghost admin as a
rollback history.

### Version tracking
The authoritative theme version is the zip filename (e.g., `multi-0.0.8`).
`package.json` `name` stays `casper-multi` across versions. The
`package.json` `version` field is inherited from the Casper fork and is
not tracked per release — consult this `CHANGELOG.md` for the logical
theme version history.
