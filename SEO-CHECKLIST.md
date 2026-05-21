# Canyon Apts — SEO Checklist
**Site:** https://canyon-apts.com  
**Last Updated:** May 2026

---

## STEP 1 — Connect Netlify & Go Live
- [ ] Log into Netlify → **Add new site → Import an existing project**
- [ ] Connect GitHub → select `canyonmarkets/canyon-apts-web`
- [ ] Let it build (takes ~2 min). Note your Netlify subdomain (e.g. `canyon-apts-web.netlify.app`)
- [ ] In Netlify: **Domain settings → Add custom domain** → type `canyon-apts.com`
- [ ] Add `www.canyon-apts.com` as well and set it to redirect to the root domain

### GoDaddy DNS Settings (canyon-apts.com)
Log into GoDaddy → My Products → canyon-apts.com → DNS

| Type  | Name | Value                              | TTL  |
|-------|------|------------------------------------|------|
| A     | @    | 75.2.60.5                          | 600  |
| CNAME | www  | your-site-name.netlify.app         | 3600 |

> Replace `your-site-name.netlify.app` with the actual subdomain Netlify gave you.  
> DNS changes take 15 min to a few hours to propagate.  
> Netlify provisions a free SSL certificate automatically once DNS resolves.

---

## STEP 2 — Google Search Console
- [ ] Go to https://search.google.com/search-console
- [ ] Click **Add Property** → enter `https://canyon-apts.com`
- [ ] Verify ownership via the **HTML tag method**: copy the meta tag Netlify will ask you to add, or add it to `app/layout.tsx` in the `metadata` object under `verification: { google: 'YOUR_CODE' }`
- [ ] Once verified, click **Sitemaps** in the left menu
- [ ] Submit: `https://canyon-apts.com/sitemap.xml`
- [ ] Check back in 3–5 days to confirm pages are indexed

---

## STEP 3 — Google Business Profile (Highest Priority)
This is the **#1 thing** that drives local "furnished apartments Phoenix" map pack results.

- [ ] Go to https://business.google.com
- [ ] Click **Add your business**
- [ ] Business name: **Canyon Apts**
- [ ] Category: **Furnished Apartment Building** (or "Extended Stay Hotel" if not available)
- [ ] Add your phone number: (602) 935-6830
- [ ] Website: https://canyon-apts.com
- [ ] Service area: Phoenix, Tempe, Mesa, Gilbert, Chandler (do NOT add a physical storefront address if you don't want the address public)
- [ ] Verify via phone call or postcard
- [ ] After verification:
  - [ ] Add all 24 apartment photos from the website
  - [ ] Add business hours (8am–8pm daily)
  - [ ] Write a full business description using keywords: "furnished apartments, no credit check, weekly rentals, Phoenix metro, utilities included, move in ready"
  - [ ] Add services: Weekly Furnished Rentals, Monthly Furnished Rentals, Corporate Housing, Traveling Nurse Housing
  - [ ] Add your booking link (Calendly URL)

---

## STEP 4 — Google Analytics 4
- [ ] Go to https://analytics.google.com → create a new property for canyon-apts.com
- [ ] Get your Measurement ID (looks like `G-XXXXXXXXXX`)
- [ ] Add it to `app/layout.tsx` — install `@next/third-parties` and use `<GoogleAnalytics gaId="G-XXXXXXXXXX" />`
- [ ] Confirm data is flowing within 24 hours

---

## STEP 5 — Apartment & Housing Directories
These backlinks and listings directly drive high-intent traffic.

### Critical (Do These First)
- [ ] **Furnished Finder** — https://www.furnishedfinder.com  
  *This is the #1 platform for traveling nurses looking for furnished housing. MUST be listed here.*
- [ ] **Craigslist Phoenix** — https://phoenix.craigslist.org → Housing → Apts/Housing  
  *Post weekly with fresh listings. Huge source of direct traffic.*
- [ ] **Facebook Marketplace** — List units under "Homes for Rent"  
  *Free and high visibility in Phoenix market*
- [ ] **Zillow Rental Manager** — https://www.zillow.com/rental-manager  
  *Add as "furnished rental, short-term available"*

### High Value
- [ ] **Hotpads** — https://hotpads.com (owned by Zillow, same listing syncs)
- [ ] **Apartments.com** — https://www.apartments.com/add-listing
- [ ] **Corporate Housing by Owner (CHBO)** — https://www.corporatehousingbyowner.com  
  *Great for corporate relocation traffic*
- [ ] **Airbnb / VRBO** — Consider listing a unit or two for additional exposure and reviews
- [ ] **Yelp** — https://biz.yelp.com → Add "Canyon Apts" as an apartment/housing business

### Supplemental
- [ ] **Trulia** — syncs from Zillow automatically once listed there
- [ ] **Nextdoor** — create a business page; great for local neighborhood visibility
- [ ] **BBB** — https://www.bbb.org/accreditation → builds trust signals
- [ ] **Bing Places** — https://www.bingplaces.com → same info as Google Business Profile

---

## STEP 6 — Social Media Profiles
Create these profiles even if you don't post regularly — they provide backlinks and sameAs trust signals.

- [ ] **Facebook Business Page** — Canyon Apts  
  Add website, phone, hours, photos, booking link
- [ ] **Instagram** — @canyonapts (or @canyonapts_phx)  
  Post apartment photos. Hashtags: #PhoenixApartments #FurnishedApartmentsPhoenix #NoCreditCheck
- [ ] Once created, send Jeff the profile URLs to add to the `sameAs` array in `app/layout.tsx`

---

## STEP 7 — Review Strategy
Reviews are the single biggest factor in Google local ranking after GMB completeness.

- [ ] After every successful move-in, send the resident a text:  
  *"Hey, glad you're settled in! If you have 60 seconds, a Google review really helps us — here's the link: [your Google review shortlink]"*
- [ ] Get your Google review link: Google Business Profile dashboard → **Get more reviews** → copy the link
- [ ] Target: **10 reviews in the first 90 days**. After that, even 1–2/month is enough to maintain rank.
- [ ] Respond to every review (positive and negative). Google rewards engagement.

---

## STEP 8 — Rich Results Verification
- [ ] Go to https://search.google.com/test/rich-results
- [ ] Enter `https://canyon-apts.com`
- [ ] Confirm **FAQPage** schema is detected (this is what powers the expandable Q&A in search results)
- [ ] Confirm **ApartmentComplex / LocalBusiness** is detected
- [ ] Fix any warnings shown

---

## STEP 9 — Ongoing (Monthly)
- [ ] Check Search Console for crawl errors or manual actions
- [ ] Update Craigslist listings weekly (they expire)
- [ ] Respond to all new Google reviews
- [ ] Refresh the Google Docs inventory list (already linked on site) — Google sees freshness signals
- [ ] Add new apartment photos to Google Business Profile quarterly

---

## Keywords to Target (for any future blog posts or landing pages)
- `furnished apartments Phoenix no credit check`
- `traveling nurse housing Phoenix AZ`
- `weekly furnished apartments Phoenix`
- `no credit check apartments Phoenix AZ`
- `apartments that accept felonies Phoenix`
- `furnished apartments utilities included Phoenix`
- `corporate housing Phoenix no credit check`
- `extended stay apartments Phoenix AZ`
- `move in ready apartments Phoenix`
- `eviction friendly apartments Phoenix`
