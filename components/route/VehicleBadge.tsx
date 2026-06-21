import type { VehicleType } from '@/types/route';

const config: Record<VehicleType, { label: string; bg: string; text: string; dot: string }> = {
  danfo:  { label: 'Danfo',        bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-danfo-yellow' },
  brt:    { label: 'BRT',          bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-brt-green'   },
  korope: { label: 'Korope',       bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500'  },
  keke:   { label: 'Keke Marwa',   bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-keke-orange'  },
  okada:  { label: 'Okada',        bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-okada-red'   },
  ferry:  { label: 'Ferry',        bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-ferry-blue'  },
  walk:   { label: 'Walk',         bg: 'bg-gray-100',   text: 'text-gray-700',   dot: 'bg-walk-gray'   },
};

interface VehicleBadgeProps {
  vehicle: VehicleType;
  size?: 'sm' | 'md';
}

export function VehicleBadge({ vehicle, size = 'md' }: VehicleBadgeProps) {
  const c = config[vehicle];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
        ${c.bg} ${c.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden="true" />
      {c.label}
    </span>
  );
}
