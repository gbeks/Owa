import type { Metadata } from 'next';
import { AlertCircle, Database, Zap, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Owa',
  description: 'What Owa is, how it works, and how to help keep it accurate.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-2">About Owa</h1>
      <p className="text-gray-500 mb-8">Lagos, step by step.</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Zap size={18} className="text-owa-green" /> What is Owa?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Owa is a public transport direction tool built for everyday Lagos commuters. Type where you are
            and where you&apos;re going — we&apos;ll break down your journey into clear numbered steps: which bus
            to board, what to tell the conductor, where to drop, and how much it will cost.
          </p>
          <p className="mt-3 text-gray-600 leading-relaxed">
            The word &ldquo;Owa&rdquo; is what conductors shout as their danfo approaches a bus stop. It means
            arrival, movement, belonging. That&apos;s what this app does for Lagos commuters navigating an
            unfamiliar route.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Database size={18} className="text-owa-green" /> How the data works
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Owa does not use Google Maps, a live API, or GPS. Every route is manually researched and
            written by someone who has taken it. Fare estimates reflect real market rates as of June 2026
            — they will drift over time as fuel prices change.
          </p>
          <p className="mt-3 text-gray-600 leading-relaxed">
            The directions are written in plain English, then refined by an AI model (Claude) to make them
            sound natural — the way a knowledgeable Lagosian would explain a route to someone new. The AI
            never invents stops, landmarks, or fares. It only reformats what we already know.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <AlertCircle size={18} className="text-owa-green" /> Accuracy disclaimer
          </h2>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 space-y-2">
            <p className="font-semibold">Please read this before relying on Owa for a trip:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Routes are manually maintained — we are not connected to live transit data.</li>
              <li>Danfo fares change frequently, especially when fuel prices shift.</li>
              <li>Bus stops occasionally move or close without notice.</li>
              <li>Always carry extra cash in case fares are higher than shown.</li>
              <li>When in doubt, ask a conductor or fellow passenger to confirm.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Users size={18} className="text-owa-green" /> Help keep it accurate
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Owa gets better when commuters flag wrong information. On any route result, tap{' '}
            <span className="font-semibold text-gray-800">&ldquo;Flag step&rdquo;</span> to report
            an incorrect landmark, wrong fare, or a route that no longer runs. You don&apos;t need an account.
            Every report is reviewed by the maintainer.
          </p>
        </section>
      </div>
    </div>
  );
}
