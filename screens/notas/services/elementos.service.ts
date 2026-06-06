import { httpClient } from "../../../http/httpClient";
import { ElementoCompetencia } from "../types/notas.types";

export async function fetchElementosCompetencia(
  idGrupo: number,
): Promise<ElementoCompetencia[]> {
  const res = await httpClient.postAuth<{ data: ElementoCompetencia[] }>(
    "/api/elementos-competencia/listar",
    { id_grupo_materia_docente: idGrupo },
    "Error al obtener elementos de competencia",
  );
  return res.data;
}

export async function crearElementoCompetencia(data: {
  id_grupo_materia_docente: number;
  nombre: string;
  observaciones?: string;
}): Promise<ElementoCompetencia> {
  const res = await httpClient.postAuth<{ data: ElementoCompetencia }>(
    "/api/elementos-competencia/crear",
    data,
    "Error al crear elemento de competencia",
  );
  return res.data;
}

export async function actualizarElementoCompetencia(data: {
  id: number;
  nombre?: string;
  observaciones?: string;
  estado?: "activo" | "inactivo";
}): Promise<ElementoCompetencia> {
  const res = await httpClient.postAuth<{ data: ElementoCompetencia }>(
    "/api/elementos-competencia/actualizar",
    data,
    "Error al actualizar elemento de competencia",
  );
  return res.data;
}
