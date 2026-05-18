import { httpClient } from "../../../http/httpClient";

const API_GENERAR_MATRICULA = "/api/matricula/generar";

export interface GenerarMatriculaResponse {
  success: boolean;
  message: string;
  data: {
    codigo_matricula: string;
    cuota: any;
    pago: any;
  };
}

export const matriculaService = {
  generarMatricula: (
    estudianteId: number,
    requierePago: boolean,
    monto: number, // ← nuevo
    observacion?: string,
  ) => {
    return httpClient.postAuth<GenerarMatriculaResponse>(
      API_GENERAR_MATRICULA,
      {
        estudiante_id: estudianteId,
        requiere_pago: requierePago,
        monto: monto,
        observacion: observacion || null,
      },
    );
  },
};
