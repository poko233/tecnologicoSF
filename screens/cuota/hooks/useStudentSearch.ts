import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { cuotaService } from "../services/cuota.service";
import { Estudiante } from "../types/cuota.types";

interface UseStudentSearchResult {
  students: Estudiante[];
  loading: boolean;
  refreshing: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loadMore: () => void;
  refresh: () => void;
  hasMore: boolean;
  total: number;
  selectedStudent: Estudiante | null;
  selectStudent: (student: Estudiante | null) => void;
  searchImmediately: (term: string) => void;
  resetSearch: () => void;
}

export const useStudentSearch = (): UseStudentSearchResult => {
  const [students, setStudents] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<Estudiante | null>(
    null,
  );

  const performSearch = useCallback(
    async (page: number, term: string, isRefresh = false) => {
      if (page === 1) {
        setStudents([]);
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
      }
      try {
        const response = await cuotaService.searchStudents(term, page);
        const newData = response.data;
        if (page === 1) {
          setStudents(newData);
        } else {
          setStudents((prev) => [...prev, ...newData]);
        }
        setHasMore(!!response.next_page_url);
        setTotal(response.total);
        setCurrentPage(page);
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error de búsqueda",
          text2: error.message || "No se pudieron cargar los estudiantes",
        });
        if (page === 1) setStudents([]);
      } finally {
        if (page === 1) {
          if (isRefresh) setRefreshing(false);
          else setLoading(false);
        }
      }
    },
    [],
  );

  const searchImmediately = useCallback(
    (term: string) => {
      if (term.trim() === "") {
        Toast.show({
          type: "info",
          text1: "Búsqueda vacía",
          text2: "Escribe al menos un carácter para buscar",
        });
        return;
      }
      // Importante: actualizar searchTerm con el término buscado
      setSearchTerm(term);
      performSearch(1, term, false);
    },
    [performSearch],
  );

  const resetSearch = useCallback(() => {
    setStudents([]);
    setSearchTerm("");
    setCurrentPage(1);
    setHasMore(true);
    setTotal(0);
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && !refreshing) {
      performSearch(currentPage + 1, searchTerm, false);
    }
  }, [loading, hasMore, refreshing, currentPage, searchTerm, performSearch]);

  const refresh = useCallback(() => {
    if (searchTerm.trim() !== "") {
      performSearch(1, searchTerm, true);
    }
  }, [searchTerm, performSearch]);

  const selectStudent = useCallback((student: Estudiante | null) => {
    setSelectedStudent(student);
  }, []);

  return {
    students,
    loading,
    refreshing,
    searchTerm,
    setSearchTerm,
    loadMore,
    refresh,
    hasMore,
    total,
    selectedStudent,
    selectStudent,
    searchImmediately,
    resetSearch,
  };
};
