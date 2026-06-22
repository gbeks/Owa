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
    <div className="space-y-4">

      {/* ── Tabs + Route chips ────────────────────────────── */}
      <div>
        {showTabs ? (
          <div className="mb-3 flex items-center gap-4 border-b border-white/[0.06] pb-0">
            <TabButton active={activeTab === 'popular'} onClick={() => setActiveTab('popular')}>
              Popular
            </TabButton>
            <TabButton active={activeTab === 'recent'} onClick={() => setActiveTab('recent')}>
              <Clock size={11} className="-mt-0.5 mr-1 inline" />
              Recent
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none
                ${activeTab === 'recent' ? 'bg-owa-gold text-owa-night' : 'bg-white/[0.08] text-owa-mist'}`}>
                {recents.length}
              </span>
            </TabButton>
            {showRecent && (
              <button
                onClick={clearRecents}
                className="ml-auto flex items-center gap-1 pb-2 text-xs text-owa-mist/50 transition-colors hover:text-red-400"
                title="Clear all recent searches"
              >
                <Trash2 size={11} />
                Clear all
              </button>
            )}
          </div>
        ) : (
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-owa-mist">
            Popular routes
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          {showRecent ? (
            recents.length > 0 ? (
              recents.map((r) => (
                <div
                  key={`${r.origin_id}-${r.destination_id}`}
                  className="flex items-center gap-2 overflow-hidden rounded-xl border border-white/[0.06] bg-owa-card transition-colors hover:border-owa-gold/30"
                >
                  <button
                    onClick={() => handleChipClick(r.origin_id, r.destination_id, r.origin_label, r.destination_label)}
                    disabled={isLoading}
                    className="flex flex-1 items-center gap-2 px-3.5 py-2.5 text-left transition-colors hover:bg-owa-gold/[0.04] disabled:opacity-50"
                  >
                    <span className="shrink-0 text-xs text-owa-gold">→</span>
                    <span className="text-sm font-medium text-owa-white">{r.origin_label}</span>
                    <span className="text-xs text-owa-mist">to</span>
                    <span className="text-sm font-medium text-owa-white">{r.destination_label}</span>
                  </button>
                  <button
                    onClick={() => removeRecent(r.origin_id, r.destination_id)}
                    className="px-3 py-2.5 text-owa-mist/30 transition-colors hover:text-red-400"
                    aria-label={`Remove ${r.origin_label} to ${r.destination_label}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))
            ) : (
              <p className="py-2 text-sm text-owa-mist/60">No recent searches yet.</p>
            )
          ) : (
            popularRoutes.map((route) => (
              <button
                key={route.route_id}
                onClick={() => handleChipClick(route.origin_id, route.destination_id, route.origin_label, route.destination_label)}
                disabled={isLoading}
                className="flex w-full items-center gap-2 rounded-xl border border-white/[0.06] bg-owa-card px-3.5 py-2.5
                  text-left transition-colors hover:border-owa-gold/30 hover:bg-owa-gold/[0.04] disabled:opacity-50"
              >
                <span className="shrink-0 text-xs text-owa-gold">→</span>
                <span className="text-sm font-medium text-owa-white">{route.origin_label}</span>
                <span className="text-xs text-owa-mist">to</span>
                <span className="text-sm font-medium text-owa-white">{route.destination_label}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Search form ───────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-owa-card shadow-xl shadow-black/20">
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 p-5">
            <LocationInput
              id="origin"
              label="From"
              placeholder="Where are you starting from?"
              value={origin}
              onChange={(loc) => { setOrigin(loc); setFormError(''); }}
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwap}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-owa-night3 px-3 py-1.5
                  text-xs font-medium text-owa-mist transition-colors hover:border-owa-gold/25 hover:text-owa-gold"
                aria-label="Swap origin and destination"
              >
                <ArrowLeftRight size={12} />
                Swap
              </button>
            </div>
            <LocationInput
              id="destination"
              label="To"
              placeholder="Where are you going?"
              value={destination}
              onChange={(loc) => { setDestination(loc); setFormError(''); }}
            />
          </div>

          <div className="border-t border-white/[0.06] px-5 pb-5 pt-4">
            {formError && (
              <p role="alert" className="mb-3 text-sm font-medium text-red-400">{formError}</p>
            )}
            <Button type="submit" size="lg" className="w-full" isLoading={isLoading} disabled={isLoading}>
              <Navigation size={17} />
              {isLoading ? 'Finding route…' : 'Get Directions'}
            </Button>
          </div>
        </form>
      </div>

      {/* ── Results ───────────────────────────────────────── */}
      {hasResults && (
        <div ref={resultsRef} className="scroll-mt-4">

          {search.status === 'loading' && (
            <div className="rounded-2xl border border-white/[0.06] bg-owa-card p-8 text-center shadow-lg shadow-black/20">
              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-owa-night3 border-t-owa-gold" />
              <p className="text-sm text-owa-mist">Looking up your route…</p>
            </div>
          )}

          {search.status === 'error' && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400">
              {search.message}
            </div>
          )}

          {search.status === 'not-found' && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-owa-card px-4 py-12 text-center shadow-lg shadow-black/20">
              <MapPinOff size={40} className="mb-4 text-owa-mist/25" />
              <h2 className="mb-1 text-lg font-bold text-owa-white">We don&apos;t have this route yet.</h2>
              <p className="mb-5 text-sm text-owa-mist">
                No route from <strong className="text-owa-sand">{search.originLabel}</strong> to{' '}
                <strong className="text-owa-sand">{search.destinationLabel}</strong>.
              </p>
              <a
                href={`/contribute?type=new_route&origin=${encodeURIComponent(search.originLabel)}&destination=${encodeURIComponent(search.destinationLabel)}`}
                className="rounded-xl bg-owa-gold px-4 py-2.5 text-sm font-semibold text-owa-night transition-colors hover:bg-owa-gold-bright"
              >
                Submit this route
              </a>
            </div>
          )}

          {search.status === 'found' && search.routes.length === 1 && (() => {
            const route = search.routes[0];
            return (
              <div className="space-y-3">
                <div
                  ref={summaryRef}
                  className="rounded-2xl border border-white/[0.06] bg-owa-card p-5 shadow-xl shadow-black/25 scroll-mt-3 space-y-4"
                >
                  <div>
                    <h2 className="text-base font-black leading-tight">
                      <span className="text-owa-gold">{route.origin_label}</span>
                      <span className="mx-2 inline-flex items-center text-owa-mist/40">
                        <ArrowRight size={16} />
                      </span>
                      <span className="text-owa-white">{route.destination_label}</span>
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-owa-mist">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        ~{route.total_duration_estimate_mins} min
                      </span>
                      <span>
                        {route.legs.length} {route.legs.length === 1 ? 'leg' : 'legs'}
                      </span>
                      <span className="hidden capitalize sm:inline">
                        {route.legs.map((l) => l.vehicle).join(' → ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <FareRange min={route.total_fare_min} max={route.total_fare_max} size="lg" label="Total est. fare" />
                    <button
                      onClick={() => setExpanded((e) => !e)}
                      className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3.5 py-2
                        text-sm font-semibold text-owa-gold transition-colors hover:bg-owa-gold/10"
                    >
                      {expanded ? (
                        <><ChevronUp size={14} /> Hide</>
                      ) : (
                        <><ChevronDown size={14} /> Directions</>
                      )}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <>
                    <div className="space-y-2.5">
                      {route.legs.map((leg, i) => (
                        <DirectionsStep key={leg.leg_id} leg={leg} isLast={i === route.legs.length - 1} />
                      ))}
                    </div>
                    <div className="pb-4 pt-1 text-center">
                      <a
                        href={`/contribute?type=correction&route_id=${route.route_id}&route_label=${encodeURIComponent(`${route.origin_label} → ${route.destination_label}`)}&from=${encodeURIComponent(route.origin_id)}&to=${encodeURIComponent(route.destination_id)}`}
                        className="text-sm text-owa-mist/60 underline underline-offset-2 transition-colors hover:text-owa-gold"
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
                <h2 className="text-base font-black leading-tight">
                  <span className="text-owa-gold">{search.originLabel}</span>
                  <span className="mx-2 inline-flex items-center text-owa-mist/40">
                    <ArrowRight size={16} />
                  </span>
                  <span className="text-owa-white">{search.destinationLabel}</span>
                </h2>
                <p className="mt-1 text-xs text-owa-mist">
                  {search.routes.length} route options — tap one to see directions
                </p>
              </div>
              <RouteVariantList routes={search.routes} />
            </div>
          )}

          {search.status === 'found-expanded' && (
            <div className="space-y-3">
              <div ref={summaryRef} className="scroll-mt-3">
                <h2 className="text-base font-black leading-tight">
                  <span className="text-owa-gold">{search.originLabel}</span>
                  <span className="mx-2 inline-flex items-center text-owa-mist/40">
                    <ArrowRight size={16} />
                  </span>
                  <span className="text-owa-white">{search.parentLabel}</span>
                </h2>
                <p className="mt-1 text-xs text-owa-mist">
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

// ── Tab button ─────────────────────────────────────────────
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
          ? 'border-owa-gold text-owa-gold'
          : 'border-transparent text-owa-mist hover:text-owa-white'
      }`}
    >
      {children}
    </button>
  );
}
