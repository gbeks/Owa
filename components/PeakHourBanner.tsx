'use client';

import { useEffect, useState } from 'react';
import { isPeakHour } from '@/lib/peak';
import { Clock } from 'lucide-react';

export function PeakHourBanner() {
  const [isPeak, setIsPeak] = useState(false);

  useEffect(() => {
    setIsPeak(isPeakHour());
  }, []);

  if (!isPeak) return null;

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <Clock size={16} className="mt-0.5 shrink-0" />
      <p>
        <span className="font-semibold">Peak hours.</span>{' '}
        Fares may be higher than shown.
      </p>
    </div>
  );
}
