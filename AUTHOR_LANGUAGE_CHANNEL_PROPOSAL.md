# Language-Specific Author Channels

## Status

Deferred design proposal. This is not the implementation selected for
`multi-0.0.9`. Version `0.0.9` keeps the existing client-side archive filter
and extends it from tag pages to author pages.

## Problem

Ghost's default author taxonomy renders every post written by an author and
calculates pagination before browser JavaScript runs. The current bilingual
theme reads the preferred language from `localStorage` after page load and
hides cards from the other language. This is simple and works well for the
current site, but pagination still describes the unfiltered author archive.

The server cannot use `localStorage` because that value exists only in the
browser. Exact server-side pagination therefore requires language to be part
of the request URL.

## Proposed URLs

Keep the existing English author URL and add a Korean equivalent:

```text
/author/sanghun/
/author/sanghun/page/2/

/ko/author/sanghun/
/ko/author/sanghun/page/2/
```

Post URLs do not change.

## Proposed Routing

Replace the default author taxonomy archive with two static Ghost channels.
The exact internal language tag slugs must be verified against the production
content before applying the configuration.

```yaml
routes:
  /author/sanghun/:
    controller: channel
    template: author-en
    filter: "primary_author:sanghun+tag:hash-en"

  /ko/author/sanghun/:
    controller: channel
    template: author-ko
    filter: "primary_author:sanghun+tag:hash-ko"

taxonomies:
  tag: /tag/{slug}/
```

The default author taxonomy must be removed or relocated so that it does not
conflict with the English channel route. Because this publication has one
permanent author, two static routes are sufficient.

## Request Flow

For a request to `/ko/author/sanghun/page/2/`, Ghost would:

1. Match the Korean author channel in `routes.yaml`.
2. Filter posts by `primary_author:sanghun` and the Korean language tag.
3. Calculate totals and page boundaries from the filtered result.
4. Fetch the second page of that result.
5. Render the posts and native pagination through `author-ko.hbs`.

The filter runs before `LIMIT` and `OFFSET`, so page size and page count are
correct for each language. No cards need to be hidden in the browser.

## Theme Structure

The proposed theme implementation would use:

```text
author-en.hbs
author-ko.hbs
partials/author-archive.hbs
```

The two entry templates would set locale-specific metadata and share the
actual author header, post list, and pagination markup through the partial.
Because channel routes provide posts and pagination but not the normal author
taxonomy context, the author profile would be loaded server-side with Ghost's
`{{#get "authors" slug="sanghun"}}` helper.

All theme links to the author archive would also become language-aware:

```text
English content -> /author/sanghun/
Korean content  -> /ko/author/sanghun/
```

Changing language from a paginated author URL should navigate to the first
page of the target-language archive. The two languages can have different
numbers of pages.

## SEO

Each author archive would be rendered in a single language on the server.
The templates should provide:

- A canonical URL for the current-language author archive.
- `hreflang="en"` and `hreflang="ko"` links between the two archive roots.
- An `x-default` link to the English author archive.

## Magic Pages Deployment

This design does not modify Ghost core or the database. Deployment requires
only:

1. Uploading the updated custom theme ZIP.
2. Uploading the updated `routes.yaml` in Ghost Admin.
3. Verifying both channels, pagination, RSS, canonical links, and hreflang on
   the production site.

The routing and channel features are standard Ghost configuration, so they
remain separate from managed-host updates.

## Tradeoffs

### Benefits

- Correct language-specific page counts and page sizes.
- Server-rendered single-language archives.
- Native Ghost pagination and RSS.
- No Ghost core fork, custom server process, or browser Content API client.

### Costs

- The Korean author archive gains a new URL.
- The default author taxonomy must be removed or relocated.
- Author links, canonical metadata, and hreflang require theme updates.
- The static route contains the author slug and language-tag slugs, which must
  be updated if those identifiers ever change.

## Adoption Trigger

Reconsider this proposal if client-side filtering begins producing sparse or
empty author pages, if author-archive SEO becomes important, or if accurate
per-language RSS feeds are required.
