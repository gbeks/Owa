import 'server-only';
import routesData from '@/data/routes.json';
import segmentsData from '@/data/segments.json';
import locationsData from '@/data/locations.json';
import type { Route, Segment, ResolvedRoute, RouteLeg, Location } from '@/types/route';

const routes = routesData as Route[];
const locations = locationsData as Location[];

// Build a fast segment lookup map once at module load
const segmentMap = new Map<string, Segment>(
  (segmentsData as Segment[]).map((s) => [s.segment_id, s])
);

function resolveRoute(route: Route): ResolvedRoute {
  const legs: RouteLeg[] = route.segments.map((segId, index) => {
    const seg = segmentMap.get(segId);
    if (!seg) throw new Error(`Unknown segment_id "${segId}" in route "${route.route_id}"`);
    return {
      leg_id: seg.segment_id,
      step_number: index + 1,
      vehicle: seg.vehicle,
      board_landmark: seg.board_landmark,
      board_instruction: seg.board_instruction,
      alight_landmark: seg.alight_landmark,
      alight_instruction: seg.alight_instruction,
      fare_min: seg.fare_min,
      fare_max: seg.fare_max,
      duration_estimate_mins: seg.duration_estimate_mins,
      notes: seg.notes,
    };
  });
  const { segments: _, ...rest } = route;
  return { ...rest, legs };
}

const POPULAR_ROUTE_IDS = [
  'ojuelegba-to-cms',
  'yaba-to-ikeja',
  'oshodi-to-victoria-island',
  'lekki-phase-1-to-cms',
  'ikorodu-to-oshodi',
  'surulere-to-ikeja',
  'ketu-to-cms',
  'ajah-to-cms',
];

export function listRoutes(): ResolvedRoute[] {
  return routes.map(resolveRoute);
}

export function findRoute(from: string, to: string): ResolvedRoute | null {
  const raw = routes.find((r) => r.origin_id === from && r.destination_id === to);
  return raw ? resolveRoute(raw) : null;
}

export function findRouteById(routeId: string): ResolvedRoute | null {
  const raw = routes.find((r) => r.route_id === routeId);
  return raw ? resolveRoute(raw) : null;
}

export function getPopularRoutes(limit: number): ResolvedRoute[] {
  return POPULAR_ROUTE_IDS
    .map((id) => routes.find((r) => r.route_id === id))
    .filter((r): r is Route => r !== undefined)
    .slice(0, limit)
    .map(resolveRoute);
}

export function getLocation(id: string): Location | null {
  return locations.find((l) => l.location_id === id) ?? null;
}

export function getAllRouteIds(): string[] {
  return routes.map((r) => r.route_id);
}
