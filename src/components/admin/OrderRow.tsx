import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Printer, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { printReceipt } from '@/utils/printReceipt';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/hooks/useOrders';

interface OrderRowProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  compact?: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-serape-yellow text-foreground',
  confirmed: 'bg-serape-blue text-white',
  preparing: 'bg-serape-blue text-white',
  ready: 'bg-serape-green text-white',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive text-white',
  paid: 'bg-serape-green text-white',
};

function OrderRowComponent({ order, onStatusChange, compact = false }: OrderRowProps) {
  const navigate = useNavigate();

  const handlePrint = () => {
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
      toast.success('Printing...');
    } catch (err) {
      toast.error('Print failed');
    }
  };

  const orderTime = useMemo(() => {
    return format(new Date(order.created_at), 'MMM dd, HH:mm');
  }, [order.created_at]);

  const itemCount = order.items.length;

  if (compact) {
    return (
      <div 
        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
        onClick={() => navigate('/admin/orders')}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Badge className={cn('shrink-0 text-xs', statusColors[order.status])}>
            {order.status}
          </Badge>
          <div className="min-w-0">
            <p className="font-semibold text-sm group-hover:text-primary truncate">
              {order.order_number}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {order.customer_name} • {itemCount} items
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-sm">${Number(order.total).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{orderTime}</p>
        </div>
      </div>
    );
  }

  return (
    <tr className="hover:bg-accent/50 transition-colors">
      <td className="py-3 px-4">
        <span className="font-semibold">{order.order_number}</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {orderTime}
        </div>
      </td>
      <td className="py-3 px-4">
        <div>
          <p className="font-medium">{order.customer_name}</p>
          <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge variant={order.order_type === 'delivery' ? 'default' : 'secondary'}>
          {order.order_type}
        </Badge>
      </td>
      <td className="py-3 px-4 text-sm">
        {itemCount} items
      </td>
      <td className="py-3 px-4 font-semibold">
        ${Number(order.total).toFixed(2)}
      </td>
      <td className="py-3 px-4">
        <Select
          value={order.status}
          onValueChange={(value) => onStatusChange(order.id, value as OrderStatus)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue>
              <Badge className={cn('text-xs', statusColors[order.status])}>
                {order.status}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="py-3 px-4">
        <Button variant="ghost" size="icon" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}

export const OrderRow = memo(OrderRowComponent);

// Compact order list for dashboard
interface RecentOrdersListProps {
  orders: Order[];
  maxItems?: number;
}

export function RecentOrdersList({ orders, maxItems = 10 }: RecentOrdersListProps) {
  const navigate = useNavigate();
  const displayOrders = orders.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders in real-time</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/admin/orders')}
          className="text-sm"
        >
          View All
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {displayOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent orders</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayOrders.map((order) => (
              <OrderRow key={order.id} order={order} onStatusChange={() => {}} compact />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
