'use client';

import { useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ContributionType } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────────

type VehicleOption = 'Danfo' | 'Korope' | 'Keke' | 'BRT' | 'Walk';

const VEHICLE_OPTIONS: VehicleOption[] = ['Danfo', 'Korope', 'Keke', 'BRT', 'Walk'];

interface Leg {
  id: string;
  boarding_point: string;
  vehicle_type: VehicleOption;
  fare_min: string;
  fare_max: string;
  drop_off_point: string;
}

function blankLeg(id: string): Leg {
  return { id, boarding_point: '', vehicle_type: 'Danfo', fare_min: '', fare_max: '', drop_off_point: '' };
}

function serializeLegs(legs: Leg[]): string {
  return legs
    .map((leg, i) => {
      const fare =
        leg.vehicle_type === 'Walk'
          ? 'Free'
          : `₦${leg.fare_min || '?'} – ₦${leg.fare_max || '?'}`;
      return (
        `[Leg ${i + 1} · ${leg.vehicle_type} · ${fare}]\n` +
        `Board at: ${leg.boarding_point}\n` +
        `Drop at:  ${leg.drop_off_point}`
      );
    })
    .join('\n\n');
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface ContributeFormProps {
  type: ContributionType;
  routeId?: string;
  routeLabel?: string;
  prefillOrigin?: string;
  prefillDestination?: string;
  stopNames?: string[];
}

// ── Shared input class ─────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-white/[0.08] bg-owa-night3 px-3 py-2.5 text-sm ' +
  'text-owa-white placeholder-owa-mist/40 ' +
  'focus:border-owa-gold/50 focus:outline-none focus:ring-1 focus:ring-owa-gold/30';

// ── Main component ─────────────────────────────────────────────────────────────

export function ContributeForm({
  type,
  routeId,
  routeLabel,
  prefillOrigin,
  prefillDestination,
  stopNames = [],
}: ContributeFormProps) {
  const [origin, setOrigin] = useState(prefillOrigin ?? '');
  const [destination, setDestination] = useState(prefillDestination ?? '');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const counterRef = useRef(0);
  function nextId() { return `leg-${++counterRef.current}`; }
  const [legs, setLegs] = useState<Leg[]>(() => [blankLeg(nextId())]);
  const [legErrors, setLegErrors] = useState<Record<string, string>>({});

  // ── Leg helpers ──────────────────────────────────────────────────────────────

  function updateLeg(id: string, patch: Partial<Leg>) {
    setLegs((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const updated = { ...l, ...patch };
        if (patch.vehicle_type === 'Walk') {
          updated.fare_min = '0';
          updated.fare_max = '0';
        }
        return updated;
      })
    );
    setLegErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  function addLeg() { setLegs((prev) => [...prev, blankLeg(nextId())]); }
  function removeLeg(id: string) { setLegs((prev) => prev.filter((l) => l.id !== id)); }

  // ── Validation ───────────────────────────────────────────────────────────────

  function validateLegs(): boolean {
    const errors: Record<string, string> = {};
    legs.forEach((l) => {
      if (!l.boarding_point.trim()) errors[l.id] = 'Boarding point is required.';
      else if (!l.drop_off_point.trim()) errors[l.id] = 'Drop-off point is required.';
      else if (l.vehicle_type !== 'Walk') {
        const min = Number(l.fare_min);
        const max = Number(l.fare_max);
        if (l.fare_min === '' || l.fare_max === '') errors[l.id] = 'Enter fare range (use 0 if unknown).';
        else if (min > max) errors[l.id] = 'Fare min must be ≤ fare max.';
      }
    });
    setLegErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    if (type === 'new_route' && !validateLegs()) return;
    setSubmitStatus('loading');
    try {
      const body =
        type === 'correction'
          ? { type, route_id: routeId, description, submitter_contact: contact || undefined }
          : { type, origin, destination, description: serializeLegs(legs), submitter_contact: contact || undefined };
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Submission failed');
      setSubmitStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitStatus('error');
    }
  }

  // ── Success state ─────────────────────────────────────────────────────────────

  if (submitStatus === 'success') {
    return (
      <div className="space-y-2 py-8 text-center">
        <p className="text-3xl text-owa-gold">✓</p>
        <p className="font-semibold text-owa-white">Submitted — thank you.</p>
        <p className="text-sm text-owa-mist">
          We&apos;ll review this and update the route if everything checks out.
        </p>
        <a href="/" className="mt-4 inline-block text-sm font-semibold text-owa-gold hover:text-owa-gold-bright transition-colors">
          Back to search
        </a>
      </div>
    );
  }

  const isLoading = submitStatus === 'loading';

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {stopNames.length > 0 && (
        <datalist id="owa-stops">
          {stopNames.map((name) => <option key={name} value={name} />)}
        </datalist>
      )}

      {type === 'correction' && routeLabel && (
        <div className="rounded-xl border border-white/[0.06] bg-owa-night3 px-3 py-2.5 text-sm text-owa-mist">
          Route: <span className="font-semibold text-owa-white">{routeLabel}</span>
        </div>
      )}

      {type === 'new_route' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="origin" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-owa-mist">
              Origin *
            </label>
            <input
              id="origin"
              type="text"
              list="owa-stops"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Ojuelegba"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="destination" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-owa-mist">
              Destination *
            </label>
            <input
              id="destination"
              type="text"
              list="owa-stops"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Ketu Garage"
              className={inputCls}
            />
          </div>
        </div>
      )}

      {type === 'new_route' && (
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-owa-mist">
            Route legs *
          </p>
          {legs.map((leg, index) => (
            <LegCard
              key={leg.id}
              leg={leg}
              index={index}
              canRemove={legs.length > 1}
              error={legErrors[leg.id]}
              onChange={(patch) => updateLeg(leg.id, patch)}
              onRemove={() => removeLeg(leg.id)}
            />
          ))}
          <button
            type="button"
            onClick={addLeg}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed
              border-white/[0.12] py-2.5 text-sm font-medium text-owa-mist transition-colors
              hover:border-owa-gold/30 hover:text-owa-gold"
          >
            <Plus size={14} />
            Add leg
          </button>
        </div>
      )}

      {type === 'correction' && (
        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-owa-mist">
            What&apos;s wrong and what should it say? *
          </label>
          <textarea
            id="description"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. The boarding point is wrong — it should be in front of GTB, not Ecobank. Fare is also outdated, it's now ₦500."
            className={`${inputCls} resize-none`}
          />
        </div>
      )}

      <div>
        <label htmlFor="contact" className="mb-1.5 block text-sm font-medium text-owa-mist">
          Email{' '}
          <span className="font-normal text-owa-mist/50">(optional)</span>
        </label>
        <input
          id="contact"
          type="email"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="e.g. you@example.com"
          className={inputCls}
        />
      </div>

      {submitStatus === 'error' && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
          {errorMsg}
        </p>
      )}

      <Button type="submit" disabled={isLoading} isLoading={isLoading} className="w-full">
        Submit
      </Button>
    </form>
  );
}

