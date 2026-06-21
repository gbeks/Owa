'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-black text-gray-100">500</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-800">Something went wrong</h1>
      <p className="mt-2 text-gray-500">We hit an unexpected error. Please try again.</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-owa-green px-6 py-3 text-sm font-semibold text-white
            hover:bg-owa-green-light transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold
            text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
