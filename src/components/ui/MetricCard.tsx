import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Metric, MetricValue } from '../../types';
import { cn, formatNumber } from '../../lib/utils';

interface MetricCardProps {
  metric: Metric;
  value: MetricValue | null;
  status: 'green' | 'yellow' | 'red';
  trend: 'improving' | 'stable' | 'declining';
  changePercent?: number;
  onClick?: () => void;
}

export default function MetricCard({
  metric,
  value,
  status,
  trend,
  changePercent,
  onClick,
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'card cursor-pointer transition-all duration-200 hover:shadow-card-hover border-l-4',
        status === 'green' && 'border-l-compliance-green',
        status === 'yellow' && 'border-l-compliance-yellow',
        status === 'red' && 'border-l-compliance-red'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">{metric.shortName}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value ? `${formatNumber(value.value, 1)}${metric.unit}` : '--'}
          </p>
        </div>
        <div className={cn(
          'w-3 h-3 rounded-full flex-shrink-0',
          status === 'green' && 'bg-compliance-green',
          status === 'yellow' && 'bg-compliance-yellow',
          status === 'red' && 'bg-compliance-red'
        )} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          {changePercent !== undefined && (
            <span className={cn('text-sm font-medium', getTrendColor())}>
              {changePercent > 0 ? '+' : ''}{formatNumber(changePercent, 1)}%
            </span>
          )}
        </div>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full',
          status === 'green' && 'bg-green-100 text-green-700',
          status === 'yellow' && 'bg-yellow-100 text-yellow-700',
          status === 'red' && 'bg-red-100 text-red-700'
        )}>
          {status}
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-500 line-clamp-2">{metric.description.slice(0, 80)}...</p>
    </div>
  );
}
