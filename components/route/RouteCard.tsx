import { Clock, ArrowRight } from 'lucide-react';
import { FareRange } from './FareRange';
import { ConfidenceBadge } from './ConfidenceBadge';
import type { ResolvedRoute } from '@/types/route';

interface RouteCardProps {
  route: ResolvedRoute;
  aiFallback?: boolean;
}

export function RouteCard({ route, aiFallback }: RouteCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-black text-gray-900 leading-tight">
            <span className="text-owa-green">{route.origin_label}</span>
            <span className="mx-2 inline-flex items-center text-gray-300">
              <ArrowRight size={18} />
            </span>
            <span>{route.destination_label}</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <ConfidenceBadge
              confidence={route.confidence}
              lastVerified={route.last_verified}
            />
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              ~{route.total_duration_estimate_mins} min
            </span>
          </div>
        </div>
        <FareRange
          min={route.total_fare_min}
          max={route.total_fare_max}
          size="lg"
          label="Total est. fare"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500">
          {route.legs.length} {route.legs.length === 1 ? 'leg' : 'legs'}
        </span>
        <span className="text-gray-200">·</span>
        <span className="text-xs text-gray-400">
          {route.legs.map((l) => l.vehicle).join(' → ')}
        </span>
      </div>

      {aiFallback && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 border border-amber-200">
          Showing simplified directions — AI formatting temporarily unavailable.
        </p>
      )}
    </div>
  );
}
