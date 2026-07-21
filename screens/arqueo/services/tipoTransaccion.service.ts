// screens/arqueo/services/tipoTransaccion.service.ts
import { httpClient } from "@/http/httpClient";
import { TipoTransaccion } from "../types/transaccion.types";

export const tipoTransaccionService = {
  getAll: () =>
    httpClient.getAuth<{ data: TipoTransaccion[] }>("/api/tipos-transaccion"),
  create: (data: {
    codigo: string;
    transaccion: string;
    tipo: "INGRESO" | "EGRESO";
  }) =>
    httpClient.postAuth<{ data: TipoTransaccion }>(
      "/api/tipos-transaccion",
      data,
    ),
  update: (
    id: number,
    data: Partial<{
      codigo: string;
      transaccion: string;
      tipo: "INGRESO" | "EGRESO";
    }>,
  ) =>
    httpClient.putAuth<{ data: TipoTransaccion }>(
      `/api/tipos-transaccion/${id}`,
      data,
    ),
  delete: (id: number) => httpClient.deleteAuth(`/api/tipos-transaccion/${id}`),
};
