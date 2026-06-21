import { Clock, ArrowRight } from 'lucide-react';
import { FareRange } from './FareRange';
import { ConfidenceBadge } from './ConfidenceBadge';
import type { Route } from '@/types/route';

interface RouteCardProps {
  route: Route;
  aiFallback?: boolean;
}

export function RouteCard({ route, aiFallback }: RouteCardProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-owa-card p-5 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-black leading-tight">
            <span className="text-owa-gold">{route.origin_label}</span>
            <span className="mx-2 inline-flex items-center text-owa-mist/40">
              <ArrowRight size={18} />
            </span>
            <span className="text-owa-white">{route.destination_label}</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <ConfidenceBadge confidence={route.confidence} lastVerified={route.last_verified} />
            <span className="flex items-center gap-1 text-xs text-owa-mist">
              <Clock size={12} />
              ~{route.total_duration_estimate_mins} min
            </span>
          </div>
        </div>
        <FareRange min={route.total_fare_min} max={route.total_fare_max} size="lg" label="Total est. fare" />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-owa-mist">
          {route.legs.length} {route.legs.length === 1 ? 'leg' : 'legs'}
        </span>
        <span className="text-owa-mist/30">·</span>
        <span className="text-xs capitalize text-owa-mist/70">
          {route.legs.map((l) => l.vehicle).join(' → ')}
        </span>
      </div>

      {aiFallback && (
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          Showing simplified directions — AI formatting temporarily unavailable.
        </p>
      )}
    </div>
  );
}
