// screens/asistencia/types/asistencia.types.ts

export interface GrupoAsignado {
  id_grupo_materia_docente: number;
  grupo: string;
  turno: string;
  materia: string;
  carrera: string;
  regimen: string;
}

export interface ListaAsistencia {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface Horario {
  idHorario: number;
  horaInicio: string;
  horaFin: string;
  dia?: string;
}

export interface AsistenciaHoyItem {
  idHorario: number;
  horaInicio: string;
  horaFin: string;
  dia?: string;
  asistencia: {
    tipo: "Presente" | "Falta" | "Permiso" | "Atraso";
    observacion: string | null;
  } | null;
}

export interface EstudianteAsistencia {
  id_inscripcion: number;
  id_usuario: number;
  nombre_completo: string;
  foto: string | null;
  carrera: string | null;
  asistencias_hoy: AsistenciaHoyItem[];
}

export interface EstudiantesResponse {
  lista_asistencia: ListaAsistencia;
  horarios: Horario[];
  estudiantes: EstudianteAsistencia[];
  message?: string;
}

export interface AsistenciaBody {
  id_inscripcion: number;
  id_lista_asistencia: number;
  tipo: "Presente" | "Falta" | "Permiso" | "Atraso";
  observacion?: string;
  fecha?: string;
  idHorario?: number | null;
}

export type AsistenciaTipo = "Presente" | "Falta" | "Permiso" | "Atraso";

export interface BatchAsistenciaItem {
  id_inscripcion: number;
  id_lista_asistencia: number;
  tipo: AsistenciaTipo;
  observacion?: string | null;
  fecha?: string | null;
  idHorario?: number | null;
}

export interface BatchAsistenciaBody {
  asistencias: BatchAsistenciaItem[];
}

export interface BatchAsistenciaResponse {
  message: string;
  procesados: number;
  errores: { indice: number; id_inscripcion: number; errores: string[] }[];
}
