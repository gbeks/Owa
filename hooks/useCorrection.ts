'use client';

import { useState } from 'react';
import type { IssueType } from '@/types/route';

interface UseCorrectionOptions {
  routeId: string;
  legId?: string;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export function useCorrection({ routeId, legId, onSuccess, onError }: UseCorrectionOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(issueType: IssueType, description: string) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route_id: routeId,
          leg_id: legId ?? null,
          issue_type: issueType,
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        onError?.(data.error ?? 'Something went wrong. Please try again.');
        return false;
      }

      onSuccess?.();
      return true;
    } catch {
      onError?.('Network error. Please check your connection and try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submit, isSubmitting };
}
