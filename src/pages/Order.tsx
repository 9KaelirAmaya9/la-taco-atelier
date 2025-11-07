import { Navigation } from "@/components/Navigation";
import { ConfettiBackground } from "@/components/ConfettiBackground";
import { menuItems, menuCategories } from "@/data/menuData";
import { getMenuItemName, getMenuItemDescription } from "@/data/menuTranslations";
import { getCategoryTranslation } from "@/data/translations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlavorSelectionDialog } from "@/components/FlavorSelectionDialog";
import { Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const Order = () => {
  const { t, language } = useLanguage();
  const { orderType, setOrderType, addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [flavorDialogOpen, setFlavorDialogOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<{ id: string; name: string; price: number; image?: string } | null>(null);

  const handleAddToCart = (item: { id: string; name: string; price: number; image?: string }) => {
    // Check if this is the fried chicken wings (k7)
    if (item.id === "k7") {
      setPendingItem(item);
      setFlavorDialogOpen(true);
    } else {
      addToCart(item);
    }
  };

  const handleFlavorSelect = (flavor: string) => {
    if (pendingItem) {
      const flavorLabel = flavor === "mango-habanero" ? "Mango Habanero" 
                        : flavor === "buffalo" ? "Buffalo" 
                        : "BBQ";
      addToCart({
        ...pendingItem,
        name: `${pendingItem.name} (${flavorLabel})`
      });
      setPendingItem(null);
    }
  };

  // Group items by topCategory and subcategory
  const groupedItems = selectedCategory === "All"
    ? menuItems.reduce((acc, item) => {
        if (!acc[item.topCategory]) {
          acc[item.topCategory] = {};
        }
        if (!acc[item.topCategory][item.subcategory]) {
          acc[item.topCategory][item.subcategory] = [];
        }
        acc[item.topCategory][item.subcategory].push(item);
        return acc;
      }, {} as Record<string, Record<string, typeof menuItems>>)
    : menuItems
        .filter(item => item.category === selectedCategory)
        .reduce((acc, item) => {
          if (!acc[item.topCategory]) {
            acc[item.topCategory] = {};
          }
          if (!acc[item.topCategory][item.subcategory]) {
            acc[item.topCategory][item.subcategory] = [];
          }
          acc[item.topCategory][item.subcategory].push(item);
          return acc;
        }, {} as Record<string, Record<string, typeof menuItems>>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 relative">
      <ConfettiBackground />
      <Navigation />
      
      <div className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              {t("order.title")} <span className="text-primary">{t("order.titleHighlight")}</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              {t("order.subtitle")}
            </p>

            {/* Order Type Selection */}
            <Tabs value={orderType} onValueChange={(v) => setOrderType(v as "pickup" | "delivery")} className="max-w-md mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pickup">{t("order.pickup")}</TabsTrigger>
                <TabsTrigger value="delivery">{t("order.delivery")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Menu Items - Full Width */}
          <div className="space-y-6">
              {/* Category Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <label className="text-sm font-medium whitespace-nowrap">{t("order.filterBy")}</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="All">{t("order.allItems")}</SelectItem>
                    {menuCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {getCategoryTranslation(language, category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Items by Category */}
              <div className="space-y-16">
                {Object.entries(groupedItems).map(([topCategory, subcategories]) => (
                  <div key={topCategory}>
                    {/* Top Category Header */}
                    <div className="mb-8">
                      <h2 className="font-serif text-4xl md:text-5xl font-bold bg-gradient-to-r from-serape-red via-serape-pink to-serape-purple bg-clip-text text-transparent mb-3">
                        {topCategory}
                      </h2>
                      <div className="h-1.5 w-full max-w-md rounded-full overflow-hidden flex">
                        <div className="flex-1 bg-serape-cyan"></div>
                        <div className="flex-1 bg-serape-red"></div>
                        <div className="flex-1 bg-serape-pink"></div>
                        <div className="flex-1 bg-serape-purple"></div>
                        <div className="flex-1 bg-serape-blue"></div>
                        <div className="flex-1 bg-serape-green"></div>
                        <div className="flex-1 bg-serape-yellow"></div>
                        <div className="flex-1 bg-serape-orange"></div>
                      </div>
                    </div>

                    {/* Subcategories */}
                    <div className="space-y-12">
                      {Object.entries(subcategories).map(([subcategory, items]) => {
                        const SubcategorySection = () => {
                          const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
                          
                          return (
                            <div key={subcategory} ref={ref}>
                              {/* Subcategory Header */}
                              <div className={cn(
                                "mb-6 transition-all duration-700",
                                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                              )}>
                                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-2">
                                  {subcategory}
                                </h3>
                                <div className="h-0.5 w-full max-w-xs rounded-full bg-gradient-to-r from-serape-orange via-serape-yellow to-serape-green"></div>
                              </div>

                              {/* Items Grid - 5 columns on desktop/tablet, 1 on mobile */}
                              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
                                {items.map((item, index) => {
                                  const ItemCard = () => {
                                    const { ref: cardRef, isVisible: cardVisible } = useScrollAnimation({ 
                                      threshold: 0.1,
                                      rootMargin: "-50px"
                                    });
                                    
                                    return (
                                      <div
                                        ref={cardRef}
                                        className={cn(
                                          "transition-all duration-500",
                                          cardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                        )}
                                        style={{ transitionDelay: `${index * 50}ms` }}
                                      >
                                        <Card className="overflow-hidden hover:shadow-elegant transition-all duration-300 group flex flex-col border-2 border-transparent hover:border-primary/10 bg-card h-full">
                                          {item.image && (
                                            <div className="relative h-40 md:h-36 overflow-hidden flex-shrink-0">
                                              <img 
                                                src={item.image} 
                                                alt={item.name}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                              />
                                              <div className="absolute inset-0 bg-gradient-to-t from-serape-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                              {/* AI Generated watermark */}
                                              <div className="absolute bottom-2 right-2 text-[8px] text-white/30 font-mono tracking-tight backdrop-blur-[2px] px-1.5 py-0.5 rounded bg-black/10">
                                                AI
                                              </div>
                                              {item.bestSeller && (
                                                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-serape-yellow to-serape-orange text-white shadow-glow gap-1 border-0">
                                                  <Star className="h-3 w-3 fill-current" />
                                                  Best
                                                </Badge>
                                              )}
                                            </div>
                                          )}
                                          <div className="p-4 flex flex-col flex-1 bg-card">
                                            <div className="flex items-start justify-between mb-2">
                                              <div className="flex-1">
                                                <h3 className="font-serif text-base md:text-lg font-semibold line-clamp-2">
                                                  {getMenuItemName(item.id, language, item.name)}
                                                </h3>
                                                {item.bestSeller && !item.image && (
                                                  <Badge className="mt-1 gap-1 bg-gradient-to-r from-serape-yellow to-serape-orange text-white border-0 text-xs">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    Best
                                                  </Badge>
                                                )}
                                              </div>
                                              <span className="text-base md:text-lg font-semibold bg-gradient-to-r from-serape-red via-serape-pink to-serape-purple bg-clip-text text-transparent whitespace-nowrap ml-2 drop-shadow-sm">
                                                ${item.price.toFixed(2)}
                                              </span>
                                            </div>
                                            {item.description && (
                                              <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">
                                                {getMenuItemDescription(item.id, language, item.description)}
                                              </p>
                                            )}
                                            
                                            <Button 
                                              size="sm" 
                                              onClick={() => handleAddToCart({ 
                                                id: item.id, 
                                                name: getMenuItemName(item.id, language, item.name), 
                                                price: item.price,
                                                image: item.image 
                                              })}
                                              className="w-full mt-auto gap-2"
                                            >
                                              <Plus className="h-4 w-4" />
                                              {t("order.addToCart")}
                                            </Button>
                                          </div>
                                        </Card>
                                      </div>
                                    );
                                  };
                                  
                                  return <ItemCard key={item.id} />;
                                })}
                              </div>
                            </div>
                          );
                        };
                        
                        return <SubcategorySection key={subcategory} />;
                      })}
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </div>

      <FlavorSelectionDialog 
        open={flavorDialogOpen}
        onOpenChange={setFlavorDialogOpen}
        onSelectFlavor={handleFlavorSelect}
        itemName={pendingItem?.name || ""}
      />
    </div>
  );
};

export default Order;
