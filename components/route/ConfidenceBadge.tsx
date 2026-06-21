import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const config = {
  high:   { icon: CheckCircle,   color: 'text-owa-gold',   label: 'Verified' },
  medium: { icon: Clock,         color: 'text-owa-sand',   label: 'Approx.' },
  low:    { icon: AlertTriangle, color: 'text-red-400',    label: 'Unconfirmed' },
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
      <Icon size={12} />
      <span>{label} · {formatted}</span>
    </div>
  );
}
