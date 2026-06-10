import { httpClient } from "../../../http/httpClient";
import {
  GrupoMateriaDocente,
  GuardarPayload,
  GuardarResponse,
  PlanillaData,
} from "../types/notas.types";

export async function fetchMisGrupos(): Promise<GrupoMateriaDocente[]> {
  const res = await httpClient.getAuth<{ data: GrupoMateriaDocente[] }>(
    "/api/notas/mis-grupos",
    "Error al obtener grupos",
  );
  return res.data;
}

export async function fetchPlanilla(idGrupo: number): Promise<PlanillaData> {
  const res = await httpClient.postAuth<{ data: PlanillaData }>(
    "/api/planilla",
    { id_grupo_materia_docente: idGrupo },
    "Error al obtener planilla",
  );
  return res.data;
}

export async function guardarPlanilla(
  payload: GuardarPayload,
): Promise<GuardarResponse> {
  const res = await httpClient.postAuth<GuardarResponse>(
    "/api/planilla/guardar",
    payload,
    "Error al guardar notas",
  );
  return res;
}

export async function descargarExcel(idGrupo: number): Promise<void> {
  const res = await httpClient._rawFetch(
    `/api/reportes/${idGrupo}/excel`,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `planilla_${idGrupo}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function abrirPDF(idGrupo: number): Promise<void> {
  const res = await httpClient._rawFetch(
    `/api/reportes/${idGrupo}/pdf/ver`,
    "application/pdf",
  );
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}