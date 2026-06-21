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
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={`/results?from=${route.origin_id}&to=${route.destination_id}`}
          className="text-sm text-gray-400 hover:text-owa-green transition-colors"
        >
          ← Back
        </a>
      </div>

      {/* Route header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
        <h1 className="text-lg font-black text-gray-900 leading-tight">
          <span className="text-owa-green">{route.origin_label}</span>
          <span className="mx-2 inline-flex items-center text-gray-300">
            <ArrowRight size={18} />
          </span>
          <span>{route.destination_label}</span>
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <ConfidenceBadge confidence={route.confidence} lastVerified={route.last_verified} />
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={12} />
            ~{route.total_duration_estimate_mins} min
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-gray-500">
            {route.legs.length} {route.legs.length === 1 ? 'leg' : 'legs'}
          </span>
          <FareRange min={route.total_fare_min} max={route.total_fare_max} size="lg" label="Total est. fare" />
        </div>
      </div>

      {/* Step-by-step legs */}
      <div className="space-y-3">
        {route.legs.map((leg, i) => (
          <DirectionsStep key={leg.leg_id} leg={leg} isLast={i === route.legs.length - 1} />
        ))}
      </div>

      {/* Report footer */}
      <div className="pt-2 pb-6 text-center">
        <a
          href={`/contribute?type=correction&route_id=${route.route_id}&route_label=${encodeURIComponent(`${route.origin_label} → ${route.destination_label}`)}&from=${encodeURIComponent(route.origin_id)}&to=${encodeURIComponent(route.destination_id)}`}
          className="text-sm text-gray-400 hover:text-owa-green transition-colors underline underline-offset-2"
        >
          Something wrong? Report it.
        </a>
      </div>
    </div>
  );
}
