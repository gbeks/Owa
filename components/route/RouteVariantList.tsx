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
            className={`rounded-2xl border-2 bg-white shadow-sm overflow-hidden transition-colors ${
              isOpen ? 'border-owa-green' : 'border-gray-200'
            }`}
          >
            <button
              type="button"
              className="w-full text-left px-5 py-4"
              onClick={() => setOpenId(isOpen ? null : route.route_id)}
              aria-expanded={isOpen}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900">{label}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} />
                      ~{route.total_duration_estimate_mins} min
                    </span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-400">
                      {route.legs.map((l) => l.vehicle).join(' → ')}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <FareRange min={route.total_fare_min} max={route.total_fare_max} />
                  {isOpen ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 px-4 pb-5 pt-4 space-y-3">
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
                    className="text-xs text-gray-400 underline underline-offset-2 hover:text-owa-green transition-colors"
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
