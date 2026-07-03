// screens/gestiones/services/gestiones.service.ts
import { httpClient } from "@/http/httpClient";
import {
  Gestion,
  GestionesResponse,
  GestionFilters,
  GestionFormData,
  GestionUpdateData,
} from "../types/gestiones.types";

export const gestionesService = {
  // ✅ Agregamos el parámetro signal opcional
  listar: (
    filters: GestionFilters = {},
    signal?: AbortSignal,
  ): Promise<GestionesResponse> => {
    const params = new URLSearchParams();
    if (filters.estado) params.append("estado", filters.estado);
    if (filters.periodo) params.append("periodo", filters.periodo);
    if (filters.anio) params.append("anio", String(filters.anio));
    if (filters.page) params.append("page", String(filters.page));
    const query = params.toString();

    // ✅ Pasamos el signal al httpClient
    return httpClient.getAuth<GestionesResponse>(
      `/api/gestiones${query ? `?${query}` : ""}`,
      undefined,
      signal,
    );
  },

  ver: (id: number): Promise<{ data: Gestion; message: string }> =>
    httpClient.getAuth(`/api/gestiones/${id}`),

  crear: (data: GestionFormData): Promise<{ data: Gestion; message: string }> =>
    httpClient.postAuth("/api/gestiones", data),

  actualizar: (
    id: number,
    data: GestionUpdateData,
  ): Promise<{ data: Gestion; message: string }> =>
    httpClient.putAuth(`/api/gestiones/${id}`, data),

  cerrar: (id: number): Promise<{ data: Gestion; message: string }> =>
    httpClient.postAuth(`/api/gestiones/${id}/cerrar`, {}),

  eliminar: (id: number): Promise<void> =>
    httpClient.deleteAuth(`/api/gestiones/${id}`),
};
