import 'server-only';
import Fuse, { type IFuseOptions } from 'fuse.js';
import locationsData from '@/data/locations.json';
import type { Location } from '@/types/route';

const locations = locationsData as Location[];

const FUSE_OPTIONS: IFuseOptions<Location> = {
  keys: [
    { name: 'canonical_name', weight: 0.6 },
    { name: 'aliases', weight: 0.35 },
    { name: 'area', weight: 0.05 },
  ],
  threshold: 0.4,
  minMatchCharLength: 2,
  includeScore: true,
  ignoreLocation: true,
  findAllMatches: false,
  useExtendedSearch: false,
};

export const locationIndex = new Fuse<Location>(locations, FUSE_OPTIONS);

export function searchLocations(query: string, limit = 8): Location[] {
  if (query.length < 2) return [];
  return locationIndex.search(query, { limit }).map((result) => result.item);
}
