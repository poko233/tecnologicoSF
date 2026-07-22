import { httpClient } from "@http";
import {
  CreateModuloPayload,
  Modulo,
  UpdateModuloPayload,
} from "../types/modulo.types";


interface BackendResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const moduloService = {
  getAll: async () => {
    const res = await httpClient.getAuth<BackendResponse<Modulo[]>>("/api/modulos", "Error al cargar módulos");
    // Asegurarse de que siempre retorne un array
    return Array.isArray(res.data) ? res.data : [];
  },

  create: async (data: CreateModuloPayload) => {
    const res = await httpClient.postAuth<BackendResponse<Modulo>>("/api/modulos", data, "Error al crear módulo");
    return res.data;
  },

  update: async (id: number, data: UpdateModuloPayload) => {
    const res = await httpClient.putAuth<BackendResponse<Modulo>>(`/api/modulos/${id}`, data, "Error al actualizar módulo");
    return res.data;
  },

  delete: (id: number) =>
    httpClient.deleteAuth<BackendResponse<any>>(`/api/modulos/${id}`, "Error al eliminar módulo"),

  reorder: async (items: Array<{ id: number; posicion: number }>) => {
    const res = await httpClient.postAuth<BackendResponse<any>>(
      "/api/modulos/reorder",
      items,
      "Error al reordenar módulos"
    );
    return res;
  },
};