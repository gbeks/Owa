import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-black text-gray-100">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-800">Page not found</h1>
      <p className="mt-2 text-gray-500">This page doesn&apos;t exist. Let&apos;s get you back on track.</p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-owa-green px-6 py-3 text-sm font-semibold text-white
          hover:bg-owa-green-light transition-colors"
      >
        Back to search
      </Link>
    </div>
  );
}
