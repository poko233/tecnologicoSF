import { httpClient } from "../../../http/httpClient";

import {
  CarreraAsignacion,
  DetalleEstudianteResponse,
  Estudiante,
  EstudianteForm,
  InscribirResponse,
  MateriasSemestreUnoResponse,
  TurnoInscripcion,
} from "../types/asignaciones.types";

export async function getCarrerasAsignaciones(): Promise<CarreraAsignacion[]> {
  const response = await httpClient.getAuth<{
    carreras?: CarreraAsignacion[];
    data?: CarreraAsignacion[];
  }>("/api/asignaciones/carreras");

  return response.carreras ?? response.data ?? [];
}

export async function getEstudiantesAsignaciones(
  idCarrera: number,
  nivel?: number | null,
): Promise<Estudiante[]> {
  const params = new URLSearchParams();

  params.append("idCarrera", String(idCarrera));

  if (nivel !== undefined && nivel !== null && Number(nivel) > 0) {
    params.append("nivel", String(nivel));
  }

  const response = await httpClient.getAuth<{
    estudiantes?: Estudiante[];
    data?: Estudiante[];
  }>(`/api/asignaciones/estudiantes?${params.toString()}`);

  return response.estudiantes ?? response.data ?? [];
}

export async function getDetalleEstudiante(
  idUsuario: number,
): Promise<DetalleEstudianteResponse> {
  const response = await httpClient.getAuth<DetalleEstudianteResponse>(
    `/api/asignaciones/estudiantes/${idUsuario}`,
  );

  return response;
}

export async function getMateriasSemestreUno(
  idUsuario: number,
  idCarrera?: number | null,
  nivel?: number | null,
): Promise<MateriasSemestreUnoResponse> {
  const params = new URLSearchParams();

  if (idCarrera !== undefined && idCarrera !== null && Number(idCarrera) > 0) {
    params.append("idCarrera", String(idCarrera));
  }

  if (nivel !== undefined && nivel !== null && Number(nivel) > 0) {
    params.append("nivel", String(nivel));
  }

  const query = params.toString();

  const response = await httpClient.getAuth<MateriasSemestreUnoResponse>(
    `/api/asignaciones/estudiantes/${idUsuario}/semestre-uno${
      query ? `?${query}` : ""
    }`,
  );

  return {
    materias: response.materias ?? response.data ?? [],

    materiasPendientesAnteriores: response.materiasPendientesAnteriores ?? [],
    tienePendientesAnteriores: Boolean(response.tienePendientesAnteriores),
    totalPendientesAnteriores: Number(response.totalPendientesAnteriores ?? 0),

    materiasBloqueadasPrerequisito:
      response.materiasBloqueadasPrerequisito ?? [],
    totalMateriasBloqueadasPrerequisito: Number(
      response.totalMateriasBloqueadasPrerequisito ?? 0,
    ),

    esNivelInicial: Boolean(response.esNivelInicial),
    nivelSeleccionado: response.nivelSeleccionado,
    labelNivel: response.labelNivel,
    gestionActiva: response.gestionActiva ?? null,
  };
}

export async function inscribirSemestreUno(
  idUsuario: number,
  idCarrera: number,
  turno: TurnoInscripcion,
  nivel?: number | null,
): Promise<InscribirResponse> {
  const payload: {
    idCarrera: number;
    turno: TurnoInscripcion;
    nivel?: number;
  } = {
    idCarrera,
    turno,
  };

  if (nivel !== undefined && nivel !== null && Number(nivel) > 0) {
    payload.nivel = Number(nivel);
  }

  const response = await httpClient.postAuth<InscribirResponse>(
    `/api/asignaciones/estudiantes/${idUsuario}/inscribir-semestre-uno`,
    payload,
  );

  return response;
}

export async function actualizarEstudianteAsignacion(
  idUsuario: number,
  form: EstudianteForm,
): Promise<{
  message: string;
  estudiante: Estudiante;
}> {
  const response = await httpClient.putAuth<{
    message: string;
    estudiante: Estudiante;
  }>(`/api/asignaciones/estudiantes/${idUsuario}`, form);

  return response;
}