# Product Requirement Document (PRD)

## Project: Owa — Lagos Public Transit Router
**Version:** 2.0
**Date:** June 18, 2026
**Author:** Gbeke Odutuga
**Status:** Active
**Replaces:** DanfoRoute PRD v1.0

---

## 1. Problem Statement

Lagos commuters navigate one of the world's most complex informal transit networks daily, with no reliable digital tool to help them. Google Maps misses danfo parks, gets boarding points wrong, and has no concept of a korope. New residents and visitors are especially vulnerable to wrong routes and conductor overcharging.

Owa solves this by being a single source of truth for Lagos public transit directions, built on human-verified route data, not algorithmic guesses.

---

## 2. Product Vision

A fast, mobile-first web app where any Lagos commuter can find step-by-step public transport directions in under 10 seconds, with exact boarding points, vehicle types, and fare ranges they can trust.

---

## 3. Target Users

**Amaka, 22 — The Newcomer**
Just relocated to Lagos or visiting an unfamiliar LGA. High anxiety about boarding the wrong danfo, getting stranded at a transfer point, or being overcharged. Needs explicit, hand-holding directions with landmark context.

**Efe, 28 — The Daily Commuter**
Knows his regular route but wants fare baselines during fuel price fluctuations and quick alternatives when traffic is bad. Values speed over explanation.

Both users are equally important. Directions must be clear enough for Amaka without being slow or patronising for Efe.

---

## 4. Core Principles

- **Verified over complete.** A smaller set of correct routes is better than a large set of wrong ones. Every route in the app must have a human source.
- **Local language first.** Use names Lagosians actually say: "Under Bridge", "CMS", "Oshodi Terminal 2", not GPS coordinates or formal street names nobody uses.
- **Speed over aesthetics.** Page must load under 2 seconds on a 3G connection. No heavy animations, no unnecessary assets.
- **Honest about gaps.** If a route doesn't exist in the database, say so clearly rather than showing a wrong one.
- **Community improves the data.** Users who know better should have a clear, low-friction way to contribute.

---

## 5. Feature Requirements

### Epic 1: Route Search

**FR-1.1: Search Input**
Two prominent fields on the home screen: "Where are you starting from?" and "Where are you going?".

Autosuggest populated from a curated list of Lagos landmarks, garages, bus stops, and popular areas. Minimum 80 entries at launch covering all major transit hubs. Suggestions filter as the user types.

**FR-1.2: Swap and Clear**
Single-tap button to invert origin and destination. One-tap clear (X) on each input field.

**FR-1.3: Empty State**
If no route exists for a searched pair, show: "We don't have this route yet." with a prompt to submit it via the community contribution flow.

---

### Epic 2: Quick Route Suggestions (Home Screen)

**FR-2.1: Popular Route Chips**
Display 5 to 10 tappable route chips on the home screen below the search bar. Examples: "Ojuelegba → Ketu", "Surulere → Lekki Phase 1".

Tapping a chip pre-fills both search fields and triggers the search immediately.

**FR-2.2: Dynamic Popularity Ranking**
Chips update based on actual search frequency logged to Supabase. Most-searched routes surface to the top. Recalculated weekly.

At launch, chips are manually curated from the verified route list until enough search data exists.

---

### Epic 3: Step-by-Step Directions

**FR-3.1: Route Results Screen**
Show matching route(s) with total estimated fare range and estimated journey duration prominently at the top.

If multiple route options exist for a corridor, rank by fewest transfers first.

**FR-3.2: Per-Leg Breakdown**
Each leg shows:
- Step number
- Boarding point (specific, landmark-anchored)
- Vehicle type tag: Danfo (Yellow Bus), BRT (Blue/Red Bus), Korope (Mini-bus), Keke Marwa (Tricycle), LRMT (Rail), Ferry, Walk
- Destination point
- Fare range for that leg

**FR-3.3: Micro-Location Instructions**
Each leg must include a plain-language instruction written for someone who has never done the route. Not "Board bus to Obalende." Instead: "At Oshodi Terminal 3, join the BRT queue on the left side. Pay with cash or Cowry card."

