// screens/arqueo/store/arqueoStore.ts
import { create } from "zustand";
import { arqueoService } from "../services/arqueo.service";
import { Arqueo, Conteo } from "../types/arqueo.types";

interface ArqueoState {
  activeArqueo: Arqueo | null;
  loading: boolean;
  error: string | null;
  _hasFetched: boolean; // 🔥 Flag para evitar peticiones duplicadas
  fetchActiveArqueo: () => Promise<void>;
  openArqueo: (turno: string, saldoAnterior: number) => Promise<Arqueo>;
  closeArqueo: (id: number, conteo: Conteo) => Promise<Arqueo>;
  clear: () => void;
}

export const useArqueoStore = create<ArqueoState>((set, get) => ({
  activeArqueo: null,
  loading: false,
  error: null,
  _hasFetched: false,

  fetchActiveArqueo: async () => {
    // 🔥 Si ya se hizo la primera carga, no hacemos nada
    if (get()._hasFetched) return;

    set({ loading: true, error: null });
    try {
      const response = await arqueoService.getActive();
      set({ activeArqueo: response.data, loading: false, _hasFetched: true });
    } catch (err: any) {
      set({
        error: err.message || "Error al cargar arqueo",
        loading: false,
        _hasFetched: true,
      });
    }
  },

  openArqueo: async (turno: string, saldoAnterior: number) => {
    set({ loading: true, error: null });
    try {
      const response = await arqueoService.open(turno, saldoAnterior);
      set({ activeArqueo: response.data, loading: false, _hasFetched: true });
      return response.data;
    } catch (err: any) {
      set({ error: err.message || "Error al abrir turno", loading: false });
      throw err;
    }
  },

  closeArqueo: async (id: number, conteo: Conteo) => {
    set({ loading: true, error: null });
    try {
      const response = await arqueoService.close(id, conteo);
      set({ activeArqueo: null, loading: false, _hasFetched: true });
      return response.data;
    } catch (err: any) {
      set({ error: err.message || "Error al cerrar turno", loading: false });
      throw err;
    }
  },

  clear: () =>
    set({
      activeArqueo: null,
      error: null,
      loading: false,
      _hasFetched: false,
    }),
}));
