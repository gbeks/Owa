# Owa — Product Requirements Document
**Version:** 2.0 | **Status:** Draft | **Author:** Gbeke Odutuga
**Last updated:** June 2026

---

## Table of Contents

1. Product Identity
2. Problem Statement
3. Target User Profile
4. Core Features (MVP)
5. User Stories
6. Out of Scope
7. System Architecture
8. Tech Stack
9. Data Architecture & Schemas
10. API Design
11. Page Routes & Component Map
12. AI Integration Spec
13. Search Logic Spec
14. Error States & Edge Cases
15. Environment Configuration
16. Definition of Done
17. Success Metrics
18. Open Questions

---

## 1. Product Identity

**Name:** Owa
**Tagline:** *Lagos, step by step.*
**One-line description:** A web app that gives Lagos commuters clear, landmark-based public transport directions — with vehicle types and estimated fares — for any trip in the city.

> "Owa" is the Yoruba word conductors shout as a bus approaches a stop. It signals arrival, movement, and belonging — exactly what this product does for people navigating an unfamiliar route.

---

## 2. Problem Statement

Lagos has one of the most complex urban transit systems in Africa, yet almost no reliable, local-language-aware navigation tool exists for it. Google Maps directions for Lagos are unreliable — they ignore danfos, BRT branches, keke routes, and the landmark-based mental maps Lagosians actually use. The result is that millions of commuters — especially those new to an area — rely entirely on strangers, trial and error, or costly ride-hailing apps just to take a simple bus trip.

There is no tool that speaks the way a Lagos commuter thinks:
*"Board a danfo at Ojuelegba under-bridge, drop at Eko Hotel bus stop, cross to the BRT side."*

**Root causes:**
- Formal mapping APIs (Google, Apple) are optimised for car travel and formal addresses
- Lagos transit has no GTFS feed or official route database
- Landmark vocabulary is hyperlocal and not indexed anywhere
- Fare data is informal, cash-based, and changes with fuel prices

---

## 3. Target User Profile

**Primary user:** Everyday Lagos commuter — a working-class or middle-income adult (18–45) who uses public transport (danfo, BRT, keke, okada) as a primary or regular mode of getting around Lagos.

**Specific sub-profiles:**

| Profile | Description | Key need |
|---|---|---|
| The Newcomer | Recently relocated to Lagos from another state | Doesn't know any routes; needs full handholding |
| The Occasional Commuter | Usually takes Bolt/Uber but cutting costs today | Needs confidence that the route is accurate |
| The Student / Intern | Navigating unfamiliar parts of the city | Needs cheap routes with specific fare info |

**Shared characteristics:**
- Android smartphone (mid-range, Tecno/Infinix/Samsung A-series)
- Intermittent or limited data (often on 100MB–500MB daily bundles)
- Thinks in landmarks, not street addresses
- Speaks English; mixes Yoruba and Pidgin in everyday transit language
- Accustomed to asking conductors and fellow passengers for directions

**They are NOT:**
- Tourists or expatriates
- Full-time Bolt/Uber users
- People seeking driving or walking directions

---

## 4. Core Features (MVP — Max 5)

### F1 — Route Search
Type or select a starting point and destination using landmarks, area names, or bus stop names. Supports fuzzy matching and common abbreviations.

### F2 — Step-by-Step Directions
Each route is broken into numbered legs: boarding landmark, vehicle to board, what to tell the conductor, and drop-off point. Every reference uses real Lagos landmarks, not coordinates.

### F3 — Fare Estimates
Each leg shows a Naira fare range. A total estimated fare is shown at the top of every result. Fare data is manually curated and periodically reviewed.

### F4 — Vehicle Type Labels
Each leg clearly labels the transport mode (Danfo / BRT / Keke Napep / Okada / Ferry) with a visual badge so commuters know exactly what to look for.

### F5 — Community Corrections
Users can flag any route step as wrong or outdated without creating an account. Submissions are stored and reviewed by the maintainer to inform data updates.

---

## 5. User Stories

### F1 — Route Search

