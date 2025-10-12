"use client";

import * as React from "react";
import { Search, Loader2, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { Input } from "./input";
import { Button } from "./button";
import { useDebounce } from "~/hooks/useDebounce";

export interface PickerItem {
  id: string;
  label: string;
  [key: string]: any;
}

export interface PickerProps<T extends PickerItem> {
  // Data fetching
  items: T[];
  fetchMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  isFetchingMore?: boolean;
  
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Selection
  selectedId?: string;
  onSelect: (item: T) => void;
  
  // Customization
  renderItem?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  loadingMessage?: string;
  
  // Styling
  className?: string;
  maxHeight?: string;
  
  // Optional features
  allowClear?: boolean;
  multiple?: boolean;
  selectedIds?: string[];
}

export function Picker<T extends PickerItem>({
  items,
  fetchMore,
  hasMore,
  isLoading,
  isFetchingMore = false,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  selectedId,
  onSelect,
  renderItem,
  emptyMessage = "No se encontraron resultados",
  loadingMessage = "Cargando...",
  className,
  maxHeight = "400px",
  allowClear = false,
  multiple = false,
  selectedIds = [],
}: PickerProps<T>) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const observerTarget = React.useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchValue, 300);

  // Infinite scroll observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading && !isFetchingMore) {
          fetchMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, isFetchingMore, fetchMore]);

  // Handle search clear
  const handleClearSearch = () => {
    onSearchChange("");
  };

  // Check if item is selected
  const isSelected = (itemId: string) => {
    if (multiple) {
      return selectedIds.includes(itemId);
    }
    return selectedId === itemId;
  };

  // Default render item
  const defaultRenderItem = (item: T) => (
    <div className="flex items-center justify-between w-full">
      <span className="truncate">{item.label}</span>
      {isSelected(item.id) && (
        <svg
          className="size-4 text-primary shrink-0"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Search Bar */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {allowClear && searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
          >
            <X className="size-3" />
            <span className="sr-only">Limpiar búsqueda</span>
          </Button>
        )}
      </div>

      {/* Items List */}
      <div
        ref={listRef}
        className="overflow-y-auto overflow-x-hidden border border-border rounded-md"
        style={{ maxHeight }}
      >
        {isLoading && items.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              {loadingMessage}
            </span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <>
            <div className="py-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    isSelected(item.id) && "bg-accent/50"
                  )}
                >
                  {renderItem ? renderItem(item) : defaultRenderItem(item)}
                </button>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div
                ref={observerTarget}
                className="flex items-center justify-center p-4"
              >
                {isFetchingMore && (
                  <>
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-xs text-muted-foreground">
                      Cargando más...
                    </span>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

