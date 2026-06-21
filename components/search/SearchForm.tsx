'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, Navigation } from 'lucide-react';
import { LocationInput } from './LocationInput';
import { Button } from '@/components/ui/Button';
import type { Location } from '@/types/route';

export function SearchForm() {
  const router = useRouter();
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [error, setError] = useState('');

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
    setError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!origin || !destination) {
      setError('Please select both a starting point and a destination.');
      return;
    }

    if (origin.location_id === destination.location_id) {
      setError('Starting point and destination cannot be the same.');
      return;
    }

    router.push(
      `/route?from=${encodeURIComponent(origin.location_id)}&to=${encodeURIComponent(destination.location_id)}`
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div className="relative space-y-3">
        <LocationInput
          id="origin"
          label="From"
          placeholder="e.g. Ojuelegba, Yaba, Oshodi…"
          value={origin}
          onChange={(loc) => { setOrigin(loc); setError(''); }}
        />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5
              text-xs font-medium text-gray-500 hover:border-owa-green hover:text-owa-green transition-colors shadow-sm"
            aria-label="Swap origin and destination"
          >
            <ArrowLeftRight size={13} />
            Swap
          </button>
        </div>

        <LocationInput
          id="destination"
          label="To"
          placeholder="e.g. CMS, Ikeja, Victoria Island…"
          value={destination}
          onChange={(loc) => { setDestination(loc); setError(''); }}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 font-medium">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full mt-2">
        <Navigation size={18} />
        Get Directions
      </Button>
    </form>
  );
}
