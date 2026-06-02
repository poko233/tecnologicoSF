// screens/cuota/services/pago.service.ts
import { Linking } from "react-native";
import { BASE_URL, httpClient } from "../../../http/httpClient";
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
  verRecibo: async (idPago: number): Promise<void> => {
    const url = `${BASE_URL}/api/pagos/${idPago}/recibo`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      throw { message: "No se puede abrir el recibo en este dispositivo." };
    }
    await Linking.openURL(url);
  },
};
