'use client';

import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { DirectionsStep } from './DirectionsStep';
import { FareRange } from './FareRange';
import { ConfidenceBadge } from './ConfidenceBadge';
import type { ResolvedRoute } from '@/types/route';

function getVariantLabel(route: ResolvedRoute): string {
  const match =
    route.destination_label.match(/\(via ([^)]+)\)/i) ??
    route.origin_label.match(/\(via ([^)]+)\)/i);
  return match ? `Via ${match[1]}` : route.destination_label;
}

interface RouteVariantListProps {
  routes: ResolvedRoute[];
}

export function RouteVariantList({ routes }: RouteVariantListProps) {
  const [openId, setOpenId] = useState<string | null>(routes[0]?.route_id ?? null);

  return (
    <div className="space-y-3">
      {routes.map((route) => {
        const isOpen = openId === route.route_id;
        const label = getVariantLabel(route);

        return (
          <div
            key={route.route_id}
            className={`overflow-hidden rounded-2xl border-2 bg-owa-card shadow-lg shadow-black/20 transition-colors duration-150 ${
              isOpen ? 'border-owa-gold/40' : 'border-white/[0.06]'
            }`}
          >
            <button
              type="button"
              className="w-full px-5 py-4 text-left transition-colors duration-150 hover:bg-white/[0.02]"
              onClick={() => setOpenId(isOpen ? null : route.route_id)}
              aria-expanded={isOpen}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-owa-white">{label}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span className="flex items-center gap-1 text-xs text-owa-mist">
                      <Clock size={11} />
                      ~{route.total_duration_estimate_mins} min
                    </span>
                    <span className="text-owa-mist/20">·</span>
                    <span className="text-xs capitalize text-owa-mist">
                      {route.legs.map((l) => l.vehicle).join(' → ')}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <FareRange min={route.total_fare_min} max={route.total_fare_max} />
                  {isOpen ? (
                    <ChevronUp size={16} className="text-owa-mist" />
                  ) : (
                    <ChevronDown size={16} className="text-owa-mist" />
                  )}
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="space-y-3 border-t border-white/[0.06] px-4 pb-5 pt-4">
                <ConfidenceBadge
                  confidence={route.confidence}
                  lastVerified={route.last_verified}
                />
                {route.legs.map((leg, i) => (
                  <DirectionsStep
                    key={leg.leg_id}
                    leg={leg}
                    isLast={i === route.legs.length - 1}
                  />
                ))}
                <div className="pt-1 text-center">
                  <a
                    href={`/contribute?type=correction&route_id=${route.route_id}&route_label=${encodeURIComponent(`${route.origin_label} → ${route.destination_label}`)}&from=${encodeURIComponent(route.origin_id)}&to=${encodeURIComponent(route.destination_id)}`}
                    className="text-xs text-owa-mist/60 underline underline-offset-2 transition-colors hover:text-owa-gold"
                  >
                    Something wrong? Report it.
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
