// screens/gestiones/hooks/useGestiones.ts
import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { gestionesService } from "../services/gestiones.service";
import {
  Gestion,
  GestionFilters,
  GestionFormData,
  GestionUpdateData,
} from "../types/gestiones.types";

export function useGestiones() {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, per_page: 15 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<GestionFilters>({ page: 1 });

  //  Ref para almacenar el controlador de la petición actual
  const abortControllerRef = useRef<AbortController | null>(null);

  // Modal states
  const [createVisible, setCreateVisible] = useState(false);
  const [editGestion, setEditGestion] = useState<Gestion | null>(null);
  const [closeGestion, setCloseGestion] = useState<Gestion | null>(null);
  const [deleteGestion, setDeleteGestion] = useState<Gestion | null>(null);
  const [detailGestion, setDetailGestion] = useState<Gestion | null>(null);
  const [deactivateGestion, setDeactivateGestion] = useState<Gestion | null>(
    null,
  );

  const fetchGestiones = useCallback(
    async (override?: GestionFilters) => {
      //  Cancelar la petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      //  Crear un nuevo controlador para la petición actual
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      try {
        //  Pasamos el signal al servicio
        const res = await gestionesService.listar(
          override ?? filters,
          controller.signal,
        );
        setGestiones(res.data);

        setMeta({
          total: res.meta.total,
          per_page: res.meta.per_page,
          page: res.meta.current_page,
        });
      } catch (err: any) {
        //  IMPORTANTE: Si la petición fue cancelada, no mostramos el Toast de error
        if (err.name === "AbortError" || err.message === "AbortError") {
          return;
        }
        Toast.show({ type: "error", text1: "Error", text2: err.message });
      } finally {
        // Limpiamos la referencia si la petición que terminó es la actual
        if (abortControllerRef.current === controller) {
          setLoading(false);
        }
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchGestiones();
  }, [filters.page, filters.estado, filters.periodo, filters.anio]);

  const updateFilters = useCallback((newFilters: Partial<GestionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleCreate = useCallback(
    async (data: GestionFormData) => {
      try {
        await gestionesService.crear(data);
        Toast.show({
          type: "success",
          text1: "Gestión creada",
          text2: "La nueva gestión ha sido abierta.",
        });
        fetchGestiones();
      } catch (err: any) {
        Toast.show({ type: "error", text1: "Error", text2: err.message });
      }
    },
    [fetchGestiones],
  );

  const handleUpdate = useCallback(
    async (id: number, data: GestionUpdateData) => {
      try {
        await gestionesService.actualizar(id, data);
        Toast.show({
          type: "success",
          text1: "Actualizado",
          text2: "La gestión ha sido modificada.",
        });
        setEditGestion(null);
        fetchGestiones();
      } catch (err: any) {
        Toast.show({ type: "error", text1: "Error", text2: err.message });
      }
    },
    [fetchGestiones],
  );

  const handleClose = useCallback(
    async (id: number) => {
      try {
        await gestionesService.cerrar(id);
        Toast.show({
          type: "success",
          text1: "Gestión cerrada",
          text2: "La gestión ha sido cerrada permanentemente.",
        });
        setCloseGestion(null);
        fetchGestiones();
      } catch (err: any) {
        Toast.show({ type: "error", text1: "Error", text2: err.message });
      }
    },
    [fetchGestiones],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await gestionesService.eliminar(id);
        Toast.show({
          type: "success",
          text1: "Eliminada",
          text2: "La gestión ha sido eliminada.",
        });
        setDeleteGestion(null);
        fetchGestiones();
      } catch (err: any) {
        Toast.show({ type: "error", text1: "Error", text2: err.message });
      }
    },
    [fetchGestiones],
  );
  const handleDeactivate = useCallback(
    async (id: number) => {
      try {
        await gestionesService.actualizar(id, { estado: "inactivo" });
        Toast.show({
          type: "success",
          text1: "Desactivada",
          text2: "La gestión ahora está inactiva.",
        });
        setDeactivateGestion(null);
        fetchGestiones();
      } catch (err: any) {
        Toast.show({ type: "error", text1: "Error", text2: err.message });
      }
    },
    [fetchGestiones],
  );
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);
  return {
    gestiones,
    meta,
    loading,
    filters,
    updateFilters,
    setPage,
    // modals
    createVisible,
    setCreateVisible,
    editGestion,
    setEditGestion,
    closeGestion,
    setCloseGestion,
    deleteGestion,
    setDeleteGestion,
    detailGestion,
    setDetailGestion,
    // actions
    handleCreate,
    handleUpdate,
    handleClose,
    handleDelete,
    deactivateGestion,
    setDeactivateGestion,
    handleDeactivate,
    refetch: fetchGestiones,
  };
}
