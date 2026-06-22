'use client';

import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, MapPinOff } from 'lucide-react';
import { DirectionsStep } from './DirectionsStep';
import { FareRange } from './FareRange';
import { ConfidenceBadge } from './ConfidenceBadge';
import { RouteVariantList } from './RouteVariantList';
import type { ResolvedRoute } from '@/types/route';

export interface ExpandedItem {
  destination_id: string;
  destination_label: string;
  routes: ResolvedRoute[];
}

interface Props {
  originLabel: string;
  parentLabel: string;
  items: ExpandedItem[];
}

export function ExpandedDestinationList({ originLabel, items }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.destination_id;

        if (item.routes.length === 0) {
          return (
            <div
              key={item.destination_id}
              className="rounded-2xl border border-white/[0.06] bg-owa-card p-5 shadow-lg shadow-black/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-owa-white">{item.destination_label}</p>
                  <p className="mt-0.5 text-xs text-owa-mist">
                    No route from {originLabel} yet
                  </p>
                </div>
                <MapPinOff size={16} className="mt-0.5 shrink-0 text-owa-mist/30" />
              </div>
              <a
                href={`/contribute?type=new_route&origin=${encodeURIComponent(originLabel)}&destination=${encodeURIComponent(item.destination_label)}`}
                className="mt-3 inline-block text-xs font-semibold text-owa-gold transition-colors hover:text-owa-gold-bright"
              >
                Submit this route →
              </a>
            </div>
          );
        }

        if (item.routes.length === 1) {
          const route = item.routes[0];
          return (
            <div
              key={item.destination_id}
              className={`overflow-hidden rounded-2xl border-2 bg-owa-card shadow-lg shadow-black/20 transition-colors duration-150 ${
                isOpen ? 'border-owa-gold/40' : 'border-white/[0.06]'
              }`}
            >
              <button
                type="button"
                className="w-full px-5 py-4 text-left transition-colors duration-150 hover:bg-white/[0.02]"
                onClick={() => setOpenId(isOpen ? null : item.destination_id)}
                aria-expanded={isOpen}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-owa-white">{item.destination_label}</p>
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
        }

        return (
          <div
            key={item.destination_id}
            className={`overflow-hidden rounded-2xl border-2 bg-owa-card shadow-lg shadow-black/20 transition-colors duration-150 ${
              isOpen ? 'border-owa-gold/40' : 'border-white/[0.06]'
            }`}
          >
            <button
              type="button"
              className="w-full px-5 py-4 text-left transition-colors duration-150 hover:bg-white/[0.02]"
              onClick={() => setOpenId(isOpen ? null : item.destination_id)}
              aria-expanded={isOpen}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-owa-white">{item.destination_label}</p>
                  <p className="mt-1 text-xs text-owa-mist">
                    {item.routes.length} route options
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp size={16} className="shrink-0 text-owa-mist" />
                ) : (
                  <ChevronDown size={16} className="shrink-0 text-owa-mist" />
                )}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-white/[0.06] px-4 pb-4 pt-3">
                <RouteVariantList routes={item.routes} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
