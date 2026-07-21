import { httpClient } from "../../../http/httpClient";

import {
  ActualizarInscripcionResponse,
  CarreraAsignacion,
  DetalleEstudianteResponse,
  Estudiante,
  EstudianteForm,
  MateriasSemestreUnoResponse,
  RetiroMateriaPayload,
  SeleccionMateriaInscripcion,
  SeleccionMateriaPayload,
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
  return httpClient.getAuth<DetalleEstudianteResponse>(
    `/api/asignaciones/estudiantes/${idUsuario}`,
  );
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
    materiasPendientesAnteriores:
      response.materiasPendientesAnteriores ?? [],
    tienePendientesAnteriores: Boolean(response.tienePendientesAnteriores),
    totalPendientesAnteriores: Number(
      response.totalPendientesAnteriores ?? 0,
    ),
    materiasBloqueadasPrerequisito:
      response.materiasBloqueadasPrerequisito ?? [],
    totalMateriasBloqueadasPrerequisito: Number(
      response.totalMateriasBloqueadasPrerequisito ?? 0,
    ),
    esNivelInicial: Boolean(response.esNivelInicial),
    nivelSeleccionado: response.nivelSeleccionado,
    nivelesAcademicos: response.nivelesAcademicos ?? [],
    labelNivel: response.labelNivel,
    notaAprobacion:
      response.notaAprobacion !== undefined &&
      response.notaAprobacion !== null
        ? Number(response.notaAprobacion)
        : null,
    gestionActiva: response.gestionActiva ?? null,
  };
}

function normalizarAgregadas(
  selecciones: SeleccionMateriaInscripcion[],
): SeleccionMateriaPayload[] {
  return Array.from(
    new Map(
      selecciones
        .map((seleccion): SeleccionMateriaPayload => ({
          idMateria: Number(seleccion.idMateria),
          idGrupoMateriaDocente: Number(seleccion.idGrupoMateriaDocente),
          nivel: Number(seleccion.nivel),
          turno: seleccion.turno,
        }))
        .filter(
          (seleccion) =>
            Number.isFinite(seleccion.idMateria) &&
            seleccion.idMateria > 0 &&
            Number.isFinite(seleccion.idGrupoMateriaDocente) &&
            seleccion.idGrupoMateriaDocente > 0 &&
            Number.isFinite(seleccion.nivel) &&
            seleccion.nivel > 0,
        )
        .map((seleccion) => [seleccion.idMateria, seleccion]),
    ).values(),
  );
}

function normalizarRetiradas(
  selecciones: SeleccionMateriaInscripcion[],
): RetiroMateriaPayload[] {
  return Array.from(
    new Map(
      selecciones
        .map((seleccion): RetiroMateriaPayload => ({
          idMateria: Number(seleccion.idMateria),
          idGrupoMateriaDocente: Number(seleccion.idGrupoMateriaDocente),
        }))
        .filter(
          (seleccion) =>
            Number.isFinite(seleccion.idMateria) &&
            seleccion.idMateria > 0 &&
            Number.isFinite(seleccion.idGrupoMateriaDocente) &&
            seleccion.idGrupoMateriaDocente > 0,
        )
        .map((seleccion) => [seleccion.idGrupoMateriaDocente, seleccion]),
    ).values(),
  );
}

export async function actualizarMateriasInscripcion(
  idUsuario: number,
  idCarrera: number,
  agregar: SeleccionMateriaInscripcion[],
  quitar: SeleccionMateriaInscripcion[],
): Promise<ActualizarInscripcionResponse> {
  return httpClient.putAuth<ActualizarInscripcionResponse>(
    `/api/asignaciones/estudiantes/${idUsuario}/materias`,
    {
      idCarrera: Number(idCarrera),
      agregar: normalizarAgregadas(agregar),
      quitar: normalizarRetiradas(quitar),
    },
  );
}

export async function actualizarEstudianteAsignacion(
  idUsuario: number,
  form: EstudianteForm,
): Promise<{
  message: string;
  estudiante: Estudiante;
}> {
  return httpClient.putAuth<{
    message: string;
    estudiante: Estudiante;
  }>(`/api/asignaciones/estudiantes/${idUsuario}`, form);
}