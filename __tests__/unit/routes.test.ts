import { describe, it, expect } from 'vitest';
import {
  findRoute,
  findAllRoutes,
  findRouteById,
  getLocation,
  getPopularRoutes,
  listRoutes,
  getAllRouteIds,
} from '@/lib/routes';

describe('findRoute', () => {
  it('returns a resolved route for a known origin/destination pair', () => {
    const route = findRoute('ojuelegba', 'cms-lagos-island');
    expect(route).not.toBeNull();
    expect(route?.route_id).toBe('ojuelegba-to-cms');
    expect(route?.origin_id).toBe('ojuelegba');
    expect(route?.destination_id).toBe('cms-lagos-island');
  });

  it('expands segments into legs', () => {
    const route = findRoute('ojuelegba', 'cms-lagos-island');
    expect(route?.legs).toBeDefined();
    expect(route?.legs.length).toBeGreaterThan(0);
    expect(route?.legs[0]).toMatchObject({
      vehicle: expect.any(String),
      board_landmark: expect.any(String),
      alight_landmark: expect.any(String),
      fare_min: expect.any(Number),
      fare_max: expect.any(Number),
    });
  });

  it('assigns step_number starting at 1', () => {
    const route = findRoute('ojuelegba', 'cms-lagos-island');
    expect(route?.legs[0].step_number).toBe(1);
  });

  it('returns null for an unknown origin', () => {
    expect(findRoute('nowhere', 'cms-lagos-island')).toBeNull();
  });

  it('returns null for an unknown destination', () => {
    expect(findRoute('ojuelegba', 'nowhere')).toBeNull();
  });

  it('returns null when both IDs are unknown', () => {
    expect(findRoute('x', 'y')).toBeNull();
  });
});

describe('findAllRoutes', () => {
  it('returns every route for a pair that has multiple options', () => {
    const routes = findAllRoutes('jakande-gate', 'ikeja-under-bridge');
    expect(routes.length).toBe(2);
    routes.forEach((r) => {
      expect(r.origin_id).toBe('jakande-gate');
      expect(r.destination_id).toBe('ikeja-under-bridge');
    });
  });

  it('returns a single-element array for a pair with one route', () => {
    const routes = findAllRoutes('ojuelegba', 'cms-lagos-island');
    expect(routes.length).toBe(1);
  });

  it('returns an empty array when no route exists', () => {
    expect(findAllRoutes('nowhere', 'nowhere')).toHaveLength(0);
  });

  it('each returned route has its segments resolved into legs', () => {
    const routes = findAllRoutes('luth', 'kayfarm');
    expect(routes.length).toBeGreaterThanOrEqual(2);
    routes.forEach((r) => {
      expect(r.legs.length).toBeGreaterThan(0);
      expect(r).not.toHaveProperty('segments');
    });
  });
});

describe('findRouteById', () => {
  it('returns the correct route by ID', () => {
    const route = findRouteById('ojuelegba-to-cms');
    expect(route?.origin_id).toBe('ojuelegba');
    expect(route?.destination_id).toBe('cms-lagos-island');
  });

  it('returns null for an unknown ID', () => {
    expect(findRouteById('does-not-exist')).toBeNull();
  });
});

describe('getLocation', () => {
  it('returns a location by ID', () => {
    const loc = getLocation('ojuelegba');
    expect(loc).not.toBeNull();
    expect(loc?.canonical_name).toBe('Ojuelegba');
  });

  it('returns a parent location with its children array', () => {
    const loc = getLocation('ikeja');
    expect(loc?.children).toEqual(['ikeja-under-bridge', 'ikeja-along', 'computer-village']);
  });

  it('returns mushin with its children', () => {
    const loc = getLocation('mushin');
    expect(loc?.children).toEqual(['idi-araba', 'luth']);
  });

  it('returns a child location without children', () => {
    const loc = getLocation('ikeja-under-bridge');
    expect(loc?.canonical_name).toBe('Ikeja Under Bridge');
    expect(loc?.children).toBeUndefined();
  });

  it('returns null for an unknown location ID', () => {
    expect(getLocation('nonexistent-place')).toBeNull();
  });
});

describe('getPopularRoutes', () => {
  it('returns at most the requested number of routes', () => {
    const routes = getPopularRoutes(3);
    expect(routes.length).toBeLessThanOrEqual(3);
  });

  it('returns resolved routes with legs (not raw segments)', () => {
    const routes = getPopularRoutes(5);
    routes.forEach((r) => {
      expect(r.legs).toBeDefined();
      expect(r).not.toHaveProperty('segments');
    });
  });
});

describe('listRoutes', () => {
  it('returns all 36 routes', () => {
    expect(listRoutes()).toHaveLength(36);
  });

  it('every route has legs resolved', () => {
    listRoutes().forEach((r) => {
      expect(r.legs.length).toBeGreaterThan(0);
    });
  });
});

describe('getAllRouteIds', () => {
  it('returns an array of string IDs', () => {
    const ids = getAllRouteIds();
    expect(ids.length).toBeGreaterThan(0);
    ids.forEach((id) => expect(typeof id).toBe('string'));
  });

  it('includes known route IDs', () => {
    const ids = getAllRouteIds();
    expect(ids).toContain('ojuelegba-to-cms');
    expect(ids).toContain('yaba-to-ikeja');
  });
});