- As a commuter, I want to type my starting area or landmark so I can find routes near where I already am.
- As a commuter, I want to type my destination in everyday terms (e.g., "Computer Village") so I don't need the exact address.
- As a commuter, I want autocomplete suggestions as I type so I can find locations faster without guessing spelling.
- As a commuter, I want to pick from a list if I'm not sure how to spell a place so I'm not blocked by a blank result.
- As a commuter on a slow connection, I want the search to work even on 2G so I'm not excluded by my data speed.

### F2 — Step-by-Step Directions

- As a commuter, I want my journey in numbered steps so I can follow it without reading a wall of text.
- As a commuter, I want each step to name a real local landmark so I know exactly where to stand.
- As a commuter, I want to know what to say to the conductor at each step so I don't get taken to the wrong stop.
- As a commuter, I want to know exactly where to drop off at each leg so I don't miss my connection.
- As a commuter with low vision, I want text to be large and high-contrast so I can read it in bright sunlight.

### F3 — Fare Estimates

- As a commuter, I want to see an estimated fare per leg (e.g., ₦150–₦200) so I know how much cash to carry.
- As a commuter, I want a total estimated fare for the full trip so I can budget before leaving home.
- As a commuter, I want fares clearly flagged as estimates, not guarantees, so I'm not caught off guard.

### F4 — Vehicle Type Labels

- As a commuter, I want each step to show the vehicle type so I know what to look for without asking.
- As a commuter, I want vehicle labels to be visually distinct so I can scan the route quickly at a glance.
- As a commuter taking a multi-modal trip, I want the app to handle mixed vehicle types so I can plan the whole journey in one place.

### F5 — Community Corrections

- As a commuter, I want to flag a step as wrong so other users don't get misled.
- As a commuter, I want to submit a correction without creating an account so helping is effortless.
- As a commuter, I want to see when a route was last reviewed so I know how fresh the data is.
- As the maintainer, I want all corrections stored in a queryable table so I can action them efficiently.

---

## 6. Out of Scope (MVP)

| Feature | Reason excluded |
|---|---|
| Real-time vehicle tracking | Requires live data feed; no free source exists |
| GPS / "You are here" | Adds complexity; not needed for pre-trip planning |
| User accounts & auth | Not required for core journey; adds friction |
| Turn-by-turn navigation | Owa is for planning, not in-motion guidance |
| Ride-hailing integration | Contradicts the core use case (cheap public transit) |
| Offline mode | Service worker caching adds complexity for MVP |
| Multilingual UI | English only at launch; Yoruba/Pidgin in v2 |
| Social features | Ratings, comments, profiles — post-MVP |
| Intercity routes | Lagos state only |
| Monetisation | No ads, no premium tier at MVP |
| Native mobile app | Web-only; PWA considered for v1.5 |
| Traffic / ETA data | No free real-time Lagos traffic API |

---

## 7. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                                                             │
│   ┌──────────────┐    ┌──────────────┐   ┌──────────────┐  │
│   │  Search UI   │    │  Results UI  │   │ Correction   │  │
│   │  (Fuse.js)   │    │  (Steps +    │   │ Modal        │  │
│   │              │    │   Fares)     │   │              │  │
│   └──────┬───────┘    └──────┬───────┘   └──────┬───────┘  │
│          │                   │                   │          │
└──────────┼───────────────────┼───────────────────┼──────────┘
           │                   │                   │
           ▼                   ▼                   ▼
┌──────────────────────────────────────────────────────────────┐
│                   Next.js App (Vercel)                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  /api/search │  │ /api/route   │  │ /api/corrections  │  │
│  │  (Fuse.js    │  │ (Claude API  │  │ (Supabase write)  │  │
│  │   lookup)    │  │  formatter)  │  │                   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                 │                    │             │
└─────────┼─────────────────┼────────────────────┼─────────────┘
          │                 │                    │
          ▼                 ▼                    ▼
