'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { SearchSuggestions } from './SearchSuggestions';
import { Spinner } from '@/components/ui/Spinner';
import type { Location } from '@/types/route';

interface LocationInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: Location | null;
  onChange: (location: Location | null) => void;
}

export function LocationInput({ id, label, placeholder, value, onChange }: LocationInputProps) {
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, isLoading } = useSearch(inputText, isOpen && !value);

  function handleSelect(loc: Location) {
    onChange(loc);
    setInputText('');
    setIsOpen(false);
  }

  function handleClear() {
    onChange(null);
    setInputText('');
    setIsOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-owa-mist"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {value ? (
          <div className="flex w-full items-center justify-between rounded-xl border-2 border-owa-gold/40 bg-owa-gold/10 px-4 py-3">
            <span className="text-sm font-semibold text-owa-white">{value.canonical_name}</span>
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 rounded-full p-0.5 text-owa-mist transition-colors hover:bg-owa-gold/20 hover:text-owa-white"
              aria-label={`Clear ${label}`}
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              id={id}
              type="text"
              autoComplete="off"
              placeholder={placeholder}
              value={inputText}
              className="w-full rounded-xl border-2 border-white/[0.08] bg-owa-night3 px-4 py-3 pr-10 text-sm
                text-owa-white placeholder-owa-mist/50 transition-colors
                focus:border-owa-gold/50 focus:outline-none"
              onChange={(e) => {
                setInputText(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 150)}
              aria-autocomplete="list"
              aria-controls={`${id}-suggestions`}
              aria-expanded={isOpen && results.length > 0}
            />
            {isLoading && (
              <div className="absolute right-3">
                <Spinner size="sm" />
              </div>
            )}
          </>
        )}
      </div>
      {isOpen && !value && (
        <SearchSuggestions
          id={`${id}-suggestions`}
          suggestions={results}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
