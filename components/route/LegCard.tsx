'use client';

import { useState } from 'react';
import { MapPin, ArrowDown } from 'lucide-react';
import { VehicleBadge } from './VehicleBadge';
import { FareRange } from './FareRange';
import { FlagButton } from './FlagButton';
import { CorrectionModal } from '@/components/corrections/CorrectionModal';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import type { RouteLeg } from '@/types/route';

interface LegCardProps {
  leg: RouteLeg & { formatted_prose: string };
  routeId: string;
}

export function LegCard({ leg, routeId }: LegCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  return (
    <>
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
              {leg.step_number}
            </span>
            <VehicleBadge vehicle={leg.vehicle} />
          </div>
          <FareRange min={leg.fare_min} max={leg.fare_max} />
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className="h-2.5 w-2.5 rounded-full bg-owa-green" />
              <div className="my-1 w-0.5 flex-1 bg-gray-200" style={{ minHeight: '2rem' }} />
              <div className="h-2.5 w-2.5 rounded-full border-2 border-owa-green bg-white" />
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
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                  Drop at
                </p>
                <p className="text-sm font-semibold text-gray-900 flex items-start gap-1.5">
                  <ArrowDown size={13} className="mt-0.5 shrink-0 text-gray-400" />
                  {leg.alight_landmark}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-sm leading-relaxed text-gray-700">{leg.formatted_prose}</p>
          </div>

          {leg.duration_estimate_mins && (
            <p className="text-xs text-gray-400">
              ~{leg.duration_estimate_mins} min estimated
            </p>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-50 px-4 py-2.5">
          <FlagButton onClick={() => setModalOpen(true)} />
        </div>
      </div>

      <CorrectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        routeId={routeId}
        legId={leg.leg_id}
        stepNumber={leg.step_number}
        onSuccess={() => addToast("Thanks for the correction. We'll review this route soon.", 'success')}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