┌──────────────┐   ┌─────────────────┐   ┌──────────────────┐
│  routes.json │   │  Anthropic      │   │  Supabase        │
│  (static,    │   │  Claude API     │   │  Postgres        │
│  versioned)  │   │  (Haiku model)  │   │  (corrections    │
│              │   │                 │   │   table)         │
└──────────────┘   └─────────────────┘   └──────────────────┘
```

### Architecture decisions

**Static-first data:** `routes.json` is bundled at build time. No database read required for route lookups — this keeps the app fast and $0 for data hosting.

**AI as formatter only:** The Claude API receives a structured route object and returns prose directions. It never invents stops, landmarks, or fares. If the API is unavailable, the app falls back to rendering the raw structured data directly.

**Supabase only for writes:** Supabase is used exclusively to store correction submissions (writes). No Supabase reads happen in the critical path, so a Supabase outage does not break route search or results.

**Vercel Edge Network:** All pages are statically generated or server-rendered at the edge, ensuring sub-second TTFB globally (critical for Nigerian users hitting Vercel's closest PoP).

---

## 8. Tech Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Framework | Next.js | 14.x (App Router) | SSG + API routes in one repo; Vercel-native |
| Language | TypeScript | 5.x | Type safety for route data schemas |
| Styling | Tailwind CSS | 3.x | Mobile-first utility classes; no runtime CSS |
| Hosting | Vercel | Free tier | Zero cost; GitHub CI/CD built in |
| Route Data | JSON flat file | — | No DB cost; version-controlled; fast at build time |
| Search | Fuse.js | 7.x | Client-side fuzzy search; handles typos and aliases |
| AI Formatter | Anthropic Claude API | claude-haiku-4-5 | Cheapest Anthropic model; formats pre-structured data only |
| Feedback DB | Supabase | Free tier | Postgres for corrections; 500MB free; Row-Level Security |
| Analytics | Vercel Analytics | Free tier | No cookies; GDPR-lite; zero config |
| Icons | Lucide React | Latest | Lightweight; MIT licensed |
| Version Control | GitHub | — | CI/CD trigger for Vercel; public repo |

### Dependency list (`package.json` essentials)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "fuse.js": "^7.0.0",
    "@supabase/supabase-js": "^2.43.0",
    "@anthropic-ai/sdk": "^0.24.0",
    "lucide-react": "^0.383.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 9. Data Architecture & Schemas

### 9.1 Route Data Schema (`routes.json`)

This is the single source of truth for all route data. It is a flat JSON file bundled with the Next.js build.

```typescript
// types/route.ts

export type VehicleType = 'danfo' | 'brt' | 'keke' | 'okada' | 'ferry' | 'walk';

export interface RouteLeg {
  leg_id: string;               // e.g., "leg_01"
  step_number: number;          // 1, 2, 3...
  vehicle: VehicleType;
  board_landmark: string;       // "Ojuelegba Under-Bridge (facing CMS)"
  board_instruction: string;    // "Tell the conductor 'CMS' or 'Marina'"
  alight_landmark: string;      // "CMS Bus Stop, opposite First Bank"
  alight_instruction: string;   // "Drop when you see the overhead bridge"
  fare_min: number;             // 150 (in Naira)
  fare_max: number;             // 200
  duration_estimate_mins: number; // rough estimate, not real-time
  notes?: string;               // "Avoid peak hours (7–9am); danfos get very full"
}

export interface Route {
  route_id: string;             // e.g., "ojuelegba-to-cms"
  origin_id: string;            // references Location.location_id
  destination_id: string;
  origin_label: string;         // "Ojuelegba"
  destination_label: string;    // "CMS (Lagos Island)"
  legs: RouteLeg[];
  total_fare_min: number;       // sum of all leg fare_min values
  total_fare_max: number;
  total_duration_estimate_mins: number;
  last_verified: string;        // ISO date, e.g. "2026-05-01"
  confidence: 'high' | 'medium' | 'low'; // data freshness signal
  flagged: boolean;             // true if pending community review
}

export interface Location {
  location_id: string;          // e.g., "ojuelegba"
  canonical_name: string;       // "Ojuelegba"
  aliases: string[];            // ["Ojue", "Ojuelegba junction", "Ojuelegba bus stop"]
  area: string;                 // "Surulere"
  lga: string;                  // "Surulere LGA"
  type: 'bus_stop' | 'landmark' | 'area' | 'terminal';
}
```

### 9.2 Supabase Schema — Corrections Table

```sql
-- Run in Supabase SQL Editor

