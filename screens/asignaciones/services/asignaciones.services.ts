import { httpClient } from "../../../http/httpClient";

import {
  DetalleEstudianteResponse,
  Estudiante,
  EstudianteForm,
  InscribirResponse,
  MateriaSemestreUno,
  TurnoInscripcion,
} from "../types/asignaciones.types";

/**
 * Obtiene únicamente los estudiantes relacionados con la carrera elegida.
 * idCarrera es obligatorio para evitar cargar alumnos de todas las carreras.
 */
export async function getEstudiantesAsignaciones(
  idCarrera: number,
): Promise<Estudiante[]> {
  const response = await httpClient.getAuth<{
    estudiantes?: Estudiante[];
    data?: Estudiante[];
  }>(`/api/asignaciones/estudiantes?idCarrera=${idCarrera}`);

  return response.estudiantes ?? response.data ?? [];
}

/**
 * Obtiene el detalle académico y personal de un estudiante.
 */
export async function getDetalleEstudiante(
  idUsuario: number,
): Promise<DetalleEstudianteResponse> {
  const response = await httpClient.getAuth<DetalleEstudianteResponse>(
    `/api/asignaciones/estudiantes/${idUsuario}`,
  );

  return response;
}

/**
 * Obtiene las materias de primer semestre de la carrera elegida
 * para poder inscribir al estudiante.
 */
export async function getMateriasSemestreUno(
  idUsuario: number,
  idCarrera?: number | null,
): Promise<MateriaSemestreUno[]> {
  const query =
    idCarrera !== undefined && idCarrera !== null && idCarrera > 0
      ? `?idCarrera=${idCarrera}`
      : "";

  const response = await httpClient.getAuth<{
    materias?: MateriaSemestreUno[];
    data?: MateriaSemestreUno[];
  }>(`/api/asignaciones/estudiantes/${idUsuario}/semestre-uno${query}`);

  return response.materias ?? response.data ?? [];
}

/**
 * Inscribe al estudiante en las materias disponibles del semestre 1,
 * según la carrera y turno seleccionados.
 */
export async function inscribirSemestreUno(
  idUsuario: number,
  idCarrera: number,
  turno: TurnoInscripcion,
): Promise<InscribirResponse> {
  const response = await httpClient.postAuth<InscribirResponse>(
    `/api/asignaciones/estudiantes/${idUsuario}/inscribir-semestre-uno`,
    {
      idCarrera,
      turno,
    },
  );

  return response;
}

/**
 * Actualiza los datos básicos del estudiante desde Asignaciones.
 */
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