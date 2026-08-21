// hooks/useLocalSearch.ts
import { useCallback, useMemo, useState } from "react";

interface UseLocalSearchProps<T> {
  items: T[];
  searchKeys: (keyof T)[];
}

export function useLocalSearch<T>({
  items,
  searchKeys,
}: UseLocalSearchProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        return value && String(value).toLowerCase().includes(lowerQuery);
      }),
    );
  }, [items, searchQuery, searchKeys]);

  const doSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  return {
    items: filteredItems,
    searchQuery,
    setSearchQuery,
    doSearch,
    total: filteredItems.length,
  };
}
