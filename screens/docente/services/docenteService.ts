import { httpClient } from "../../../http/httpClient";

import {
  AsignarUsuarioExistentePayload,
  Docente,
  DocenteForm,
  DocentesResponse,
  UsuariosDisponiblesResponse,
} from "../types/docente.types";

export const docenteService = {
  listar() {
    return httpClient.getAuth<DocentesResponse>("/api/docentes");
  },

  crear(payload: DocenteForm) {
    return httpClient.postAuth<{ message: string; docente: Docente }>(
      "/api/docentes",
      payload,
    );
  },

  actualizar(idDocente: number, payload: DocenteForm) {
    return httpClient.putAuth<{ message: string; docente: Docente }>(
      `/api/docentes/${idDocente}`,
      payload,
    );
  },

  desactivar(idDocente: number) {
    return httpClient.deleteAuth<{ message: string }>(
      `/api/docentes/${idDocente}`,
    );
  },

  activar(idDocente: number) {
    return httpClient.putAuth<{ message: string }>(
      `/api/docentes/${idDocente}/activar`,
      {},
    );
  },

  listarUsuariosDisponibles(buscar = "", pagina = 1) {
    const parametros = [`page=${Math.max(1, pagina)}`];
    const texto = buscar.trim();

    if (texto) {
      parametros.push(`buscar=${encodeURIComponent(texto)}`);
    }

    return httpClient.getAuth<UsuariosDisponiblesResponse>(
      `/api/docentes/usuarios-disponibles?${parametros.join("&")}`,
    );
  },

  asignarUsuarioExistente(payload: AsignarUsuarioExistentePayload) {
    return httpClient.postAuth<{ message: string; docente: Docente }>(
      "/api/docentes/asignar-usuario-existente",
      payload,
    );
  },
};