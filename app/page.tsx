import { getPopularRoutes } from '@/lib/routes';
import { SearchSection } from '@/components/search/SearchSection';
import { PeakHourBanner } from '@/components/PeakHourBanner';

interface HomePageProps {
  searchParams: { from?: string; to?: string };
}

export default function HomePage({ searchParams }: HomePageProps) {
  const popularRoutes = getPopularRoutes(8);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
          <span className="text-owa-green">Owa.</span>
        </h1>
        <p className="mt-3 text-lg text-gray-500">Lagos, step by step.</p>
        <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
          Enter where you are and where you&apos;re going. We&apos;ll tell you exactly which bus to board,
          what to tell the conductor, and what it will cost.
        </p>
      </div>

      <PeakHourBanner />

      <div className="mt-4">
        <SearchSection
          popularRoutes={popularRoutes}
          initialFrom={searchParams.from}
          initialTo={searchParams.to}
        />
      </div>

      <p className="mt-8 text-center text-xs text-gray-400">
        25+ Lagos corridors · Fares updated June 2026
      </p>
    </div>
  );
}
