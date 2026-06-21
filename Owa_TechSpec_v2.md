# Technical Specification & Architecture

## Project: Owa — Lagos Public Transit Router
**Version:** 2.0
**Date:** June 18, 2026
**Author:** Gbeke Odutuga
**Status:** Active
**Replaces:** DanfoRoute System Architecture v2.0 (Gemini-generated, superseded)

---

## 1. Architecture Philosophy

Owa is a **data-first, render-second** application. The routing logic is not computed at runtime. Routes are human-verified, pre-structured JSON that the UI reads and displays. The app's job is to match a search pair to a route object and render it clearly. Nothing more.

This means:
- No graph engine
- No AI route generation
- No live mapping API
- Claude API is used only as a text formatter where explicitly noted, never as a route source

Complexity is added only when the current approach breaks under real usage. Not before.

---

## 2. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14 (App Router) | Already in use, good static export support |
| Styling | Tailwind CSS | Low bundle size, fast to build with |
| Route Data | Local JSON file (`routes.json`) | Simple, version-controlled, no DB required for reads |
| Community Submissions | Supabase | Free tier covers launch volume, easy form-to-table writes |
| Search Analytics | Supabase | Log search pairs to power popular route chips |
| Hosting | Vercel | Zero-config Next.js deployment |
| Language | TypeScript | Catches data shape errors early |

**No new dependencies without a clear reason.** Total page weight target: under 1.5MB. TTI target: under 2 seconds on 3G.

---

## 3. Project Structure

```
/owa
  /src
    /app
      page.tsx                  # Home screen (search + quick chips)
      /results
        page.tsx                # Route results screen
      /directions
        [routeId]
          page.tsx              # Step-by-step directions screen
      /contribute
        page.tsx                # Community submission form
    /components
      SearchBar.tsx
      RouteChip.tsx
      RouteCard.tsx
      DirectionsStep.tsx
      FareBadge.tsx
      PeakHourBanner.tsx
      ReportForm.tsx
      EmptyState.tsx
    /data
      routes.json               # Single source of truth for all route data
      routes.schema.json        # JSON Schema for validation
      routes.ts                 # Typed loader, validator, query helpers
      landmarks.ts              # Autocomplete list of Lagos stops/landmarks
    /lib
      supabase.ts               # Supabase client (submissions + analytics only)
      peak.ts                   # Peak hour detection logic
    /types
      route.ts                  # TypeScript types matching routes.json schema
```

---

## 4. Data Architecture

### 4.1 routes.json

The single source of truth. All route reads come from here. No component, page, or helper is allowed to define route data inline.

Every route object follows the schema defined in `routes.schema.json`. Key fields:

```typescript
type Leg = {
  step_number: number
  instruction: string        // Plain language, landmark-anchored
  boarding_point: string
  vehicle_type: VehicleType  // Enum — see below
  vehicle_label: string      // Display label
  destination_point: string
  fare_min: number
  fare_max: number
  fare_verified: boolean     // If false, show disclaimer in UI
}

type Route = {
  route_id: string           // Format: R-ORIGIN-DESTINATION-NN
  origin: string
  destination: string
  verified: boolean          // Human verified. Unverified routes are not displayed.
  verified_by: string
  verified_date: string
  notes: string
  total_fare_min: number
  total_fare_max: number
  est_duration_mins: number
  legs: Leg[]
}

type VehicleType = 
  'Danfo' | 'BRT' | 'Korope' | 'Keke' | 'LRMT' | 'Ferry' | 'Walk'
```

### 4.2 routes.ts — Query Helpers

```typescript
// Returns verified routes only
export function listRoutes(): Route[]

// Exact or fuzzy match on origin + destination
export function getRoute(origin: string, destination: string): Route | null

// Returns top N routes by search count (from Supabase analytics)
// Falls back to manual ordering if no analytics data yet
export function getPopularRoutes(limit: number): Route[]
```

Validation runs at build time via a Node script that checks `routes.json` against `routes.schema.json`. Build fails if validation fails. This prevents malformed data from reaching production.

### 4.3 landmarks.ts

A static array of Lagos landmarks, bus stops, garages, and area names for the autocomplete. Minimum 80 entries at launch.

```typescript
export const LANDMARKS: string[] = [
  "Ojuelegba",
  "Oshodi Interchange",
  "CMS (Marina)",
  "Ikeja Along",
  "Ketu Garage",
  "Berger",
  // ...
]
```

Autocomplete filters this list client-side. No API call needed.

