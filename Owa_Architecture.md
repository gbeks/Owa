# Owa — System Architecture Document
**Version:** 1.0 | **Status:** Canonical | **Author:** Gbeke Odutuga
**Last updated:** June 2026
**Companion doc:** Owa PRD v2.0

---

## Table of Contents

1. [Architecture Philosophy](#1-architecture-philosophy)
2. [System Overview](#2-system-overview)
3. [Layer-by-Layer Breakdown](#3-layer-by-layer-breakdown)
   - 3.1 Client Layer
   - 3.2 Application Layer (Next.js)
   - 3.3 Data Layer
   - 3.4 External Services
4. [Request Lifecycle Maps](#4-request-lifecycle-maps)
   - 4.1 Route Search Flow
   - 4.2 Route Result + AI Formatting Flow
   - 4.3 Community Correction Flow
5. [Directory Structure](#5-directory-structure)
6. [Module Dependency Graph](#6-module-dependency-graph)
7. [Data Flow Architecture](#7-data-flow-architecture)
8. [API Layer Architecture](#8-api-layer-architecture)
9. [Component Architecture](#9-component-architecture)
10. [State Management](#10-state-management)
11. [AI Subsystem Architecture](#11-ai-subsystem-architecture)
12. [Search Subsystem Architecture](#12-search-subsystem-architecture)
13. [Database Architecture](#13-database-architecture)
14. [Security Architecture](#14-security-architecture)
15. [Performance Architecture](#15-performance-architecture)
16. [Error Boundary Architecture](#16-error-boundary-architecture)
17. [Deployment Architecture](#17-deployment-architecture)
18. [Environment & Config Architecture](#18-environment--config-architecture)
19. [Future Architecture Considerations](#19-future-architecture-considerations)

---

## 1. Architecture Philosophy

Owa is built around three hard constraints that shape every architectural decision:

**Constraint 1 — $0 budget**
No paid APIs, no paid infrastructure, no database that costs per row. Every architectural choice must either be free or have a generous free tier that won't be exceeded at MVP scale.

**Constraint 2 — Data honesty**
Lagos transit data is informal, volatile, and unverifiable via any API. The architecture treats data correctness as a first-class concern: every response signals its own confidence level, the AI layer is structurally prevented from inventing data, and the system degrades gracefully rather than returning wrong information.

**Constraint 3 — Low-bandwidth users**
Target users are on mid-range Android devices with intermittent 2G/3G data. The architecture front-loads as much work as possible at build time (static generation), minimises client-side JavaScript, and has no third-party analytics or ad scripts.

### Resulting principles

| Principle | What it means in practice |
|---|---|
| Static first | Route data is a JSON file bundled at build time — no DB read in the critical path |
| AI as formatter, not oracle | Claude only touches pre-validated structured data |
| Write-only external DB | Supabase is in the correction write path only — never the read path |
| Graceful degradation | Every external dependency (Claude, Supabase) has a fallback that keeps the core UX functional |
| Edge rendering | Pages are statically generated or server-rendered at the CDN edge |
| No client secrets | API keys never leave the server; no env vars prefixed `NEXT_PUBLIC_` for sensitive values |

---

## 2. System Overview

```
╔══════════════════════════════════════════════════════════════════════════╗
║                            OWA SYSTEM BOUNDARY                           ║
║                                                                          ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │                      CLIENT (Browser)                             │   ║
║  │                                                                   │   ║
║  │   SearchForm ──► LocationInput ──► SearchSuggestions             │   ║
║  │        │                                                          │   ║
║  │        ▼                                                          │   ║
║  │   RouteCard ──► LegList ──► LegCard ──► FlagButton               │   ║
║  │                                              │                    │   ║
║  │                                              ▼                    │   ║
║  │                                     CorrectionModal               │   ║
║  └───────────────────────┬──────────────────────┬────────────────────┘   ║
║                          │ HTTP                 │ HTTP                   ║
║                          ▼                      ▼                        ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │                 NEXT.JS APP LAYER (Vercel Edge)                   │   ║
║  │                                                                   │   ║
║  │  Pages: /  /route  /about  /404  /500                            │   ║
║  │                                                                   │   ║
║  │  API Routes:                                                      │   ║
║  │  ┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │   ║
║  │  │  GET /api/search │ │  GET /api/route   │ │POST /api/correct │  │   ║
║  │  │  (Fuse.js)       │ │  (Claude format)  │ │ions (Supabase)   │  │   ║
║  │  └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘  │   ║
║  └───────────┼────────────────────┼─────────────────────┼────────────┘   ║
║              │                    │                      │                ║
║              ▼                    ├──────────┐           ▼                ║
║  ┌───────────────────┐            │          │  ┌─────────────────────┐  ║
║  │   routes.json     │◄───────────┘          │  │  Supabase Postgres  │  ║
║  │   locations.json  │                       │  │  (corrections tbl)  │  ║
║  │   (static, build) │                       │  └─────────────────────┘  ║
║  └───────────────────┘                       │                           ║
║                                              ▼                           ║
║                                  ┌─────────────────────┐                ║
║                                  │  Anthropic Claude   │                ║
║                                  │  API (Haiku model)  │                ║
║                                  └─────────────────────┘                ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### System topology summary

| Zone | Technology | Responsibility |
|---|---|---|
| Client | React (Next.js) | UI rendering, user interaction, local state |
| Application | Next.js App Router on Vercel | Page rendering, API route handling, orchestration |
| Static data | JSON files (bundled at build) | Route and location source of truth |
| AI service | Anthropic Claude API | Direction prose formatting only |
| Write DB | Supabase Postgres | Store community corrections |
| CDN / Infra | Vercel Edge Network | Delivery, caching, CI/CD |

---

## 3. Layer-by-Layer Breakdown

### 3.1 Client Layer

The client is a React application rendered by Next.js. It is **not** a SPA — each page is a distinct server-rendered or statically generated HTML document. JavaScript on the client is limited to:

- Search input debouncing and dropdown rendering
- Route page API fetch on mount
- Correction modal open/close state
- Form submission for corrections

**Client has zero access to:**
- `routes.json` directly (served only via API)
- `ANTHROPIC_API_KEY` (server-only env var)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only env var)
- Supabase admin functions

**Client interactions:**
```
User types in SearchForm
    → debounce 300ms
    → GET /api/search?q={query}
    → render suggestions dropdown

User submits search
    → navigate to /route?from={id}&to={id}

Route page mounts
    → GET /api/route?from={id}&to={id}
    → render skeleton → render RouteCard + LegList

User clicks Flag on a leg
    → open CorrectionModal (local state)
    → POST /api/corrections
    → show success/error toast
```

---

### 3.2 Application Layer (Next.js)

The Next.js App Router is the central orchestrator. It handles:

**Page rendering**

| Page | Rendering strategy | Why |
|---|---|---|
| `/` (home) | Static (SSG) | No dynamic data; pre-built at deploy |
| `/route` | Server-side per request (SSR) | Reads URL params; calls Claude; can't pre-build |
| `/about` | Static (SSG) | Fully static content |
| `/404` | Static (SSG) | Standard error page |
| `/500` | Static (SSG) | Standard error page |

**API route handlers**

Each handler runs server-side in a Vercel Serverless Function (Node.js runtime). They are the only layer that touches external services (Claude API, Supabase).

```
/app
  /api
    /search
      route.ts     ← GET handler; imports locationIndex from lib/search.ts
    /route
      route.ts     ← GET handler; reads routes.json, calls lib/claude.ts
    /corrections
      route.ts     ← POST handler; writes to Supabase via lib/supabase.ts
```

**Key Next.js configuration choices:**

```
App Router (not Pages Router)
  Reason: Native support for server components, streaming, and route handlers
          in a single coherent model. No need for getServerSideProps patterns.

TypeScript strict mode
  Reason: Route data schemas must be type-safe. A wrong field type in
          routes.json should fail at build time, not at runtime.

No `src/` directory
  Reason: Keeps import paths short; standard for small Next.js projects.
```

---

### 3.3 Data Layer

The data layer has two distinct sub-layers with different characteristics:

**Sub-layer A — Static route data (read-only)**

```
/data
  routes.json      ← Array of Route objects; source of truth for all directions
  locations.json   ← Array of Location objects; source of truth for search index
```

These files are:
- Committed to the GitHub repository
- Bundled by webpack at build time into the server-side module graph
- Imported directly in API route handlers (no filesystem read at runtime)
- Updated manually by the maintainer; each update triggers a Vercel redeploy

The static data approach means:
- Zero latency for route lookups (in-memory after cold start)
- No database cost
- Route data is versioned in git (full history, rollback possible)
- A bad data update is reversible within minutes via git revert

**Sub-layer B — Supabase Postgres (write-only from public)**

Used exclusively for the `corrections` table. Public users can only `INSERT`. No public `SELECT`. The maintainer reads corrections via the Supabase dashboard or a future admin page authenticated with Supabase Auth.

Schema, RLS policies, and indexes are defined fully in Section 13.

---

### 3.4 External Services

**Anthropic Claude API**
- Called per route view (one call per leg)
- Strictly a formatting layer — receives structured data, returns prose
- Failure mode: returns raw structured data instead of prose
- No streaming used at MVP (full response awaited before render)
- Model: `claude-haiku-4-5-20251001` (lowest latency, lowest cost)

**Vercel**
- Hosts the Next.js app
- Runs serverless functions for API routes
- Provides CI/CD from GitHub (`main` branch → production)
- Provides Vercel Analytics (pageviews, custom events, web vitals)
- Edge network delivers static assets (HTML, JS, CSS, JSON)

**GitHub**
- Source control
- Triggers Vercel deploy on push to `main`
- Pull request previews via Vercel preview deployments
- `routes.json` and `locations.json` are maintained here

---

## 4. Request Lifecycle Maps

### 4.1 Route Search Flow

```
User types "ojue" in origin input
│
├─► [Client] debounce timer starts (300ms)
│
├─► [Client] timer fires → fetch GET /api/search?q=ojue&limit=8
│
├─► [Server: /api/search]
│     ├─ validate: query.length >= 2 ✓
│     ├─ call searchLocations("ojue", 8)  ← lib/search.ts
│     │     └─ Fuse.js searches locationIndex (in-memory)
│     │         keys: canonical_name (0.6), aliases (0.35), area (0.05)
│     │         threshold: 0.4
│     └─ return JSON: { results: [...], query: "ojue", total: 3 }
│
├─► [Client] render SearchSuggestions dropdown
│     └─ show: "Ojuelegba · Surulere · bus_stop"
│
└─► User clicks "Ojuelegba" → location_id "ojuelegba" stored in form state
```

---

### 4.2 Route Result + AI Formatting Flow

```
User clicks "Get Directions"
│
├─► [Client] validate: origin_id and destination_id both set ✓
│
├─► [Client] router.push("/route?from=ojuelegba&to=cms-lagos-island")
│
├─► [Server: /route page — SSR]
│     ├─ read searchParams: { from: "ojuelegba", to: "cms-lagos-island" }
│     └─ begin data fetch (parallel with HTML stream)
│
├─► [Client] render skeleton loading state (3 placeholder LegCards)
│
├─► [Server: /api/route?from=ojuelegba&to=cms-lagos-island]
│     │
│     ├─ Step 1: Lookup
│     │     └─ find route in routes.json where
│     │         origin_id === "ojuelegba" AND
│     │         destination_id === "cms-lagos-island"
│     │         → route found ✓
│     │
│     ├─ Step 2: AI Formatting (per leg, in parallel)
│     │     └─ for each leg in route.legs:
│     │           ├─ build prompt from leg fields (see Section 11)
│     │           └─ call Claude API → formatted_prose string
│     │
│     ├─ Step 3: Fallback check
│     │     └─ if any Claude call fails:
│     │           leg.formatted_prose = leg.board_instruction (raw field)
│     │           response.ai_formatted = false
│     │
│     └─ Step 4: Return
│           └─ { route: { ...routeObj, legs: [...legsWithProse] }, ai_formatted: true }
│
├─► [Client] replace skeleton with:
│     ├─ RouteCard (total fare, duration, confidence badge, last verified)
│     └─ LegList → LegCard × N
│           each LegCard: VehicleBadge | board info | alight info | FareRange | prose
│
└─► [Client] render FlagButton on each leg (opens CorrectionModal on click)
```

**Parallel vs sequential Claude calls:**

For a 3-leg route, Claude calls run in parallel using `Promise.all()`:

```typescript
const legsWithProse = await Promise.all(
  route.legs.map(leg => formatLegProse(leg).catch(() => ({
    ...leg,
    formatted_prose: leg.board_instruction
  })))
);
```

This means a 3-leg route takes as long as the slowest single Claude call (~800ms), not 3× that.

---

### 4.3 Community Correction Flow

```
User clicks "Flag this step" on LegCard
│
├─► [Client] open CorrectionModal (local React state)
│     └─ pre-populate: route_id, leg_id
│
├─► User selects issue type: "wrong_landmark"
│   User optionally types description
│
├─► User clicks "Submit"
│
├─► [Client] POST /api/corrections
│     body: { route_id, leg_id, issue_type, description }
│
├─► [Server: /api/corrections]
│     │
│     ├─ Step 1: Validate body
│     │     ├─ route_id exists in routes.json? ✓
│     │     ├─ issue_type is valid enum? ✓
│     │     └─ description.length <= 500? ✓
│     │
│     ├─ Step 2: Rate limit check
│     │     └─ hash request IP → check in-memory counter
│     │         if count >= 3 in last 3600s → return 429
│     │
│     ├─ Step 3: Enrich payload
│     │     └─ add user_agent (from request headers)
│     │        add ip_hash (SHA-256 of IP, not raw IP)
│     │
│     ├─ Step 4: Write to Supabase
│     │     └─ supabase.from("corrections").insert({ ... })
│     │         if error → log + return 500
│     │         if success → return 201
│     │
│     └─ Step 5: Return
│           201: { success: true, message: "...", correction_id: "uuid" }
│
└─► [Client] close modal → show success toast
      "Thanks. We'll review this route soon."
```

---

## 5. Directory Structure

Full project file tree with purpose annotations:

```
owa/
│
├── app/                              ← Next.js App Router root
│   ├── layout.tsx                   ← Root layout: fonts, analytics, metadata
│   ├── page.tsx                     ← Home page: renders SearchForm
│   ├── globals.css                  ← Tailwind base imports only
│   │
│   ├── route/
│   │   └── page.tsx                 ← Route result page (SSR; reads searchParams)
│   │
│   ├── about/
│   │   └── page.tsx                 ← Static about/accuracy disclosure page
│   │
│   ├── not-found.tsx                ← Custom 404 page
│   ├── error.tsx                    ← Global error boundary (client component)
│   │
│   └── api/
│       ├── search/
│       │   └── route.ts             ← GET /api/search
│       ├── route/
│       │   └── route.ts             ← GET /api/route
│       └── corrections/
│           └── route.ts             ← POST /api/corrections
│
├── components/                      ← All React components
│   ├── search/
│   │   ├── SearchForm.tsx           ← Origin + destination + swap + submit
│   │   ├── LocationInput.tsx        ← Autocomplete input (reusable)
│   │   └── SearchSuggestions.tsx    ← Dropdown list of matches
│   │
│   ├── route/
│   │   ├── RouteCard.tsx            ← Trip summary (fare total, duration, badges)
│   │   ├── LegList.tsx              ← Ordered list container for legs
│   │   ├── LegCard.tsx              ← Single leg display (all step info)
│   │   ├── VehicleBadge.tsx         ← Coloured pill: Danfo / BRT / Keke etc.
│   │   ├── FareRange.tsx            ← ₦300–₦450 formatted display
│   │   ├── ConfidenceBadge.tsx      ← "Last verified May 2026" + level dot
│   │   └── FlagButton.tsx           ← Trigger for CorrectionModal
│   │
│   ├── corrections/
│   │   ├── CorrectionModal.tsx      ← Modal wrapper (accessible)
│   │   └── CorrectionForm.tsx       ← Issue type select + description textarea
│   │
│   ├── ui/                          ← Primitive, unstyled-logic components
│   │   ├── Button.tsx               ← primary | secondary | ghost variants
│   │   ├── Badge.tsx                ← Base badge (used by VehicleBadge)
│   │   ├── Modal.tsx                ← Focus trap + backdrop + escape handler
│   │   ├── Spinner.tsx              ← Loading indicator
│   │   ├── Toast.tsx                ← Feedback notifications (success/error)
│   │   ├── EmptyState.tsx           ← Zero results / no route found
│   │   ├── Skeleton.tsx             ← Placeholder loading cards
│   │   └── Disclaimer.tsx           ← Data accuracy warning banner
│   │
│   └── layout/
│       ├── Header.tsx               ← Logo mark + "About" nav link
│       └── Footer.tsx               ← Data notice + correction prompt
│
├── lib/                             ← Server-side utility modules
│   ├── search.ts                    ← Fuse.js index initialisation + searchLocations()
│   ├── routes.ts                    ← Route lookup helpers (findRoute, getLocation)
│   ├── claude.ts                    ← Claude API client + formatLegProse()
│   ├── supabase.ts                  ← Supabase client singletons (public + admin)
│   ├── rate-limit.ts                ← In-memory rate limiter for corrections
│   └── validation.ts                ← Zod schemas for API request validation
│
├── data/                            ← Static source-of-truth data files
│   ├── routes.json                  ← All Route objects
│   └── locations.json               ← All Location objects
│
├── types/                           ← TypeScript type definitions
│   └── route.ts                     ← Route, RouteLeg, Location, VehicleType types
│
├── hooks/                           ← Custom React hooks (client-side)
│   ├── useSearch.ts                 ← Debounced search input logic
│   ├── useCorrection.ts             ← Correction modal state + submit handler
│   └── useToast.ts                  ← Toast notification state
│
├── public/                          ← Static assets served by Next.js
│   ├── favicon.ico
│   ├── og-image.png                 ← Open Graph image for social sharing
│   └── icons/
│       ├── danfo.svg
│       ├── brt.svg
│       ├── keke.svg
│       ├── okada.svg
│       └── ferry.svg
│
├── .env.local                       ← Local env vars (gitignored)
├── .env.example                     ← Template for env vars (committed, no values)
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── package.json
```

---

## 6. Module Dependency Graph

Shows which modules import which. Arrows represent `import` direction.

```
                        ┌─────────────────┐
                        │   routes.json   │
                        │  locations.json │
                        └────────┬────────┘
                                 │ imported by
                    ┌────────────┼────────────────┐
                    ▼            ▼                 ▼
             lib/routes.ts  lib/search.ts    (build only)
                    │            │
                    ▼            ▼
         app/api/route/   app/api/search/
            route.ts         route.ts
                    │
                    ▼
            lib/claude.ts ──────────────► [Anthropic API]
                    │
                    ▼
            lib/supabase.ts ────────────► [Supabase API]
                    │
                    ▼
         app/api/corrections/
              route.ts
                    │
                    ▼
            lib/rate-limit.ts
            lib/validation.ts

─────────── SERVER BOUNDARY ───────────────────────────────

Client components import ONLY:
  - React hooks from /hooks/
  - UI components from /components/
  - Types from /types/
  - NO imports from /lib/ (server-only)
  - NO imports from /data/ (JSON files)
```

**Enforcing the server boundary:**

```typescript
// lib/claude.ts — first line
import 'server-only'; // Next.js package; throws build error if imported client-side
```

All files in `/lib/` include `import 'server-only'` to prevent accidental client import of server code containing API keys.

---

## 7. Data Flow Architecture

### 7.1 Read path (route lookup)

```
routes.json ──(bundled at build)──► Next.js module cache
                                          │
                                    lib/routes.ts
                                    findRoute(from, to)
                                          │
                                   Route object found
                                          │
                              ┌───────────┴────────────┐
                              │                        │
                        raw Route object         lib/claude.ts
                              │                  formatLegProse()
                              │                        │
                              └───────────┬────────────┘
                                          │
                              Route with formatted_prose
                                          │
                                   JSON response
                                          │
                                    React UI render
```

### 7.2 Write path (corrections)

```
User submits CorrectionForm
        │
        ▼ POST /api/corrections
        │
   lib/validation.ts
   Zod.parse(body) ──fail──► 400 response
        │ pass
        ▼
   lib/rate-limit.ts
   checkLimit(ipHash) ──exceed──► 429 response
        │ ok
        ▼
   lib/supabase.ts
   supabaseAdmin.from("corrections").insert()
        │
   ┌────┴─────┐
   │ success  │ error
   ▼          ▼
  201       500 + log
```

### 7.3 Search path

```
locations.json ──(bundled at build)──► lib/search.ts
                                       Fuse(locations, options)
                                       locationIndex (module-level singleton)
                                             │
                                       GET /api/search?q=
                                             │
                                       searchLocations(q, limit)
                                             │
                                       Fuse.search(q)
                                             │
                                       JSON response → client dropdown
```

**Why the Fuse index is a module-level singleton:**

Fuse.js builds an index from the locations array once when the module is first imported. In Vercel's serverless functions, the module stays warm between invocations within the same container. This means the index is built once per cold start, not once per request — making search essentially free after the first call.

---

## 8. API Layer Architecture

### 8.1 Handler Structure Pattern

All three API route handlers follow the same internal structure:

```typescript
// Pattern applied to all route handlers

export async function GET/POST(request: NextRequest) {
  try {
    // 1. Parse and validate input
    // 2. Business logic (lookup / AI call / DB write)
    // 3. Return structured JSON response
  } catch (error) {
    // 4. Log error
    // 5. Return appropriate error response (never expose stack traces)
  }
}
```

### 8.2 `GET /api/search` — Full Implementation Spec

```typescript
// app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/search';

export const runtime = 'nodejs'; // use Node for Fuse.js compatibility

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '8'), 20);

  if (q.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters', code: 'QUERY_TOO_SHORT' },
      { status: 400 }
    );
  }

  const results = searchLocations(q, limit);

  return NextResponse.json(
    { results, query: q, total: results.length },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // 5min cache on CDN
      }
    }
  );
}
```

### 8.3 `GET /api/route` — Full Implementation Spec

```typescript
// app/api/route/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { findRoute } from '@/lib/routes';
import { formatLegProse } from '@/lib/claude';

export const runtime = 'nodejs';
export const maxDuration = 10; // seconds; allows for Claude latency

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from')?.trim();
  const to = searchParams.get('to')?.trim();

  if (!from || !to) {
    return NextResponse.json(
      { error: 'Both from and to parameters are required', code: 'MISSING_PARAMS' },
      { status: 400 }
    );
  }

  if (from === to) {
    return NextResponse.json(
      { error: 'Origin and destination cannot be the same', code: 'SAME_LOCATION' },
      { status: 400 }
    );
  }

  const route = findRoute(from, to);

  if (!route) {
    return NextResponse.json(
      {
        error: 'No route found between these locations',
        code: 'ROUTE_NOT_FOUND',
        suggestion: 'Try searching for a nearby landmark or area instead'
      },
      { status: 404 }
    );
  }

  // Format all legs in parallel; fall back to raw fields on per-leg failure
  let aiFormatted = true;
  const legsWithProse = await Promise.all(
    route.legs.map(async (leg) => {
      try {
        const formatted_prose = await formatLegProse(leg);
        return { ...leg, formatted_prose };
      } catch {
        aiFormatted = false;
        return { ...leg, formatted_prose: leg.board_instruction };
      }
    })
  );

  return NextResponse.json(
    {
      route: { ...route, legs: legsWithProse },
      ai_formatted: aiFormatted,
      ...(!aiFormatted && {
        fallback_notice: 'Showing simplified directions. Prose formatting temporarily unavailable.'
      })
    },
    { status: 200 }
  );
}
```

### 8.4 `POST /api/corrections` — Full Implementation Spec

```typescript
// app/api/corrections/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';
import { correctionSchema } from '@/lib/validation';
import { findRoute } from '@/lib/routes';
import { createHash } from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse body
    const body = await request.json();

    // 2. Validate shape
    const parsed = correctionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { route_id, leg_id, issue_type, description } = parsed.data;

    // 3. Validate route_id exists in static data
    const route = findRoute(route_id);
    if (!route) {
      return NextResponse.json(
        { error: 'Route not found', code: 'INVALID_ROUTE_ID' },
        { status: 400 }
      );
    }

    // 4. Rate limit by hashed IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    const ipHash = createHash('sha256').update(ip).digest('hex');
    const allowed = checkRateLimit(ipHash, 3, 3600); // 3 per hour
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait before submitting again.', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    }

    // 5. Write to Supabase
    const { data, error } = await supabaseAdmin
      .from('corrections')
      .insert({
        route_id,
        leg_id: leg_id ?? null,
        issue_type,
        description: description ?? null,
        user_agent: request.headers.get('user-agent') ?? null,
        ip_hash: ipHash
      })
      .select('id')
      .single();

    if (error) {
      console.error('[corrections] Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Could not save correction. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thanks for the correction. We'll review and update this route.",
        correction_id: data.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[corrections] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
```

---

## 9. Component Architecture

### 9.1 Component Hierarchy & Data Flow

```
app/page.tsx (Server Component)
└── SearchForm (Client Component)
      ├── LocationInput — "From" (Client)
      │     └── SearchSuggestions (Client)
      ├── LocationInput — "To" (Client)
      │     └── SearchSuggestions (Client)
      └── Button — "Get Directions" (Client)

app/route/page.tsx (Server Component — fetches route data)
└── RouteCard (Client Component — receives route prop)
      ├── ConfidenceBadge
      ├── FareRange (total)
      └── LegList
            └── LegCard × N
                  ├── VehicleBadge
                  ├── FareRange (per leg)
                  ├── ConfidenceBadge (per leg freshness)
                  └── FlagButton
                        └── CorrectionModal (portal, lazy-loaded)
                              └── CorrectionForm
```

### 9.2 Component Classification

| Component | Type | Why |
|---|---|---|
| `app/page.tsx` | Server | No interactivity; can be fully static |
| `app/route/page.tsx` | Server | Fetches route data server-side before streaming HTML |
| `SearchForm` | Client | Needs event handlers, controlled inputs, navigation |
| `LocationInput` | Client | Debounced keypress, dropdown visibility state |
| `SearchSuggestions` | Client | Conditionally rendered based on search state |
| `RouteCard` | Client | Receives props; minor interactivity (expand/collapse future) |
| `LegCard` | Client | Flag button interaction |
| `CorrectionModal` | Client | Modal open/close state, form submission |
| `VehicleBadge` | Server or Client | Pure display; no state needed |
| `FareRange` | Server or Client | Pure display |
| `ConfidenceBadge` | Server or Client | Pure display |
| `Button`, `Badge`, `Modal` | Client | UI primitives |

### 9.3 Key Component Specs

**`LocationInput.tsx`**
```
Props:
  id: string
  label: string
  placeholder: string
  value: Location | null
  onChange: (location: Location | null) => void

Internal state:
  inputText: string        ← what the user has typed
  suggestions: Location[]  ← API results
  isOpen: boolean          ← dropdown visibility
  isLoading: boolean       ← debounce in flight

Behaviour:
  - Debounce 300ms on keystroke → GET /api/search?q={inputText}
  - Show spinner in input during fetch
  - Click suggestion → set value, clear inputText, close dropdown
  - Escape key → close dropdown
  - Click outside → close dropdown
  - Clear button appears when value is set
```

**`LegCard.tsx`**
```
Props:
  leg: RouteLeg & { formatted_prose: string }
  stepNumber: number
  routeId: string

Renders:
  ┌──────────────────────────────────────────┐
  │ Step 1         [DANFO]          ₦300–₦450 │
  │                                           │
  │ Board at Ojuelegba Under-Bridge...        │
  │ [formatted_prose paragraph]               │
  │                                           │
  │ Drop at CMS Bus Stop                      │
  │                              [Flag step]  │
  └──────────────────────────────────────────┘
```

**`CorrectionModal.tsx`**
```
Props:
  isOpen: boolean
  onClose: () => void
  routeId: string
  legId: string
  stepNumber: number

Behaviour:
  - Renders as React portal to document.body
  - Traps focus while open
  - Closes on Escape or backdrop click
  - Submits to POST /api/corrections
  - Shows inline loading state on submit button
  - On success: closes modal, fires onSuccess toast
  - On error: shows inline error message, keeps modal open
```

---

## 10. State Management

Owa uses no global state library (no Redux, no Zustand, no Context for data). State is local to components and lifted only where necessary.

### 10.1 State Map

| State | Where it lives | Type |
|---|---|---|
| Origin location | `SearchForm` | `Location \| null` |
| Destination location | `SearchForm` | `Location \| null` |
| Search input text (origin) | `LocationInput` | `string` |
| Search input text (destination) | `LocationInput` | `string` |
| Search suggestions | `LocationInput` | `Location[]` |
| Dropdown open | `LocationInput` | `boolean` |
| Route data | `app/route/page.tsx` (server) | `Route \| null` |
| Correction modal open | `LegCard` | `boolean` |
| Correction form values | `CorrectionForm` | `{ issue_type, description }` |
| Correction submitting | `CorrectionForm` | `boolean` |
| Toast notifications | `useToast` hook | `Toast[]` |

### 10.2 URL as State

The route result page stores its key state in the URL:

```
/route?from=ojuelegba&to=cms-lagos-island
```

This means:
- Results are shareable (copy URL → same result for anyone)
- Browser back/forward navigates correctly
- No client-side state needed to persist the route query
- Deep links work out of the box (e.g., from a WhatsApp share)

### 10.3 No Caching Layer at MVP

Route results are fetched fresh on every `/route` page load. There is no:
- Client-side result cache
- Vercel KV cache for formatted prose
- SWR or React Query

This is intentional for MVP: caching adds complexity and the fresh-per-request model is simple, predictable, and ensures users always see the latest route data after a redeploy.

---

## 11. AI Subsystem Architecture

### 11.1 Responsibility Boundary (Strict)

```
Claude's allowed inputs:          Claude's allowed outputs:
┌─────────────────────────┐       ┌───────────────────────────┐
│ vehicle (from JSON)     │       │ Prose paragraph (2-3      │
│ board_landmark (from    │  ───► │ sentences) referencing    │
│   JSON)                 │       │ ONLY the input values     │
│ board_instruction       │       │ provided. No new names,   │
│ alight_landmark         │       │ stops, fares, or routes.  │
│ alight_instruction      │       └───────────────────────────┘
│ fare_min / fare_max     │
│ duration_estimate_mins  │
│ notes (optional)        │
└─────────────────────────┘

Claude is NOT allowed to:
  ✗ Suggest alternative routes
  ✗ Add landmarks not in the input
  ✗ Change fare figures
  ✗ Invent conductor dialogue not in board_instruction
  ✗ Give real-time information
```

### 11.2 Prompt Architecture

The prompt has three layers:

**Layer 1 — System prompt (static, never changes)**
Sets the role, the rules, and the output format. This is the hallucination guardrail.

**Layer 2 — Structured data (per-leg, from routes.json)**
Injected as a labelled list. Every field name is explicit to prevent the model from confusing which value is which.

**Layer 3 — Output instruction (static)**
Specifies exactly what to return and what not to return.

```typescript
const SYSTEM_PROMPT = `
You are a Lagos transit guide writing clear, friendly directions for everyday commuters.

Your ONLY job: rewrite the structured data below into natural prose directions.
Write in second person. Keep it to 2-3 sentences per step.
Use conversational English. No corporate language.

STRICT RULES — never break these:
1. Never change or invent any landmark name, stop name, or place
2. Never change the fare figures — use exactly what is given
3. Never add vehicle types not specified
4. Never add steps, connections, or routes not in the data
5. If a "notes" field is present, weave it in naturally
6. Return ONLY the prose. No lists, no labels, no markdown.
`.trim();
```

### 11.3 Claude Client Module

```typescript
// lib/claude.ts
import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import type { RouteLeg } from '@/types/route';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function formatLegProse(leg: RouteLeg): Promise<string> {
  const userContent = `
Vehicle type: ${leg.vehicle}
Board at: ${leg.board_landmark}
Board instruction: ${leg.board_instruction}
Alight at: ${leg.alight_landmark}
Alight instruction: ${leg.alight_instruction}
Fare: ₦${leg.fare_min}–₦${leg.fare_max}
Estimated time: ${leg.duration_estimate_mins} minutes
${leg.notes ? `Additional notes: ${leg.notes}` : ''}

Write the formatted prose for this step only. Nothing else.
  `.trim();

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const text = response.content.find(b => b.type === 'text')?.text;
  if (!text) throw new Error('No text in Claude response');
  return text.trim();
}
```

### 11.4 Timeout Strategy

Claude API calls are wrapped with a 5-second timeout to prevent slow routes from blocking the UI:

```typescript
async function formatLegProseWithTimeout(leg: RouteLeg): Promise<string> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Claude timeout')), 5000)
  );
  return Promise.race([formatLegProse(leg), timeout]);
}
```

If the timeout fires, the leg falls back to its raw `board_instruction` field.

---

## 12. Search Subsystem Architecture

### 12.1 Index Construction

```typescript
// lib/search.ts
import 'server-only';
import Fuse from 'fuse.js';
import locations from '@/data/locations.json';
import type { Location } from '@/types/route';

const FUSE_OPTIONS: Fuse.IFuseOptions<Location> = {
  keys: [
    { name: 'canonical_name', weight: 0.6 },
    { name: 'aliases',        weight: 0.35 },
    { name: 'area',           weight: 0.05 },
  ],
  threshold: 0.4,          // Controls fuzziness. 0 = exact, 1 = anything
  minMatchCharLength: 2,   // Don't match single letters
  includeScore: true,
  ignoreLocation: true,    // Don't penalise non-prefix matches ("cms" finds "CMS Bus Stop")
  findAllMatches: false,   // Stop after finding threshold matches (performance)
  useExtendedSearch: false,
};

// Built once at module load (cold start). Reused across all requests in this container.
export const locationIndex = new Fuse<Location>(locations as Location[], FUSE_OPTIONS);

export function searchLocations(query: string, limit = 8): Location[] {
  if (query.length < 2) return [];
  return locationIndex
    .search(query, { limit })
    .map(result => result.item);
}
```

### 12.2 Alias Coverage Requirements

Every Location object must have aliases covering:

```
1. Abbreviations         CMS, VI, GRA, FESTAC, TBS, Ojue
2. Structural variants   "Under-Bridge", "Over-Bridge", "Terminal", "Park"
3. Landmark anchors      "near Shoprite Surulere", "opposite GTBank Yaba"
4. Pidgin/Yoruba names   where commonly used ("Oshodi" → "Oshodi")
5. Common misspellings   Ikeja/Ikaja, Yaba/Yaaba, Lekki/Leki
6. LGA / area names      "Surulere", "Isale Eko", "Ajah"
```

### 12.3 Zero-Result Telemetry

When `searchLocations` returns an empty array, the `/api/search` handler logs a custom Vercel Analytics event:

```typescript
// In /api/search/route.ts, after results computed:
if (results.length === 0) {
  // Vercel Analytics custom event (server-side)
  // Stored in Vercel dashboard; helps identify missing locations
  console.log(JSON.stringify({ event: 'zero_result_search', query: q }));
}
```

These logs surface in Vercel's log drain and can be queried to discover the top unresolved searches — directly driving `locations.json` expansion.

---

## 13. Database Architecture

### 13.1 Supabase Project Setup

```
Project name: owa-lagos
Region: eu-west-1 (London)  ← closest Vercel region to Lagos
Postgres version: 15
```

**Why London over US regions:** Supabase free tier only offers us-east-1 and eu-west-1 (at time of writing). EU West has measurably lower latency from Lagos (~100ms) than US East (~200ms). Since Supabase is only in the write path (corrections), this difference is acceptable but worth minimising.

### 13.2 Full Schema

```sql
-- ============================================================
-- TABLE: corrections
-- Purpose: Store community-submitted route correction reports
-- Access: anon INSERT only; authenticated SELECT/UPDATE
-- ============================================================

CREATE TABLE IF NOT EXISTS corrections (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ   DEFAULT NOW() NOT NULL,

  -- Route reference (validated against routes.json before insert)
  route_id      TEXT          NOT NULL,
  leg_id        TEXT,         -- null = whole route flagged

  -- Classification
  issue_type    TEXT          NOT NULL,
  CONSTRAINT issue_type_check CHECK (
    issue_type IN (
      'wrong_landmark',
      'wrong_fare',
      'route_closed',
      'wrong_vehicle',
      'other'
    )
  ),

  -- User content
  description   TEXT          CHECK (char_length(description) <= 500),

  -- Status lifecycle: pending → reviewed → applied
  status        TEXT          NOT NULL DEFAULT 'pending',
  CONSTRAINT status_check CHECK (
    status IN ('pending', 'reviewed', 'applied', 'dismissed')
  ),

  -- Anti-spam fields
  user_agent    TEXT,
  ip_hash       TEXT          -- SHA-256 of originating IP; not raw IP
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Admin review queue: pending items newest first
CREATE INDEX idx_corrections_review
  ON corrections(status, created_at DESC)
  WHERE status = 'pending';

-- Route-specific lookups
CREATE INDEX idx_corrections_route_id
  ON corrections(route_id, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;

-- Public (anon) can insert only
CREATE POLICY "anon_insert"
  ON corrections
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users (maintainer) can read all
CREATE POLICY "auth_select"
  ON corrections
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can update status field only
CREATE POLICY "auth_update_status"
  ON corrections
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

### 13.3 Supabase Client Architecture

Two separate clients with different privilege levels:

```typescript
// lib/supabase.ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Anon client — uses NEXT_PUBLIC keys; safe for theoretical client use
// In practice, only used server-side in this app
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client — uses service role key; bypasses RLS
// Used only in /api/corrections route handler (INSERT with extra fields)
// NEVER exported to client components
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

---

## 14. Security Architecture

### 14.1 Threat Model

| Threat | Likelihood | Mitigation |
|---|---|---|
| API key leakage | Medium | All keys in server-only env vars; `import 'server-only'` enforced |
| Spam corrections | High | IP hash rate limiting (3/hour); no account needed to submit |
| Prompt injection via correction text | Low | Description text never passed to Claude |
| XSS in route data | Low | React escapes all output; no `dangerouslySetInnerHTML` |
| Data scraping | Low | No user data stored; route data is public anyway |
| Supabase data exfiltration | Low | RLS prevents anon reads; no PII stored |
| Claude hallucination injection | Medium | Prompt design prevents it; Claude receives only pre-validated fields |

### 14.2 Secret Handling Rules

```
ANTHROPIC_API_KEY        → server-only (never NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY → server-only (never NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL  → safe to expose (just the project URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY → safe to expose (RLS limits its power)
```

### 14.3 Input Validation (Zod)

All API inputs are validated with Zod before any business logic runs:

```typescript
// lib/validation.ts
import { z } from 'zod';

export const correctionSchema = z.object({
  route_id: z.string().min(1).max(100),
  leg_id: z.string().max(20).optional(),
  issue_type: z.enum([
    'wrong_landmark',
    'wrong_fare',
    'route_closed',
    'wrong_vehicle',
    'other'
  ]),
  description: z.string().max(500).optional(),
});

export const searchSchema = z.object({
  q: z.string().min(2).max(100),
  limit: z.coerce.number().min(1).max(20).default(8),
});

export const routeQuerySchema = z.object({
  from: z.string().min(1).max(100),
  to: z.string().min(1).max(100),
});
```

### 14.4 Rate Limiting

In-memory rate limiter for correction submissions. Sufficient for MVP traffic volumes:

```typescript
// lib/rate-limit.ts

const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true; // allowed
  }

  if (entry.count >= maxRequests) {
    return false; // blocked
  }

  entry.count++;
  return true; // allowed
}
```

**Caveat:** In-memory rate limiting resets on cold starts and is per-function-instance. For MVP volumes this is acceptable. If traffic grows, replace with Vercel KV-backed rate limiting.

---

## 15. Performance Architecture

### 15.1 Performance Budget

| Metric | Target | Measurement |
|---|---|---|
| Home page — First Contentful Paint | < 1.5s (4G), < 2.5s (3G) | Vercel Analytics |
| Route result — Time to Interactive | < 3s (4G), < 5s (3G) | Lighthouse |
| Search suggestions — response time | < 300ms p95 | Vercel Function logs |
| Route API — response time | < 2s p95 (includes Claude) | Vercel Function logs |
| Total page weight (home, gzipped) | < 200KB | Webpack bundle analyser |
| Total page weight (route, gzipped) | < 250KB | Webpack bundle analyser |

### 15.2 Static Generation Strategy

```
Home (/)        → generateStaticParams: none needed → builds as static HTML
About (/about)  → static HTML
404             → static HTML
500             → static HTML

Route (/route)  → SSR per request (URL params are dynamic)
                  Cannot be statically generated at MVP because:
                  - 25 routes × 25 destinations = 625 possible pages
                  - Claude calls happen at render time
                  - Future: generateStaticParams for top 50 routes
```

### 15.3 Bundle Optimisation

```typescript
// next.config.ts — bundle analysis
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Key rules:
// - Fuse.js runs SERVER-SIDE only → not in client bundle
// - Anthropic SDK runs SERVER-SIDE only → not in client bundle
// - Supabase client: only @supabase/supabase-js client bundle (not full SDK)
// - lucide-react: tree-shaken to only icons used
// - No moment.js, no lodash, no large utility libraries
```

### 15.4 Image Optimisation

```
Vehicle type icons: SVG inline (not <img>) → zero network requests
OG image: Static PNG in /public/ → served from CDN edge
No hero images, no photo assets at MVP
```

### 15.5 Font Strategy

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',     // prevents FOIT
  variable: '--font-inter',
  preload: true,
});

// Single font family at MVP. No display/body split.
// Reduces font payload to one variable weight file.
```

---

## 16. Error Boundary Architecture

### 16.1 Error Hierarchy

```
app/error.tsx                ← Catches unhandled errors in any route segment
    │
    ├── app/route/error.tsx  ← Route-specific error (overrides global)
    │     Displays: "Couldn't load this route. Try searching again."
    │     CTA: Back to home
    │
    └── app/not-found.tsx    ← 404 handler
          Displays: "Page not found."
          CTA: Back to home + search form
```

### 16.2 API Error Response Contract

Every API route returns a consistent error shape:

```typescript
type ApiError = {
  error: string;      // Human-readable message (safe to display)
  code: string;       // Machine-readable code for client logic
  details?: unknown;  // Optional: validation errors (dev mode only)
  suggestion?: string; // Optional: what the user can try instead
};
```

Error codes reference:

| Code | Status | Meaning |
|---|---|---|
| `QUERY_TOO_SHORT` | 400 | Search query < 2 chars |
| `MISSING_PARAMS` | 400 | `from` or `to` missing |
| `SAME_LOCATION` | 400 | `from === to` |
| `INVALID_BODY` | 400 | Correction body fails Zod validation |
| `INVALID_ROUTE_ID` | 400 | route_id not found in routes.json |
| `ROUTE_NOT_FOUND` | 404 | No route for this origin/destination pair |
| `RATE_LIMITED` | 429 | Correction submission rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### 16.3 Client-Side Error Handling

```
API call fails (network / 5xx)
  └─ show Toast: "Something went wrong. Please try again."
     └─ retry button on route result page

API returns 404 (ROUTE_NOT_FOUND)
  └─ show EmptyState: "No route found"
     └─ "Try a nearby landmark" hint
     └─ Search form (back to home)

Correction submit fails
  └─ keep modal open
  └─ show inline error: "Couldn't save. Try again?"
  └─ retry button in modal footer
```

---

## 17. Deployment Architecture

### 17.1 CI/CD Pipeline

```
Developer pushes to GitHub
        │
        ▼
┌──────────────────────────────────┐
│  Vercel Build Pipeline           │
│                                  │
│  1. npm install                  │
│  2. TypeScript type check        │
│  3. next build                   │
│     ├─ routes.json bundled       │
│     ├─ locations.json bundled    │
│     ├─ Static pages generated    │
│     └─ API routes compiled       │
│  4. Deploy to Vercel Edge        │
└──────────────────────────────────┘
        │
        ▼
Production URL: https://owa.vercel.app
  or custom: https://owalagos.com
```

### 17.2 Branch Strategy

```
main          → Production (auto-deploy on merge)
develop       → Staging (optional preview deploy)
feature/*     → Pull request previews (Vercel preview URLs)
data/update-* → Branch convention for routes.json updates
```

### 17.3 Data Update Workflow

When route data needs updating (fares changed, new route added):

```
1. Create branch: git checkout -b data/update-ojuelegba-fares
2. Edit /data/routes.json
   - Update fare_min / fare_max
   - Update last_verified date
   - Adjust confidence level if needed
3. Commit: git commit -m "data: update Ojuelegba–CMS fares (June 2026)"
4. Open PR → Vercel generates preview URL
5. Test preview URL manually (verify route renders correctly)
6. Merge to main → Vercel rebuilds production in ~60 seconds
7. New fares live without any code change
```

### 17.4 Vercel Configuration

```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "functions": {
    "app/api/route/route.ts": {
      "maxDuration": 10
    },
    "app/api/search/route.ts": {
      "maxDuration": 5
    },
    "app/api/corrections/route.ts": {
      "maxDuration": 5
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-DNS-Prefetch-Control", "value": "on" }
      ]
    }
  ]
}
```

---

## 18. Environment & Config Architecture

### 18.1 Full Environment Variable Registry

```bash
# ─── REQUIRED: App will not start without these ───────────────────────────

ANTHROPIC_API_KEY=sk-ant-api03-...
# Used by: lib/claude.ts
# Scope: Server only (never NEXT_PUBLIC_)
# Obtain: https://console.anthropic.com/settings/keys

NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
# Used by: lib/supabase.ts
# Scope: Public (safe to expose; identifies project, not credentials)

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Used by: lib/supabase.ts (public client)
# Scope: Public (safe to expose; RLS restricts permissions)

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Used by: lib/supabase.ts (admin client, corrections INSERT)
# Scope: Server only (never NEXT_PUBLIC_) — bypasses RLS

# ─── OPTIONAL: Defaults provided if absent ────────────────────────────────

NEXT_PUBLIC_APP_URL=https://owa.vercel.app
# Used by: OG metadata, canonical URL generation
# Default: http://localhost:3000

NODE_ENV=production
# Set automatically by Vercel; don't set manually
```

### 18.2 `.env.example` (committed to repo)

```bash
# Copy this file to .env.local and fill in values
# NEVER commit .env.local

ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

### 18.3 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 18.4 `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Owa brand palette
        'danfo-yellow': '#F5C518',
        'brt-green': '#2D7D46',
        'keke-orange': '#E07B39',
        'okada-red': '#C0392B',
        'ferry-blue': '#2471A3',
        'walk-gray': '#7F8C8D',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 19. Future Architecture Considerations

These are documented here to inform MVP decisions — not to scope-creep the current build.

| Feature | Architecture implication |
|---|---|
| **Route caching (v1.5)** | Add Vercel KV; cache `formatLegProse` output keyed by `leg_id + routes.json version hash`. Cuts Claude cost by ~90% at scale. |
| **Admin dashboard (v1.5)** | Add `/admin` route protected by `next-auth` or Supabase Auth. Reads corrections table. Simple table UI showing pending items with "mark reviewed" action. |
| **PWA / offline mode (v2)** | Add `next-pwa` package. Cache home page and top 50 routes as Service Worker pre-cache. Requires content hashing strategy for route data. |
| **Dynamic route data (v2)** | Move `routes.json` to Supabase table. Add admin CRUD for routes. Requires significant read-path restructure (DB reads in critical path). |
| **Real-time fares (v2)** | Would require a separate community fare-reporting system (not Claude — fare data must come from humans). |
| **Yoruba / Pidgin UI (v2)** | Add `next-intl`. Language toggle in header. Translator for direction prose prompts. |
| **Vercel KV rate limiting (v2)** | Replace in-memory rate limiter with Vercel KV for cross-instance consistency at higher traffic. |
| **GTFS feed integration (v3)** | If Lagos LASG ever publishes official GTFS data, replace `routes.json` with a nightly GTFS parser job (GitHub Actions cron → regenerate routes.json). |

---

*This document is the canonical architecture reference for Owa. All implementation decisions should trace back to the constraints and principles in Section 1. Changes to architecture must be reflected here before code is written.*

*Companion document: Owa PRD v2.0*
