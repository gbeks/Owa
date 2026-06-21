import { ArrowRight } from 'lucide-react';
import type { Route } from '@/types/route';

interface RouteChipProps {
  route: Route;
}

export function RouteChip({ route }: RouteChipProps) {
  return (
    <a
      href={`/results?from=${route.origin_id}&to=${route.destination_id}`}
      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2
        text-sm font-medium text-gray-700 hover:border-owa-green hover:text-owa-green
        transition-colors shadow-sm whitespace-nowrap"
    >
      <span>{route.origin_label}</span>
      <ArrowRight size={13} className="shrink-0 text-gray-400" />
      <span>{route.destination_label}</span>
    </a>
  );
}