CREATE TABLE corrections (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  route_id      TEXT NOT NULL,
  leg_id        TEXT,                    -- null if flagging the whole route
  issue_type    TEXT NOT NULL            -- 'wrong_landmark' | 'wrong_fare'
                CHECK (issue_type IN (   --   | 'route_closed' | 'wrong_vehicle'
                  'wrong_landmark',      --   | 'other'
                  'wrong_fare',
                  'route_closed',
                  'wrong_vehicle',
                  'other'
                )),
  description   TEXT,                   -- free text from user (optional)
  status        TEXT DEFAULT 'pending'  -- 'pending' | 'reviewed' | 'applied'
                CHECK (status IN ('pending', 'reviewed', 'applied')),
  user_agent    TEXT,                   -- browser UA for spam filtering
  ip_hash       TEXT                    -- hashed IP, not raw, for rate limiting
);

-- Index for admin review queue
CREATE INDEX idx_corrections_status ON corrections(status, created_at DESC);
CREATE INDEX idx_corrections_route ON corrections(route_id, created_at DESC);

-- Row Level Security: public can INSERT only, no SELECT
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts"
  ON corrections FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users (maintainer) can read corrections
CREATE POLICY "Allow authenticated reads"
  ON corrections FOR SELECT
  TO authenticated
  USING (true);
```

### 9.3 Data File Structure

```
/data
  routes.json          ← All route objects (array)
  locations.json       ← All location objects (array, used for search index)
  
/types
  route.ts             ← TypeScript interfaces (as above)

/lib
  search.ts            ← Fuse.js index builder
  routes.ts            ← Route lookup helpers
  supabase.ts          ← Supabase client singleton
  claude.ts            ← Claude API formatter
