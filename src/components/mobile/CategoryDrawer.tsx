import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { menuItems } from "@/data/menuData";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Get unique topCategories in the order they appear in menuItems
const getTopCategories = (): string[] => {
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const item of menuItems) {
    if (!seen.has(item.topCategory)) {
      seen.add(item.topCategory);
      categories.push(item.topCategory);
    }
  }
  return categories;
};

export const CategoryDrawer = ({ open, onOpenChange }: CategoryDrawerProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  const topCategories = getTopCategories();

  const handleCategoryClick = (category: string) => {
    const categoryId = category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    
    // If already on /order, scroll directly
    if (location.pathname === '/order') {
      const element = document.getElementById(categoryId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Navigate to order page with hash
      navigate(`/order#${categoryId}`);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <SheetHeader className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
          <SheetTitle className="font-serif text-xl">
            {t("menu.categories") || "Categories"}
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-2">
            {topCategories.map((category, index) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-lg transition-all",
                  "hover:bg-accent active:scale-[0.98]",
                  "border-b border-border/50 last:border-0"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <span className="font-medium text-left">
                  {category}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
