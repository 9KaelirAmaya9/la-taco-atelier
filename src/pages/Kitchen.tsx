import { useCallback, useEffect, useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useOrders, type Order, type OrderStatus } from '@/hooks/useOrders';
import { useAudioAlerts } from '@/hooks/useAudioAlerts';
import { KitchenHeader } from '@/components/kitchen/KitchenHeader';
import { KitchenOrderCard } from '@/components/kitchen/KitchenOrderCard';
import { StationFilter, type Station, getItemStation } from '@/components/kitchen/StationFilter';

const KITCHEN_STATUSES: OrderStatus[] = ['pending', 'preparing', 'paid'];

const Kitchen = () => {
  const [activeStation, setActiveStation] = useState<Station>('all');
  
  const {
    audioEnabled,
    setAudioEnabled,
    audioVolume,
    setAudioVolume,
    playNewOrderAlert,
  } = useAudioAlerts({ enabled: true, volume: 0.7 });

  const handleNewOrder = useCallback((order: Order) => {
    playNewOrderAlert();
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [playNewOrderAlert]);

  const {
    orders,
    loading,
    isOnline,
    lastUpdated,
    metrics,
    refetch,
    updateOrderStatus,
    updateOrderItems,
  } = useOrders({
    statusFilter: KITCHEN_STATUSES,
    enableRealtime: true,
    onNewOrder: handleNewOrder,
  });

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Calculate station counts
  const stationCounts = useMemo(() => {
    const counts: Record<Station, number> = {
      all: orders.length,
      grill: 0,
      fryer: 0,
      assembly: 0,
      drinks: 0,
    };

    orders.forEach(order => {
      const orderStations = new Set<Station>();
      order.items.forEach(item => {
        const station = getItemStation(item.name);
        orderStations.add(station);
      });
      orderStations.forEach(station => {
        counts[station]++;
      });
    });

    return counts;
  }, [orders]);

  // Filter orders by station
  const filteredOrders = useMemo(() => {
    if (activeStation === 'all') return orders;

    return orders.filter(order => 
      order.items.some(item => getItemStation(item.name) === activeStation)
    );
  }, [orders, activeStation]);

  const handleItemPrepared = useCallback(async (orderId: string, itemIndex: number, prepared: boolean) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedItems = order.items.map((item, idx) => 
      idx === itemIndex ? { ...item, prepared } : item
    );

    await updateOrderItems(orderId, updatedItems);
  }, [orders, updateOrderItems]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="bg-primary p-4 rounded-xl mx-auto mb-4 w-fit animate-pulse">
            <Package className="h-12 w-12 text-primary-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">Loading kitchen orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <KitchenHeader
        orderCount={orders.length}
        pendingCount={metrics.pending}
        preparingCount={metrics.preparing}
        isOnline={isOnline}
        lastUpdated={lastUpdated}
        audioEnabled={audioEnabled}
        audioVolume={audioVolume}
        onAudioToggle={setAudioEnabled}
        onVolumeChange={setAudioVolume}
        onRefresh={refetch}
      />

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Station Filter */}
        <div className="mb-6">
          <StationFilter
            activeStation={activeStation}
            onStationChange={setActiveStation}
            stationCounts={stationCounts}
          />
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="p-12 md:p-16 text-center">
            <Package className="h-20 w-20 md:h-24 md:w-24 mx-auto mb-6 text-muted-foreground opacity-50" />
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              {activeStation === 'all' ? 'No Active Orders' : `No Orders for ${activeStation.charAt(0).toUpperCase() + activeStation.slice(1)}`}
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground">
              {activeStation === 'all' 
                ? 'All orders are completed or ready for pickup'
                : 'No orders require this station currently'
              }
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              New orders will appear here automatically
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredOrders.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                onStatusChange={updateOrderStatus}
                onItemPrepared={handleItemPrepared}
                highlightStation={activeStation !== 'all' ? activeStation : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Kitchen;
