export type VehicleType = 'danfo' | 'brt' | 'korope' | 'keke' | 'okada' | 'ferry' | 'walk';

export interface RouteLeg {
  leg_id: string;
  step_number: number;
  vehicle: VehicleType;
  board_landmark: string;
  board_instruction: string;
  alight_landmark: string;
  alight_instruction: string;
  fare_min: number;
  fare_max: number;
  duration_estimate_mins: number;
  notes?: string;
  formatted_prose?: string;
}

export interface Route {
  route_id: string;
  origin_id: string;
  destination_id: string;
  origin_label: string;
  destination_label: string;
  legs: RouteLeg[];
  total_fare_min: number;
  total_fare_max: number;
  total_duration_estimate_mins: number;
  last_verified: string;
  confidence: 'high' | 'medium' | 'low';
  flagged: boolean;
}

export interface Location {
  location_id: string;
  canonical_name: string;
  aliases: string[];
  area: string;
  lga: string;
  type: 'bus_stop' | 'landmark' | 'area' | 'terminal';
}

export interface RouteApiResponse {
  route: Route & { legs: (RouteLeg & { formatted_prose: string })[] };
  ai_formatted: boolean;
  fallback_notice?: string;
}

export interface SearchApiResponse {
  results: Location[];
  query: string;
  total: number;
}

export interface CorrectionApiResponse {
  success: boolean;
  message: string;
  correction_id: string;
}

export type IssueType =
  | 'wrong_landmark'
  | 'wrong_fare'
  | 'route_closed'
  | 'wrong_vehicle'
  | 'other';
