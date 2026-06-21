import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { findRoute } from '@/lib/routes';
import { logSearch } from '@/lib/supabase';
import { RouteCard } from '@/components/route/RouteCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PeakHourBanner } from '@/components/PeakHourBanner';

interface ResultsPageProps {
  searchParams: { from?: string; to?: string };
}

export async function generateMetadata({ searchParams }: ResultsPageProps): Promise<Metadata> {
  const { from, to } = searchParams;
  if (!from || !to) return {};
  const route = findRoute(from, to);
  if (!route) return { title: 'Route not found' };
  return {
    title: `${route.origin_label} → ${route.destination_label}`,
    description: `Public transport directions from ${route.origin_label} to ${route.destination_label}. Total fare: ₦${route.total_fare_min}–₦${route.total_fare_max}.`,
  };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const { from, to } = searchParams;
  if (!from || !to) redirect('/');

  const route = findRoute(from, to);

  // Log search non-blocking — do not await
  void logSearch(from, to, route !== null);

  if (!route) {
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
