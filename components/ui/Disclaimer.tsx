import { AlertCircle } from 'lucide-react';

interface DisclaimerProps {
  flagged?: boolean;
  lastVerified?: string;
}

export function Disclaimer({ flagged, lastVerified }: DisclaimerProps) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm flex gap-2 items-start
      ${flagged
        ? 'border-amber-300 bg-amber-50 text-amber-800'
        : 'border-blue-200 bg-blue-50 text-blue-700'}`
    }>
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <div>
        {flagged && (
          <p className="font-semibold mb-0.5">This route has been flagged for review.</p>
        )}
        <p>
          Routes are manually maintained. Fares and routes may vary.
          {lastVerified && ` Last verified ${lastVerified}.`}
        </p>
      </div>
    </div>
  );
}
