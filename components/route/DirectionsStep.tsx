import { MapPin } from 'lucide-react';
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
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
            {leg.step_number}
          </span>
          <VehicleBadge vehicle={leg.vehicle} />
        </div>
        {leg.vehicle !== 'walk' && (
          <FareRange min={leg.fare_min} max={leg.fare_max} />
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center pt-1">
            <div className="h-2.5 w-2.5 rounded-full bg-owa-green" />
            {!isLast && (
              <div className="my-1 w-0.5 flex-1 bg-gray-200" style={{ minHeight: '2rem' }} />
            )}
            {!isLast && (
              <div className="h-2.5 w-2.5 rounded-full border-2 border-owa-green bg-white" />
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                Board at
              </p>
              <p className="text-sm font-semibold text-gray-900 flex items-start gap-1.5">
                <MapPin size={13} className="mt-0.5 shrink-0 text-owa-green" />
                {leg.board_landmark}
              </p>
            </div>
            {leg.alight_landmark && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                  Drop at
                </p>
                <p className="text-sm font-semibold text-gray-900 flex items-start gap-1.5">
                  <MapPin size={13} className="mt-0.5 shrink-0 text-gray-400" />
                  {leg.alight_landmark}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-sm leading-relaxed text-gray-700">{leg.board_instruction}</p>
        </div>

        {leg.alight_instruction && (
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-sm leading-relaxed text-gray-700">{leg.alight_instruction}</p>
          </div>
        )}

        {leg.notes && (
          <p className="text-xs text-gray-400 italic">{leg.notes}</p>
        )}

        {unverifiedFare && (
          <p className="text-xs text-amber-600">
            Fare estimate unconfirmed. Verify with conductor.
          </p>
        )}

        {leg.duration_estimate_mins ? (
          <p className="text-xs text-gray-400">~{leg.duration_estimate_mins} min estimated</p>
        ) : null}
      </div>
    </div>
  );
}
