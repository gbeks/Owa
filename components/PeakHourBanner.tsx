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
    <div className="flex items-start gap-2.5 rounded-r-xl border-l-2 border-owa-gold bg-owa-gold/[0.07] px-4 py-3 text-sm">
      <Clock size={15} className="mt-0.5 shrink-0 text-owa-gold" />
      <p className="text-owa-sand">
        <span className="font-semibold text-owa-gold">Peak hours active.</span>{' '}
        Fares may be higher than shown.
      </p>
    </div>
  );
}
