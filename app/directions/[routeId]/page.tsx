import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { findRouteById, getAllRouteIds } from '@/lib/routes';
import { DirectionsStep } from '@/components/route/DirectionsStep';
import { FareRange } from '@/components/route/FareRange';
import { ConfidenceBadge } from '@/components/route/ConfidenceBadge';
import { Clock, ArrowRight } from 'lucide-react';

interface DirectionsPageProps {
  params: { routeId: string };
}

export async function generateStaticParams() {
  return getAllRouteIds().map((routeId) => ({ routeId }));
}

export async function generateMetadata({ params }: DirectionsPageProps): Promise<Metadata> {
  const route = findRouteById(params.routeId);
  if (!route) return { title: 'Route not found' };
  return {
    title: `${route.origin_label} → ${route.destination_label} directions`,
    description: `Step-by-step public transport directions from ${route.origin_label} to ${route.destination_label}. Total fare: ₦${route.total_fare_min}–₦${route.total_fare_max}.`,
  };
}

export default function DirectionsPage({ params }: DirectionsPageProps) {
  const route = findRouteById(params.routeId);
  if (!route) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <a
        href={`/results?from=${route.origin_id}&to=${route.destination_id}`}
        className="text-sm text-owa-mist transition-colors hover:text-owa-gold"
      >
        ← Back
      </a>

      {/* Route header */}
      <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-owa-card p-5 shadow-xl shadow-black/25">
        <h1 className="text-lg font-black leading-tight">
          <span className="text-owa-gold">{route.origin_label}</span>
          <span className="mx-2 inline-flex items-center text-owa-mist/40">
            <ArrowRight size={18} />
          </span>
          <span className="text-owa-white">{route.destination_label}</span>
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <ConfidenceBadge confidence={route.confidence} lastVerified={route.last_verified} />
          <span className="flex items-center gap-1 text-xs text-owa-mist">
            <Clock size={12} />
            ~{route.total_duration_estimate_mins} min
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
          <span className="text-xs text-owa-mist">
            {route.legs.length} {route.legs.length === 1 ? 'leg' : 'legs'}
          </span>
          <FareRange min={route.total_fare_min} max={route.total_fare_max} size="lg" label="Total est. fare" />
        </div>
      </div>

      {/* Step-by-step legs */}
      <div className="space-y-2.5">
        {route.legs.map((leg, i) => (
          <DirectionsStep key={leg.leg_id} leg={leg} isLast={i === route.legs.length - 1} />
        ))}
      </div>

      {/* Report footer */}
      <div className="pb-6 pt-2 text-center">
        <a
          href={`/contribute?type=correction&route_id=${route.route_id}&route_label=${encodeURIComponent(`${route.origin_label} → ${route.destination_label}`)}&from=${encodeURIComponent(route.origin_id)}&to=${encodeURIComponent(route.destination_id)}`}
          className="text-sm text-owa-mist/50 underline underline-offset-2 transition-colors hover:text-owa-gold"
        >
          Something wrong? Report it.
        </a>
      </div>
    </div>
  );
}
