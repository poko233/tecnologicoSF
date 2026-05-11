import { httpClient } from "@http";
import {
    CreateModuloPayload,
    Modulo,
    UpdateModuloPayload,
} from "../types/modulo.types";

// Todas las llamadas al backend de módulos en un solo lugar

export const moduloService = {
  getAll: () =>
    httpClient.getAuth<Modulo[]>("/api/modulos", "Error al cargar módulos"),

  getById: (id: number) =>
    httpClient.getAuth<Modulo>(`/api/modulos/${id}`, "Error al cargar módulo"),

  create: (data: CreateModuloPayload) =>
    httpClient.postAuth<Modulo>("/api/modulos", data, "Error al crear módulo"),

  update: (id: number, data: UpdateModuloPayload) =>
    httpClient.putAuth<Modulo>(
      `/api/modulos/${id}`,
      data,
      "Error al actualizar módulo"
    ),

  delete: (id: number) =>
    httpClient.deleteAuth<{ message: string }>(
      `/api/modulos/${id}`,
      "Error al eliminar módulo"
    ),
};