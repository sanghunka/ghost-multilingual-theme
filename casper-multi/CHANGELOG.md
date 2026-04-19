# Changelog

All notable changes to this theme are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.0.8] — 2026-04-20

### Summary
Tag-based language detection is completely reworked. Previous versions
relied on two brittle assumptions: that the language tag sits at a fixed
position in the tag list (`{{tags.[1].name}}`), and that Ghost's built-in
`{{#has tag="..."}}` helper works the same for internal tags as for
public ones. Both assumptions are gone. The new model serializes every
tag name of a post into a JavaScript array at render time and does all
language / `#multi` detection in JS by searching that array. This
applies identically to the new automated bilingual-post hreflang
(`partials/hreflang-multi.hbs`) and to the tag-page language filter
(`tag.hbs`).

### Changed — tag handling (breaking internal convention)
- **Language detection is now tag-order-independent.** `tag.hbs` no
  longer reads `{{tags.[1].name}}`. Each post card now carries
  `data-tags='[...]'` containing every tag name (public + internal),
  produced via `{{#foreach tags visibility="all"}}`. The filter script
  searches that array for `#en` / `#ko` / ... and hides cards whose
  language does not match the user-selected locale. Reordering tags in
  Ghost admin no longer breaks filtering.
- **`{{#has tag="..."}}` is no longer used for internal tags.** Its
  matching behavior is unreliable for internal tags because the tag's
  slug is `hash-xxx` while its display name is `#xxx` — matching by
  the naive form silently fails. Instead, the new partial and the tag
  page both build a JS array of tag names and call
  `tagNames.indexOf("#multi")` / `"#en"` / etc. This is explicit and
  predictable.
- **`visibility="all"` is required on `{{#foreach tags}}`** when the
  loop needs internal tags. By default Ghost filters internal tags
  (the ones that start with `#`) out of `{{#foreach tags}}`. The
  language tag (`#en`, `#ko`) and the bilingual marker (`#multi`) are
  internal, so both the hreflang partial and `tag.hbs` now pass
  `visibility="all"`.

### Added
- **`partials/hreflang-multi.hbs`** — client-side script that injects
  hreflang tags for bilingual posts / pages at runtime. Uses the new
  tag-array model above to detect `#multi` and the current language,
  then computes partner URLs from the `-en` / `-ko` slug suffix
  convention. Appends three `<link rel="alternate" hreflang=...>` tags
  (including `x-default`) to `<head>`. Invoked from `default.hbs`
  inside `{{#is "post"}}{{#post}}{{> "hreflang-multi"}}{{/post}}{{/is}}`
  (and the matching `"page"` block) so post / page context is
  available for `{{slug}}` and `{{tags}}`.
- **Generalized language configuration.** Both `partials/hreflang-multi.hbs`
  and `tag.hbs` declare `LANGS = ["en", "ko"]` and `DEFAULT_LANG = "en"`
  constants. Adding a locale is a one-line edit in each place plus
  `routes.yaml` and a new `index-<lang>.hbs`.
- **`ADDING_A_LANGUAGE.md`** in the theme folder — worked example
  (Japanese) of extending the theme to a new locale.
- **`CHANGELOG.md`** (this file).

### Removed
- Manual per-post `Code Injection` is no longer required for most
  bilingual posts. Posts that follow the `-en` / `-ko` slug convention
  and the `#multi` tag get hreflang automatically. (Existing manual
  Code Injection in specific posts will coexist — the partial just
  appends three more `<link>` tags alongside it.)

### Notes on SEO and crawler compatibility
- Server-side hreflang generation for posts is not possible on managed
  Ghost hosts (Magic Pages, Ghost(Pro), etc.) that sandbox theme code:
  Handlebars has no string-replace helper and custom helpers cannot be
  registered. Client-side injection is the pragmatic alternative and
  is accepted by Google. Crawlers with weaker JS rendering (legacy
  Bing, some aggregators) may still miss the tags. Acceptable trade-off
  for this blog; revisit if the bilingual post count grows or a
  non-Google search engine becomes important.

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
