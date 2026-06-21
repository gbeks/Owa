import 'server-only';
import routesData from '@/data/routes.json';
import locationsData from '@/data/locations.json';
import type { Route, Location } from '@/types/route';

const routes = routesData as Route[];
const locations = locationsData as Location[];

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

export function getLocation(id: string): Location | null {
  return locations.find((l) => l.location_id === id) ?? null;
}

export function getAllRouteIds(): string[] {
  return routes.map((r) => r.route_id);
}
