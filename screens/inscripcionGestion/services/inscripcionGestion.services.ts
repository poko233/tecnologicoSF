import { httpClient } from "../../../http/httpClient";

import {
  AsignarCarrerasIGPayload,
  AsignarCarrerasIGResponse,
  DatosIGResponse,
  DetalleGruposCarreraIGResponse,
} from "../types/inscripcionGestion.types";

export async function getDatosInscripcionGestion(
  idGestion?: number | null,
): Promise<DatosIGResponse> {
  const query =
    idGestion !== undefined && idGestion !== null && Number(idGestion) > 0
      ? `?idGestion=${Number(idGestion)}`
      : "";

  return httpClient.getAuth<DatosIGResponse>(
    `/api/inscripcion-gestion/datos${query}`,
  );
}

export async function getGruposCarreraGestion(
  idGestion: number,
  idCarrera: number,
): Promise<DetalleGruposCarreraIGResponse> {
  const params = new URLSearchParams({
    idGestion: String(Number(idGestion)),
  });

  return httpClient.getAuth<DetalleGruposCarreraIGResponse>(
    `/api/inscripcion-gestion/carreras/${Number(idCarrera)}/grupos?${params.toString()}`,
  );
}

export async function postAsignarCarrerasGestion(
  payload: AsignarCarrerasIGPayload,
): Promise<AsignarCarrerasIGResponse> {
  return httpClient.postAuth<AsignarCarrerasIGResponse>(
    "/api/inscripcion-gestion/asignar-carreras",
    payload,
  );
}