```

---

## 10. API Design

All API routes live under `/app/api/` using Next.js Route Handlers.

### 10.1 `GET /api/search`

Searches locations index. Returns matching origin/destination suggestions.

**Query parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string | Yes | Search query (min 2 chars) |
| `limit` | number | No | Max results (default: 8, max: 20) |

**Response (200):**
```json
{
  "results": [
    {
      "location_id": "ojuelegba",
      "canonical_name": "Ojuelegba",
      "area": "Surulere",
      "type": "bus_stop"
    }
  ],
  "query": "ojue",
  "total": 3
}
```

**Response (400) — query too short:**
```json
{
  "error": "Query must be at least 2 characters",
  "code": "QUERY_TOO_SHORT"
}
```

**Implementation note:** Fuse.js runs server-side in this route handler to keep the search index off the client bundle. The locations array is imported at module level (cached between cold starts).

---

### 10.2 `GET /api/route`

Returns a full route with AI-formatted prose directions.

**Query parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `from` | string | Yes | `location_id` of origin |
| `to` | string | Yes | `location_id` of destination |

**Response (200):**
```json
{
  "route": {
    "route_id": "ojuelegba-to-cms",
    "origin_label": "Ojuelegba",
    "destination_label": "CMS (Lagos Island)",
    "total_fare_min": 300,
    "total_fare_max": 450,
    "total_duration_estimate_mins": 55,
    "last_verified": "2026-05-01",
    "confidence": "high",
    "flagged": false,
    "legs": [
      {
        "leg_id": "leg_01",
        "step_number": 1,
        "vehicle": "danfo",
        "board_landmark": "Ojuelegba Under-Bridge (facing CMS side)",
        "board_instruction": "Board any danfo heading to CMS. Tell the conductor 'CMS' or 'Marina'.",
        "alight_landmark": "CMS Bus Stop, opposite First Bank on Lagos Island",
        "alight_instruction": "Drop when you see the overhead bridge at CMS. The bus will stop right there.",
        "fare_min": 300,
        "fare_max": 450,
        "duration_estimate_mins": 55,
        "formatted_prose": "At Ojuelegba Under-Bridge, look for a yellow danfo heading toward CMS — they're usually parked under the bridge on the left side facing the island. Tell the conductor 'CMS' and you'll be dropped right in front of First Bank. Journey takes about 45–55 minutes depending on traffic.",
        "notes": "Avoid 7–9am and 4–7pm. The bridge gets jammed."
      }
    ]
  }
}
```

**Response (404) — no route found:**
```json
{
  "error": "No route found between these locations",
  "code": "ROUTE_NOT_FOUND",
  "suggestion": "Try searching for a nearby landmark or area instead"
}
```

**Response (200, fallback) — Claude API unavailable:**
```json
{
  "route": { ... },
  "ai_formatted": false,
  "fallback_notice": "Directions shown in simplified format. Prose formatting temporarily unavailable."
}
```

---

### 10.3 `POST /api/corrections`

Submits a community correction for a route or leg.

**Request body:**
```json
{
  "route_id": "ojuelegba-to-cms",
  "leg_id": "leg_01",
  "issue_type": "wrong_landmark",
  "description": "The danfo no longer parks under the bridge, they now load from the Total filling station"
}
```

**Validation rules:**
- `route_id` — required, must exist in `routes.json`
- `leg_id` — optional
- `issue_type` — required, must be one of the enum values
- `description` — optional, max 500 characters

**Response (201):**
```json
{
  "success": true,
  "message": "Thanks for the correction. We'll review and update this route.",
  "correction_id": "uuid-here"
}
```

**Response (429) — rate limit:**
```json
{
  "error": "Too many submissions. Please wait before submitting again.",
  "code": "RATE_LIMITED"
}
```

**Rate limiting:** Max 3 corrections per IP hash per hour, enforced in the API handler using a lightweight in-memory counter (acceptable for MVP traffic).

---

## 11. Page Routes & Component Map

### 11.1 Page Routes

```
/                        → Home (search interface)
/route?from=X&to=Y       → Route result page
/about                   → What is Owa, data accuracy notice
/404                     → Custom not found page
/500                     → Custom error page
```

### 11.2 Component Tree

```
app/
├── layout.tsx                  ← Root layout (font, analytics, metadata)
├── page.tsx                    ← Home page
├── route/
│   └── page.tsx                ← Route result page (reads ?from & ?to params)
├── about/
│   └── page.tsx                ← Static about page
│
components/
├── search/
│   ├── SearchForm.tsx          ← Origin + destination inputs with swap button
│   ├── LocationInput.tsx       ← Single autocomplete input (reused for both fields)
│   └── SearchSuggestions.tsx   ← Dropdown list of fuzzy-matched suggestions
│
├── route/
│   ├── RouteCard.tsx           ← Top-level card: total fare, duration, freshness badge
│   ├── LegList.tsx             ← Ordered list of all legs
│   ├── LegCard.tsx             ← Single leg: vehicle badge, board/alight info, fare, prose
│   ├── VehicleBadge.tsx        ← Coloured label: Danfo / BRT / Keke / Okada / Ferry
│   ├── FareRange.tsx           ← "₦300 – ₦450" display component
│   ├── ConfidenceBadge.tsx     ← "Last verified May 2026" + confidence level
│   └── FlagButton.tsx          ← Trigger to open correction modal
│
├── corrections/
│   ├── CorrectionModal.tsx     ← Modal: issue type selector + optional description
│   └── CorrectionForm.tsx      ← Form fields + submit handler
│
├── ui/
│   ├── Button.tsx              ← Primary, secondary, ghost variants
│   ├── Badge.tsx               ← Generic badge (used by VehicleBadge etc.)
│   ├── Modal.tsx               ← Accessible modal wrapper
│   ├── Spinner.tsx             ← Loading state
│   ├── EmptyState.tsx          ← Zero results / no route found
│   └── Disclaimer.tsx          ← Accuracy warning banner
│
└── layout/
    ├── Header.tsx              ← Logo + "About" link
    └── Footer.tsx              ← Data notice + feedback prompt
```

### 11.3 Page Behaviour Details

**Home (`/`)**
- Renders `SearchForm` immediately; no loading state needed
- On submit: validates both fields are filled, then navigates to `/route?from={id}&to={id}`
- If a user lands with `?from` or `?to` pre-filled in the URL (e.g., from a share link), prefills those inputs

**Route Result (`/route`)**
- Reads `from` and `to` from URL query params
- Calls `/api/route?from=X&to=Y` on mount
- Shows skeleton loader during fetch
- On success: renders `RouteCard` + `LegList`
- On 404: renders `EmptyState` with search-again CTA
- On 500: renders error state with retry button

---

## 12. AI Integration Spec

### 12.1 Purpose and Boundary

Claude is used **only** to convert structured route leg data into natural, landmark-rich prose directions. It does not:
- Generate route data
- Invent landmarks, stop names, or fare figures
- Make routing decisions

This boundary is enforced structurally: the Claude prompt only ever receives fully validated data from `routes.json`.

### 12.2 Claude Prompt Template

```typescript
// lib/claude.ts

