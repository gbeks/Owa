import type { Metadata } from 'next';
import { ContributeForm } from '@/components/contribute/ContributeForm';
import locationsData from '@/data/locations.json';
import { findRouteById } from '@/lib/routes';
import type { Route } from '@/types/route';

export const metadata: Metadata = {
  title: 'Contribute a Route',
  description: 'Submit a missing route or report incorrect information to help improve Owa.',
};

// Canonical names + aliases, flattened, deduped, sorted — for datalist autocomplete
const stopNames = Array.from(
  new Set(locationsData.flatMap((l) => [l.canonical_name, ...l.aliases]))
).sort();

interface ContributePageProps {
  searchParams: {
    type?: string;
    route_id?: string;
    route_label?: string;
    origin?: string;
    destination?: string;
    from?: string;
    to?: string;
  };
}

export default function ContributePage({ searchParams }: ContributePageProps) {
  const isCorrection = searchParams.type === 'correction';
  const backHref =
    searchParams.from && searchParams.to
      ? `/?from=${encodeURIComponent(searchParams.from)}&to=${encodeURIComponent(searchParams.to)}`
      : '/';

  const correctionRoute: Route | null =
    isCorrection && searchParams.route_id
      ? findRouteById(searchParams.route_id)
      : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <a href={backHref} className="text-sm text-gray-400 hover:text-owa-green transition-colors">
          ← Back to search
        </a>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">
          {isCorrection ? 'Report a problem' : 'Submit a route'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isCorrection
            ? "Tell us what's wrong and what the correct information should be."
            : "Know a route we're missing? Share the details and we'll add it after review."}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <ContributeForm
          type={isCorrection ? 'correction' : 'new_route'}
          routeId={searchParams.route_id}
          routeLabel={searchParams.route_label}
          prefillOrigin={searchParams.origin}
          prefillDestination={searchParams.destination}
          stopNames={stopNames}
          route={correctionRoute}
        />
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        Submissions are reviewed before going live. We may follow up by email if you leave one.
      </p>
    </div>
  );
}
