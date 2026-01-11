import { Plus, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMenuItemName, getMenuItemDescription } from "@/data/menuTranslations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuickAddCardProps {
  item: {
    id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
    bestSeller?: boolean;
  };
  onItemClick?: () => void;
  compact?: boolean;
}

export const QuickAddCard = ({ item, onItemClick, compact = false }: QuickAddCardProps) => {
  const { addToCart } = useCart();
  const { language, t } = useLanguage();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: item.id,
      name: getMenuItemName(item.id, language, item.name),
      price: item.price,
      image: item.image,
    });
    toast.success(t("cart.added") || "Added to cart!", {
      duration: 1500,
    });
  };

  return (
    <Card
      onClick={onItemClick}
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-200",
        "hover:shadow-md active:scale-[0.98]",
        "border border-border/50",
        compact ? "flex flex-row h-24" : "flex flex-col"
      )}
    >
      {/* Image */}
      {item.image && (
        <div className={cn(
          "relative overflow-hidden flex-shrink-0",
          compact ? "w-24 h-full" : "h-32"
        )}>
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {item.bestSeller && (
            <Badge className="absolute top-1 left-1 gap-0.5 bg-gradient-to-r from-serape-yellow to-serape-orange text-white border-0 text-[10px] px-1.5 py-0.5">
              <Star className="h-2.5 w-2.5 fill-current" />
              Best
            </Badge>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "flex-1 p-3 flex",
        compact ? "flex-row items-center gap-2" : "flex-col"
      )}>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium line-clamp-1",
            compact ? "text-sm" : "text-base mb-1"
          )}>
            {getMenuItemName(item.id, language, item.name)}
          </h4>
          {!compact && item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {getMenuItemDescription(item.id, language, item.description)}
            </p>
          )}
          <p className={cn(
            "font-semibold text-primary",
            compact ? "text-sm" : "text-lg"
          )}>
            ${item.price.toFixed(2)}
          </p>
        </div>

        {/* Quick Add Button */}
        <Button
          size="icon"
          variant="default"
          onClick={handleQuickAdd}
          className={cn(
            "rounded-full flex-shrink-0 shadow-md",
            "bg-primary hover:bg-primary/90 active:scale-95",
            compact ? "h-10 w-10" : "h-11 w-11"
          )}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
};
