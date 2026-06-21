'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { ContributionType } from '@/lib/supabase';

interface ContributeFormProps {
  type: ContributionType;
  routeId?: string;
  routeLabel?: string;
  prefillOrigin?: string;
  prefillDestination?: string;
}

export function ContributeForm({
  type,
  routeId,
  routeLabel,
  prefillOrigin,
  prefillDestination,
}: ContributeFormProps) {
  const [origin, setOrigin] = useState(prefillOrigin ?? '');
  const [destination, setDestination] = useState(prefillDestination ?? '');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          route_id: routeId,
          origin: origin || undefined,
          destination: destination || undefined,
          description,
          submitter_contact: contact || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Submission failed');
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="py-8 text-center space-y-2">
        <p className="text-2xl">✓</p>
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Correction: show the pre-filled route context */}
      {type === 'correction' && routeLabel && (
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Route: <span className="font-semibold">{routeLabel}</span>
        </div>
      )}

      {/* New route: origin + destination */}
      {type === 'new_route' && (
        <>
          <div>
            <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
              Origin *
            </label>
            <input
              id="origin"
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Ojuelegba"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-owa-green focus:outline-none focus:ring-1 focus:ring-owa-green"
            />
          </div>
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
              Destination *
            </label>
            <input
              id="destination"
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Ketu Garage"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-owa-green focus:outline-none focus:ring-1 focus:ring-owa-green"
            />
          </div>
        </>
      )}

      {/* Description field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          {type === 'correction' ? 'What\'s wrong and what should it say? *' : 'Step-by-step directions *'}
        </label>
        <textarea
          id="description"
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            type === 'correction'
              ? 'e.g. The boarding point is wrong — it should be in front of GTB, not Ecobank. Fare is also outdated, it\'s now ₦500.'
              : 'e.g. Board a danfo from Lawanson calling "CMS". Drop at Ojuelegba. Then take a korope to Ketu Garage...'
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-owa-green focus:outline-none focus:ring-1 focus:ring-owa-green"
        />
      </div>

      {/* Optional contact */}
      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp number <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="contact"
          type="tel"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="e.g. 08012345678"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-owa-green focus:outline-none focus:ring-1 focus:ring-owa-green"
        />
      </div>

      {status === 'error' && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
          {errorMsg}
        </p>
      )}

      <Button type="submit" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? 'Submitting…' : 'Submit'}
      </Button>
    </form>
  );
}
