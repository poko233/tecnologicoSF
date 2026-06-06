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