const SYSTEM_PROMPT = `
You are a Lagos transit guide. Your job is to rewrite structured route data into 
clear, natural directions in plain English — the way a knowledgeable Lagos 
commuter would explain it to someone new.

Rules you must follow:
- Never invent or change any landmark name, stop name, fare figure, or vehicle type
- Use the exact values provided in the structured data
- Write in second person ("You'll board...", "Tell the conductor...")
- Keep each step to 2–3 sentences maximum
- Use conversational Lagos English — no corporate language
- If a notes field is provided, work it naturally into the prose
- Return ONLY the formatted prose for this leg — no preamble, no markdown
`.trim();

export async function formatLegProse(leg: RouteLeg): Promise<string> {
  const userMessage = `
Format this route leg into natural directions:

Vehicle: ${leg.vehicle}
Board at: ${leg.board_landmark}
Board instruction: ${leg.board_instruction}
Alight at: ${leg.alight_landmark}
Alight instruction: ${leg.alight_instruction}
Fare: ₦${leg.fare_min}–₦${leg.fare_max}
Duration estimate: ${leg.duration_estimate_mins} minutes
${leg.notes ? `Notes: ${leg.notes}` : ''}

Write the formatted prose for this step only.
  `.trim();

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  });

  return response.content[0].type === 'text'
    ? response.content[0].text.trim()
    : leg.board_instruction; // fallback to raw field
}
```

### 12.3 Fallback Behaviour

If the Claude API call fails (timeout, rate limit, service error):

1. Log the error server-side (console + Vercel logs)
2. Return the raw structured data fields directly — `board_instruction` and `alight_instruction` are written to be human-readable without AI formatting
3. Include `"ai_formatted": false` in the API response
4. Show a subtle fallback notice in the UI: *"Showing simplified directions."* (no alarm; most users won't notice)

### 12.4 Cost Management

- **Model:** `claude-haiku-4-5` — lowest cost Anthropic model
- **Max tokens per leg:** 200 output tokens
- **Typical route:** 2–3 legs = 3 Claude calls per route view
- **Estimated cost:** ~$0.0003 per route view (negligible at MVP traffic volumes)
- **No caching at MVP** — at higher traffic, formatted prose can be cached in Vercel KV

---

## 13. Search Logic Spec

### 13.1 Fuse.js Configuration

```typescript
// lib/search.ts
import Fuse from 'fuse.js';
import locations from '@/data/locations.json';

const fuseOptions = {
  keys: [
    { name: 'canonical_name', weight: 0.6 },
    { name: 'aliases', weight: 0.35 },
    { name: 'area', weight: 0.05 }
  ],
  threshold: 0.4,        // 0 = exact match, 1 = match anything
  minMatchCharLength: 2,
  includeScore: true,
  ignoreLocation: true,  // don't penalise matches not at start of string
  useExtendedSearch: false
};

export const locationIndex = new Fuse(locations, fuseOptions);