// ── LegCard sub-component ──────────────────────────────────────────────────────

interface LegCardProps {
  leg: Leg;
  index: number;
  canRemove: boolean;
  error?: string;
  onChange: (patch: Partial<Leg>) => void;
  onRemove: () => void;
}

function LegCard({ leg, index, canRemove, error, onChange, onRemove }: LegCardProps) {
  const isWalk = leg.vehicle_type === 'Walk';
  const inputCls =
    'w-full rounded-xl border border-white/[0.08] bg-owa-night2 px-3 py-2 text-sm ' +
    'text-owa-white placeholder-owa-mist/40 ' +
    'focus:border-owa-gold/50 focus:outline-none focus:ring-1 focus:ring-owa-gold/30';

  return (
    <div className={`space-y-3 rounded-xl border bg-owa-night3 p-4 transition-colors ${error ? 'border-red-500/30' : 'border-white/[0.06]'}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-owa-mist">
          Leg {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-owa-mist/50 transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Remove leg ${index + 1}`}
          >
            <Trash2 size={11} />
            Remove
          </button>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-owa-mist">Board at *</label>
        <input
          type="text"
          required
          value={leg.boarding_point}
          onChange={(e) => onChange({ boarding_point: e.target.value })}
          placeholder="e.g. Oshodi Terminal 3, BRT platform"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-owa-mist">Vehicle *</label>
          <select
            value={leg.vehicle_type}
            onChange={(e) => onChange({ vehicle_type: e.target.value as VehicleOption })}
            className={inputCls}
          >
            {VEHICLE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="col-span-1">
          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-owa-mist">
            Min (₦) {isWalk ? '' : '*'}
          </label>
          <input
            type="number"
            min={0}
            value={leg.fare_min}
            onChange={(e) => onChange({ fare_min: e.target.value })}
            placeholder="0"
            disabled={isWalk}
            className={`${inputCls} ${isWalk ? 'opacity-30 cursor-not-allowed' : ''}`}
          />
        </div>
        <div className="col-span-1">
          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-owa-mist">
            Max (₦) {isWalk ? '' : '*'}
          </label>
          <input
            type="number"
            min={0}
            value={leg.fare_max}
            onChange={(e) => onChange({ fare_max: e.target.value })}
            placeholder="0"
            disabled={isWalk}
            className={`${inputCls} ${isWalk ? 'opacity-30 cursor-not-allowed' : ''}`}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-owa-mist">Drop at *</label>
        <input
          type="text"
          required
          value={leg.drop_off_point}
          onChange={(e) => onChange({ drop_off_point: e.target.value })}
          placeholder="e.g. Ikosi Ketu overhead bridge"
          className={inputCls}
        />
      </div>

      {error && (
        <p className="text-xs font-medium text-red-400">{error}</p>
      )}
    </div>
  );
}
