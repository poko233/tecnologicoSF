import { httpClient } from "../../../http/httpClient";
import { ElementoEvaluativo } from "../types/notas.types";

export async function fetchElementosEvaluativos(
  idEC: number,
): Promise<ElementoEvaluativo[]> {
  const res = await httpClient.postAuth<{ data: ElementoEvaluativo[] }>(
    "/api/elementos-evaluativos/listar",
    { id_elemento_competencia: idEC },
    "Error al obtener elementos evaluativos",
  );
  return res.data;
}

export async function crearElementoEvaluativo(data: {
  id_elemento_competencia: number;
  nombre: string;
  puntaje_maximo?: number;
}): Promise<ElementoEvaluativo> {
  const res = await httpClient.postAuth<{ data: ElementoEvaluativo }>(
    "/api/elementos-evaluativos/crear",
    data,
    "Error al crear elemento evaluativo",
  );
  return res.data;
}

export async function actualizarElementoEvaluativo(data: {
  id: number;
  nombre?: string;
  puntaje_maximo?: number;
  estado?: "activo" | "inactivo";
}): Promise<ElementoEvaluativo> {
  const res = await httpClient.postAuth<{ data: ElementoEvaluativo }>(
    "/api/elementos-evaluativos/actualizar",
    data,
    "Error al actualizar elemento evaluativo",
  );
  return res.data;
}
