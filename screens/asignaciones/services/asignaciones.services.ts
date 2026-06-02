import { httpClient } from "../../../http/httpClient";
import {
    DetalleEstudianteResponse,
    Estudiante,
    EstudianteForm,
    InscribirResponse,
    MateriaSemestreUno,
} from "../types/asignaciones.types";

export async function getEstudiantesAsignaciones() {
  const response = await httpClient.getAuth<{ estudiantes: Estudiante[] }>(
    "/api/asignaciones/estudiantes"
  );

  return response.estudiantes ?? [];
}

export async function getDetalleEstudiante(idUsuario: number) {
  const response = await httpClient.getAuth<DetalleEstudianteResponse>(
    `/api/asignaciones/estudiantes/${idUsuario}`
  );

  return response;
}

export async function getMateriasSemestreUno(
  idUsuario: number,
  idCarrera?: number
) {
  const query = idCarrera ? `?idCarrera=${idCarrera}` : "";

  const response = await httpClient.getAuth<{ materias: MateriaSemestreUno[] }>(
    `/api/asignaciones/estudiantes/${idUsuario}/semestre-uno${query}`
  );

  return response.materias ?? [];
}

export async function inscribirSemestreUno(
  idUsuario: number,
  idCarrera?: number
) {
  const response = await httpClient.postAuth<InscribirResponse>(
    `/api/asignaciones/estudiantes/${idUsuario}/inscribir-semestre-uno`,
    {
      idCarrera,
    }
  );

  return response;
}

export async function actualizarEstudianteAsignacion(
  idUsuario: number,
  form: EstudianteForm
) {
  const response = await httpClient.putAuth<{
    message: string;
    estudiante: Estudiante;
  }>(
    `/api/asignaciones/estudiantes/${idUsuario}`,
    form
  );

  return response;
}