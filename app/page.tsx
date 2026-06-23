import { getPopularRoutes } from '@/lib/routes';
import { SearchSection } from '@/components/search/SearchSection';
import { PeakHourBanner } from '@/components/PeakHourBanner';

interface HomePageProps {
  searchParams: { from?: string; to?: string };
}

export default function HomePage({ searchParams }: HomePageProps) {
  const popularRoutes = getPopularRoutes(5);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
          <span className="text-owa-white">owa</span><span className="text-owa-gold">.</span>
        </h1>
        <p className="mt-2 text-base text-owa-mist">Lagos public transport, made simple.</p>
        <p className="mt-2 max-w-sm mx-auto text-sm text-owa-mist/60">
          Tell us where you&apos;re going. We&apos;ll guide you on how to get there.
        </p>
      </div>

      <PeakHourBanner />

      <div className="mt-6">
        <SearchSection
          popularRoutes={popularRoutes}
          initialFrom={searchParams.from}
          initialTo={searchParams.to}
        />
      </div>

      <div className="mt-4 text-center">
        <a
          href="/contribute"
          className="text-sm text-owa-mist/50 transition-colors hover:text-owa-gold"
        >
          Know a route we&apos;re missing? Submit it →
        </a>
      </div>

      <p className="mt-8 text-center text-xs text-owa-mist/40">
        25+ Lagos corridors · Fares updated June 2026
      </p>
    </div>
  );
}
