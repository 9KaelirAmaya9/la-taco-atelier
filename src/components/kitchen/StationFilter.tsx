import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Droplets, Layers, GlassWater, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Station = 'all' | 'grill' | 'fryer' | 'assembly' | 'drinks';

interface StationFilterProps {
  activeStation: Station;
  onStationChange: (station: Station) => void;
  stationCounts: Record<Station, number>;
}

const stationConfig: Record<Station, { label: string; icon: React.ReactNode; color: string }> = {
  all: { label: 'All', icon: <ChefHat className="h-4 w-4" />, color: 'bg-primary' },
  grill: { label: 'Grill', icon: <Flame className="h-4 w-4" />, color: 'bg-serape-red' },
  fryer: { label: 'Fryer', icon: <Droplets className="h-4 w-4" />, color: 'bg-serape-yellow' },
  assembly: { label: 'Assembly', icon: <Layers className="h-4 w-4" />, color: 'bg-serape-green' },
  drinks: { label: 'Drinks', icon: <GlassWater className="h-4 w-4" />, color: 'bg-serape-blue' },
};

// Map menu categories/items to stations
export const getItemStation = (itemName: string, category?: string): Station => {
  const name = itemName.toLowerCase();
  const cat = (category || '').toLowerCase();
  
  // Drinks station
  if (cat.includes('bebida') || cat.includes('drink') || 
      name.includes('agua') || name.includes('licuado') || name.includes('jugo') ||
      name.includes('refresco') || name.includes('soda') || name.includes('limonada') ||
      name.includes('horchata') || name.includes('jamaica') || name.includes('tamarindo')) {
    return 'drinks';
  }
  
  // Fryer station
  if (name.includes('fries') || name.includes('nugget') || name.includes('empanizado') ||
      name.includes('dorado') || name.includes('fried') || name.includes('chicharr') ||
      name.includes('churro') || name.includes('salchipapa')) {
    return 'fryer';
  }
  
  // Grill station
  if (name.includes('asado') || name.includes('asada') || name.includes('pastor') ||
      name.includes('bistec') || name.includes('arrachera') || name.includes('fajita') ||
      name.includes('carnitas') || name.includes('birria') || name.includes('carne') ||
      name.includes('pollo') || name.includes('cecina') || name.includes('chorizo') ||
      cat.includes('taco') || cat.includes('carne') || cat.includes('meat')) {
    return 'grill';
  }
  
  // Assembly station (default for prepared items)
  return 'assembly';
};

export const StationFilter = ({ activeStation, onStationChange, stationCounts }: StationFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(stationConfig) as Station[]).map((station) => {
        const config = stationConfig[station];
        const isActive = activeStation === station;
        const count = stationCounts[station] || 0;
        
        return (
          <Button
            key={station}
            variant={isActive ? 'default' : 'outline'}
            size="lg"
            onClick={() => onStationChange(station)}
            className={cn(
              'flex items-center gap-2 min-h-[48px] min-w-[100px] transition-all',
              isActive && config.color,
              isActive && 'text-white shadow-lg scale-105'
            )}
          >
            {config.icon}
            <span className="font-medium">{config.label}</span>
            <Badge 
              variant="secondary" 
              className={cn(
                'ml-1 text-xs',
                isActive && 'bg-white/20 text-white'
              )}
            >
              {count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
};
