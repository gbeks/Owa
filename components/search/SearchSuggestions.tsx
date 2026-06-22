'use client';

import { MapPin } from 'lucide-react';
import type { Location } from '@/types/route';

const typeLabel: Record<Location['type'], string> = {
  bus_stop: 'Bus stop',
  terminal: 'Terminal',
  landmark: 'Landmark',
  area:     'Area',
};

interface SearchSuggestionsProps {
  suggestions: Location[];
  onSelect: (location: Location) => void;
  id: string;
}

export function SearchSuggestions({ suggestions, onSelect, id }: SearchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <ul
      id={id}
      role="listbox"
      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-white/[0.08] bg-owa-night3 shadow-2xl shadow-black/50"
    >
      {suggestions.map((loc) => (
        <li key={loc.location_id} role="option" aria-selected="false">
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(loc);
            }}
          >
            <MapPin size={14} className="shrink-0 text-owa-gold" />
            <div>
              <p className="text-sm font-medium text-owa-white">{loc.canonical_name}</p>
              <p className="text-xs text-owa-mist">
                {loc.area} · {typeLabel[loc.type]}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