**FR-3.4: Unverified Fare Warning**
If a leg's fare is flagged `fare_verified: false` in the data, show a small disclaimer: "Fare estimate unconfirmed. Verify with conductor."

---

### Epic 4: Fare Display

**FR-4.1: Fare Ranges**
Every leg shows a min-max range in Naira (e.g., N400 - N600). Total route fare range displayed at the top of results.

**FR-4.2: Peak Hour Indicator**
Auto-detect current time and show a peak hour banner when the user searches between 6:30-9:30 AM or 4:30-8:30 PM. Banner reads: "You're travelling during peak hours. Fares may be higher than shown."

No fare recalculation logic needed at this stage. The banner is a heads-up, not a precise multiplier.

---

### Epic 5: Community Contributions

**FR-5.1: Report Wrong Route**
On every route result screen, a clearly visible link: "Something wrong? Report it." Opens a simple form with:
- Route it relates to (pre-filled from current result)
- What is wrong (free text)
- What the correct information is (free text)
- Optional: submitter's WhatsApp number for follow-up

Submissions go to a Supabase `route_submissions` table with status `pending`.

**FR-5.2: Submit a Missing Route**
Accessible from the empty state screen. Same form structure as FR-5.1 but without a pre-filled route. Fields: origin, destination, step-by-step directions (free text), fare info, submitter contact (optional).

**FR-5.3: Review and Approval**
Submissions do not go live automatically. You review each submission and either approve (merges into routes.json and routes table) or reject it. No public voting UI at launch.

Community voting (upvote/flag) is a post-launch feature once submission volume warrants it.

---

## 6. User Flow

```
[Home Screen]
   ├── Tap a Quick Route Chip → [Route Result Screen]
   └── Type Origin + Destination → Tap "Find Route"
         ├── Match found → [Route Result Screen]
         │     └── Tap a route → [Step-by-Step Directions Screen]
         │           └── "Something wrong?" → [Report Form]
         └── No match → [Empty State]
               └── "Submit this route" → [Contribution Form]
```

---

## 7. Data Schema

```json
{
  "route_id": "R-OJUELEGBA-KETUALAPERE-01",
  "origin": "Ojuelegba",
  "destination": "Ketu Alapere",
  "verified": true,
  "verified_by": "Local source",
  "verified_date": "2026-06-16",
  "notes": "",
  "total_fare_min": 700,
  "total_fare_max": 1200,
  "est_duration_mins": 45,
  "legs": [
    {
      "step_number": 1,
      "instruction": "Stand in front of Ecobank on the main road. Board a danfo calling 'Ketu'. Ride to Ikosi Ketu.",
      "boarding_point": "In front of Ecobank, Ojuelegba",
      "vehicle_type": "Danfo",
      "vehicle_label": "Danfo (Yellow Bus)",
      "destination_point": "Ikosi Ketu",
      "fare_min": 700,
      "fare_max": 1000,
      "fare_verified": true
    },
    {
      "step_number": 2,
      "instruction": "After dropping, cross to the other side using the overhead bridge. Walk into Ketu garage.",
      "boarding_point": "Ikosi Ketu overhead bridge",
      "vehicle_type": "Walk",
      "vehicle_label": "Walk",
      "destination_point": "Ketu Garage",
      "fare_min": 0,
      "fare_max": 0,
      "fare_verified": true
    },
    {
      "step_number": 3,
      "instruction": "At Ketu garage, find a korope going to Alapere and board.",
      "boarding_point": "Ketu Garage",
      "vehicle_type": "Korope",
      "vehicle_label": "Korope (Mini-bus)",
      "destination_point": "Alapere",
      "fare_min": 100,
      "fare_max": 200,
      "fare_verified": false
    }
  ]
}
```

---

## 8. Out of Scope (V1)

- Real-time traffic or live ETAs
- GPS or map display
- User accounts or saved routes
- Native mobile app (iOS/Android)
- Free-text address input (street-level)
- Automated fare updates
- Community voting on submissions

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Search completion rate | Over 85% of searches return a result |
| Bounce rate | Under 30% leave without searching |
| Return usage | 3+ searches per week per returning session |
| Community submissions | At least 5 route submissions in first month |
| Route correction rate | Under 10% of viewed routes get a report |
