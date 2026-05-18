import { httpClient } from "../../../http/httpClient";
import { CrearPlanPagoData, PlanPago } from "../types/planPago.types";

const API_BASE = "/api/planes-pago";

export const planPagoService = {
  // Listar planes de un estudiante
  // Cambia el tipo de retorno para que coincida con la respuesta real
  listarPorEstudiante: (usuarioId: number) => {
    return httpClient.getAuth<{ success: boolean; data: PlanPago[] }>(
      `${API_BASE}?usuario_id=${usuarioId}`,
    );
  },

  // Crear un nuevo plan de pago
  crear: (data: CrearPlanPagoData) => {
    return httpClient.postAuth<{
      success: boolean;
      message: string;
      data: PlanPago;
    }>(API_BASE, data);
  },

  // Eliminar un plan de pago
  eliminar: (planId: number) => {
    return httpClient.deleteAuth<{ success: boolean; message: string }>(
      `${API_BASE}/${planId}`,
    );
  },
};
