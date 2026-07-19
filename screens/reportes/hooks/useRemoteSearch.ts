import { useCallback, useRef, useState } from "react";

interface UseRemoteSearchProps<T> {
  fetchItems: (
    search: string,
    page: number,
    signal?: AbortSignal,
  ) => Promise<{
    data: T[];
    meta: { current_page: number; last_page: number; total: number };
    next_page_url: string | null;
  }>;
}

export function useRemoteSearch<T>({ fetchItems }: UseRemoteSearchProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [total, setTotal] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadItems = useCallback(
    async (search: string, pageNum: number, isLoadMore: boolean = false) => {
      // Cancelar petición anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      try {
        const response = await fetchItems(search, pageNum, controller.signal);

        setItems((prev) =>
          isLoadMore ? [...prev, ...response.data] : response.data,
        );
        setTotal(response.meta.total);
        setHasNextPage(!!response.next_page_url);
        setPage(response.meta.current_page);
      } catch (error: any) {
        if (error.name === "AbortError") {
          return;
        }
        // Si hay otro error, ocultamos el botón de cargar más
        setHasNextPage(false);
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        if (isLoadMore) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [fetchItems],
  );

  const doSearch = useCallback(
    (text: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setItems([]);
      setPage(1);
      setHasNextPage(true);
      setLoading(true);
      setSearchQuery(text);
      loadItems(text, 1, false);
    },
    [loadItems],
  );

  const loadMore = useCallback(() => {
    if (!hasNextPage || loadingMore) return;
    loadItems(searchQuery, page + 1, true);
  }, [hasNextPage, loadingMore, loadItems, searchQuery, page]);

  const abortCurrentRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    items,
    loading,
    loadingMore,
    hasNextPage,
    total,
    searchQuery,
    setSearchQuery,
    doSearch,
    loadMore,
    abortCurrentRequest,
  };
}
