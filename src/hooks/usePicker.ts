import { useState, useCallback, useMemo } from "react";
import type { PickerItem } from "~/components/ui/picker";

/**
 * Hook personalizado para manejar el estado del Picker
 * Simplifica el manejo de búsqueda, paginación y selección
 */

interface UsePickerOptions {
  initialSearch?: string;
  initialPage?: number;
  pageSize?: number;
  debounceDelay?: number;
}

interface UsePickerReturn<T extends PickerItem> {
  // Search state
  search: string;
  setSearch: (value: string) => void;
  handleSearchChange: (value: string) => void;
  
  // Pagination state
  page: number;
  setPage: (value: number) => void;
  resetPage: () => void;
  nextPage: () => void;
  
  // Selection state (single)
  selectedId?: string;
  setSelectedId: (id: string | undefined) => void;
  clearSelection: () => void;
  
  // Selection state (multiple)
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearMultipleSelection: () => void;
  
  // Transform function
  transformItems: <Original>(
    items: Original[] | undefined,
    transformer: (item: Original) => T
  ) => T[];
  
  // Config
  limit: number;
}

export function usePicker<T extends PickerItem>(
  options: UsePickerOptions = {}
): UsePickerReturn<T> {
  const {
    initialSearch = "",
    initialPage = 1,
    pageSize = 20,
  } = options;

  // Search state
  const [search, setSearch] = useState(initialSearch);
  
  // Pagination state
  const [page, setPage] = useState(initialPage);
  
  // Selection state
  const [selectedId, setSelectedId] = useState<string>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Handle search change and reset page
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  }, []);

  // Pagination helpers
  const resetPage = useCallback(() => setPage(1), []);
  const nextPage = useCallback(() => setPage(prev => prev + 1), []);

  // Selection helpers
  const clearSelection = useCallback(() => setSelectedId(undefined), []);
  
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(existingId => existingId !== id);
      }
      return [...prev, id];
    });
  }, []);
  
  const clearMultipleSelection = useCallback(() => setSelectedIds([]), []);

  // Transform items helper
  const transformItems = useCallback(
    <Original,>(
      items: Original[] | undefined,
      transformer: (item: Original) => T
    ): T[] => {
      if (!items) return [];
      return items.map(transformer);
    },
    []
  );

  return {
    // Search
    search,
    setSearch,
    handleSearchChange,
    
    // Pagination
    page,
    setPage,
    resetPage,
    nextPage,
    
    // Selection (single)
    selectedId,
    setSelectedId,
    clearSelection,
    
    // Selection (multiple)
    selectedIds,
    setSelectedIds,
    toggleSelection,
    clearMultipleSelection,
    
    // Helpers
    transformItems,
    
    // Config
    limit: pageSize,
  };
}

/**
 * Hook específico para manejar paginación infinita con tRPC
 */

interface UseInfinitePickerOptions<TData> {
  initialSearch?: string;
  pageSize?: number;
  getTotalPages: (data: TData | undefined) => number;
  getCurrentPage: (data: TData | undefined) => number;
}

interface UseInfinitePickerReturn {
  search: string;
  handleSearchChange: (value: string) => void;
  page: number;
  hasMore: boolean;
  fetchMore: () => void;
  limit: number;
}

export function useInfinitePicker<TData>({
  initialSearch = "",
  pageSize = 20,
  getTotalPages,
  getCurrentPage,
}: UseInfinitePickerOptions<TData>) {
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const fetchMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  // This needs to be called with the actual data from your query
  const getHelpers = useCallback((data: TData | undefined) => {
    const totalPages = getTotalPages(data);
    const currentPage = getCurrentPage(data);
    
    return {
      hasMore: currentPage < totalPages,
      totalPages,
      currentPage,
    };
  }, [getTotalPages, getCurrentPage]);

  return {
    search,
    handleSearchChange,
    page,
    hasMore: false, // This should be calculated with actual data
    fetchMore,
    limit: pageSize,
    getHelpers, // Call this with your query data
  };
}

/**
 * EJEMPLO DE USO:
 * 
 * ```tsx
 * function ClientPickerComponent() {
 *   const picker = usePicker<ClientItem>({
 *     pageSize: 20
 *   });
 * 
 *   const { data, isLoading, isFetching } = trpc.client.getAll.useQuery({
 *     page: picker.page,
 *     limit: picker.limit,
 *     search: picker.search,
 *     type: "CLIENT",
 *   });
 * 
 *   const items = picker.transformItems(data?.clients, (client) => ({
 *     id: client.id,
 *     label: client.name,
 *     ...client,
 *   }));
 * 
 *   const handleFetchMore = () => {
 *     if (data && picker.page < data.totalPages) {
 *       picker.nextPage();
 *     }
 *   };
 * 
 *   return (
 *     <Picker
 *       items={items}
 *       fetchMore={handleFetchMore}
 *       hasMore={data ? picker.page < data.totalPages : false}
 *       isLoading={isLoading}
 *       isFetchingMore={isFetching && picker.page > 1}
 *       searchValue={picker.search}
 *       onSearchChange={picker.handleSearchChange}
 *       selectedId={picker.selectedId}
 *       onSelect={(item) => picker.setSelectedId(item.id)}
 *     />
 *   );
 * }
 * ```
 */

