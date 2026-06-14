# Canyon Apartments (canyon-apts.com) — Handoff for SEO Local-Presence Build

**Created:** 2026-06-14 · **Purpose:** Resume in a fresh thread. Two jobs: (A) the mobile-display scare, (B) build the local-SEO landing-page mesh like we did for canyon-markets.com.

---

## A. The "messed-up mobile page" — DIAGNOSED: not a real site problem

Jeff signed up with **Merchynt / "Paige"** (an AI agent for Google Business Profile / Maps local SEO). On his **phone** the site looked broken — "little blog posts on the page," hero video "all screwed up" — but it looks **fine on desktop**.

**What I checked (2026-06-14):**
- `git log` — newest commit is the leads page. **No commits from Merchynt/Paige.** The SEO tool did not touch the repo.
- Grepped the whole project — **no injected `<script>`, widget, embed, gtag, or "merchynt/paige" anywhere.** The only `<script>` is our own JSON-LD (`app/layout.tsx:301`).
- **No blog/article pages exist** in the codebase (`app/` has only the home + 5 keyword landing pages + /leads + /api).
- Fetched the **live homepage with an iPhone user-agent**: `200 OK`, hero `<video>` present, correct title, **zero blog/article content, zero merchynt/paige strings.**

**Verdict:** The real website served to phones is clean — other visitors are **not** seeing a mess. The "blog posts" Jeff saw are almost certainly **Paige's Google Business Profile posts** (GBP posts render as little cards and, on a phone Google search, sit right under the business name — easy to mistake for "my website"). The broken hero is most likely **his phone's browser cache** showing a stale/half-loaded paint.

**Tell Jeff:** hard-refresh / clear cache on the phone, or open canyon-apts.com in a private/incognito tab on the phone — it'll look correct. Confirm whether what he saw was actually the **Google listing** (maps.google / the business panel), not the site.

**One genuine, small improvement to make (next thread):** `components/Hero.tsx` `<video>` has **no `poster` image**. On a slow phone connection the hero can show black until the MP4 loads. Add a `poster="/hero-poster.jpg"` fallback (export a frame of HeroVideo.mp4). Also consider it doesn't `preload` a poster. This is polish, not the reported bug.

**To fully close the loop:** this environment couldn't render external URLs in a real mobile browser (only fetch HTML). In the next thread, load canyon-apts.com in a mobile viewport (Chrome devtools / preview tool that allows the domain) and eyeball the hero + sections to be 100% sure no CSS-only mobile glitch exists.

---

## B. Current state of canyon-apts.com

- **Stack:** Next.js (App Router) + React + TypeScript + Tailwind, Netlify auto-deploy from `github.com/canyonmarkets/canyon-apts-web` (main). Light/white brand theme (`brand-*` orange on white, `iron-900` hero) — **different from the dark markets site. Keep this theme; this is an SEO build, not a redesign.**
- **Components:** Hero (bg video), Amenities, BookCallButton (Calendly), CTABanner, FAQ, Footer, HowItWorks, Locations, Navbar, PhotoCarousel (24 photos), PricingBanner, SiteShell, TheDifference, WhoWeHelp.
- **Existing pages (5 keyword landing pages):** `/furnished-apartments-phoenix`, `/no-credit-check-apartments-phoenix`, `/weekly-rentals-phoenix`, `/traveling-nurse-housing-phoenix`, `/corporate-housing-phoenix`. Plus `/leads` (Joleen's prospect tracker) and `/api/leads-notify`.
- **Schema already present:** ApartmentComplex + FAQPage + geo meta (commit 913eb9e). Verify in next thread.
- **`SEO-CHECKLIST.md` already exists** — covers OFF-site work: Netlify/DNS, Search Console, **Google Business Profile (Paige now handles this)**, GA4, directories (Furnished Finder, Craigslist, Zillow, CHBO, etc.), social, reviews. Don't duplicate it — this handoff is the ON-site landing-page build that complements it.
- Contact/booking: Calendly + pre-screening modal. Leads also via `/api/leads-notify` (check Resend key usage).

---

## C. The build — local-SEO landing-page mesh (mirror canyon-markets.com)

Reference the markets template: `../canyon-markets-web/SEO-BUILD-PLAN.md` (industry × city pages). For apartments the analog is **housing-type × city** (and optionally a traveling-nurse × hospital sub-play, which is very high-intent).

**Proposed matrix (confirm with Jeff):**
- **Housing types** (the existing 5 keyword pages become the "hubs"): Furnished Apartments · No-Credit-Check Apartments · Weekly Rentals · Traveling-Nurse Housing · Corporate Housing. (Maybe add: Monthly/Extended-Stay.)
- **Cities (service area):** Phoenix, Tempe, Mesa, Gilbert, Chandler (+ Scottsdale? Glendale? confirm). Hero currently lists Phoenix · Tempe · Mesa · Gilbert · Chandler.
- **Pages:** `/[housing-type]/[city]` spokes = 5 × ~5–6 = ~25–30 unique pages, each with city-specific copy + FAQ + schema, cross-linked to siblings + hubs. Mirror the markets structure (generateStaticParams, generateMetadata, Service/Breadcrumb/FAQPage JSON-LD, programmatic sitemap, footer link columns).
- **High-value extra:** Traveling-Nurse Housing × major Phoenix hospitals (Banner, Mayo Clinic AZ, HonorHealth, Phoenix Children's, Dignity/St. Joseph's, VA) — "furnished housing near [hospital]" is premium traveling-nurse search intent. (Reference hospitals as proximity context, not affiliations.)
- Build `lib/site.ts` / `lib/housingTypes.ts` / `lib/cities.ts` data files like markets.

**Merchynt/Paige coordination:** Paige manages the **Google Business Profile** (off-site posts, Maps). It does **not** edit the website. The two are complementary — our on-site landing pages + their GBP work reinforce each other. Make sure the **NAP (name/address/phone) is identical** everywhere: "Canyon Apartments" / service-area (no public address) / (602) 935-6830. Don't let any Paige-generated "website" or microsite compete with canyon-apts.com for the brand term — confirm Paige is pointing at canyon-apts.com.

---

## D. Info to get from Jeff before building (next thread)
1. **Final housing types + cities** for the matrix (confirm/trim the proposed list; add Scottsdale/Glendale?).
2. **Traveling-nurse hospital pages** — yes/no, and which hospitals.
3. **Publishable credibility numbers** (like markets: e.g., "since 20XX," # of units, # of residents housed, years in business) for trust + schema.
4. **Real per-city/neighborhood context** he can speak to (which areas the units are actually in) — for non-thin local copy.
5. Confirm **service-area, no public address** (same as markets) for schema/GBP NAP consistency.
6. Any **real amenities/policies** to feature per type (e.g., no-credit-check specifics, weekly pricing, what's included).

## E. Checklist (next thread)
- [ ] Visually verify mobile in a real mobile viewport; add hero `poster` fallback
- [ ] Confirm matrix (types × cities) with Jeff + gather Part D info
- [ ] `lib/` data files (site, housingTypes, cities)
- [ ] Convert the 5 keyword pages into hubs; build `/[type]/[city]` spokes
- [ ] (Optional) traveling-nurse × hospital pages
- [ ] Service/Breadcrumb/FAQPage JSON-LD helpers + per-page metadata/canonicals
- [ ] Programmatic sitemap + internal-link mesh + footer columns
- [ ] `next build` verify → push (Netlify auto-deploys main) → spot-check live
- [ ] Cross-check NAP consistency with Paige/GBP
