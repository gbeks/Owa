import { MapPinOff, Search } from 'lucide-react';

interface EmptyStateProps {
  type?: 'no-route' | 'no-results';
  origin?: string;
  destination?: string;
}

export function EmptyState({ type = 'no-route', origin, destination }: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
        <Search size={32} className="mb-3 opacity-40" />
        <p className="font-medium text-gray-700">No locations found</p>
        <p className="mt-1 text-sm">Try a nearby area or a well-known landmark.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <MapPinOff size={48} className="mb-4 text-gray-300" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">No route found</h2>
      {origin && destination ? (
        <p className="text-gray-500 mb-4">
          We don&apos;t have a route from <strong>{origin}</strong> to <strong>{destination}</strong> yet.
        </p>
      ) : (
        <p className="text-gray-500 mb-4">
          We don&apos;t have this route in our database yet.
        </p>
      )}
      <p className="text-sm text-gray-400">
        Try searching for a nearby area or landmark, or check back soon — we&apos;re adding routes regularly.
      </p>
    </div>
  );
}
