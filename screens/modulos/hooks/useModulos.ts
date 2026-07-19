import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { moduloService } from "../services/modulo.service";
import {
    CreateModuloPayload,
    Modulo,
    UpdateModuloPayload,
} from "../types/modulo.types";

const CACHE_KEY = "modulos_cache";
const CACHE_TIMESTAMP_KEY = "modulos_cache_timestamp";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

export function useModulos() {
  const [modulos, setModulos]     = useState<Modulo[]>([]);
  const [loading, setLoading]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── Cargar desde cache ────────────────────────────────────────────────────
  const loadFromCache = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        setModulos(data);
        return true;
      }
    } catch (err) {
      console.warn("Error loading cache:", err);
    }
    return false;
  }, []);

  // ── Guardar en cache ───────────────────────────────────────────────────────
  const saveToCache = useCallback(async (data: Modulo[]) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (err) {
      console.warn("Error saving cache:", err);
    }
  }, []);

  // ── Verificar si cache es válido ───────────────────────────────────────────
  const isCacheValid = useCallback(async () => {
    try {
      const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp);
        return age < CACHE_DURATION;
      }
    } catch (err) {
      console.warn("Error checking cache:", err);
    }
    return false;
  }, []);

  // ── Cargar ────────────────────────────────────────────────────────────────
  const fetchModulos = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    // Primero intentar cargar desde cache
    const hasCache = await loadFromCache();

    // Verificar si el cache es válido
    const cacheValid = await isCacheValid();

    // Si el cache es válido, no hacer fetch
    if (cacheValid && hasCache) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    // Fetch desde API
    try {
      const data = await moduloService.getAll();
      setModulos(data);
      await saveToCache(data);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadFromCache, isCacheValid, saveToCache]);

  // ── Crear ─────────────────────────────────────────────────────────────────
  const createModulo = async (payload: CreateModuloPayload): Promise<boolean> => {
    try {
      const nuevo = await moduloService.create(payload);
      const updated = [...modulos, nuevo];
      setModulos(updated);
      await saveToCache(updated);
      Toast.show({ type: "success", text1: "Módulo creado correctamente" });
      return true;
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error al crear", text2: err.message });
      return false;
    }
  };

  // ── Editar ────────────────────────────────────────────────────────────────
  const updateModulo = async (
    id: number,
    payload: UpdateModuloPayload
  ): Promise<boolean> => {
    try {
      const updated = await moduloService.update(id, payload);
      const newList = modulos.map((m) => (m.id === id ? updated : m));
      setModulos(newList);
      await saveToCache(newList);
      Toast.show({ type: "success", text1: "Módulo actualizado" });
      return true;
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error al editar", text2: err.message });
      return false;
    }
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const deleteModulo = async (id: number): Promise<boolean> => {
    try {
      await moduloService.delete(id);
      const newList = modulos.filter((m) => m.id !== id);
      setModulos(newList);
      await saveToCache(newList);
      Toast.show({ type: "success", text1: "Módulo eliminado" });
      return true;
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error al eliminar", text2: err.message });
      return false;
    }
  };

  // ── Reordenar ─────────────────────────────────────────────────────────────
  const reorderModulos = async (
    items: Array<{ id: number; posicion: number }>
  ): Promise<boolean> => {
    try {
      await moduloService.reorder(items);
      // Actualizar el estado local con las nuevas posiciones
      const updated = modulos.map((m) => {
        const found = items.find((i) => i.id === m.id);
        return found ? { ...m, posicion: found.posicion } : m;
      });
      const sorted = updated.sort((a, b) => a.posicion - b.posicion);
      setModulos(sorted);
      await saveToCache(sorted);
      Toast.show({ type: "success", text1: "Orden actualizado" });
      return true;
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error al reordenar",
        text2: err.message,
      });
      return false;
    }
  };

  useEffect(() => {
    fetchModulos();
  }, []);

  return {
    modulos,
    loading,
    refreshing,
    fetchModulos,
    onRefresh: () => {
      setRefreshing(true);
      fetchModulos(true);
    },
    createModulo,
    updateModulo,
    deleteModulo,
    reorderModulos,
  };
}