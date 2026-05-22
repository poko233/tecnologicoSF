import { httpClient } from "../../../http/httpClient";
import { Docente, DocenteForm, DocentesResponse } from "../types/docente.types";

export const docenteService = {
  listar() {
    return httpClient.getAuth<DocentesResponse>("/api/docentes");
  },

  crear(payload: DocenteForm) {
    return httpClient.postAuth<{ message: string; docente: Docente }>(
      "/api/docentes",
      payload
    );
  },

  actualizar(idDocente: number, payload: DocenteForm) {
    return httpClient.putAuth<{ message: string; docente: Docente }>(
      `/api/docentes/${idDocente}`,
      payload
    );
  },

  desactivar(idDocente: number) {
    return httpClient.deleteAuth<{ message: string }>(
      `/api/docentes/${idDocente}`
    );
  },

  activar(idDocente: number) {
    return httpClient.putAuth<{ message: string }>(
      `/api/docentes/${idDocente}/activar`,
      {}
    );
  },
};