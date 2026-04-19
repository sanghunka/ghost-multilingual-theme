# Adding a Language

The theme is wired to support any number of languages, but adding one is a
site-wide operation that touches Ghost routing, theme templates, the hreflang
code, and content. This guide walks through every step using **Japanese
(`ja`)** as the running example.

Prerequisites before starting:

- Every existing `#multi` post/page is ready to be translated into the new
  language, OR you have decided to re-tag them so that `#multi` only marks
  posts that exist in *all* configured languages. If a `#multi` post is
  missing a translation after you activate the new language, hreflang will
  point to a 404 and Google Search Console will flag it.
- You know whether the new language should be the new default
  (unlikely; English is currently default and gets no URL prefix) or an
  additional non-default language (the common case — it will live under
  `/ja/...`).

---

## 1. Routes (`routes.yaml`)

Edit the Ghost server's `routes.yaml` to add a collection for the new
language. This file lives on the Ghost server (the local copy in this repo
is for reference; on Magic Pages it is uploaded via **Ghost Admin → Settings
→ Labs → Routes**).

```yaml
routes:

collections:
  /:
    filter: "tag:en"
    permalink: /{slug}/
    template: index-en
  /ko/:
    filter: "tag:ko"
    permalink: /ko/{slug}/
    template: index-ko
  /ja/:                         # ← new
    filter: "tag:ja"
    permalink: /ja/{slug}/
    template: index-ja

taxonomies:
  tag: /tag/{slug}/
  author: /author/{slug}/
```

Upload the updated `routes.yaml` to Ghost Admin.

## 2. Per-locale index template

Duplicate one of the existing locale indexes and adapt:

```bash
cp index-ko.hbs index-ja.hbs
```

Edit `index-ja.hbs`:

```handlebars
{{!< index}}
{{#contentFor "lang"}}ja{{/contentFor}}
{{#contentFor "hreflang-home"}}
    <link rel="alternate" hreflang="en" href="{{@site.url}}/" />
    <link rel="alternate" hreflang="ko" href="{{@site.url}}/ko/" />
    <link rel="alternate" hreflang="ja" href="{{@site.url}}/ja/" />
    <link rel="alternate" hreflang="x-default" href="{{@site.url}}/" />
{{/contentFor}}
```

**Also update the other existing index templates** (`index-en.hbs` and
`index-ko.hbs`) to include the new `hreflang="ja"` line in their
`hreflang-home` block. Every index file should emit the same set of
`<link rel="alternate">` tags.

## 3. Hreflang JS (`default.hbs`)

Add the language code to the `LANGS` array at the top of the hreflang
script:

```javascript
var LANGS = ["en", "ko", "ja"];     // ← add "ja"
var DEFAULT_LANG = "en";
```

Nothing else in the script needs to change. The regex that strips the
language suffix is built from `LANGS.join("|")`, and URL construction is
already generalized.

## 4. Header language selector

The `<select id="languageSelector">` in `default.hbs` has hardcoded
`<option>` entries. Add the new language:

```html
<select id="languageSelector">
    <option value="en">English</option>
    <option value="ko">한국어</option>
    <option value="ja">日本語</option>         <!-- ← new -->
</select>
```

The selector's JavaScript (`initializeLanguageSelector` at the bottom of
`default.hbs`) currently has two hardcoded redirect paths:

```javascript
if (!currentUrl.includes('/tag/')) {
    window.location.href = this.value === 'ko' ? '/ko/' : '/';
}
```

Generalize the redirect so the default lang maps to `/` and every other
lang maps to `/{lang}/`:

```javascript
if (!currentUrl.includes('/tag/')) {
    window.location.href = this.value === 'en' ? '/' : '/' + this.value + '/';
}
```

## 5. UI strings (`messages/` or inline)

Translate any user-visible inline strings that are currently hardcoded
in English (post card "read more", footer copyright, etc.). The theme
is mostly content-driven, but audit `partials/*.hbs` for any hardcoded
English copy and add the Japanese equivalents.

## 6. Content tagging conventions

Every Japanese post must follow the existing convention:

- **Slug** ends with `-ja` (e.g., `codex-ja`).
- **Tags**, in order:
  1. topic tag (same as the other-language pair)
  2. `#ja` — language tag
  3. `#multi` — only if partner posts exist in *every* configured language

If you add `ja` to `LANGS` but leave older `#multi` posts without a
Japanese translation, their hreflang will resolve to
`https://sanghunkang.com/ja/<stem>-ja/` which returns 404. Either:

- **Strict**: finish translating every existing `#multi` post to Japanese
  before flipping the switch, OR
- **Pragmatic**: temporarily remove `#multi` from posts that don't yet
  have Japanese versions. Re-add it per post as translations land.

## 7. Tag/author pages

`tag.hbs` currently filters posts by their 2nd tag (`data-language`)
against the localStorage-selected language. With Japanese added, the
existing selector drop-down will produce `selectedLanguage === "ja"`,
and cards whose 2nd tag is `#ja` will show. No further change needed.

(This assumes you only want users to see *one* language at a time on
the tag archive. If you want mixed-language archives, the tag page
script needs rework.)

## 8. Deploy and verify

1. Bump the theme version (zip file name, e.g., `multi-0.1.0.zip`).
2. Manual zip + upload + activate (see `../../../CLAUDE.md` →
   "Deploy workflow").
3. Verify:
   ```bash
   curl -sL https://sanghunkang.com/         | grep hreflang    # expect en, ko, ja, x-default
   curl -sL https://sanghunkang.com/ko/      | grep hreflang
   curl -sL https://sanghunkang.com/ja/      | grep hreflang
   curl -sL https://sanghunkang.com/codex-en/| grep hreflang    # expect ja URL too (JS-rendered)
   ```
   Check Japanese URLs actually render (not 404).
4. Submit the new sitemap language in Google Search Console and request
   indexing for a sample Japanese post.
5. Monitor Search Console's **International Targeting** report over the
   next 1–2 weeks for hreflang errors.

---

## Summary checklist

- [ ] `routes.yaml` — add `/ja/` collection, upload to Ghost.
- [ ] `index-ja.hbs` — new file with `lang` + `hreflang-home` contentFor.
- [ ] `index-en.hbs`, `index-ko.hbs` — add `hreflang="ja"` line.
- [ ] `default.hbs` — add `"ja"` to `LANGS`, add `<option>` to selector,
      generalize the redirect condition.
- [ ] Existing `#multi` posts: translate to Japanese *or* strip
      `#multi` from untranslated ones.
- [ ] New Japanese posts follow `#ja` + `-ja` slug convention.
- [ ] Deploy theme, curl-verify home pages and a sample post.
- [ ] Submit/inspect in Search Console.
