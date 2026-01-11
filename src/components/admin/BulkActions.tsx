import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckSquare, ChevronDown, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/hooks/useOrders';

interface BulkActionsProps {
  selectedIds: string[];
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkStatusChange: (ids: string[], status: OrderStatus) => Promise<void>;
  isLoading?: boolean;
}

export const BulkActions = ({
  selectedIds,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkStatusChange,
  isLoading = false,
}: BulkActionsProps) => {
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; status: OrderStatus | null }>({
    open: false,
    status: null,
  });

  const handleStatusChange = (status: OrderStatus) => {
    if (status === 'cancelled') {
      setConfirmDialog({ open: true, status });
    } else {
      onBulkStatusChange(selectedIds, status);
    }
  };

  const confirmChange = async () => {
    if (confirmDialog.status) {
      await onBulkStatusChange(selectedIds, confirmDialog.status);
    }
    setConfirmDialog({ open: false, status: null });
  };

  const allSelected = selectedIds.length === totalCount && totalCount > 0;
  const someSelected = selectedIds.length > 0;

  return (
    <>
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
        someSelected ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
      )}>
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => checked ? onSelectAll() : onClearSelection()}
          className="h-5 w-5"
        />
        
        {someSelected ? (
          <>
            <span className="font-medium text-sm">
              {selectedIds.length} selected
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-7 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
            
            <div className="h-4 w-px bg-border mx-1" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm" 
                  disabled={isLoading}
                  className="h-8"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Bulk Actions
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                  <span className="w-2 h-2 rounded-full bg-serape-yellow mr-2" />
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('preparing')}>
                  <span className="w-2 h-2 rounded-full bg-serape-blue mr-2" />
                  Mark as Preparing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('ready')}>
                  <span className="w-2 h-2 rounded-full bg-serape-green mr-2" />
                  Mark as Ready
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                  <span className="w-2 h-2 rounded-full bg-muted-foreground mr-2" />
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleStatusChange('cancelled')}
                  className="text-destructive focus:text-destructive"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Cancel Orders
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            Select orders for bulk actions
          </span>
        )}
      </div>
      
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, status: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancel {selectedIds.length} Orders?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel {selectedIds.length} selected orders. This cannot be undone.
              Customers may need to be notified separately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Orders</AlertDialogCancel>
            <AlertDialogAction onClick={confirmChange} className="bg-destructive hover:bg-destructive/90">
              Cancel Orders
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface SelectableRowProps {
  isSelected: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const SelectableRow = ({ isSelected, onToggle, children }: SelectableRowProps) => {
  return (
    <tr className={cn(
      'transition-colors',
      isSelected && 'bg-primary/5'
    )}>
      <td className="px-4 py-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          className="h-4 w-4"
        />
      </td>
      {children}
    </tr>
  );
};
