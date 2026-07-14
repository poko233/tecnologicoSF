import { httpClient } from "../../../http/httpClient";

import {
    DatosIGResponse,
    InscribirIGPayload,
    InscribirIGResponse,
} from "../types/inscripcionGestion.types";

export async function getDatosInscripcionGestion(
  idGestion?: number | null,
): Promise<DatosIGResponse> {
  const query =
    idGestion !== undefined && idGestion !== null && Number(idGestion) > 0
      ? `?idGestion=${Number(idGestion)}`
      : "";

  const response = await httpClient.getAuth<DatosIGResponse>(
    `/api/inscripcion-gestion/datos${query}`,
  );

  return response;
}

export async function postInscribirGestion(
  payload: InscribirIGPayload,
): Promise<InscribirIGResponse> {
  const response = await httpClient.postAuth<InscribirIGResponse>(
    "/api/inscripcion-gestion/inscribir",
    payload,
  );

  return response;
}