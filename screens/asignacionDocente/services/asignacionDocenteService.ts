import { httpClient } from "../../../http/httpClient";
import {
    AsignacionDocenteResponse,
    GuardarAsignacionPayload,
} from "../types/asignacionDocente.types";

export const asignacionDocenteService = {
  listar() {
    return httpClient.getAuth<AsignacionDocenteResponse>(
      "/api/asignacion-docente"
    );
  },

  guardar(payload: GuardarAsignacionPayload) {
    return httpClient.postAuth<{ message: string }>(
      "/api/asignacion-docente",
      payload
    );
  },

  eliminarPorMateria(idMateria: number) {
    return httpClient.deleteAuth<{ message: string }>(
      `/api/asignacion-docente/materia/${idMateria}`
    );
  },
  eliminarAsignacion(idMateria: number, idDocente: number) {
  return httpClient.deleteAuth<{ message: string }>(
    `/api/asignacion-docente/${idMateria}/${idDocente}`
  );
},
};