// screens/cuota/services/pago.service.ts
import { httpClient } from "../../../http/httpClient";
import { Pago } from "../types/pago.types";

const API_PAGOS = "/api/pagos";

export const pagoService = {
  /**
   * Obtiene el historial de pagos, opcionalmente filtrado por usuario y método.
   */
  getPagos: (params?: {
    idUsuario?: number;
    metodo?: string;
    per_page?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.idUsuario)
      query.append("idUsuario", params.idUsuario.toString());
    if (params?.metodo) query.append("metodo", params.metodo);
    if (params?.per_page) query.append("per_page", params.per_page.toString());
    const qs = query.toString();
    return httpClient.getAuth<{
      success: boolean;
      data: { data: Pago[] } & any;
    }>(`${API_PAGOS}${qs ? `?${qs}` : ""}`);
  },

  /**
   * Registra un pago para una o varias cuotas.
   */
  registrarPago: (payload: {
    idUsuario: number;
    cuotas: number[];
    metodo: string;
    monto?: number;
    comprobante?: string;
    observacion?: string;
  }) => {
    return httpClient.postAuth<{
      success: boolean;
      message: string;
      data: Pago;
    }>(API_PAGOS, payload);
  },
};
