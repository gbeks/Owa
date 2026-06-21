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
  const [description, setDescription] = useState(''); // used for corrections only
  const [contact, setContact] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Leg builder (new_route only)
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
        // Auto-zero fares when Walk is selected
        if (patch.vehicle_type === 'Walk') {
          updated.fare_min = '0';
          updated.fare_max = '0';
        }
        return updated;
      })
    );
    // Clear per-leg error on any edit
    setLegErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  function addLeg() {
    setLegs((prev) => [...prev, blankLeg(nextId())]);
  }

  function removeLeg(id: string) {
    setLegs((prev) => prev.filter((l) => l.id !== id));
  }

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
          ? {
              type,
              route_id: routeId,
              description,
              submitter_contact: contact || undefined,
            }
          : {
              type,
              origin,
              destination,
              description: serializeLegs(legs),
              submitter_contact: contact || undefined,
            };

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
      <div className="py-8 text-center space-y-2">
        <p className="text-3xl">✓</p>
        <p className="font-semibold text-gray-900">Submitted — thank you.</p>
        <p className="text-sm text-gray-500">
          We&apos;ll review this and update the route if everything checks out.
        </p>
        <a href="/" className="mt-4 inline-block text-sm font-semibold text-owa-green hover:underline">
          Back to search
        </a>
      </div>
    );
  }

  const isLoading = submitStatus === 'loading';

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Stop-name datalist — shared by origin + destination inputs */}
      {stopNames.length > 0 && (
        <datalist id="owa-stops">
          {stopNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      )}

      {/* ── Correction context banner ── */}
      {type === 'correction' && routeLabel && (
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Route: <span className="font-semibold">{routeLabel}</span>
        </div>
      )}

      {/* ── New route: Origin + Destination ── */}
      {type === 'new_route' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="origin" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
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
            <label htmlFor="destination" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
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

      {/* ── New route: Leg builder ── */}
      {type === 'new_route' && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
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
              border-gray-300 py-2.5 text-sm font-medium text-gray-500 hover:border-owa-green
              hover:text-owa-green transition-colors"
          >
            <Plus size={15} />
            Add leg
          </button>
        </div>
      )}

      {/* ── Correction: free-text description ── */}
      {type === 'correction' && (
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
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

      {/* ── Email contact (both types) ── */}
      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
          Email{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
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
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
          {errorMsg}
        </p>
      )}

      <Button type="submit" disabled={isLoading} isLoading={isLoading} className="w-full">
        Submit
      </Button>
    </form>
  );
}

// ── Shared input class ─────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm ' +
  'focus:border-owa-green focus:outline-none focus:ring-1 focus:ring-owa-green';

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

  return (
    <div className={`rounded-xl border bg-white p-4 space-y-3 transition-colors ${error ? 'border-red-300' : 'border-gray-200'}`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Leg {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-400
              hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label={`Remove leg ${index + 1}`}
          >
            <Trash2 size={12} />
            Remove
          </button>
        )}
      </div>

      {/* Boarding point */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Board at *</label>
        <input
          type="text"
          required
          value={leg.boarding_point}
          onChange={(e) => onChange({ boarding_point: e.target.value })}
          placeholder="e.g. Oshodi Terminal 3, BRT platform"
          className={inputCls}
        />
      </div>

      {/* Vehicle + Fare row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle *</label>
          <select
            value={leg.vehicle_type}
            onChange={(e) => onChange({ vehicle_type: e.target.value as VehicleOption })}
            className={inputCls}
          >
            {VEHICLE_OPTIONS.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Fare min (₦) {isWalk ? '' : '*'}
          </label>
          <input
            type="number"
            min={0}
            value={leg.fare_min}
            onChange={(e) => onChange({ fare_min: e.target.value })}
            placeholder="0"
            disabled={isWalk}
            className={`${inputCls} ${isWalk ? 'bg-gray-50 text-gray-400' : ''}`}
          />
        </div>

        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Fare max (₦) {isWalk ? '' : '*'}
          </label>
          <input
            type="number"
            min={0}
            value={leg.fare_max}
            onChange={(e) => onChange({ fare_max: e.target.value })}
            placeholder="0"
            disabled={isWalk}
            className={`${inputCls} ${isWalk ? 'bg-gray-50 text-gray-400' : ''}`}
          />
        </div>
      </div>

      {/* Drop-off point */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Drop at *</label>
        <input
          type="text"
          required
          value={leg.drop_off_point}
          onChange={(e) => onChange({ drop_off_point: e.target.value })}
          placeholder="e.g. Ikosi Ketu overhead bridge"
          className={inputCls}
        />
      </div>

      {/* Per-leg validation error */}
      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
