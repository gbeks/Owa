# Owa — Product Requirements Document
**Version:** 1.0 | **Status:** Draft | **Author:** Gbeke Odutuga

---

## 1. Product Identity

**Name:** Owa
**Tagline:** *Lagos, step by step.*
**One-line description:** A web app that gives Lagos commuters clear, landmark-based public transport directions — with vehicle types and estimated fares — for any trip in the city.

> "Owa" is the Yoruba word conductors shout as a bus approaches a stop. It signals arrival, movement, and belonging — exactly what this product does for people navigating an unfamiliar route.

---

## 2. Problem Statement

Lagos has one of the most complex urban transit systems in Africa, yet almost no reliable, local-language-aware navigation tool exists for it. Google Maps directions for Lagos are unreliable — they ignore danfos, BRT branches, keke routes, and the landmark-based mental maps Lagosians actually use. The result is that millions of commuters — especially those new to an area — rely entirely on strangers, trial and error, or costly ride-hailing apps just to take a simple bus trip.

There is no tool that speaks the way a Lagos commuter thinks: *"Board a danfo at Ojuelegba under-bridge, drop at Eko Hotel bus stop, cross to the BRT side."*

---

## 3. Target User Profile

**Primary user:** Everyday Lagos commuter — a working-class or middle-income adult (18–45) who uses public transport (danfo, BRT, keke, okada) as a primary or regular mode of getting around Lagos.

**Specific sub-profiles:**
- The **newcomer** — recently relocated to Lagos from another state; doesn't know the routes yet
- The **occasional commuter** — usually takes Bolt/Uber but needs to cut costs on a specific day
- The **student or intern** — navigating unfamiliar parts of the city for work, school, or errands

**What they share:**
- Smartphone with internet access (typically Android, mid-range device)
- Limited data budget — expects fast, light pages
- Thinks in landmarks, not addresses (*"near Shoprite"* not *"12 Adeola Odeku Street"*)
- Speaks English but thinks in a mix of Yoruba slang, pidgin, and local transit vocabulary

**What they are NOT:**
- Tourists or foreign visitors (not the primary target)
- Commuters with cars or full-time ride-hailing budgets
- People looking for driving or walking directions

---

## 4. Core Features (MVP — Max 5)

### Feature 1 — Route Search
Users can type or select a starting point and destination to get a route. Input supports landmarks, bus stops, and area names (not just formal addresses).

### Feature 2 — Step-by-Step Directions
Each route is broken into clear, numbered steps: where to board, what vehicle to take, what to tell the conductor, and where to drop off — all referenced using local landmarks.

### Feature 3 — Fare Estimates
Each step shows an estimated fare range (in Naira) so the user knows roughly how much cash to carry before they leave.

### Feature 4 — Vehicle Type Labels
Each step clearly labels the transport mode: Danfo, BRT, Keke Napep, Okada, or Ferry — so the user knows what to look and ask for at each boarding point.

### Feature 5 — Community Corrections (Feedback)
Users can flag a route or step as outdated or wrong (e.g., "this bus no longer runs this way"). This feeds a correction queue that informs future route updates.

---

## 5. User Stories

### Feature 1 — Route Search

- As a commuter, I want to type my starting area or landmark (e.g., "Ojuelegba") so that I can find routes that begin near where I already am.
- As a commuter, I want to type my destination in everyday terms (e.g., "Computer Village Ikeja") so that I don't need to know the exact address.
- As a commuter, I want to see suggested completions as I type so that I can find my location faster without guessing exact spelling.
- As a commuter, I want to select my start and end points from a list if I'm not sure how to spell them so that I'm not blocked by a blank search result.

### Feature 2 — Step-by-Step Directions

- As a commuter, I want to see my full journey broken into numbered steps so that I can follow it without reading a wall of text.
- As a commuter, I want each step to reference a real local landmark (e.g., "board at the Total filling station on Agege Motor Road") so that I know exactly where to stand without needing GPS.
- As a commuter, I want to know what to say to conductors or drivers at each step (e.g., "tell them 'Oshodi'") so that I don't look lost or get taken to the wrong stop.
- As a commuter, I want to know where to drop off at each leg of the journey so that I don't miss my connection.

### Feature 3 — Fare Estimates

- As a commuter, I want to see an estimated fare per leg (e.g., "₦150 – ₦200") so that I know how much cash to prepare before leaving home.
- As a commuter, I want to see a total estimated fare for the full trip so that I can decide if this route fits my budget.
- As a commuter, I want the fare estimates to reflect current real-world pricing, not outdated figures, so that I'm not underprepared at the bus stop.

### Feature 4 — Vehicle Type Labels

- As a commuter, I want each step to clearly show the transport type (Danfo / BRT / Keke / Okada) so that I know what kind of vehicle to look for without asking anyone.
- As a commuter, I want the vehicle label to be visually distinct from the rest of the step so that I can scan the route quickly at a glance.
- As a commuter, I want the app to account for routes that require multiple vehicle types so that I can plan a complete multi-modal journey.

### Feature 5 — Community Corrections

