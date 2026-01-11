import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  isLive?: boolean;
}

function MetricCardComponent({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'text-primary',
  isLive = false,
}: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg bg-opacity-10', color.replace('text-', 'bg-'))}>
          <Icon className={cn('h-4 w-4', color)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <div className={cn(
              'flex items-center text-xs font-medium',
              trend.isPositive ? 'text-serape-green' : 'text-destructive'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
      </CardContent>
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-2 right-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-serape-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-serape-green"></span>
          </span>
        </div>
      )}
    </Card>
  );
}

export const MetricCard = memo(MetricCardComponent);

// Pre-configured metric types for common use cases
export const TodayOrdersMetric = memo(({ value, isLive }: { value: number; isLive?: boolean }) => (
  <MetricCard
    title="Today's Orders"
    value={value}
    description="Orders placed today"
    icon={ShoppingBag}
    color="text-serape-blue"
    isLive={isLive}
  />
));

export const TodayRevenueMetric = memo(({ value, isLive }: { value: number; isLive?: boolean }) => (
  <MetricCard
    title="Today's Revenue"
    value={`$${value.toFixed(2)}`}
    description="Total earnings today"
    icon={DollarSign}
    color="text-serape-green"
    isLive={isLive}
  />
));

export const PendingOrdersMetric = memo(({ value, isLive }: { value: number; isLive?: boolean }) => (
  <MetricCard
    title="Pending Orders"
    value={value}
    description="Awaiting confirmation"
    icon={Clock}
    color="text-serape-orange"
    isLive={isLive}
  />
));

export const TotalOrdersMetric = memo(({ value }: { value: number }) => (
  <MetricCard
    title="Total Orders"
    value={value}
    description="All time orders"
    icon={TrendingUp}
    color="text-serape-purple"
  />
));

export const CompletedOrdersMetric = memo(({ value }: { value: number }) => (
  <MetricCard
    title="Completed"
    value={value}
    description="Successfully fulfilled"
    icon={CheckCircle}
    color="text-serape-green"
  />
));

export const CancelledOrdersMetric = memo(({ value }: { value: number }) => (
  <MetricCard
    title="Cancelled"
    value={value}
    description="Order cancellations"
    icon={XCircle}
    color="text-destructive"
  />
));
