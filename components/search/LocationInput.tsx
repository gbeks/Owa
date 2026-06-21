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
      <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      <div className="relative flex items-center">
        {value ? (
          <div className="flex w-full items-center justify-between rounded-xl border-2 border-owa-green bg-green-50 px-4 py-3">
            <span className="text-sm font-semibold text-gray-900">{value.canonical_name}</span>
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 rounded-full p-0.5 text-gray-400 hover:bg-green-200 hover:text-gray-700"
              aria-label={`Clear ${label}`}
            >
              <X size={16} />
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
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-sm
                placeholder-gray-400 focus:border-owa-green focus:outline-none transition-colors"
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
