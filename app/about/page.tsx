import type { Metadata } from 'next';
import { AlertCircle, Database, Zap, Users, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How Owa works',
  description: 'What Owa is, how it works, and how to help keep it accurate.',
};

const sections = [
  {
    icon: Zap,
    heading: 'What it does',
    content: (
      <p className="text-sm leading-relaxed text-owa-mist">
        Owa is a public transport direction tool built for everyday Lagos commuters. Type where you
        are and where you&apos;re going — we&apos;ll break down your journey into clear numbered
        steps: which bus to board, what to tell the conductor, where to drop, and how much it will
        cost.
      </p>
    ),
  },
  {
    icon: Database,
    heading: 'How the data works',
    content: (
      <p className="text-sm leading-relaxed text-owa-mist">
        Owa does not use Google Maps, a live API, or GPS. Every route is manually researched and
        written by someone who has taken it.
      </p>
    ),
  },
  {
    icon: AlertCircle,
    heading: 'A few things to keep in mind',
    content: (
      <div className="space-y-2.5 rounded-r-xl border-l-2 border-owa-gold/40 bg-owa-night3 px-4 py-4">
        {[
          'Routes are manually maintained — we are not connected to live transit data.',
          'Danfo fares change frequently, especially when fuel prices shift.',
          'Bus stops occasionally move or close without notice.',
          'Always carry extra cash in case fares are higher than shown.',
          'When in doubt, ask a conductor or fellow passenger to confirm.',
        ].map((item) => (
          <div key={item} className="flex items-start gap-2.5">
            <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-owa-gold/50" />
            <p className="text-sm leading-relaxed text-owa-mist">{item}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Users,
    heading: 'Help keep it accurate',
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-owa-mist">
          Owa gets better when commuters flag wrong information. On any route result, tap{' '}
          <span className="font-semibold text-owa-white">&ldquo;Report a problem&rdquo;</span> to
          flag an incorrect landmark, wrong fare, or a route that no longer runs. You don&apos;t
          need an account — every report is reviewed by the maintainer.
        </p>
        <a
          href="/contribute"
          className="inline-flex items-center gap-2 rounded-xl border border-owa-gold/30 bg-owa-gold/10 px-4 py-2.5 text-sm font-semibold text-owa-gold transition-colors hover:bg-owa-gold/20"
        >
          Submit a route
          <ArrowRight size={14} />
        </a>
      </div>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">

      {/* Back nav */}
      <a
        href="/"
        className="mb-8 block text-sm text-owa-mist transition-colors hover:text-owa-gold"
      >
        ← Back to search
      </a>

      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-owa-white">How Owa works</h1>
        <p className="mt-1.5 text-sm text-owa-mist">Lagos transit, step by step.</p>
      </div>

      {/* Sections */}
      <div className="rounded-2xl border border-white/[0.06] bg-owa-card shadow-xl shadow-black/25">
        {sections.map(({ icon: Icon, heading, content }, i) => (
          <div key={heading}>
            {i > 0 && <div className="mx-5 border-t border-white/[0.06]" />}
            <section className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-owa-gold/10">
                  <Icon size={15} className="text-owa-gold" />
                </div>
                <h2 className="font-bold text-owa-white">{heading}</h2>
              </div>
              {content}
            </section>
          </div>
        ))}
      </div>

      {/* Contributor credit */}
      <p className="mt-6 text-center text-xs text-owa-mist/40">
        Built with local knowledge from Lagos commuters.
      </p>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-owa-gold px-6 py-3 text-sm font-bold text-owa-night transition-colors hover:bg-owa-gold-bright"
        >
          Start searching
          <ArrowRight size={15} />
        </a>
      </div>

    </div>
  );
}
