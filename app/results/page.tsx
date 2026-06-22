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
          <a href="/" className="text-sm font-semibold text-owa-gold transition-colors hover:text-owa-gold-bright">
            ← Search again
          </a>
        </div>
      </div>
    );
  }

  if (routes.length === 1) {
    const route = routes[0];
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <a href="/" className="text-sm text-owa-mist transition-colors hover:text-owa-gold">
            ← New search
          </a>
        </div>
        <PeakHourBanner />
        <p className="text-xs text-owa-mist/60">
          {route.legs.length} {route.legs.length === 1 ? 'leg' : 'legs'} ·{' '}
          {route.confidence === 'high' ? 'Verified route' : 'Route data may be approximate'}
        </p>
        <a
          href={`/directions/${route.route_id}`}
          className="block rounded-2xl border-2 border-transparent transition-colors hover:border-owa-gold/40"
        >
          <RouteCard route={route} />
          <p className="mt-2 text-center text-xs font-semibold text-owa-gold/70">
            Tap to see step-by-step directions →
          </p>
        </a>
      </div>
    );
  }

  const originLabel = routes[0].origin_label;
  const destLabel = stripVia(routes[0].destination_label);

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <a href="/" className="text-sm text-owa-mist transition-colors hover:text-owa-gold">
          ← New search
        </a>
      </div>
      <PeakHourBanner />
      <div>
        <h1 className="text-lg font-black leading-tight text-owa-white">
          <span className="text-owa-gold">{originLabel}</span>
          <span className="mx-2 inline-flex items-center text-owa-mist/40">
            <ArrowRight size={18} />
          </span>
          <span>{destLabel}</span>
        </h1>
        <p className="mt-1 text-xs text-owa-mist">
          {routes.length} route options — tap one to see directions
        </p>
      </div>
      <RouteVariantList routes={routes} />
    </div>
  );
}
