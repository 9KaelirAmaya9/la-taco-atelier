import { Home, UtensilsCrossed, ShoppingCart, User, Menu as MenuIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileBottomNavProps {
  onMenuClick?: () => void;
}

export const MobileBottomNav = ({ onMenuClick }: MobileBottomNavProps) => {
  const { cartCount } = useCart();
  const { t } = useLanguage();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Don't render on desktop or on admin/kitchen pages
  if (!isMobile) return null;
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/kitchen')) return null;

  const navItems = [
    { to: "/", icon: Home, label: t("nav.home") || "Home" },
    { to: "/order", icon: UtensilsCrossed, label: t("nav.order") || "Order" },
    { to: "/cart", icon: ShoppingCart, label: t("nav.cart") || "Cart", badge: cartCount },
    { to: "/profile", icon: User, label: t("nav.profile") || "Account" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Categories button */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-primary active:scale-95"
        >
          <MenuIcon className="h-5 w-5" />
          <span className="text-[10px] font-medium">Categories</span>
        </button>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )
            }
          >
            <div className="relative">
              <item.icon className="h-5 w-5" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
