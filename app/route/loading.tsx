import { SkeletonRoute } from '@/components/ui/Skeleton';

export default function RouteLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <SkeletonRoute />
    </div>
  );
}
