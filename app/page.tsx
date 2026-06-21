import { getPopularRoutes } from '@/lib/routes';
import { SearchForm } from '@/components/search/SearchForm';
import { RouteChip } from '@/components/route/RouteChip';
import { PeakHourBanner } from '@/components/PeakHourBanner';

export default function HomePage() {
  const popularRoutes = getPopularRoutes(8);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
          <span className="text-owa-green">Owa.</span>
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Lagos, step by step.
        </p>
        <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
          Enter where you are and where you&apos;re going. We&apos;ll tell you exactly which bus to board, what to tell the conductor, and what it will cost.
        </p>
      </div>

      <PeakHourBanner />

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <SearchForm />
      </div>

      {popularRoutes.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Popular routes
          </p>
          <div className="flex flex-wrap gap-2">
            {popularRoutes.map((route) => (
              <RouteChip key={route.route_id} route={route} />
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-gray-400">
        {popularRoutes.length}+ Lagos corridors · Fares updated June 2026
      </p>
    </div>
  );
}
