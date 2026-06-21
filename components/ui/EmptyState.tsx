import { MapPinOff, Search } from 'lucide-react';

interface EmptyStateProps {
  type?: 'no-route' | 'no-results';
  origin?: string;
  destination?: string;
}

export function EmptyState({ type = 'no-route', origin, destination }: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-owa-mist">
        <Search size={32} className="mb-3 opacity-30" />
        <p className="font-medium text-owa-white">No locations found</p>
        <p className="mt-1 text-sm">Try a nearby area or a well-known landmark.</p>
      </div>
    );
  }

  const contributeHref = origin && destination
    ? `/contribute?type=new_route&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
    : '/contribute?type=new_route';

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <MapPinOff size={48} className="mb-4 text-owa-mist/30" />
      <h2 className="mb-2 text-xl font-bold text-owa-white">We don&apos;t have this route yet.</h2>
      {origin && destination ? (
        <p className="mb-4 text-owa-mist">
          No route from <strong className="text-owa-sand">{origin}</strong> to{' '}
          <strong className="text-owa-sand">{destination}</strong> in our database.
        </p>
      ) : (
        <p className="mb-4 text-owa-mist">This route isn&apos;t in our database yet.</p>
      )}
      <a
        href={contributeHref}
        className="rounded-xl bg-owa-gold px-4 py-2.5 text-sm font-semibold text-owa-night transition-colors hover:bg-owa-gold-bright"
      >
        Submit this route
      </a>
    </div>
  );
}
