import { memo, useEffect, useState } from 'react';
import { ChefHat, Volume2, VolumeX, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface KitchenHeaderProps {
  orderCount: number;
  pendingCount: number;
  preparingCount: number;
  isOnline: boolean;
  lastUpdated: Date;
  audioEnabled: boolean;
  audioVolume: number;
  onAudioToggle: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onRefresh: () => void;
}

function KitchenHeaderComponent({
  orderCount,
  pendingCount,
  preparingCount,
  isOnline,
  lastUpdated,
  audioEnabled,
  audioVolume,
  onAudioToggle,
  onVolumeChange,
  onRefresh,
}: KitchenHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b-4 border-primary shadow-lg">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left: Logo and counts */}
          <div className="flex items-center gap-4">
            <div className="bg-primary p-3 rounded-xl">
              <ChefHat className="h-10 w-10 md:h-12 md:w-12 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Kitchen Display
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {orderCount} Active
                </Badge>
                <Badge className="bg-serape-yellow text-foreground text-base px-3 py-1">
                  {pendingCount} Pending
                </Badge>
                <Badge className="bg-serape-blue text-white text-base px-3 py-1">
                  {preparingCount} Preparing
                </Badge>
              </div>
            </div>
          </div>

          {/* Right: Status, controls, time */}
          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
              isOnline ? 'bg-serape-green/10 text-serape-green' : 'bg-destructive/10 text-destructive'
            )}>
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span className="hidden sm:inline">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>

            {/* Audio controls */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={audioEnabled ? 'default' : 'outline'}
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => onAudioToggle(!audioEnabled)}
                >
                  {audioEnabled ? (
                    <Volume2 className="h-6 w-6" />
                  ) : (
                    <VolumeX className="h-6 w-6" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Alert Volume</p>
                  <Slider
                    value={[audioVolume * 100]}
                    onValueChange={([value]) => onVolumeChange(value / 100)}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {Math.round(audioVolume * 100)}%
                  </p>
                </div>
              </PopoverContent>
            </Popover>

            {/* Manual refresh */}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={onRefresh}
            >
              <RefreshCw className="h-6 w-6" />
            </Button>

            {/* Current time */}
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
              <p className="text-2xl md:text-3xl font-bold tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const KitchenHeader = memo(KitchenHeaderComponent);
