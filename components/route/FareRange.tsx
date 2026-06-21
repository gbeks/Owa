interface FareRangeProps {
  min: number;
  max: number;
  size?: 'sm' | 'lg';
  label?: string;
}

export function FareRange({ min, max, size = 'sm', label }: FareRangeProps) {
  return (
    <div className="flex flex-col items-end">
      {label && <span className="mb-0.5 text-xs text-owa-mist">{label}</span>}
      <span
        className={`font-mono font-bold text-owa-gold tabular-nums ${size === 'lg' ? 'text-2xl' : 'text-sm'}`}
      >
        ₦{min.toLocaleString()}
        {min !== max && (
          <span className="font-normal text-owa-sand"> – ₦{max.toLocaleString()}</span>
        )}
      </span>
    </div>
  );
}
