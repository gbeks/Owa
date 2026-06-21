'use client';

import { useState, useEffect, useCallback } from 'react';

export interface RecentSearch {
  origin_id: string;
  destination_id: string;
  origin_label: string;
  destination_label: string;
}

const STORAGE_KEY = 'owa_recent_searches';
const MAX = 6;

export function useRecentSearches() {
  const [recents, setRecents] = useState<RecentSearch[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  const addRecent = useCallback((entry: RecentSearch) => {
    setRecents((prev) => {
      const deduped = prev.filter(
        (r) => !(r.origin_id === entry.origin_id && r.destination_id === entry.destination_id)
      );
      const next = [entry, ...deduped].slice(0, MAX);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeRecent = useCallback((origin_id: string, destination_id: string) => {
    setRecents((prev) => {
      const next = prev.filter(
        (r) => !(r.origin_id === origin_id && r.destination_id === destination_id)
      );
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { recents, addRecent, removeRecent, clearRecents, hydrated };
}
