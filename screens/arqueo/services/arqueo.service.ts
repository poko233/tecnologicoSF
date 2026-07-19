// services/arqueo.service.ts
import { httpClient } from "@/http/httpClient";
import { Arqueo, Conteo, Pago } from "../types/arqueo.types";

// Tipo para la respuesta paginada de pagos
interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const arqueoService = {
  // Obtener arqueo activo del usuario autenticado
  getActive: () =>
    httpClient.getAuth<{ data: Arqueo | null }>("/api/arqueos/abierto"),

  // Abrir nuevo turno
  open: (turno: string, saldo_anterior: number) =>
    httpClient.postAuth<{ data: Arqueo }>("/api/arqueos", {
      turno,
      saldo_anterior,
    }),

  // Cerrar turno
  close: (id: number, conteo: Conteo) =>
    httpClient.postAuth<{ data: Arqueo }>(`/api/arqueos/${id}/cerrar`, conteo),

  // Obtener historial paginado
  getHistory: (
    page = 1,
    estado?: string,
    search?: string,
    turno?: string,
    fecha_apertura_from?: string,
    fecha_apertura_to?: string,
    fecha_cierre_from?: string,
    fecha_cierre_to?: string,
    total_min?: number,
    total_max?: number,
    user_id?: number,
  ) => {
    const params = new URLSearchParams();
    if (estado) params.append("estado", estado);
    if (search) params.append("search", search);
    if (turno) params.append("turno", turno);
    if (fecha_apertura_from)
      params.append("fecha_apertura_from", fecha_apertura_from);
    if (fecha_apertura_to)
      params.append("fecha_apertura_to", fecha_apertura_to);
    if (fecha_cierre_from)
      params.append("fecha_cierre_from", fecha_cierre_from);
    if (fecha_cierre_to) params.append("fecha_cierre_to", fecha_cierre_to);
    if (total_min !== undefined) params.append("total_min", String(total_min));
    if (total_max !== undefined) params.append("total_max", String(total_max));
    if (user_id) params.append("user_id", String(user_id));
    params.append("page", String(page));
    return httpClient.getAuth<{ data: Arqueo[] }>(
      `/api/arqueos?${params.toString()}`,
    );
  },

  // Obtener un arqueo por ID
  getById: (id: number) =>
    httpClient.getAuth<{ data: Arqueo }>(`/api/arqueos/${id}`),

  // Obtener pagos asociados a un arqueo (respuesta paginada)
  getPagosByArqueoId: (arqueoId: number) =>
    httpClient.getAuth<{ data: PaginatedResponse<Pago> }>(
      `/api/pagos?arqueo_id=${arqueoId}`,
    ),
};
