import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-owa-night2/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tight text-owa-white transition-colors group-hover:text-owa-gold">
            owa<span className="text-owa-gold">.</span>
          </span>
          <span className="hidden text-xs text-owa-mist sm:block">Lagos, step by step.</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-sm font-medium text-owa-mist transition-colors hover:text-owa-gold"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
