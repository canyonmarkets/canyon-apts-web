# Canyon Apartments Web — CLAUDE.md

Project: `canyon-apts-web` · Live site: https://canyon-apts.com · Netlify auto-deploys `main`.
Repo path: `C:\Users\jeffm\Documents\CLAUDE\CANYON-APTS\canyon-apts-web`

---

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4
- Supabase (Postgres + Auth + Storage)
- Resend (transactional email)
- Netlify (hosting + Scheduled Functions)
- Twilio (SMS — pending A2P 10DLC registration)

---

## Dev Workflow

- **Always `npm run build` before pushing.** TS errors fail the Netlify build silently — a clean local build is mandatory.
- Run `npm run dev` and verify in the browser before pushing.
- Batch all related changes into one push per logical task — one Netlify deploy per task, not one per file.
- The dev server throws a harmless PhotoCarousel hydration warning — ignore it; production build is clean.

---

## Business Context & Guardrails

**NAP (must be identical everywhere, source of truth: `lib/site.ts`):**
Canyon Apartments · (623) 230-7020 · service-area only · properties@canyon-advisors.com

**Brand:** white/light theme, Canyon orange `#C94B0C` (brand-500). Reuse polish components: `Reveal`, `TiltCard`, `CountUp`/`StatBar`, `Marquee`, `SectionDivider`, `PageChrome`, plus CSS classes `btn-shine` / `nav-link` / `text-gradient-animate`. All motion is `prefers-reduced-motion`-gated.

**Real stats (only use these — no fabrication):** 4,000+ guests, 9+ years, 5 cities, $495/week starting rate.

