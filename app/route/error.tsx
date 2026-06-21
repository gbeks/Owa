'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RouteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[route page]', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Couldn&apos;t load this route</h2>
      <p className="text-gray-500 mb-6">Something went wrong fetching directions. Please try again.</p>
      <div className="flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-owa-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-owa-green-light"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          New search
        </Link>
      </div>
    </div>
  );
}
