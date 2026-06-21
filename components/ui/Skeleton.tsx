export function SkeletonLeg() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-16 rounded-full bg-gray-200" />
        <div className="h-5 w-24 rounded-full bg-gray-200" />
        <div className="h-5 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-5/6 rounded bg-gray-100" />
        <div className="h-4 w-4/6 rounded bg-gray-100" />
      </div>
      <div className="mt-4 h-4 w-3/4 rounded bg-gray-100" />
    </div>
  );
}

export function SkeletonRoute() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-6 w-32 rounded bg-gray-200" />
          <div className="h-6 w-24 rounded bg-gray-200" />
        </div>
        <div className="flex gap-4">
          <div className="h-8 w-28 rounded-full bg-gray-200" />
          <div className="h-8 w-20 rounded-full bg-gray-100" />
        </div>
      </div>
      <SkeletonLeg />
      <SkeletonLeg />
      <SkeletonLeg />
    </div>
  );
}