export function searchLocations(query: string, limit = 8) {
  if (query.length < 2) return [];
  return locationIndex
    .search(query, { limit })
    .map(result => result.item);
}
```

### 13.2 Alias Strategy

The `aliases` array in each Location object is the primary mechanism for handling how Lagosians actually speak:

```json
{
  "location_id": "oshodi",
  "canonical_name": "Oshodi",
  "aliases": [
    "Oshodi Terminal",
    "Oshodi Under-Bridge",
    "Oshodi interchange",
    "Oshodi bus stop",
    "Oshodi park"
  ],
  "area": "Oshodi-Isolo",
  "lga": "Oshodi-Isolo LGA",
  "type": "terminal"
}
```

Common alias patterns to include for all locations:
- Common abbreviations (CMS, VI, GRA, FESTAC)
- "Under-bridge" / "Over-bridge" variants
- Nearby landmark references ("near Shoprite", "opposite GTBank")
- Common misspellings (Yaba/Yaaba, Ikeja/Ikaja)
- Pidgin variants where they exist

### 13.3 Zero Results Handling

When a search returns no results:
1. Show `EmptyState` with message: *"We don't have this location yet."*
2. Show a prompt: *"Try searching for a nearby area or landmark."*
3. Log the zero-result query to Vercel Analytics as a custom event (`zero_result_search`) for data gap tracking

---

## 14. Error States & Edge Cases

| Scenario | UI behaviour | API behaviour |
|---|---|---|
| Search query < 2 chars | No dropdown shown; no API call | 400 `QUERY_TOO_SHORT` |
| No search results | EmptyState with "try nearby landmark" | 200 with empty results array |
| Route not found | EmptyState with search-again CTA | 404 `ROUTE_NOT_FOUND` |
| Same origin and destination | Inline validation error; form doesn't submit | — |
| Claude API timeout (>5s) | Fallback notice shown; raw data renders | 200 with `ai_formatted: false` |
| Claude API error (5xx) | Same as timeout | 200 with `ai_formatted: false` |
| Supabase write fails | Toast: "Couldn't save. Please try again." | 500 logged server-side |
| Rate limit hit (corrections) | Toast: "Too many submissions. Try later." | 429 `RATE_LIMITED` |
| Invalid `from`/`to` in URL | Redirect to home with error toast | — |
| Network offline (client) | Browser default offline page | — |
| Empty `routes.json` | 500 error page with contact info | — |

### 14.1 Loading States

| State | Component | Behaviour |
|---|---|---|
| Search suggestions loading | `LocationInput` | Debounce 300ms; spinner in input |
| Route result loading | `route/page.tsx` | Skeleton cards (3 placeholder legs) |
| Correction submitting | `CorrectionForm` | Button disabled + spinner |

---

## 15. Environment Configuration

### 15.1 Environment Variables

```bash
# .env.local (never commit this file)

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        # Public anon key (safe to expose)
SUPABASE_SERVICE_ROLE_KEY=eyJ...            # Private — server-side only, never NEXT_PUBLIC_

# App config
NEXT_PUBLIC_APP_URL=https://owa.vercel.app  # Used for OG tags and canonical URLs
NODE_ENV=development
```

### 15.2 Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "functions": {
    "app/api/**": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### 15.3 Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true
  },
  // Ensure large JSON data files don't bloat the client bundle
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  }
};

export default nextConfig;
```

### 15.4 Supabase Client Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Public client — safe for browser use
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-only admin client — for route handlers that need elevated access
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

## 16. Definition of Done

### MVP is shippable when all of the following are true:

**Functional completeness**
- [ ] User can search origin and destination by landmark name and receive a matching route
- [ ] Fuzzy search handles at least 10 documented Lagos aliases and common misspellings
- [ ] Every route result displays: origin, destination, total fare range, total duration estimate, last verified date, confidence level
- [ ] Every leg displays: step number, vehicle badge, board landmark, board instruction, alight landmark, alight instruction, fare range, AI-formatted prose
- [ ] AI prose fallback renders raw instruction fields when Claude API is unavailable
- [ ] User can submit a correction without an account; submission is saved to Supabase
- [ ] Rate limiting blocks more than 3 corrections per IP per hour

**Data quality**
- [ ] Minimum 25 origin-destination pairs fully populated in `routes.json`
- [ ] All 25 routes manually verified against real Lagos conditions (June 2026)
- [ ] All fare estimates reviewed and within ±₦50 of current market rates
- [ ] Each location has at least 3 aliases in `locations.json`
- [ ] `confidence` field is set accurately per route (not all "high" by default)

**Performance**
- [ ] Lighthouse Performance score ≥ 85 on mobile (simulated 3G)
- [ ] First Contentful Paint < 2.5s on simulated 3G
- [ ] Total page weight < 250KB (gzipped) for the home page
- [ ] Search suggestions appear within 300ms of typing

**Accessibility & UX**
- [ ] Minimum 4.5:1 contrast ratio on all body text
- [ ] All interactive elements are keyboard navigable
- [ ] Vehicle badges are distinguishable without colour alone (icon or label)
- [ ] Accuracy disclaimer visible on every route result page
- [ ] Zero-result and no-route states have clear, actionable messages

