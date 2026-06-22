import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { findAllRoutes } from '@/lib/routes';
import { logSearch } from '@/lib/supabase';
import { RouteCard } from '@/components/route/RouteCard';
import { RouteVariantList } from '@/components/route/RouteVariantList';
import { EmptyState } from '@/components/ui/EmptyState';
import { PeakHourBanner } from '@/components/PeakHourBanner';
import { ArrowRight } from 'lucide-react';

interface ResultsPageProps {
  searchParams: { from?: string; to?: string };
}

function stripVia(label: string): string {
  return label.replace(/\s*\(via [^)]+\)/i, '').trim();
}

export async function generateMetadata({ searchParams }: ResultsPageProps): Promise<Metadata> {
  const { from, to } = searchParams;
  if (!from || !to) return {};
  const routes = findAllRoutes(from, to);
  if (routes.length === 0) return { title: 'Route not found' };
  const r = routes[0];
  const originLabel = r.origin_label;
  const destLabel = stripVia(r.destination_label);
  return {
    title: `${originLabel} → ${destLabel}`,
    description: `Public transport directions from ${originLabel} to ${destLabel}. Total fare: ₦${r.total_fare_min}–₦${r.total_fare_max}.`,
  };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const { from, to } = searchParams;
  if (!from || !to) redirect('/');

  const routes = findAllRoutes(from, to);

  void logSearch(from, to, routes.length > 0);

  if (routes.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <EmptyState type="no-route" />
        <div className="mt-6 text-center">
          <a href="/" className="text-sm font-semibold text-owa-green hover:underline">
            ← Search again
          </a>
        </div>
      </div>
    );
  }

  if (routes.length === 1) {
    const route = routes[0];
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <a href="/" className="text-sm text-gray-400 hover:text-owa-green transition-colors">
            ← New search
          </a>
        </div>
        <PeakHourBanner />
        <p className="text-xs text-gray-400">
          {route.legs.length} {route.legs.length === 1 ? 'leg' : 'legs'} ·{' '}
          {route.confidence === 'high' ? 'Verified route' : 'Route data may be approximate'}
        </p>
        <a
          href={`/directions/${route.route_id}`}
          className="block rounded-2xl border-2 border-transparent hover:border-owa-green transition-colors"
        >
          <RouteCard route={route} />
          <p className="mt-2 text-center text-xs font-semibold text-owa-green">
            Tap to see step-by-step directions →
          </p>
        </a>
      </div>
    );
  }

  const originLabel = routes[0].origin_label;
  const destLabel = stripVia(routes[0].destination_label);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <a href="/" className="text-sm text-gray-400 hover:text-owa-green transition-colors">
          ← New search
        </a>
      </div>
      <PeakHourBanner />
      <div>
        <h1 className="text-lg font-black text-gray-900 leading-tight">
          <span className="text-owa-green">{originLabel}</span>
          <span className="mx-2 inline-flex items-center text-gray-300">
            <ArrowRight size={18} />
          </span>
          <span>{destLabel}</span>
        </h1>
        <p className="mt-1 text-xs text-gray-400">
          {routes.length} route options — tap one to see directions
        </p>
      </div>
      <RouteVariantList routes={routes} />
    </div>
  );
}
