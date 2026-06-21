import { SearchForm } from '@/components/search/SearchForm';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
          <span className="text-owa-green">Owa.</span>
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Lagos, step by step.
        </p>
        <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
          Enter where you are and where you&apos;re going. We&apos;ll tell you exactly which bus to board, what to tell the conductor, and what it will cost.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <SearchForm />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        {[
          { icon: '🚌', label: 'Danfo routes' },
          { icon: '🚍', label: 'BRT lines' },
          { icon: '🛺', label: 'Keke & Okada' },
        ].map(({ icon, label }) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-white px-3 py-4">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-xs font-medium text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Covering 25+ Lagos corridors · Fares updated June 2026
      </p>
    </div>
  );
}
