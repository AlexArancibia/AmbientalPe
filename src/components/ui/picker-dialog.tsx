"use client";

import * as React from "react";
import { ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Picker, type PickerItem } from "./picker";

export interface PickerDialogProps<T extends PickerItem> {
  // Data
  items: T[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Selection
  selectedId?: string;
  onSelect: (item: T) => void;
  
  // Display
  triggerPlaceholder?: string;
  emptyMessage?: string;
  renderItem?: (item: T) => React.ReactNode;
  
  // Styling
  className?: string;
  disabled?: boolean;
}

export function PickerDialog<T extends PickerItem>({
  items,
  totalPages,
  currentPage,
  onPageChange,
  isLoading,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  selectedId,
  onSelect,
  triggerPlaceholder = "Seleccionar...",
  emptyMessage = "No se encontraron resultados",
  renderItem,
  className,
  disabled = false,
}: PickerDialogProps<T>) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = items.find((item) => item.id === selectedId);

  const handleSelect = (item: T) => {
    onSelect(item);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-9", className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedItem ? selectedItem.label : triggerPlaceholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-3 w-[600px]" 
        align="start"
        side="bottom"
      >
        <Picker<T>
          items={items}
          fetchMore={() => {}} // No infinite scroll, using pagination instead
          hasMore={false}
          isLoading={isLoading}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          selectedId={selectedId}
          onSelect={handleSelect}
          renderItem={renderItem}
          emptyMessage={emptyMessage}
          allowClear
          maxHeight="350px"
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-3 mt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

