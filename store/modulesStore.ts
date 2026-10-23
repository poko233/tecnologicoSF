// store/modulesStore.ts
import { create } from "zustand";
import { httpClient } from "../http/httpClient";
import { modulosEventBus } from "../screens/admin/events/modulosEventBus";

export interface MiFormulario {
  id: number;
  nombre: string;
  ruta: string;
  icono: string | null;
  descripcion: string;
}

export interface MiModulo {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  formularios: MiFormulario[];
}

interface MisModulosResponse {
  success: boolean;
  modulos: MiModulo[];
}

interface ModulesState {
  modulos: MiModulo[];
  loading: boolean;
  error: string | null;
  allowedRoutes: Set<string>;
  fetchModulos: () => Promise<void>;
  clearModulos: () => void;
}

let pendingFetch: Promise<void> | null = null;

export const useModulesStore = create<ModulesState>((set) => ({
  modulos: [],
  loading: false,
  error: null,
  allowedRoutes: new Set(),

  fetchModulos: async () => {
    // Los solicitantes concurrentes esperan el MISMO resultado.
    if (pendingFetch) return pendingFetch;
    const operation = async () => {
    set({ loading: true, error: null });
    try {
      const data = await httpClient.getAuth<MisModulosResponse>(
        "/api/mis-modulos",
        "Error al cargar módulos",
      );
      const modulos = data.modulos ?? [];
      const routes = new Set<string>();
      for (const modulo of modulos) {
        if (modulo.formularios.length > 0) {
          modulo.formularios.forEach((f) => {
            const cleanRoute =
              f.ruta.replace(/\\\//g, "/").replace(/\/+$/, "") || "/";
            routes.add(cleanRoute);
          });
        } else {
          const slug = `/${modulo.nombre.toLowerCase().replace(/\s+/g, "-")}`;
          routes.add(slug);
        }
      }
      set({ modulos, allowedRoutes: routes, loading: false });
    } catch (err: any) {
      set({
        error: err?.message ?? "Error al cargar módulos",
        modulos: [],
        allowedRoutes: new Set(),
        loading: false,
      });
      throw err;
    }
    };
    const promise = operation();
    pendingFetch = promise;
    try {
      await promise;
    } finally {
      if (pendingFetch === promise) pendingFetch = null;
    }
  },

  clearModulos: () => {
    set({
      modulos: [],
      allowedRoutes: new Set(),
      error: null,
      loading: false,
    });
  },
}));

modulosEventBus.subscribe(() => {
  void useModulesStore.getState().fetchModulos().catch(() => {
    // El store expone el error; evitamos rechazo no gestionado del evento.
  });
});