---

## 5. Supabase Schema

Supabase is used for two things only: logging searches (for popular route chips) and storing community submissions. It is never used for route reads at launch.

### 5.1 search_logs

```sql
create table search_logs (
  id uuid default gen_random_uuid() primary key,
  origin text not null,
  destination text not null,
  result_found boolean not null,
  searched_at timestamptz default now()
);
```

A row is inserted every time a user taps "Find Route". No user ID, no PII. Used to calculate weekly popular routes.

### 5.2 route_submissions

```sql
create table route_submissions (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('correction', 'new_route')),
  route_id text,                    -- pre-filled for corrections, null for new
  origin text,
  destination text,
  description text not null,        -- what's wrong / full route description
  submitter_contact text,           -- optional WhatsApp number
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewer_notes text
);
```

Row Level Security: insert allowed for anonymous users, select/update restricted to service role (your admin access only).

---

## 6. Key Screens & Component Logic

### 6.1 Home Screen (`/`)

- Renders `<SearchBar>` with two inputs wired to `LANDMARKS` autocomplete
- Renders `<RouteChip>` list from `getPopularRoutes(8)`
- On search: logs to `search_logs`, navigates to `/results?from=X&to=Y`
- Shows `<PeakHourBanner>` if current time is in peak window

### 6.2 Results Screen (`/results`)

- Reads `from` and `to` from URL params
- Calls `getRoute(from, to)`
- If match: renders `<RouteCard>` with total fare, duration, leg count
- If no match: renders `<EmptyState>` with link to `/contribute`

### 6.3 Directions Screen (`/directions/[routeId]`)

- Fetches route by `routeId` from `listRoutes()`
- Renders each leg as a `<DirectionsStep>`
- Each step shows: vehicle tag, boarding point, instruction, `<FareBadge>`
- Unverified fares render with a warning label
- Footer: "Something wrong? Report it." opens `<ReportForm>` (inline modal or separate page)

### 6.4 Contribute Screen (`/contribute`)

- Single form handling both corrections and new submissions
- Pre-fills `route_id` and type if coming from a report link
- On submit: writes to `route_submissions` table, shows confirmation
- No redirect to a live route. Submissions are pending until you review.

---

## 7. Peak Hour Detection

```typescript
// /src/lib/peak.ts

export function isPeakHour(): boolean {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const time = hour * 60 + minute

  const morningStart = 6 * 60 + 30   // 06:30
  const morningEnd = 9 * 60 + 30     // 09:30
  const eveningStart = 16 * 60 + 30  // 16:30
  const eveningEnd = 20 * 60 + 30    // 20:30

  return (
    (time >= morningStart && time <= morningEnd) ||
    (time >= eveningStart && time <= eveningEnd)
  )
}
```

This runs client-side. No server call needed.

---

## 8. Performance Constraints

| Constraint | Target |
|-----------|--------|
| Total page weight | Under 1.5MB |
| Time to Interactive (3G) | Under 2 seconds |
| JS bundle (client) | Under 200KB gzipped |
| Route data file | Under 100KB for 50 routes |
| Supabase calls per search | Maximum 2 (log write + optional analytics read) |

Routes are read from local JSON at build time, not fetched from Supabase. This means route display works even if Supabase is down.

---

## 9. Claude API Usage (Scoped and Limited)

Claude API is not used for routing. It may be used for one specific purpose only:

**Formatting contributor submissions into structured route JSON.**

When you receive a plain-text submission like "Board danfo from Lawanson to CMS, then korope to Lekki", you can run it through Claude API to produce a draft routes.json leg structure for your review. You then verify, edit, and merge it manually.

Claude API is never called from the user-facing app. It is a private admin tool only.

---

## 10. Deployment

- **Hosting:** Vercel (free tier at launch)
- **Branch strategy:** `main` = production, `dev` = active development
- **Routes update process:** Edit `routes.json` locally, validate via build script, push to `main`, Vercel redeploys in under 60 seconds
- **Environment variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel dashboard

---

## 11. What This Architecture Does Not Include

These are explicitly out of scope and should not be built until V1 is stable and validated with real users:

- Graph/DAG routing engine
- Edge computing or CDN-side route computation
- AI-generated route suggestions surfaced to users
- Real-time traffic integration
- Native app wrapper
- User authentication
- Saved routes or favourites
- Automated fare scraping

The v2 architecture document (Gemini-generated, dated June 11 2026) proposed several of these. That document is superseded by this one.
