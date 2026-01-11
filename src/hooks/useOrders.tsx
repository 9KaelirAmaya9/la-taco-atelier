import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

export type Order = Tables<'orders'> & {
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    prepared?: boolean;
  }>;
};

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'paid';

interface UseOrdersOptions {
  statusFilter?: OrderStatus[];
  limit?: number;
  enableRealtime?: boolean;
  onNewOrder?: (order: Order) => void;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const {
    statusFilter,
    limit = 100,
    enableRealtime = true,
    onNewOrder,
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const pendingUpdatesRef = useRef<Map<string, Partial<Order>>>(new Map());
  const previousOrdersRef = useRef<Set<string>>(new Set());

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
      // Flush pending updates
      flushPendingUpdates();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Changes will sync when connection is restored.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const flushPendingUpdates = useCallback(async () => {
    const updates = Array.from(pendingUpdatesRef.current.entries());
    for (const [orderId, update] of updates) {
      try {
        const { error } = await supabase
          .from('orders')
          .update(update)
          .eq('id', orderId);
        if (!error) {
          pendingUpdatesRef.current.delete(orderId);
        }
      } catch (err) {
        console.error('Failed to flush pending update:', err);
      }
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(limit);

      if (statusFilter && statusFilter.length > 0) {
        query = query.in('status', statusFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const ordersData = (data || []).map(order => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : [],
      })) as Order[];

      // Check for new orders
      const currentOrderIds = new Set(ordersData.map(o => o.id));
      if (previousOrdersRef.current.size > 0) {
        ordersData.forEach(order => {
          if (!previousOrdersRef.current.has(order.id)) {
            onNewOrder?.(order);
          }
        });
      }
      previousOrdersRef.current = currentOrderIds;

      setOrders(ordersData);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, limit, onNewOrder]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic update
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    if (!isOnline) {
      pendingUpdatesRef.current.set(orderId, { status: newStatus });
      toast.info('Update queued for when connection is restored');
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success(`Order marked as ${newStatus}`);
      return { success: true };
    } catch (err: any) {
      console.error('Error updating order:', err);
      toast.error('Failed to update order status');
      // Rollback
      fetchOrders();
      return { success: false, error: err.message };
    }
  }, [isOnline, fetchOrders]);

  const updateOrderItems = useCallback(async (orderId: string, items: Order['items']) => {
    // Optimistic update
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, items } : order
      )
    );

    if (!isOnline) {
      pendingUpdatesRef.current.set(orderId, { items: items as any });
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ items: items as any })
        .eq('id', orderId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error updating order items:', err);
      fetchOrders();
      return { success: false, error: err.message };
    }
  }, [isOnline, fetchOrders]);

  // Real-time subscription
  useEffect(() => {
    fetchOrders();

    if (!enableRealtime) return;

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = {
              ...payload.new,
              items: Array.isArray(payload.new.items) ? payload.new.items : [],
            } as Order;
            
            // Only add if it matches our filter
            if (!statusFilter || statusFilter.includes(newOrder.status as OrderStatus)) {
              setOrders(prev => {
                if (prev.find(o => o.id === newOrder.id)) return prev;
                return [...prev, newOrder].sort(
                  (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
              });
              onNewOrder?.(newOrder);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = {
              ...payload.new,
              items: Array.isArray(payload.new.items) ? payload.new.items : [],
            } as Order;
            
            setOrders(prev => {
              // If status changed and no longer matches filter, remove it
              if (statusFilter && !statusFilter.includes(updatedOrder.status as OrderStatus)) {
                return prev.filter(o => o.id !== updatedOrder.id);
              }
              // If it matches filter but wasn't in list, add it
              if (!prev.find(o => o.id === updatedOrder.id)) {
                return [...prev, updatedOrder].sort(
                  (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
              }
              // Otherwise update it
              return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
            });
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
          setLastUpdated(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(console.error);
    };
  }, [fetchOrders, enableRealtime, statusFilter, onNewOrder]);

  // Calculate metrics
  const metrics = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  return {
    orders,
    loading,
    error,
    isOnline,
    lastUpdated,
    metrics,
    refetch: fetchOrders,
    updateOrderStatus,
    updateOrderItems,
  };
}

// Hook for getting time-based urgency
export function useOrderUrgency(createdAt: string) {
  const [minutesElapsed, setMinutesElapsed] = useState(0);

  useEffect(() => {
    const calculateMinutes = () => {
      const elapsed = Math.floor(
        (Date.now() - new Date(createdAt).getTime()) / 60000
      );
      setMinutesElapsed(elapsed);
    };

    calculateMinutes();
    const interval = setInterval(calculateMinutes, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [createdAt]);

  const urgency: 'low' | 'medium' | 'high' = 
    minutesElapsed <= 5 ? 'low' :
    minutesElapsed <= 15 ? 'medium' : 'high';

  const color = {
    low: 'bg-serape-green',
    medium: 'bg-serape-yellow',
    high: 'bg-destructive',
  }[urgency];

  const textColor = {
    low: 'text-serape-green',
    medium: 'text-serape-yellow',
    high: 'text-destructive',
  }[urgency];

  return { minutesElapsed, urgency, color, textColor };
}
