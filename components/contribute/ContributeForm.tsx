'use client';

import { useRef, useState } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ContributionType } from '@/lib/supabase';
import type { ResolvedRoute } from '@/types/route';

// ── Types ──────────────────────────────────────────────────────────────────────

type VehicleOption = 'Danfo' | 'Korope' | 'Keke' | 'BRT' | 'Okada' | 'Ferry' | 'Walk';
const VEHICLE_OPTIONS: VehicleOption[] = ['Danfo', 'Korope', 'Keke', 'BRT', 'Okada', 'Ferry', 'Walk'];

interface Step {
  id: string;
  boarding_point: string;
  vehicle_type: VehicleOption;
  fare_min: string;
  fare_max: string;
  drop_off_point: string;
  duration_mins: string;
  notes: string;
}

function blankStep(id: string): Step {
  return { id, boarding_point: '', vehicle_type: 'Danfo', fare_min: '', fare_max: '', drop_off_point: '', duration_mins: '', notes: '' };
}

function serializeSteps(steps: Step[]): string {
  return steps
    .map((step, i) => {
      const fare =
        step.vehicle_type === 'Walk'
          ? 'Free'
          : `₦${step.fare_min || '?'} – ₦${step.fare_max || '?'}`;
      const lines = [
        `[Step ${i + 1} · ${step.vehicle_type} · ${fare}]`,
        `Board at: ${step.boarding_point}`,
        `Drop at:  ${step.drop_off_point}`,
      ];
      if (step.duration_mins.trim()) lines.push(`Duration: ~${step.duration_mins} min`);
      if (step.notes.trim()) lines.push(`Notes: ${step.notes.trim()}`);
      return lines.join('\n');
    })
    .join('\n\n');
}

interface EditLeg {
  leg_id: string;
  board_landmark: string;
  vehicle: string;
  fare_min: string;
  fare_max: string;
  alight_landmark: string;
  board_instruction: string;
  alight_instruction: string;
  notes: string;
}

const vehicleDisplayMap: Record<string, string> = {
  danfo: 'Danfo', brt: 'BRT', korope: 'Korope', keke: 'Keke',
  okada: 'Okada', ferry: 'Ferry', walk: 'Walk',
};

function routeLegToEditLeg(leg: ResolvedRoute['legs'][0]): EditLeg {
  return {
    leg_id: leg.leg_id,
    board_landmark: leg.board_landmark ?? '',
    vehicle: vehicleDisplayMap[leg.vehicle] ?? leg.vehicle,
    fare_min: leg.fare_min != null ? String(leg.fare_min) : '',
    fare_max: leg.fare_max != null ? String(leg.fare_max) : '',
    alight_landmark: leg.alight_landmark ?? '',
    board_instruction: leg.board_instruction ?? '',
    alight_instruction: leg.alight_instruction ?? '',
    notes: leg.notes ?? '',
  };
}

type CorrectionMode = 'flag' | 'edit';

const FLAG_OPTIONS = [
  { id: 'wrong_fare',     label: 'Fare is wrong' },
  { id: 'wrong_landmark', label: 'Boarding point changed' },
  { id: 'wrong_vehicle',  label: 'Vehicle type is wrong' },
  { id: 'route_closed',   label: 'Route no longer exists' },
  { id: 'other',          label: 'Other' },
] as const;

// ── Props ──────────────────────────────────────────────────────────────────────