**Cities served:** Phoenix, Tempe, Mesa, Gilbert, Chandler. **No West Valley** (too far to service). Scottsdale was removed from the site entirely on 2026-07-04 (it attracted callers we couldn't serve) — re-add the entry in `lib/cities.ts` when a Scottsdale unit is secured; all pages regenerate from that list.

**Funnel design (intentional — do not change):**
- No phone number in the public UI (lives only in JSON-LD schema).
- No lead capture form — conversion is: website → download inventory (Google Doc) → book a call via BookCallButton → Calendly → Joleen sends application/photos.
- The BookCallButton 4-item checklist (including "$495 is per week not per month") is the screen. It filters out tire-kickers. Do not add a phone number or lead form.
- `/api/leads-notify` route is dormant/harmless — leave or delete.

**Do not change URL structure or canonical strategy without asking Jeff.**

---

## SEO Architecture (Hub-and-Spoke Mesh) — LIVE

All 94 routes prerendered and in sitemap.xml.

- **Tier 1 — Flat Phoenix pages (5):** `/furnished-apartments-phoenix`, etc.
- **Tier 2 — Spoke pages (25):** `app/[housingType]/[city]/page.tsx` — 5 types × 5 cities
- **Tier 3 — City hub pages (5):** `app/apartments/[city]/page.tsx`
- **Content hub (6):** `app/guides/[slug]/page.tsx`

**Data layer:** `lib/site.ts`, `lib/cities.ts`, `lib/housingTypes.ts`, `lib/hospitals.ts`, `lib/faqs.ts`, `lib/guides.ts`

**GBP Knowledge Graph ID:** `/g/11npvbhw3x`

### SEO Features Live
- FAQ + FAQPage JSON-LD on all spokes
- City hub pages with CollectionPage/BreadcrumbList JSON-LD
- Service + BreadcrumbList JSON-LD on all flat Phoenix pages (via `lib/jsonld.ts`)
- Dynamic branded OG images on all 35 routes (`lib/og.tsx` OgCard)
- `/guides` content hub (6 articles) with Article JSON-LD
- `sameAs` entity signal in ApartmentComplex schema
- `AggregateRating` scaffold in `lib/reviews.ts` (`enabled: false` — flip when Paige delivers real reviews)
- Hospital micro-content prose on travel-nurse spokes
- Dual hero CTAs: "Book a Free 15-Min Call" + "View Inventory & Rates" (inventory URL centralized in `SITE.inventoryUrl`)
- GA4 gtag.js + GSC meta verification in `layout.tsx`, gated on env vars

### SEO — Remaining (Jeff's off-site actions)
1. Set `NEXT_PUBLIC_GA_ID` (G-XXXXXXXXXX) in Netlify env vars
2. Set `NEXT_PUBLIC_GSC_VERIFY` in Netlify → deploy → verify in GSC → submit sitemap.xml
3. GBP via Paige: confirm pointing to canyon-apts.com, NAP matches `lib/site.ts`
4. Furnished Finder listing (critical for travel nurses)
5. Bing Places, Yelp, Apartments.com NAP citations
6. Flip `lib/reviews.ts` `enabled: true` once Paige delivers real Google reviews

---

## Booking System — ALL PHASES BUILT, Pending Go-Live

**DO NOT push the booking system to GitHub until Jeff explicitly approves go-live.**

### Public Routes
- `/book` — 5-step booking flow (confirmation checkboxes → info form → availability → time picker → review/submit)
- `/available-now` — Public inventory page (server-rendered, revalidates 60s). Photo carousel, amenity chips, status pills, Book CTA.
- `/book/confirmed` — Confirmation page

### Staff Routes (magic link auth via Supabase)
- `/staff/login` — Magic link login
- `/staff` — Today's bookings dashboard
- `/staff/bookings` + `/staff/bookings/[id]` — Booking list + detail (status, pipeline stage, photo recap, notes, screening answers)
- `/staff/inventory` + `/staff/inventory/[id]` — Unit list + editor (status, price, photos, amenities, complex_name)
- `/staff/waitlist` — Grouped by reason. Amber ⚡ Blast button emails matching leads
- `/staff/availability` — Joleen's weekly call schedule grid
- `/staff/stats` — Stats dashboard (leads, bookings, no-show rate, photos-sent %, charts, pipeline)
- `/staff/guide` — Staff instruction manual
- `public/staff-guide.html` — Offline staff guide (no login needed)

### Automations (Netlify Scheduled Functions)
- `netlify/functions/tick.mts` — Every minute: 2h reminder, 1h reminder, running-behind email
- `netlify/functions/followups.mts` — Every hour: 4h photo follow-up, push notifications

### Go-Live Checklist

**Jeff runs in Supabase SQL Editor:**
1. `supabase/phase2-migration.sql`
2. `supabase/phase4-migration.sql`
3. `supabase/phase5-migration.sql`

**Supabase Auth:**
- Authentication → URL Configuration → add `https://canyon-apts.com` as Site URL and `https://canyon-apts.com/**` to Redirect URLs

**Netlify env vars (all required before deploy):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose to browser)
- `RESEND_API_KEY`
- `RESEND_FROM` (verified sending domain)
- `STAFF_NOTIFY_EMAIL` → properties@canyon-advisors.com
- `STAFF_EMAIL` → properties@canyon-advisors.com
- `ERROR_ALERT_EMAIL` → jeff.martin.az@gmail.com
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` (generate with web-push)
- `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_FROM` (pending A2P 10DLC, ~1 week)

**After env vars:**
- Joleen sets availability in `/staff/availability` (seeded Mon–Sat 9–5 MST)
- Joleen uploads unit photos in `/staff/inventory`
- Full end-to-end test: book a call → confirm emails fire → staff app shows booking → send recap

**Tabled for later:**
- Rental agreement / e-signature system
- SMS reminders (Twilio A2P 10DLC registration pending)

### Key Technical Notes
- `supabaseAdmin()` = service-role client. Server only — never in browser.
- Smart/curly quote issue: Edit tool converts apostrophes to Unicode in .ts files — use PowerShell `[System.IO.File]` replace for edits to `lib/email/templates.ts`
- Netlify functions excluded from tsconfig.json to avoid build errors
- `netlify.toml` uses esbuild bundler for functions

---

## Reference Files
- `HANDOFF.md` — Detailed SEO build log and execution plan (read before any SEO work)
- `SEO-CHECKLIST.md` — Off-site citation/directory checklist
- `lib/site.ts` — NAP source of truth, brand story, real stats


---
## LOCATION (re-indexed 2026-07-23)
This project lives at: `C:\Users\jeffm\Documents\CLAUDE\CANYON-APTS\canyon-apts-web`

This is the FINAL post-reorg home. The workspace root is C:\Users\jeffm\Documents\CLAUDE with four buckets (CANYON-APTS, CANYON-HQ, CANYON-MARKETS, PERSONAL) plus an OLD archive of the pre-reorg tree. The D:\COWORK CLEANUP staging area is GONE. Any older path mentioned elsewhere in this document is STALE — trust this note.
