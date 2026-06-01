// screens/asistencia/services/asistencia.service.ts
import { httpClient } from "@/http/httpClient";
import {
  AsistenciaBody,
  BatchAsistenciaBody,
  BatchAsistenciaResponse,
  EstudiantesResponse,
  GrupoAsignado,
} from "../types/asistencia.types";

export interface EstudiantesResponseWithMessage {
  data: EstudiantesResponse;
  message?: string;
}

export const getGruposAsignados = (signal?: AbortSignal) =>
  httpClient.getAuth<{ data: GrupoAsignado[] }>(
    "/api/docente/grupos-asignados",
    "Error al cargar grupos",
    signal,
  );

export const getEstudiantesAsistencia = (id: number, signal?: AbortSignal) =>
  httpClient.getAuth<EstudiantesResponseWithMessage>(
    `/api/docente/grupos-asignados/${id}/estudiantes`,
    "Error al cargar estudiantes",
    signal,
  );

export const registrarAsistencia = (body: AsistenciaBody) =>
  httpClient.postAuth<{ data: any; message: string }>(
    "/api/docente/asistencia",
    body,
  );

export const batchRegistrarAsistencia = (body: BatchAsistenciaBody) =>
  httpClient.postAuth<BatchAsistenciaResponse>(
    "/api/docente/asistencia/batch",
    body,
  );
