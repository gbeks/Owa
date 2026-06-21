import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const config = {
  high:   { icon: CheckCircle,    color: 'text-green-600',  label: 'High confidence' },
  medium: { icon: Clock,          color: 'text-amber-600',  label: 'Medium confidence' },
  low:    { icon: AlertTriangle,  color: 'text-red-500',    label: 'Low confidence' },
};

interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low';
  lastVerified: string;
}

export function ConfidenceBadge({ confidence, lastVerified }: ConfidenceBadgeProps) {
  const { icon: Icon, color, label } = config[confidence];

  const date = new Date(lastVerified);
  const formatted = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
      <Icon size={13} />
      <span>
        {label} · Verified {formatted}
      </span>
    </div>
  );
}