**Deployment**
- [ ] App is live on a public Vercel URL
- [ ] All env variables are in Vercel dashboard (none hardcoded)
- [ ] GitHub repo is public with a README covering: setup, data structure, how to add a route, how to update fares
- [ ] Vercel Analytics is active and recording page views
- [ ] No console errors in production

---

## 17. Success Metrics (30-Day Post-Launch)

| Metric | Target | Tool |
|---|---|---|
| Total route searches | 500+ | Vercel Analytics |
| Unique visitors | 300+ | Vercel Analytics |
| Mobile traffic share | >75% | Vercel Analytics |
| Zero-result search rate | <20% | Custom Vercel Analytics event |
| Correction submissions | 10–50 (signal of engagement, not failure) | Supabase |
| Routes flagged as wrong | <15% of total route pairs | Supabase |
| Avg page load time | <3s | Vercel Analytics |
| App crash rate | 0 unhandled 500 errors in logs | Vercel Logs |

---

## 18. Open Questions

| # | Question | Owner | Priority |
|---|---|---|---|
| 1 | Who maintains `routes.json` post-launch? Solo or community contributors via GitHub PRs? | Gbeke | High |
| 2 | What is the fare update cadence? Fuel price changes shift danfo fares within days. | Gbeke | High |
| 3 | Domain strategy — `owalagos.com` or Vercel subdomain at MVP? | Gbeke | Medium |
| 4 | Should corrections be reviewable via a simple admin page at `/admin` (protected by Supabase auth)? | Gbeke | Medium |
| 5 | Is Vercel KV needed at MVP for caching Claude responses, or is fresh Claude calls per route view acceptable? | Gbeke | Low |
| 6 | Phase 2 trigger: if zero-result searches exceed 30%, prioritise expanding `locations.json` before any new features | Gbeke | Low |
| 7 | At what traffic level does the free Supabase tier (500MB, 2GB bandwidth) become a constraint? | Gbeke | Low |

---

## Appendix A — Vehicle Type Reference

| Vehicle | Badge colour | Common routes | Fare range (Lagos, 2026) |
|---|---|---|---|
| Danfo | Yellow | All major corridors | ₦100–₦500 per leg |
| BRT | Green | Oshodi–CMS, Ikorodu–TBS | ₦100–₦300 |
| Keke Napep | Orange | Last-mile, estate roads | ₦100–₦300 |
| Okada | Red | Short-distance, tight areas | ₦200–₦500 |
| Ferry | Blue | Marina–Ikorodu waterway | ₦500–₦1,500 |
| Walk | Grey | Short connections between stops | ₦0 |

---

## Appendix B — Sample `routes.json` Entry

```json
[
  {
    "route_id": "ojuelegba-to-cms",
    "origin_id": "ojuelegba",
    "destination_id": "cms-lagos-island",
    "origin_label": "Ojuelegba",
    "destination_label": "CMS (Lagos Island)",
    "total_fare_min": 300,
    "total_fare_max": 450,
    "total_duration_estimate_mins": 55,
    "last_verified": "2026-05-01",
    "confidence": "high",
    "flagged": false,
    "legs": [
      {
        "leg_id": "leg_01",
        "step_number": 1,
        "vehicle": "danfo",
        "board_landmark": "Ojuelegba Under-Bridge (CMS-facing side)",
        "board_instruction": "Board any yellow danfo heading to CMS. Tell the conductor 'CMS' or 'Marina'.",
        "alight_landmark": "CMS Bus Stop, opposite First Bank on Lagos Island",
        "alight_instruction": "Drop when you see the overhead bridge at CMS. The bus stops right there.",
        "fare_min": 300,
        "fare_max": 450,
        "duration_estimate_mins": 55,
        "notes": "Avoid 7–9am and 4–7pm. Traffic on the bridge can double journey time."
      }
    ]
  }
]
```

---

*This document supersedes PRD v1.0. All subsequent development should reference v2.0 as the canonical specification. V2 product considerations (real-time data, Yoruba UI, PWA, admin dashboard) are tracked separately.*
