'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeftRight, Navigation, ChevronDown, ChevronUp,
  Clock, ArrowRight, MapPinOff, X, Trash2,
} from 'lucide-react';
import { LocationInput } from './LocationInput';
import { Button } from '@/components/ui/Button';
import { DirectionsStep } from '@/components/route/DirectionsStep';
import { FareRange } from '@/components/route/FareRange';
import { RouteVariantList } from '@/components/route/RouteVariantList';
import { ExpandedDestinationList, type ExpandedItem } from '@/components/route/ExpandedDestinationList';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import type { Location, ResolvedRoute } from '@/types/route';

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; routes: ResolvedRoute[]; originLabel: string; destinationLabel: string }
  | { status: 'found-expanded'; originLabel: string; parentLabel: string; items: ExpandedItem[] }
  | { status: 'not-found'; originLabel: string; destinationLabel: string }
  | { status: 'error'; message: string };

interface SearchSectionProps {
  popularRoutes: ResolvedRoute[];
  initialFrom?: string;
  initialTo?: string;
}

export function SearchSection({ popularRoutes, initialFrom, initialTo }: SearchSectionProps) {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState<SearchState>({ status: 'idle' });
  const [expanded, setExpanded] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const { recents, addRecent, removeRecent, clearRecents, hydrated } = useRecentSearches();

  // Restore the last search when returning from /contribute
  useEffect(() => {
    if (!initialFrom || !initialTo) return;
    let cancelled = false;

    setSearch({ status: 'loading' });
    setExpanded(false);

    fetch(`/api/find-route?from=${encodeURIComponent(initialFrom)}&to=${encodeURIComponent(initialTo)}`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          if (data.expanded) {
            setSearch({ status: 'found-expanded', originLabel: initialFrom, parentLabel: data.parent_label, items: data.items });
          } else {
            setSearch({ status: 'found', routes: data.routes, originLabel: initialFrom, destinationLabel: initialTo });
            setExpanded(true);
          }
        } else {
          setSearch({ status: 'not-found', originLabel: initialFrom, destinationLabel: initialTo });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSearch({ status: 'error', message: 'Could not load route. Check your connection and try again.' });
        }
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll after React commits the new search state to the DOM
  useEffect(() => {
    const navbarHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0;

    function scrollTo(el: HTMLElement) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navbarHeight - 16,
        behavior: 'smooth',
      });
    }

    if ((search.status === 'found' || search.status === 'found-expanded') && summaryRef.current) {
      scrollTo(summaryRef.current);
    } else if ((search.status === 'error' || search.status === 'not-found') && resultsRef.current) {
      scrollTo(resultsRef.current);
    }
  }, [search.status]);

  async function fetchRoute(
    from: string, to: string,
    originLabel: string, destinationLabel: string,
  ) {
    setSearch({ status: 'loading' });
    setExpanded(false);
    try {
      const res = await fetch(
        `/api/find-route?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      const data = await res.json();
      if (res.ok) {
        if (data.expanded) {
          setSearch({ status: 'found-expanded', originLabel, parentLabel: data.parent_label, items: data.items });
        } else {
          setSearch({ status: 'found', routes: data.routes, originLabel, destinationLabel });
          setExpanded(true);
        }
        addRecent({ origin_id: from, destination_id: to, origin_label: originLabel, destination_label: destinationLabel });
        window.history.replaceState(null, '', `/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      } else {
        setSearch({ status: 'not-found', originLabel, destinationLabel });
      }
    } catch {
      setSearch({ status: 'error', message: 'Could not load route. Check your connection and try again.' });
    }
  }

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
    setFormError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!origin || !destination) {
      setFormError('Please select both a starting point and a destination.');
      return;
    }
    if (origin.location_id === destination.location_id) {
      setFormError('Starting point and destination cannot be the same.');
      return;
    }
    await fetchRoute(origin.location_id, destination.location_id, origin.canonical_name, destination.canonical_name);
  }

  function handleChipClick(originId: string, destinationId: string, originLabel: string, destinationLabel: string) {
    fetchRoute(originId, destinationId, originLabel, destinationLabel);
  }

  const isLoading = search.status === 'loading';
  const hasResults = search.status !== 'idle';
  const showTabs = hydrated && recents.length > 0;
  const [activeTab, setActiveTab] = useState<'popular' | 'recent'>('popular');
  const showRecent = showTabs && activeTab === 'recent';

  return (
    <div className="space-y-5">

      {/* ── Tabs + Chip panel ─────────────────────────────── */}
      <div>
        {/* Tab headers */}
        {showTabs && (
          <div className="mb-3 flex items-center gap-4 border-b border-gray-100 pb-0">
            <TabButton active={activeTab === 'popular'} onClick={() => setActiveTab('popular')}>
              Popular
            </TabButton>
            <TabButton active={activeTab === 'recent'} onClick={() => setActiveTab('recent')}>
              <Clock size={12} className="inline mr-1 -mt-0.5" />
              Recent
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none
                ${activeTab === 'recent' ? 'bg-owa-green text-white' : 'bg-gray-100 text-gray-500'}`}>
                {recents.length}
              </span>
            </TabButton>

            {showRecent && (
              <button
                onClick={clearRecents}
                className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors pb-2"
                title="Clear all recent searches"
              >
                <Trash2 size={12} />
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Popular label when no tabs */}
        {!showTabs && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Popular routes
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {showRecent ? (
            recents.map((r) => (
              <div
                key={`${r.origin_id}-${r.destination_id}`}
                className="flex items-center rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => handleChipClick(r.origin_id, r.destination_id, r.origin_label, r.destination_label)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 pl-3.5 pr-2 py-2 text-sm font-medium text-gray-700
                    hover:text-owa-green transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  <span>{r.origin_label}</span>
                  <ArrowRight size={13} className="shrink-0 text-gray-400" />
                  <span>{r.destination_label}</span>
                </button>
                <button
                  onClick={() => removeRecent(r.origin_id, r.destination_id)}
                  className="pr-2.5 pl-1 py-2 text-gray-300 hover:text-red-400 transition-colors"
                  aria-label={`Remove ${r.origin_label} to ${r.destination_label} from recent searches`}
                >
                  <X size={13} />
                </button>
              </div>
            ))
          ) : (
            popularRoutes.map((route) => (
              <button
                key={route.route_id}
                onClick={() => handleChipClick(route.origin_id, route.destination_id, route.origin_label, route.destination_label)}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2
                  text-sm font-medium text-gray-700 hover:border-owa-green hover:text-owa-green
                  transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
              >
                <span>{route.origin_label}</span>
                <ArrowRight size={13} className="shrink-0 text-gray-400" />
                <span>{route.destination_label}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Search form ───────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <div className="space-y-3">
            <LocationInput
              id="origin"
              label="From"
              placeholder="e.g. Ojuelegba, Yaba, Oshodi…"
              value={origin}
              onChange={(loc) => { setOrigin(loc); setFormError(''); }}
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
              onChange={(loc) => { setDestination(loc); setFormError(''); }}
            />
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-600 font-medium">{formError}</p>
          )}

          <Button type="submit" size="lg" className="w-full mt-2" isLoading={isLoading} disabled={isLoading}>
            <Navigation size={18} />
            {isLoading ? 'Finding route…' : 'Get Directions'}
          </Button>
        </form>
      </div>

      {/* ── Results ───────────────────────────────────────── */}
      {hasResults && (
        <div ref={resultsRef} className="scroll-mt-4">
          {search.status === 'loading' && (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-owa-green" />
              <p className="text-sm text-gray-400">Looking up your route…</p>
            </div>
          )}

          {search.status === 'error' && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
              {search.message}
            </div>
          )}

          {search.status === 'not-found' && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-12 text-center shadow-sm px-4">
              <MapPinOff size={40} className="mb-4 text-gray-300" />
              <h2 className="text-lg font-bold text-gray-800 mb-1">We don&apos;t have this route yet.</h2>
              <p className="text-sm text-gray-500 mb-4">
                No route from <strong>{search.originLabel}</strong> to <strong>{search.destinationLabel}</strong>.
              </p>
              <a
                href={`/contribute?type=new_route&origin=${encodeURIComponent(search.originLabel)}&destination=${encodeURIComponent(search.destinationLabel)}`}
                className="rounded-lg bg-owa-green px-4 py-2 text-sm font-semibold text-white hover:bg-owa-green-light transition-colors"
              >
                Submit this route
              </a>
            </div>
          )}

          {search.status === 'found' && search.routes.length === 1 && (() => {
            const route = search.routes[0];
            return (
              <div className="space-y-3">
                {/* Summary card */}
                <div ref={summaryRef} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 scroll-mt-3">
                  <div>
                    <h2 className="text-lg font-black text-gray-900 leading-tight">
                      <span className="text-owa-green">{route.origin_label}</span>
                      <span className="mx-2 inline-flex items-center text-gray-300">
                        <ArrowRight size={18} />
                      </span>
                      <span>{route.destination_label}</span>
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        ~{route.total_duration_estimate_mins} min
                      </span>
                      <span>
                        {route.legs.length} {route.legs.length === 1 ? 'leg' : 'legs'}
                      </span>
                      <span className="hidden sm:inline capitalize">
                        {route.legs.map((l) => l.vehicle).join(' → ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                    <FareRange
                      min={route.total_fare_min}
                      max={route.total_fare_max}
                      size="lg"
                      label="Total est. fare"
                    />
                    <button
                      onClick={() => setExpanded((e) => !e)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5
                        text-sm font-semibold text-owa-green hover:bg-green-50 transition-colors"
                    >
                      {expanded ? (
                        <><ChevronUp size={15} /> Hide</>
                      ) : (
                        <><ChevronDown size={15} /> Directions</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expandable step-by-step */}
                {expanded && (
                  <>
                    <div className="space-y-3">
                      {route.legs.map((leg, i) => (
                        <DirectionsStep
                          key={leg.leg_id}
                          leg={leg}
                          isLast={i === route.legs.length - 1}
                        />
                      ))}
                    </div>
                    <div className="pb-4 text-center">
                      <a
                        href={`/contribute?type=correction&route_id=${route.route_id}&route_label=${encodeURIComponent(`${route.origin_label} → ${route.destination_label}`)}&from=${encodeURIComponent(route.origin_id)}&to=${encodeURIComponent(route.destination_id)}`}
                        className="text-sm text-gray-400 hover:text-owa-green transition-colors underline underline-offset-2"
                      >
                        Something wrong? Report it.
                      </a>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {search.status === 'found' && search.routes.length > 1 && (
            <div className="space-y-3">
              <div ref={summaryRef} className="scroll-mt-3">
                <h2 className="text-lg font-black text-gray-900 leading-tight">
                  <span className="text-owa-green">{search.originLabel}</span>
                  <span className="mx-2 inline-flex items-center text-gray-300">
                    <ArrowRight size={18} />
                  </span>
                  <span>{search.destinationLabel}</span>
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  {search.routes.length} route options — tap one to see directions
                </p>
              </div>
              <RouteVariantList routes={search.routes} />
            </div>
          )}

          {search.status === 'found-expanded' && (
            <div className="space-y-3">
              <div ref={summaryRef} className="scroll-mt-3">
                <h2 className="text-lg font-black text-gray-900 leading-tight">
                  <span className="text-owa-green">{search.originLabel}</span>
                  <span className="mx-2 inline-flex items-center text-gray-300">
                    <ArrowRight size={18} />
                  </span>
                  <span>{search.parentLabel}</span>
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  {search.items.length} destinations — tap one to see directions
                </p>
              </div>
              <ExpandedDestinationList
                originLabel={search.originLabel}
                parentLabel={search.parentLabel}
                items={search.items}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab button helper ──────────────────────────────────────
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
        active
          ? 'border-owa-green text-owa-green'
          : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      {children}
    </button>
  );
}
