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
  
export const descargarReporteAsistencia = async (
  idGrupoMateriaDocente: number,
  formato: "xlsx" | "pdf",
): Promise<{ blob: Blob; filename: string }> => {
  const endpoint = formato === "pdf" ? "pdf" : "excel";
  const mime =
    formato === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const res = await (httpClient as any)._rawFetch(
    `/api/docente/grupos-asignados/${idGrupoMateriaDocente}/reporte/${endpoint}`,
    mime,
  );

  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]+)/i);
  const ext = formato === "pdf" ? "pdf" : "xlsx";
  const filename =
    match?.[1]?.trim() ??
    `asistencia_grupo${idGrupoMateriaDocente}.${ext}`;
  return { blob, filename };
};