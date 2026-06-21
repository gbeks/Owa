import 'server-only';
import routesData from '@/data/routes.json';
import locationsData from '@/data/locations.json';
import type { Route, Location } from '@/types/route';

const routes = routesData as Route[];
const locations = locationsData as Location[];

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

export function listRoutes(): Route[] {
  return routes;
}

export function findRoute(from: string, to: string): Route | null {
  return (
    routes.find(
      (r) => r.origin_id === from && r.destination_id === to
    ) ?? null
  );
}

export function findRouteById(routeId: string): Route | null {
  return routes.find((r) => r.route_id === routeId) ?? null;
}

export function getPopularRoutes(limit: number): Route[] {
  return POPULAR_ROUTE_IDS
    .map((id) => routes.find((r) => r.route_id === id))
    .filter((r): r is Route => r !== undefined)
    .slice(0, limit);
}

export function getLocation(id: string): Location | null {
  return locations.find((l) => l.location_id === id) ?? null;
}

export function getAllRouteIds(): string[] {
  return routes.map((r) => r.route_id);
}
