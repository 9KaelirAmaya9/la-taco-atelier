import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, Package, ChefHat, Printer } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { printReceipt } from "@/utils/printReceipt";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  delivery_address?: string | null;
  notes?: string | null;
  created_at: string;
}

const Kitchen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["pending", "preparing"])
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Failed to fetch orders");
      console.error(error);
    } else {
      setOrders((data || []) as unknown as Order[]);
    }
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status");
      console.error(error);
    } else {
      toast.success("Order status updated");
      fetchOrders();
    }
  };

  const handlePrintReceipt = (order: Order) => {
    try {
      printReceipt({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        orderType: order.order_type,
        items: order.items,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        total: Number(order.total),
        deliveryAddress: order.delivery_address || undefined,
        notes: order.notes || undefined,
        createdAt: order.created_at,
      });
      toast.success('Printing receipt...');
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print receipt');
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up realtime subscription
    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusColor = (status: string) => {
    return status === "pending" ? "bg-yellow-500" : "bg-blue-500";
  };

  const getTimeElapsed = (createdAt: string) => {
    const minutes = Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) / 60000
    );
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <ChefHat className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="kitchen">
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-4xl font-bold">Kitchen Display</h1>
                <p className="text-muted-foreground">
                  {orders.length} active {orders.length === 1 ? "order" : "orders"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Auto-refreshing</p>
              <p className="text-2xl font-bold">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No Active Orders</h2>
            <p className="text-muted-foreground">
              All orders are completed or ready for pickup
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="border-2 hover:shadow-lg transition-shadow"
              >
                <CardHeader className={`${getStatusColor(order.status)} text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl font-bold mb-1">
                        {order.order_number.split("-")[2]}
                      </CardTitle>
                      <p className="text-sm opacity-90 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {getTimeElapsed(order.created_at)} ago
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-lg px-3 py-1 font-semibold bg-white/20"
                    >
                      {order.order_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Customer</p>
                    <p className="font-semibold text-lg">{order.customer_name}</p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-3 font-semibold">
                      Items:
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-muted/50 p-3 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center">
                              {item.quantity}
                            </span>
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.status === "pending" && (
                      <Button
                        onClick={() => updateStatus(order.id, "preparing")}
                        className="w-full text-base font-semibold"
                        size="lg"
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === "preparing" && (
                      <Button
                        onClick={() => updateStatus(order.id, "ready")}
                        className="w-full text-base font-semibold"
                        size="lg"
                      >
                        Mark Ready
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handlePrintReceipt(order)}
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Printer className="h-4 w-4" />
                      Print Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Kitchen;
