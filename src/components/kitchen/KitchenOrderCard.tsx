import { useState, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Printer, ChefHat, CheckCircle2, AlertTriangle, Flame, Droplets, Layers, GlassWater } from 'lucide-react';
import { cn } from '@/lib/utils';
import { printReceipt } from '@/utils/printReceipt';
import { toast } from 'sonner';
import type { Order } from '@/hooks/useOrders';
import { useOrderUrgency } from '@/hooks/useOrders';
import { getItemStation, type Station } from './StationFilter';

interface KitchenOrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onItemPrepared: (orderId: string, itemIndex: number, prepared: boolean) => void;
  highlightStation?: Station;
}

const stationIcons: Record<Station, React.ReactNode> = {
  all: null,
  grill: <Flame className="h-3 w-3" />,
  fryer: <Droplets className="h-3 w-3" />,
  assembly: <Layers className="h-3 w-3" />,
  drinks: <GlassWater className="h-3 w-3" />,
};

function KitchenOrderCardComponent({
  order,
  onStatusChange,
  onItemPrepared,
  highlightStation,
}: KitchenOrderCardProps) {
  const { minutesElapsed, urgency, color } = useOrderUrgency(order.created_at);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = useCallback(async (newStatus: string) => {
    setIsUpdating(true);
    await onStatusChange(order.id, newStatus);
    setIsUpdating(false);
  }, [order.id, onStatusChange]);

  const handlePrint = useCallback(() => {
    try {
      printReceipt({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        orderType: order.order_type,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        total: Number(order.total),
        deliveryAddress: order.delivery_address || undefined,
        notes: order.notes || undefined,
        createdAt: order.created_at,
      });
      toast.success('Printing receipt...');
    } catch (err) {
      console.error('Print error:', err);
      toast.error('Failed to print');
    }
  }, [order]);

  const allItemsPrepared = order.items.every(item => item.prepared);
  const orderNumber = order.order_number.split('-').pop() || order.order_number;

  // Urgency styling
  const urgencyStyles = {
    low: {
      header: 'bg-serape-green text-white',
      border: 'border-serape-green',
      icon: null,
    },
    medium: {
      header: 'bg-serape-yellow text-foreground',
      border: 'border-serape-yellow',
      icon: <Clock className="h-6 w-6" />,
    },
    high: {
      header: 'bg-destructive text-white animate-pulse',
      border: 'border-destructive',
      icon: <AlertTriangle className="h-6 w-6" />,
    },
  };

  const styles = urgencyStyles[urgency];

  return (
    <Card className={cn(
      'border-4 transition-all duration-300 flex flex-col h-full',
      styles.border,
      order.status === 'preparing' && 'ring-4 ring-serape-blue ring-opacity-50'
    )}>
      {/* Header with order info and timer */}
      <CardHeader className={cn('p-4 md:p-6', styles.header)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                #{orderNumber}
              </span>
              {styles.icon}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="h-5 w-5" />
              <span className="text-lg md:text-xl font-medium">
                {minutesElapsed < 1 ? 'Just now' : `${minutesElapsed} min`}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="secondary"
              className="text-lg md:text-xl px-4 py-2 font-semibold bg-white/20 backdrop-blur-sm"
            >
              {order.order_type}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'text-sm px-3 py-1 font-medium bg-white/10',
                order.status === 'pending' && 'border-yellow-300',
                order.status === 'preparing' && 'border-blue-300'
              )}
            >
              {order.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 flex-1 flex flex-col">
        {/* Customer info */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Customer</p>
          <p className="font-semibold text-xl md:text-2xl truncate">{order.customer_name}</p>
        </div>

        {/* Special instructions - prominently displayed */}
        {order.notes && (
          <div className="mb-4 p-3 bg-serape-yellow/10 border-2 border-serape-yellow rounded-lg">
            <p className="text-sm font-medium text-serape-yellow-dark flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Special Instructions
            </p>
            <p className="text-base md:text-lg font-medium mt-1">{order.notes}</p>
          </div>
        )}

        {/* Delivery address */}
        {order.order_type === 'delivery' && order.delivery_address && (
          <div className="mb-4 p-3 bg-serape-blue/10 border border-serape-blue/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Delivery to</p>
            <p className="font-medium text-sm">{order.delivery_address}</p>
          </div>
        )}

        {/* Items with checkboxes */}
        <div className="flex-1 mb-4">
          <p className="text-sm text-muted-foreground mb-3 font-semibold">
            Items ({order.items.length})
          </p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {order.items.map((item, idx) => {
              const itemStation = getItemStation(item.name);
              const isHighlighted = highlightStation && itemStation === highlightStation;
              
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-all',
                    item.prepared 
                      ? 'bg-serape-green/10 border border-serape-green/30' 
                      : isHighlighted
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted/50'
                  )}
                >
                  <Checkbox
                    checked={item.prepared || false}
                    onCheckedChange={(checked) => onItemPrepared(order.id, idx, !!checked)}
                    className="h-6 w-6"
                  />
                  <span className={cn(
                    'font-bold text-2xl md:text-3xl bg-primary text-primary-foreground rounded-full h-10 w-10 md:h-12 md:w-12 flex items-center justify-center shrink-0',
                    item.prepared && 'bg-serape-green'
                  )}>
                    {item.quantity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      'font-medium text-lg md:text-xl block truncate',
                      item.prepared && 'line-through text-muted-foreground'
                    )}>
                      {item.name}
                    </span>
                    {stationIcons[itemStation] && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        {stationIcons[itemStation]}
                        {itemStation.charAt(0).toUpperCase() + itemStation.slice(1)}
                      </span>
                    )}
                  </div>
                  {item.prepared && (
                    <CheckCircle2 className="h-5 w-5 text-serape-green shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons - large touch targets */}
        <div className="space-y-3 mt-auto">
          {order.status === 'pending' && (
            <Button
              onClick={() => handleStatusChange('preparing')}
              disabled={isUpdating}
              className="w-full text-xl md:text-2xl font-semibold h-14 md:h-16 bg-serape-blue hover:bg-serape-blue-dark"
            >
              <ChefHat className="h-6 w-6 mr-2" />
              Start Preparing
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button
              onClick={() => handleStatusChange('ready')}
              disabled={isUpdating || !allItemsPrepared}
              className={cn(
                'w-full text-xl md:text-2xl font-semibold h-14 md:h-16',
                allItemsPrepared 
                  ? 'bg-serape-green hover:bg-serape-green-dark' 
                  : 'bg-muted'
              )}
            >
              <CheckCircle2 className="h-6 w-6 mr-2" />
              {allItemsPrepared ? 'Mark Ready' : `${order.items.filter(i => i.prepared).length}/${order.items.length} Items Done`}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handlePrint}
            className="w-full gap-2 text-lg h-12"
          >
            <Printer className="h-5 w-5" />
            Print Ticket
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const KitchenOrderCard = memo(KitchenOrderCardComponent);
