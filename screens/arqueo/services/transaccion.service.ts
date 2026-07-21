// screens/arqueo/services/transaccion.service.ts
import { httpClient } from "@/http/httpClient";
import { TipoTransaccion, Transaccion } from "../types/transaccion.types";

export const transaccionService = {
  getTiposTransaccion: () =>
    httpClient.getAuth<{ data: TipoTransaccion[] }>("/api/tipos-transaccion"),

  // --- INGRESOS ---
  getIngresos: (arqueoId: number) =>
    httpClient.getAuth<{ data: Transaccion[] }>(
      `/api/arqueos/${arqueoId}/ingresos`,
    ),

  createIngreso: (arqueoId: number, payload: any) =>
    httpClient.postAuth<{ data: Transaccion }>(
      `/api/arqueos/${arqueoId}/ingresos`,
      payload,
    ),

  //NUEVO: Actualizar estado de un ingreso
  updateIngresoEstado: (
    arqueoId: number,
    ingresoId: number,
    estado: "VALIDO" | "ANULADO",
  ) =>
    httpClient.patchAuth<{ data: Transaccion }>(
      `/api/arqueos/${arqueoId}/ingresos/${ingresoId}`,
      { estado },
    ),

  // --- EGRESOS ---
  getEgresos: (arqueoId: number) =>
    httpClient.getAuth<{ data: Transaccion[] }>(
      `/api/arqueos/${arqueoId}/egresos`,
    ),

  createEgreso: (arqueoId: number, payload: any) =>
    httpClient.postAuth<{ data: Transaccion }>(
      `/api/arqueos/${arqueoId}/egresos`,
      payload,
    ),

  //Actualizar estado de un egreso
  updateEgresoEstado: (
    arqueoId: number,
    egresoId: number,
    estado: "VALIDO" | "ANULADO",
  ) =>
    httpClient.patchAuth<{ data: Transaccion }>(
      `/api/arqueos/${arqueoId}/egresos/${egresoId}`,
      { estado },
    ),
};
