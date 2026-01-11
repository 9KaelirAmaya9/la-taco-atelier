import { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  DollarSign,
  AlertCircle,
  Check,
  Package,
  Loader2,
  RefreshCw,
  TrendingUp,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { menuItems, menuCategories, type MenuItem } from '@/data/menuData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MenuItemState {
  id: string;
  available: boolean;
  price: number;
  originalPrice: number;
  soldCount: number;
}

interface PriceChange {
  id: string;
  itemId: string;
  itemName: string;
  oldPrice: number;
  newPrice: number;
  changedAt: string;
  changedBy: string;
}

export default function AdminMenu() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [itemStates, setItemStates] = useState<Record<string, MenuItemState>>({});
  const [priceHistory, setPriceHistory] = useState<PriceChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize item states from menu data and fetch any stored overrides
  useEffect(() => {
    const initializeItems = async () => {
      setLoading(true);
      
      // Initialize with default states
      const defaultStates: Record<string, MenuItemState> = {};
      menuItems.forEach(item => {
        defaultStates[item.id] = {
          id: item.id,
          available: true,
          price: item.price,
          originalPrice: item.price,
          soldCount: 0,
        };
      });
      
      // Fetch sold counts from orders
      try {
        const { data: orders } = await supabase
          .from('orders')
          .select('items')
          .neq('status', 'cancelled');
        
        if (orders) {
          orders.forEach(order => {
            const items = Array.isArray(order.items) ? order.items : [];
            items.forEach((item: { name: string; quantity: number }) => {
              const menuItem = menuItems.find(m => m.name === item.name);
              if (menuItem && defaultStates[menuItem.id]) {
                defaultStates[menuItem.id].soldCount += item.quantity;
              }
            });
          });
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
      }
      
      setItemStates(defaultStates);
      setLoading(false);
    };
    
    initializeItems();
  }, []);

  const toggleAvailability = useCallback((itemId: string) => {
    setItemStates(prev => {
      const item = prev[itemId];
      const newAvailable = !item.available;
      
      toast.success(
        newAvailable 
          ? `${menuItems.find(m => m.id === itemId)?.name} is now available`
          : `${menuItems.find(m => m.id === itemId)?.name} has been 86'd`
      );
      
      return {
        ...prev,
        [itemId]: { ...item, available: newAvailable }
      };
    });
  }, []);

  const openPriceEditor = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setNewPrice(itemStates[item.id]?.price.toFixed(2) || item.price.toFixed(2));
  }, [itemStates]);

  const savePrice = useCallback(async () => {
    if (!editingItem) return;
    
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    setSaving(true);
    
    const oldPrice = itemStates[editingItem.id]?.price || editingItem.price;
    
    // Record price change
    const change: PriceChange = {
      id: crypto.randomUUID(),
      itemId: editingItem.id,
      itemName: editingItem.name,
      oldPrice,
      newPrice: price,
      changedAt: new Date().toISOString(),
      changedBy: 'Admin',
    };
    
    setPriceHistory(prev => [change, ...prev]);
    setItemStates(prev => ({
      ...prev,
      [editingItem.id]: { ...prev[editingItem.id], price }
    }));
    
    toast.success(`Updated ${editingItem.name} price to $${price.toFixed(2)}`);
    setSaving(false);
    setEditingItem(null);
  }, [editingItem, newPrice, itemStates]);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    
    if (activeCategory !== 'all') {
      items = items.filter(item => item.category === activeCategory);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }
    
    return items;
  }, [searchTerm, activeCategory]);

  const unavailableCount = useMemo(() => {
    return Object.values(itemStates).filter(s => !s.available).length;
  }, [itemStates]);

  const topSellers = useMemo(() => {
    return Object.entries(itemStates)
      .sort((a, b) => b[1].soldCount - a[1].soldCount)
      .slice(0, 5)
      .map(([id, state]) => ({
        item: menuItems.find(m => m.id === id),
        soldCount: state.soldCount,
      }))
      .filter(x => x.item);
  }, [itemStates]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Menu Management</h1>
            <p className="text-muted-foreground">
              {menuItems.length} items • {unavailableCount} currently 86'd
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{menuItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">86'd Items</p>
                  <p className="text-2xl font-bold">{unavailableCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-serape-green/10">
                  <Check className="h-6 w-6 text-serape-green" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">{menuItems.length - unavailableCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="items" className="space-y-4">
          <TabsList>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="popular">Popular Items</TabsTrigger>
            <TabsTrigger value="history">Price History</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={activeCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCategory('all')}
                    >
                      All
                    </Button>
                    {menuCategories.slice(0, 6).map(cat => (
                      <Button
                        key={cat}
                        variant={activeCategory === cat ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu Items Table */}
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Sold</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => {
                        const state = itemStates[item.id];
                        const isModified = state?.price !== item.price;
                        
                        return (
                          <TableRow 
                            key={item.id}
                            className={cn(!state?.available && 'opacity-60 bg-destructive/5')}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {item.name}
                                    {item.bestSeller && (
                                      <Badge variant="secondary" className="text-xs">
                                        Best Seller
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground line-clamp-1">
                                    {item.description}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span className={cn(
                                  'font-semibold',
                                  isModified && 'text-serape-yellow'
                                )}>
                                  ${(state?.price || item.price).toFixed(2)}
                                </span>
                                {isModified && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    ${item.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">
                                {state?.soldCount || 0}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={state?.available ?? true}
                                onCheckedChange={() => toggleAvailability(item.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openPriceEditor(item)}
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Edit Price
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {filteredItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No items found matching your search
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="popular">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Selling Items
                </CardTitle>
                <CardDescription>
                  Based on order history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSellers.map(({ item, soldCount }, index) => (
                    <div 
                      key={item!.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      {item!.image && (
                        <img 
                          src={item!.image} 
                          alt={item!.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{item!.name}</div>
                        <div className="text-sm text-muted-foreground">{item!.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{soldCount}</div>
                        <div className="text-xs text-muted-foreground">sold</div>
                      </div>
                    </div>
                  ))}
                  {topSellers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No sales data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Price Change History
                </CardTitle>
                <CardDescription>
                  Recent price adjustments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {priceHistory.map((change) => (
                    <div 
                      key={change.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <div className="font-medium">{change.itemName}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(change.changedAt), 'MMM dd, yyyy HH:mm')} by {change.changedBy}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through">
                          ${change.oldPrice.toFixed(2)}
                        </span>
                        <span className="text-lg font-bold">
                          →
                        </span>
                        <span className={cn(
                          'font-bold',
                          change.newPrice > change.oldPrice ? 'text-serape-green' : 'text-destructive'
                        )}>
                          ${change.newPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {priceHistory.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No price changes recorded
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Price Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Price</DialogTitle>
            <DialogDescription>
              Update the price for {editingItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">New Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
            </div>
            {editingItem && (
              <div className="text-sm text-muted-foreground">
                Original price: ${editingItem.price.toFixed(2)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={savePrice} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
