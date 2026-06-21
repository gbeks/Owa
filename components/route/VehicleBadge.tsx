import type { VehicleType } from '@/types/route';

// Dark-theme vehicle colours matching OwaVisuals design system
const config: Record<VehicleType, { label: string; bg: string; color: string }> = {
  danfo:  { label: 'Danfo',      bg: 'rgba(201,150,58,0.15)',  color: '#C9963A' },
  brt:    { label: 'BRT',        bg: 'rgba(99,145,210,0.15)',  color: '#6391D2' },
  korope: { label: 'Korope',     bg: 'rgba(130,196,140,0.15)', color: '#82C48C' },
  keke:   { label: 'Keke Marwa', bg: 'rgba(196,168,130,0.20)', color: '#C4A882' },
  okada:  { label: 'Okada',      bg: 'rgba(192,57,43,0.15)',   color: '#E07070' },
  ferry:  { label: 'Ferry',      bg: 'rgba(36,113,163,0.18)',  color: '#5DADE2' },
  walk:   { label: 'Walk',       bg: 'rgba(142,155,174,0.12)', color: '#8E9BAE' },
};

interface VehicleBadgeProps {
  vehicle: VehicleType;
  size?: 'sm' | 'md';
}

export function VehicleBadge({ vehicle, size = 'md' }: VehicleBadgeProps) {
  const c = config[vehicle];
  const padClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[11px]';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold leading-none tracking-wide ${padClass}`}
      style={{ background: c.bg, color: c.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: c.color }}
        aria-hidden="true"
      />
      {c.label}
    </span>
  );
}
