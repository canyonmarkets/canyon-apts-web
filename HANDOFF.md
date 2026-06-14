# Canyon Apartments (canyon-apts.com) — SEO Build: Current State + Execution Plan

**Updated 2026-06-14 by Opus.** This replaces the original pre-build plan. It's written so a **fresh Sonnet thread** can execute it cold. Goal in Jeff's words: **maximize organic search traffic and conversion so he can throttle down paid Facebook ads.** Currently advertising via Facebook (paid), Facebook Marketplace, and Craigslist.

---

## 0. How to use this doc (Sonnet, read first)
- The **architecture is already built** — follow the existing patterns, don't re-invent them. Concrete examples to copy: `lib/*.ts` (data), `app/[housingType]/[city]/page.tsx` (dynamic route + JSON-LD + metadata), `app/sitemap.ts`.
- Work in **`C:\Users\jeffm\Documents\CLAUDE\VENDING\canyon-apts-web`**. Stack: Next.js 16 (App Router) + React + TS + Tailwind v4. Netlify auto-deploys `main`.
- **Always `npm run build` before pushing** (catches TS errors; confirms all routes prerender). The dev server throws a harmless PhotoCarousel hydration warning — **ignore it; production build is clean.**
- **Keep the light/white brand theme.** Reuse the polish components: `Reveal`, `TiltCard`, `CountUp`/`StatBar`, `Marquee`, `SectionDivider`, `PageChrome`, plus CSS classes `btn-shine` / `nav-link` / `text-gradient-animate` in `app/globals.css`. All motion is `prefers-reduced-motion`-gated.
- **NAP must stay identical everywhere** (matches Paige/GBP): name **Canyon Apartments** · **(602) 935-6830** · service-area (no public address) · email `info@canyon-markets.com`. Source of truth: `lib/site.ts`.
- **If tempted to change URL structure or canonical strategy, STOP and ask Jeff.** That's the one architectural fork left.

---

## 1. DONE (live on main)
- **Premium visual/motion layer** across homepage (commit c62b890) + switched hero to the lighter 2nd video.
- **SEO mesh v1** (commit a5bb9fc):
  - `lib/site.ts` (NAP, brand story, real stats), `lib/cities.ts` (6 cities), `lib/housingTypes.ts` (5 hubs), `lib/hospitals.ts` (by city).
  - `app/[housingType]/[city]/page.tsx` → **25 static spokes** (5 types × 5 non-Phoenix cities), `dynamicParams=false` (off-list cities 404). Per-page title/canonical, **Service + BreadcrumbList JSON-LD**, hospital list on travel-nurse pages, internal-link mesh.
  - Spokes added to `sitemap.xml`. Build = 38 routes, verified.
- **Existing 5 flat Phoenix pages** = the type hubs: `/furnished-apartments-phoenix`, `/no-credit-check-apartments-phoenix`, `/weekly-rentals-phoenix`, `/traveling-nurse-housing-phoenix`, `/corporate-housing-phoenix`.
- Existing schema in `app/layout.tsx` (ApartmentComplex + FAQPage + geo). Title template is `%s | Canyon Apartments`.

---

