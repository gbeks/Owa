import { VehicleBadge } from './VehicleBadge';
import { FareRange } from './FareRange';
import type { RouteLeg } from '@/types/route';

interface DirectionsStepProps {
  leg: RouteLeg;
  isLast: boolean;
}

export function DirectionsStep({ leg, isLast }: DirectionsStepProps) {
  const unverifiedFare = !leg.fare_min && !leg.fare_max;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-owa-card shadow-lg shadow-black/20">
      {/* Step header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-owa-gold/15 text-xs font-bold text-owa-gold">
            {leg.step_number}
          </span>
          <VehicleBadge vehicle={leg.vehicle} />
        </div>
        {leg.vehicle !== 'walk' && (
          <FareRange min={leg.fare_min} max={leg.fare_max} />
        )}
      </div>

      {/* Body */}
      <div className="space-y-3 p-4">

        {/* Board → Drop connector */}
        <div className="flex gap-3">
          <div className="flex shrink-0 flex-col items-center pt-1">
            <div className="h-2 w-2 rounded-full bg-owa-gold" />
            {leg.alight_landmark && (
              <>
                <div
                  className="my-1 w-px flex-1"
                  style={{
                    minHeight: '1.75rem',
                    background: 'linear-gradient(to bottom, rgba(201,150,58,0.4), rgba(201,150,58,0.05))',
                  }}
                />
                <div className="h-2 w-2 rounded-full bg-owa-gold/40" />
              </>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-owa-mist">
                Board at
              </p>
              <p className="text-sm font-medium text-owa-white">{leg.board_landmark}</p>
            </div>
            {leg.alight_landmark && (
              <div>
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-owa-mist">
                  Drop at
                </p>
                <p className="text-sm font-medium text-owa-sand">{leg.alight_landmark}</p>
              </div>
            )}
          </div>
        </div>

        {/* Instruction blocks */}
        <div className="rounded-xl bg-owa-night3 px-4 py-3">
          <p className="text-sm leading-relaxed text-owa-white/80">{leg.board_instruction}</p>
        </div>

        {leg.alight_instruction && (
          <div className="rounded-xl bg-owa-night3 px-4 py-3">
            <p className="text-sm leading-relaxed text-owa-white/80">{leg.alight_instruction}</p>
          </div>
        )}

        {leg.notes && (
          <p className="text-xs italic text-owa-mist/70">{leg.notes}</p>
        )}

        {unverifiedFare && (
          <p className="text-xs text-amber-400/80">
            Fare estimate unconfirmed. Verify with conductor.
          </p>
        )}

        {leg.duration_estimate_mins ? (
          <p className="text-xs text-owa-mist">~{leg.duration_estimate_mins} min estimated</p>
        ) : null}
      </div>
    </div>
  );
}
