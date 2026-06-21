interface FareRangeProps {
  min: number;
  max: number;
  size?: 'sm' | 'lg';
  label?: string;
}

export function FareRange({ min, max, size = 'sm', label }: FareRangeProps) {
  return (
    <div className="flex flex-col items-end">
      {label && <span className="text-xs text-gray-400 mb-0.5">{label}</span>}
      <span
        className={`font-bold text-gray-800 tabular-nums ${size === 'lg' ? 'text-2xl' : 'text-base'}`}
      >
        ₦{min.toLocaleString()}
        {min !== max && <span className="font-normal text-gray-500"> – ₦{max.toLocaleString()}</span>}
      </span>
    </div>
  );
}