## 2. Business context (use for authentic, non-thin copy)
- **Origin story (real):** Started as an **Airbnb operation in 2017**; thousands of stays pre-COVID. In 2020 Airbnb canceled their entire **March–April** season (AZ's peak), so they pulled every listing and rebuilt around **direct weekly/monthly furnished rentals** — more stability for residents, full control for them. ("COVID was a blessing.") See `BRAND_STORY` in `lib/site.ts`.
- **Traveling nurses are a core pillar:** ~75% of COVID-era guests; the reason for the pivot. The travel-nurse × hospital angle is the **highest-intent** play — lean into it.
- **Real stats (defensible):** 4,000+ guests hosted, 9+ years, 5 cities served, $495 starting weekly rate.
- **Decisions locked:** Cities = Phoenix, Tempe, Mesa, Gilbert, Chandler (live) + **Scottsdale (coming soon, build the pages now)**. **No West Valley** (Glendale/Peoria/etc. — too far to service). Local copy stays **general** (Phoenix metro = one big connected suburb, no distinct neighborhoods) — lean on freeways + nearby employers/hospitals, not invented neighborhood detail.

---

## 3. Remaining build — prioritized checklist

### P1 — finish the mesh + indexability (do first)
- [ ] **FAQ on every spoke + `FAQPage` JSON-LD.** Reuse homepage `FAQ` content, lightly city/type-flavored (3–5 Qs each). FAQ rich-results are a big SERP-real-estate + CTR win. Add the JSON-LD to the spoke's `@graph`.
- [ ] **City hub pages** `app/[city]/page.tsx` (CONFIRMED wanted): one page per city listing **all 5 housing types** for that city, with city blurb, hospital list, internal links to the 5 spokes + the Phoenix hubs, FAQ, and `CollectionPage`/`BreadcrumbList` JSON-LD. Targets "[city] furnished apartments / corporate housing" and funnels to spokes. **Watch collision:** city slugs (`tempe`,`mesa`,…) must not clash with the `[housingType]` segment — they won't (different values), but verify build. Add to sitemap + `generateStaticParams` with `dynamicParams=false`.
- [ ] **Enrich spoke body copy** so pages aren't thin/duplicate (Google may drop near-duplicate programmatic pages). Each page should have meaningful unique prose: weave `BRAND_STORY`, the city `anchors`, type-specific detail, and a short "why this city" paragraph. Aim ~400+ words of genuinely useful copy per page.
- [ ] **Fix doubled-title bug** on the 5 flat Phoenix pages (their `metaTitle` includes "| Canyon Apartments" AND the layout template appends it → "...| Canyon Apartments | Canyon Apartments"). Strip the suffix from each page's `metadata.title`.
- [ ] **Footer link columns** into the mesh (currently footer is anchor-nav only). Add columns: Housing Types (→ hubs), Cities (→ city hubs), so every page links the full mesh (crawl depth + internal PageRank).

### P2 — the SEO edge (traffic + CTR levers)
- [ ] **OpenGraph + Twitter Card images** per page (`opengraph-image`/`og:image`). Huge for **Facebook/Marketplace/Craigslist** link previews → more clicks on the posts Jeff already makes. Generate branded OG images (Next.js `ImageResponse` or static) with the page title + photo.
- [ ] **`Organization`/`LocalBusiness` schema with `sameAs`** in layout (link FB, IG, GBP, directory profiles once URLs exist) — strengthens entity/brand signals.
- [ ] **Review/`AggregateRating` schema** — wire it in now (reads from a small data file) so it lights up as soon as Google reviews land via Paige. Reviews are the #1 local-rank + conversion lever.
- [ ] **Image SEO:** descriptive `alt` on all gallery/photo images (some are generic "Apartment interior" — make them specific), keep `next/image` optimization, meaningful filenames.
- [ ] **Long-tail content hub (`/guides` or `/blog`)** — the biggest organic lever to replace FB ads. Write genuinely helpful articles for informational intent that paid ads can't cheaply capture, each internally linking to relevant spokes:
  - "How traveling nurses find housing in Phoenix (and what to ask)"
  - "Renting with an eviction in Arizona: what's actually possible"
  - "No-credit-check apartments in Phoenix — how they work"
  - "Furnished vs. unfurnished for a 3-month Phoenix stay"
  - "Moving to Phoenix: where to land while you house-hunt"
  - Add `Article` + `BreadcrumbList` schema; these rank for questions and feed the money pages.
- [ ] **`furnished housing near [hospital]` micro-pages** (or anchored sections on travel-nurse spokes) for the top hospitals in `lib/hospitals.ts` — premium travel-nurse intent. Proximity only, no affiliation claims.

### P3 — measurement + off-site (so you can prove it's working before cutting ads)
- [ ] **Google Search Console:** verify domain, submit `sitemap.xml`, watch indexation of the 25+ new pages.
- [ ] **GA4 + conversion events:** track `tel:` clicks, "Book a Call" clicks, inventory-link clicks, lead-form submits. You need this to know organic is replacing ad-driven leads **before** you throttle Facebook.
- [ ] **GBP alignment (Paige):** confirm Paige points at canyon-apts.com (not a competing microsite), NAP matches `lib/site.ts`, and embed/link the GBP. Add a GBP map embed + reviews section on the homepage/contact.
- [ ] **Directory/citation NAP consistency:** Furnished Finder (critical for nurses), Apartments.com, Zillow/Hotpads, CHBO, Yelp, Bing Places, Nextdoor — identical NAP (see `SEO-CHECKLIST.md`). These feed the map pack and send referral traffic.

---

## 4. Conversion (CRO) — turn the new traffic into bookings
- Already live: above-fold CTA, **click-to-call** `(602) 935-6830`, sticky mobile CTA, pre-screening modal → Calendly, trust stat bar, fast load.
- [ ] **Lead form on spokes/hubs** (not just Calendly) — capture visitors who won't book a call yet. `/api/leads-notify` exists; **confirm `RESEND_API_KEY` is set on Netlify** (it was flagged missing for the follow-up app — verify here too).
- [ ] **Social proof on money pages:** pull 2–3 real Google reviews onto spokes/hubs once available.
- [ ] **Mobile pass:** verify every new page on a real mobile viewport (most local + Craigslist/FB traffic is mobile). Check hero, CTAs, tap targets.
- [ ] Keep **Core Web Vitals** green (it's an organic ranking factor): the lighter video + poster + zero-dep animations already help — don't regress by adding heavy libs.

---

## 5. Guardrails
- One Netlify deploy per logical task (batch changes, build locally, then push) — don't deploy per file.
- Don't fabricate claims (reviews, ratings, "X residents" beyond the defensible 4,000+). Proximity to hospitals is context, never affiliation.
- Reference docs: `SEO-CHECKLIST.md` (off-site checklist), this file (on-site build), and the `canyon-apts-seo` memory note.

**Suggested order for the next thread:** P1 (FAQ schema → city hubs → enrich copy → title fix → footer) → build/verify/push → P2 (OG images → review schema → guides) → P3 (GSC/GA4/GBP) → only then start dialing back Facebook spend as GSC/GA4 show organic leads ramping.
