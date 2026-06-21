import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { findRoute } from '@/lib/routes';
import { formatLegProseWithTimeout } from '@/lib/claude';
import { RouteCard } from '@/components/route/RouteCard';
import { LegList } from '@/components/route/LegList';
import { EmptyState } from '@/components/ui/EmptyState';
import { Disclaimer } from '@/components/ui/Disclaimer';
import type { RouteLeg } from '@/types/route';

interface RoutePageProps {
  searchParams: { from?: string; to?: string };
}

export async function generateMetadata({ searchParams }: RoutePageProps): Promise<Metadata> {
  const { from, to } = searchParams;
  if (!from || !to) return {};
  const route = findRoute(from, to);
  if (!route) return { title: 'Route not found' };
  return {
    title: `${route.origin_label} → ${route.destination_label}`,
    description: `Public transport directions from ${route.origin_label} to ${route.destination_label}. Total fare: ₦${route.total_fare_min}–₦${route.total_fare_max}.`,
  };
}

export default async function RoutePage({ searchParams }: RoutePageProps) {
  const { from, to } = searchParams;

  if (!from || !to) redirect('/');

  const route = findRoute(from, to);

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

  let aiFormatted = true;
  const legsWithProse = await Promise.all(
    route.legs.map(async (leg): Promise<RouteLeg & { formatted_prose: string }> => {
      try {
        const formatted_prose = await formatLegProseWithTimeout(leg);
        return { ...leg, formatted_prose };
      } catch {
        aiFormatted = false;
        return { ...leg, formatted_prose: leg.board_instruction };
      }
    })
  );

  const fullRoute = { ...route, legs: legsWithProse };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <a href="/" className="text-sm text-gray-400 hover:text-owa-green transition-colors">
          ← New search
        </a>
      </div>

      <RouteCard route={fullRoute} aiFallback={!aiFormatted} />

      <Disclaimer flagged={route.flagged} lastVerified={route.last_verified} />

      <LegList legs={legsWithProse} routeId={route.route_id} />

      <p className="text-center text-xs text-gray-400 pb-4">
        Something wrong? Tap &quot;Flag step&quot; on any step above to send a correction.
      </p>
    </div>
  );
}