- As a commuter, I want to flag a specific step as wrong or outdated so that other users don't get misled by stale route information.
- As a commuter, I want to submit a correction without creating an account so that the barrier to helping is as low as possible.
- As a returning user, I want to see a marker on routes that have recently been flagged or updated so that I know the information is being actively maintained.

---

## 6. Out of Scope (MVP)

The following are explicitly excluded from the MVP:

- **Real-time tracking** — no live vehicle locations, ETAs based on traffic, or GPS-based "you are here" functionality
- **User accounts and authentication** — no sign-up, login, saved trips, or history
- **Turn-by-turn navigation** — Owa gives directions, it does not guide you in motion
- **Ride-hailing integration** — no Bolt, Uber, or InDrive booking links
- **Offline mode** — no service worker caching or downloadable maps
- **Multilingual support** — English only at launch (Yoruba and Pidgin considered for v2)
- **Ratings, reviews, or social features** — beyond basic flagging, no comments or community profiles
- **Intercity routes** — Lagos state routes only; no Abuja, PH, or long-distance travel
- **Monetisation features** — no ads, premium tiers, or partnerships at MVP
- **Native mobile app** — web only; no iOS or Android app packaging

---

## 7. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Fast static rendering, good SEO, easy Vercel deployment |
| **Styling** | Tailwind CSS | Rapid UI, no bloat, mobile-first by default |
| **Hosting** | Vercel (free tier) | Zero cost, instant deploys from GitHub |
| **Route Data** | Manually curated JSON (static files) | $0 budget; no API dependency; easier to version-control |
| **Search/Fuzzy Match** | Fuse.js | Lightweight, client-side fuzzy search for Lagos landmarks and stops |
| **AI Route Formatter** | Anthropic Claude API (`claude-haiku`) | Converts raw route data into natural, landmark-rich human-readable directions |
| **Feedback / Corrections** | Supabase (free tier) | Simple Postgres table to capture user correction submissions |
| **Analytics** | Vercel Analytics (free tier) | Lightweight, privacy-respecting usage data |
| **Version Control** | GitHub | Standard; also enables Vercel CI/CD |

**Data strategy note:** Route data starts as a manually maintained JSON file (`routes.json`) covering the 20–30 most-traveled Lagos corridors. This is the core constraint of the $0 budget approach — no paid mapping API, no live data feed. Data is updated manually based on community corrections. Accuracy warnings are shown to users on all routes.

---

## 8. Definition of Done

### MVP is shippable when:

**Functional**
- [ ] A user can search by origin and destination using landmark names and receive a result
- [ ] Fuzzy search handles common misspellings and alternate names (e.g., "CMS" = "Lagos Island CMS")
- [ ] Every route result shows numbered steps with: boarding landmark, vehicle type label, what to tell the conductor, drop-off point, and fare estimate per leg
- [ ] A total estimated fare is shown at the top of each route
- [ ] A user can submit a correction on any route step without creating an account
- [ ] All correction submissions are saved to Supabase

**Quality**
- [ ] App loads in under 3 seconds on a 3G connection
- [ ] UI is fully functional on mobile (375px viewport minimum)
- [ ] No broken routes or 404s on any linked page
- [ ] Fare estimates are reviewed and reflect current Lagos market rates (within ±₦50)
- [ ] At least 20 origin-destination pairs are fully populated with accurate data at launch

**Communication**
- [ ] An accuracy disclaimer is visible on every route result ("Routes are manually maintained. Fares and routes may vary.")
- [ ] Empty search states have a clear message and a fallback suggestion
- [ ] Flagged or recently corrected routes show a visible update indicator

**Deployment**
- [ ] App is live on a public Vercel URL
- [ ] Environment variables (Supabase keys, Claude API key) are set in Vercel dashboard, not hardcoded
- [ ] GitHub repo is clean with a README documenting setup and data structure

---

## 9. Success Metrics (Post-Launch)

These are lightweight signals to evaluate whether the MVP is working, measurable with Vercel Analytics and Supabase logs:

| Metric | Target (30 days post-launch) |
|---|---|
| Total route searches | 500+ |
| Routes with at least 1 correction submission | <10% (signals data quality is holding) |
| Bounce rate on results page | <60% (users are engaging with results, not leaving immediately) |
| Mobile share of traffic | >75% (validates mobile-first approach) |
| Zero-result searches | <20% of total searches (search coverage is adequate) |

---

## 10. Open Questions

1. **Data sourcing:** Who maintains `routes.json` after launch? Is this a solo effort or can a small community of contributors help validate?
2. **AI usage guardrails:** How do we prevent Claude from hallucinating stop names or landmarks that don't exist? (Suggested fix: Claude only formats pre-structured data; it does not generate route data.)
3. **Fare volatility:** Lagos fares shift with fuel prices. What's the update cadence for fare data, and is there a mechanism to flag stale fares specifically?
4. **Domain:** Will Owa launch on a custom domain (e.g., `owalagos.com`) or a Vercel subdomain for MVP?
5. **Phase 2 scope signal:** Community interest in real-time or saved routes should be tracked via correction submissions — if users frequently flag "this route changed," that signals a need for a more dynamic data layer in v2.

---

*This PRD covers the MVP scope only. V2 considerations (real-time data, Yoruba language support, offline mode) are documented separately.*
