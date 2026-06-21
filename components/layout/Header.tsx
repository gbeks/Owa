import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tight text-owa-green group-hover:text-owa-green-light transition-colors">
            Owa
          </span>
          <span className="hidden text-xs text-gray-400 sm:block">Lagos, step by step.</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-sm font-medium text-gray-500 hover:text-owa-green transition-colors"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
