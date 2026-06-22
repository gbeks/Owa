export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-owa-night">
      <div className="mx-auto max-w-2xl space-y-1 px-4 py-6 text-center text-sm text-owa-mist">
        <p>
          Route data is manually maintained by the Owa community.
          Fares and routes change — always carry a little extra cash.
        </p>
        <p>
          See something wrong?{' '}
          <span className="font-medium text-owa-gold">Tap &quot;Flag this step&quot;</span>{' '}
          on any route to submit a correction.
        </p>
      </div>
    </footer>
  );
}
