import { useState } from "react";
import { MobileBottomNav } from "./MobileBottomNav";
import { CategoryDrawer } from "./CategoryDrawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      {children}
      
      {/* Category Drawer */}
      <CategoryDrawer 
        open={categoryDrawerOpen} 
        onOpenChange={setCategoryDrawerOpen} 
      />
      
      {/* Bottom Navigation */}
      <MobileBottomNav onMenuClick={() => setCategoryDrawerOpen(true)} />
      
      {/* Bottom padding for mobile nav */}
      {isMobile && <div className="h-16" />}
    </>
  );
};