interface ContributeFormProps {
  type: ContributionType;
  routeId?: string;
  routeLabel?: string;
  prefillOrigin?: string;
  prefillDestination?: string;
  stopNames?: string[];
  route?: ResolvedRoute | null;
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
  route,
}: ContributeFormProps) {
  // Shared
  const [contact, setContact] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [formError, setFormError] = useState('');

  // new_route
  const [origin, setOrigin] = useState(prefillOrigin ?? '');
  const [destination, setDestination] = useState(prefillDestination ?? '');

  const counterRef = useRef(0);
  function nextId() { return `step-${++counterRef.current}`; }
  const [steps, setSteps] = useState<Step[]>(() => [blankStep(nextId())]);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // correction — flag mode
  const [correctionMode, setCorrectionMode] = useState<CorrectionMode>('edit');
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [flagNotes, setFlagNotes] = useState('');

  // correction — edit mode
  const [editLegs, setEditLegs] = useState<EditLeg[]>(() =>
    route?.legs.map(routeLegToEditLeg) ?? []
  );
  const [changeNotes, setChangeNotes] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  // ── Step helpers (new_route) ─────────────────────────────────────────────────

  function updateStep(id: string, patch: Partial<Step>) {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...patch };
        if (patch.vehicle_type === 'Walk') {
          updated.fare_min = '0';
          updated.fare_max = '0';
        }
        return updated;
      })
    );
    setStepErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
  }

  function addStep() { setSteps((prev) => [...prev, blankStep(nextId())]); }
  function removeStep(id: string) { setSteps((prev) => prev.filter((s) => s.id !== id)); }

  function validateSteps(): boolean {
    const errors: Record<string, string> = {};
    steps.forEach((s) => {
      if (!s.boarding_point.trim()) errors[s.id] = 'Boarding point is required.';
      else if (!s.drop_off_point.trim()) errors[s.id] = 'Drop-off point is required.';
      else if (s.vehicle_type !== 'Walk') {
        const min = Number(s.fare_min);
        const max = Number(s.fare_max);
        if (s.fare_min === '' || s.fare_max === '') errors[s.id] = 'Enter fare range (use 0 if unknown).';
        else if (min > max) errors[s.id] = 'Fare min must be ≤ fare max.';
      }
    });
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Edit-leg helpers (correction) ───────────────────────────────────────────

  function updateEditLeg(legId: string, patch: Partial<EditLeg>) {
    setEditLegs((prev) => prev.map((l) => l.leg_id === legId ? { ...l, ...patch } : l));
  }

  function removeEditLeg(legId: string) {
    setEditLegs((prev) => prev.filter((l) => l.leg_id !== legId));
  }

  function resetEditLegs() {
    setEditLegs(route?.legs.map(routeLegToEditLeg) ?? []);
    setChangeNotes('');
    setConfirmReset(false);
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setErrorMsg('');

    let description = '';

    if (type === 'new_route') {
      if (!validateSteps()) return;
      description = serializeSteps(steps);
    } else {
      const inFlagMode = !route || correctionMode === 'flag';
      if (inFlagMode) {
        if (flagged.size === 0 && !flagNotes.trim()) {
          setFormError('Please select at least one issue or describe the problem.');
          return;
        }
        const issueLabels = FLAG_OPTIONS
          .filter((o) => flagged.has(o.id))
          .map((o) => o.label);
        const issueStr = issueLabels.length ? issueLabels.join(', ') : 'Other';
        description = `[FLAG]\nIssues: ${issueStr}${flagNotes.trim() ? `\nNotes: ${flagNotes.trim()}` : ''}`;
      } else {
        description =
          `[ROUTE EDIT - PENDING REVIEW]\n` +
          JSON.stringify({
            proposed_legs: editLegs,
            change_notes: changeNotes.trim() || undefined,
          });
      }
    }

    setSubmitStatus('loading');
    try {
      const body =
        type === 'new_route'
          ? { type, origin, destination, description, submitter_contact: contact || undefined }
          : { type: 'correction', route_id: routeId, description, submitter_contact: contact || undefined };

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

  // ── Success ───────────────────────────────────────────────────────────────────

  if (submitStatus === 'success') {
    return (
      <div className="space-y-3 py-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-owa-gold/15">
          <span className="text-2xl text-owa-gold">✓</span>
        </div>
        <p className="text-lg font-bold text-owa-white">Thanks!</p>
        <p className="text-sm text-owa-mist">
          We&apos;ll review and update this route soon.
        </p>
        <a
          href="/"
          className="mt-2 inline-block rounded-xl bg-owa-gold/15 px-5 py-2.5 text-sm font-semibold text-owa-gold transition-colors hover:bg-owa-gold/25"
        >
          Back to search
        </a>
      </div>
    );
  }

  const isLoading = submitStatus === 'loading';

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <form id="contribute-form" onSubmit={handleSubmit} className="space-y-5 pb-28">

        {stopNames.length > 0 && (
          <datalist id="owa-stops">
            {stopNames.map((name) => <option key={name} value={name} />)}
          </datalist>
        )}

        {/* ── CORRECTION ── */}
        {type === 'correction' && (
          <>
            {routeLabel && (
              <div className="rounded-xl border border-white/[0.06] bg-owa-night3 px-3 py-2.5 text-sm text-owa-mist">
                Route: <span className="font-semibold text-owa-white">{routeLabel}</span>
              </div>
            )}

            {route && (
              <div className="flex rounded-xl border border-white/[0.08] bg-owa-night3 p-0.5">
                <button
                  type="button"
                  onClick={() => { setCorrectionMode('flag'); setFormError(''); }}
                  className={`flex-1 rounded-[10px] px-3 py-2 text-sm transition-colors ${
                    correctionMode === 'flag'
                      ? 'bg-owa-night2 shadow-sm font-semibold text-owa-white'
                      : 'font-medium text-owa-mist hover:text-owa-white'
                  }`}
                >
                  Flag an issue
                </button>
                <button
                  type="button"
                  onClick={() => { setCorrectionMode('edit'); setFormError(''); }}
                  className={`flex-1 rounded-[10px] px-3 py-2 text-sm transition-colors ${
                    correctionMode === 'edit'
                      ? 'bg-owa-night2 shadow-sm font-semibold text-owa-white'
                      : 'font-medium text-owa-mist hover:text-owa-white'
                  }`}
                >
                  Edit this route
                </button>
              </div>
            )}

            {/* ── Mode A: Flag an issue ── */}
            {(!route || correctionMode === 'flag') && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-owa-mist">
                  What&apos;s the issue? *
                </p>
                <div className="space-y-2.5">
                  {FLAG_OPTIONS.map((opt) => (
                    <label key={opt.id} className="flex cursor-pointer select-none items-center gap-3">
                      <input
                        type="checkbox"
                        checked={flagged.has(opt.id)}
                        onChange={(e) => {
                          const next = new Set(flagged);
                          if (e.target.checked) next.add(opt.id); else next.delete(opt.id);
                          setFlagged(next);
                          setFormError('');
                        }}
                        className="h-4 w-4 rounded border-white/[0.12] bg-owa-night2 text-owa-gold focus:ring-owa-gold/30"
                      />
                      <span className="text-sm text-owa-white">{opt.label}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label htmlFor="flag-notes" className="mb-1 block text-sm font-medium text-owa-mist">
                    Anything else to add?{' '}
                    <span className="font-normal text-owa-mist/50">(optional)</span>
                  </label>
                  <textarea
                    id="flag-notes"
                    rows={3}
                    value={flagNotes}
                    onChange={(e) => setFlagNotes(e.target.value)}
                    placeholder="e.g. The fare is now ₦500, not ₦300."
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            )}

            {/* ── Mode B: Edit this route ── */}
            {route && correctionMode === 'edit' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-owa-mist">
                    Steps
                  </p>
                  {confirmReset ? (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5">
                      <span className="text-xs text-amber-300">Undo all changes?</span>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="text-xs text-owa-mist transition-colors hover:text-owa-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={resetEditLegs}
                        className="text-xs font-semibold text-amber-300 transition-colors hover:text-amber-200"
                      >
                        Continue
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="flex items-center gap-1 text-xs text-owa-mist/50 transition-colors hover:text-owa-white"
                    >
                      <RotateCcw size={11} />
                      Reset to original
                    </button>
                  )}
                </div>

                {editLegs.map((leg, index) => (
                  <EditLegCard
                    key={leg.leg_id}
                    leg={leg}
                    index={index}
                    canRemove={editLegs.length > 1}
                    onChange={(patch) => updateEditLeg(leg.leg_id, patch)}
                    onRemove={() => removeEditLeg(leg.leg_id)}
                  />
                ))}

                <div>
                  <label htmlFor="change-notes" className="mb-1 block text-sm font-medium text-owa-mist">
                    Anything else we should know?{' '}
                    <span className="font-normal text-owa-mist/50">(optional)</span>
                  </label>
                  <textarea
                    id="change-notes"
                    rows={2}
                    value={changeNotes}
                    onChange={(e) => setChangeNotes(e.target.value)}
                    placeholder="e.g. Fare went up last week. Boarding point moved to the new terminal."
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── NEW ROUTE ── */}
        {type === 'new_route' && (
          <>
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

            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-owa-mist">
                Steps *
              </p>
              {steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={index}
                  canRemove={steps.length > 1}
                  error={stepErrors[step.id]}
                  onChange={(patch) => updateStep(step.id, patch)}
                  onRemove={() => removeStep(step.id)}
                />
              ))}
              <button
                type="button"
                onClick={addStep}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed
                  border-white/[0.12] py-2.5 text-sm font-medium text-owa-mist transition-colors
                  hover:border-owa-gold/30 hover:text-owa-gold"
              >
                <Plus size={14} />
                Add step
              </button>
            </div>
          </>
        )}

        {formError && (
          <p role="alert" className="text-sm font-medium text-red-400">{formError}</p>
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
      </form>

      {/* ── Sticky submit bar ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-white/[0.06] bg-owa-night/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <Button
            form="contribute-form"
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full"
          >
            Submit
          </Button>
        </div>
      </div>
    </>
  );
}

// ── StepCard (new_route) ───────────────────────────────────────────────────────

interface StepCardProps {
  step: Step;
  index: number;
  canRemove: boolean;
  error?: string;
  onChange: (patch: Partial<Step>) => void;
  onRemove: () => void;
}

function StepCard({ step, index, canRemove, error, onChange, onRemove }: StepCardProps) {
  const isWalk = step.vehicle_type === 'Walk';
  const innerInputCls =
    'w-full rounded-xl border border-white/[0.08] bg-owa-night2 px-3 py-2 text-sm ' +
    'text-owa-white placeholder-owa-mist/40 ' +
    'focus:border-owa-gold/50 focus:outline-none focus:ring-1 focus:ring-owa-gold/30';

  return (
    <div className={`space-y-3 rounded-xl border bg-owa-night3 p-4 transition-colors ${error ? 'border-red-500/30' : 'border-white/[0.06]'}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-owa-mist">
          Step {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-owa-mist/50 transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Remove step ${index + 1}`}
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
          value={step.boarding_point}
          onChange={(e) => onChange({ boarding_point: e.target.value })}
          placeholder="e.g. Oshodi Terminal 3, BRT platform"
          className={innerInputCls}
        />
      </div>

      {/* Vehicle on its own row */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-owa-mist">Vehicle *</label>
        <select
          value={step.vehicle_type}
          onChange={(e) => onChange({ vehicle_type: e.target.value as VehicleOption })}
          className={innerInputCls}
        >
          {VEHICLE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Fare min + max side by side */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-owa-mist">
            Fare min (₦) {isWalk ? '' : '*'}
          </label>
          <input
            type="number"
            min={0}
            value={step.fare_min}
            onChange={(e) => onChange({ fare_min: e.target.value })}
            placeholder="0"
            disabled={isWalk}
            className={`${innerInputCls} ${isWalk ? 'cursor-not-allowed opacity-30' : ''}`}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-owa-mist">
            Fare max (₦) {isWalk ? '' : '*'}
          </label>
          <input
            type="number"
            min={0}
            value={step.fare_max}
            onChange={(e) => onChange({ fare_max: e.target.value })}
            placeholder="0"
            disabled={isWalk}
            className={`${innerInputCls} ${isWalk ? 'cursor-not-allowed opacity-30' : ''}`}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-owa-mist">Drop at *</label>
        <input
          type="text"
          required
          value={step.drop_off_point}
          onChange={(e) => onChange({ drop_off_point: e.target.value })}
          placeholder="e.g. Ikosi Ketu overhead bridge"
          className={innerInputCls}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-owa-mist">
          Duration{' '}
          <span className="normal-case font-normal text-owa-mist/50">(mins, optional)</span>
        </label>
        <input
          type="number"
          min={1}
          value={step.duration_mins}
          onChange={(e) => onChange({ duration_mins: e.target.value })}
          placeholder="e.g. 20"
          className={innerInputCls}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-widest text-owa-mist">
          Notes or tips{' '}
          <span className="normal-case font-normal text-owa-mist/50">(optional)</span>
        </label>
        <textarea
          rows={2}
          value={step.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="e.g. Use the overhead bridge to cross. Avoid peak hours (7–9am). Tell conductor 'Ketu'."
          className={`${innerInputCls} resize-none`}
        />
      </div>

      {error && (
        <p className="text-xs font-medium text-red-400">{error}</p>
      )}
    </div>
  );
}

// ── EditLegCard (correction / edit route) ──────────────────────────────────────

interface EditLegCardProps {
  leg: EditLeg;
  index: number;
  canRemove: boolean;
  onChange: (patch: Partial<EditLeg>) => void;
  onRemove: () => void;
}

function EditLegCard({ leg, index, canRemove, onChange, onRemove }: EditLegCardProps) {
  const isWalk = leg.vehicle === 'Walk';
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <div className="space-y-3 rounded-xl border border-white/[0.06] bg-owa-night3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-owa-mist">
          Step {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-owa-mist/50 transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Remove step ${index + 1}`}
          >
            <Trash2 size={11} />
            Remove
          </button>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-owa-mist">Board at</label>
        <input
          type="text"
          value={leg.board_landmark}
          onChange={(e) => onChange({ board_landmark: e.target.value })}
          placeholder="e.g. Ojuelegba Under-Bridge"
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-owa-mist">Board instruction</label>
        <textarea
          rows={focused === 'board_instruction' ? 4 : 2}
          value={leg.board_instruction}
          onFocus={() => setFocused('board_instruction')}
          onBlur={() => setFocused(null)}
          onChange={(e) => onChange({ board_instruction: e.target.value })}
          placeholder="e.g. Board any yellow danfo heading to CMS."
          className={`${inputCls} resize-none transition-[height] duration-150`}
        />
      </div>

      {/* Vehicle on its own row */}
      <div>
        <label className="mb-1 block text-xs font-medium text-owa-mist">Vehicle</label>
        <select
          value={leg.vehicle}
          onChange={(e) => onChange({ vehicle: e.target.value })}
          className={inputCls}
        >
          {VEHICLE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Fare min + max side by side */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-owa-mist">Fare min (₦)</label>
          <input
            type="number"
            min={0}
            value={leg.fare_min}
            onChange={(e) => onChange({ fare_min: e.target.value })}
            placeholder="0"
            disabled={isWalk}
            className={`${inputCls} ${isWalk ? 'cursor-not-allowed opacity-30' : ''}`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-owa-mist">Fare max (₦)</label>
          <input
            type="number"
            min={0}
            value={leg.fare_max}
            onChange={(e) => onChange({ fare_max: e.target.value })}
            placeholder="0"
            disabled={isWalk}
            className={`${inputCls} ${isWalk ? 'cursor-not-allowed opacity-30' : ''}`}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-owa-mist">Drop at</label>
        <input
          type="text"
          value={leg.alight_landmark}
          onChange={(e) => onChange({ alight_landmark: e.target.value })}
          placeholder="e.g. CMS Bus Stop"
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-owa-mist">Alight instruction</label>
        <textarea
          rows={focused === 'alight_instruction' ? 4 : 2}
          value={leg.alight_instruction}
          onFocus={() => setFocused('alight_instruction')}
          onBlur={() => setFocused(null)}
          onChange={(e) => onChange({ alight_instruction: e.target.value })}
          placeholder="e.g. Drop when you see the overhead bridge."
          className={`${inputCls} resize-none transition-[height] duration-150`}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-owa-mist">Step notes (optional)</label>
        <input
          type="text"
          value={leg.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="e.g. Avoid rush hours"
          className={inputCls}
        />
      </div>
    </div>
  );
}
