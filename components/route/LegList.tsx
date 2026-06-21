import { LegCard } from './LegCard';
import type { RouteLeg } from '@/types/route';

interface LegListProps {
  legs: (RouteLeg & { formatted_prose: string })[];
  routeId: string;
}

export function LegList({ legs, routeId }: LegListProps) {
  return (
    <ol className="space-y-3" aria-label="Journey steps">
      {legs.map((leg) => (
        <li key={leg.leg_id}>
          <LegCard leg={leg} routeId={routeId} />
        </li>
      ))}
    </ol>
  );
}
