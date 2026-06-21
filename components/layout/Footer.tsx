export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="mx-auto max-w-2xl px-4 py-6 text-center text-sm text-gray-400 space-y-1">
        <p>
          Route data is manually maintained by the Owa community.
          Fares and routes change — always carry a little extra cash.
        </p>
        <p>
          See something wrong?{' '}
          <span className="text-owa-green font-medium">Tap &quot;Flag this step&quot;</span>{' '}
          on any route to submit a correction.
        </p>
      </div>
    </footer>
  );
}
