'use client';

import { useState } from 'react';
import { useCorrection } from '@/hooks/useCorrection';
import { Button } from '@/components/ui/Button';
import type { IssueType } from '@/types/route';

const ISSUE_OPTIONS: { value: IssueType; label: string }[] = [
  { value: 'wrong_landmark', label: 'Wrong landmark or location name' },
  { value: 'wrong_fare',     label: 'Fare is wrong or outdated' },
  { value: 'route_closed',   label: 'This route no longer runs' },
  { value: 'wrong_vehicle',  label: 'Wrong vehicle type' },
  { value: 'other',          label: 'Something else' },
];

interface CorrectionFormProps {
  routeId: string;
  legId?: string;
  stepNumber?: number;
  onSuccess: () => void;
}

export function CorrectionForm({ routeId, legId, stepNumber, onSuccess }: CorrectionFormProps) {
  const [issueType, setIssueType] = useState<IssueType | ''>('');
  const [description, setDescription] = useState('');
  const [inlineError, setInlineError] = useState('');

  const { submit, isSubmitting } = useCorrection({
    routeId,
    legId,
    onSuccess,
    onError: (msg) => setInlineError(msg),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInlineError('');

    if (!issueType) {
      setInlineError('Please select what type of issue this is.');
      return;
    }

    await submit(issueType, description);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {stepNumber && (
        <p className="text-sm text-gray-500">
          Flagging <span className="font-semibold text-gray-700">Step {stepNumber}</span>
        </p>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          What&apos;s the issue?
        </label>
        <div className="space-y-2">
          {ISSUE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="issue_type"
                value={opt.value}
                checked={issueType === opt.value}
                onChange={() => { setIssueType(opt.value); setInlineError(''); }}
                className="accent-owa-green"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-semibold text-gray-700">
          More details{' '}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={500}
          placeholder="e.g. The danfo no longer parks at this spot — they now load from the filling station further down"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm
            placeholder-gray-400 focus:border-owa-green focus:outline-none transition-colors resize-none"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{description.length}/500</p>
      </div>

      {inlineError && (
        <p role="alert" className="text-sm text-red-600 font-medium">
          {inlineError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Submit correction
      </Button>
    </form>
  );
}
