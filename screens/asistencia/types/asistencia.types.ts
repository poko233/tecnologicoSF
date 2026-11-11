// screens/asistencia/types/asistencia.types.ts

export type SesionEstado = 'programada' | 'tomada' | 'cancelada' | 'feriado';
export type AsistenciaTipo = 'Presente' | 'Falta' | 'Atraso' | 'Permiso';
export type RequiresConfiguracion = 'fechas' | 'horarios' | null;
export type OrigenFechas = 'materia' | 'gestion' | null;
export type GestionEstado = 'activo' | 'cerrado' | 'inactivo';

export interface GrupoAsignado {
  id_grupo_materia_docente: number;
  grupo: string;
  turno: string;
  materia: string;
  carrera: string | null;
  regimen: string | null;
}

export interface GrupoMateriaDocenteDetalle {
  id: number;
  id_materia: number;
  id_grupo: number;
  grupo: string;
  materia: string;
  turno: string;
  carrera: string | null;
  regimen: string | null;
}

export interface Gestion {
  id: number;
  nombre: string;
  estado: GestionEstado;
}

export interface FechasSugeridas {
  fecha_inicio: string;
  fecha_fin: string;
  origen: 'gestion';
}

export interface Generacion {
  creadas: number;
  existentes: number;
  origen_fechas: OrigenFechas;
}

export interface SesionResumen {
  presentes: number;
  faltas: number;
  atrasos: number;
  permisos: number;
  sin_marcar: number;
}

export interface Sesion {
  id: number;
  fecha: string;
  idHorario: number | null;
  horaInicio: string | null;
  horaFin: string | null;
  dia: string | null;
  estado: SesionEstado;
  tomada_por: string | null;
  tomada_en: string | null;
  observacion: string | null;
  resumen: SesionResumen;
}

export interface AsistenciaRegistro {
  tipo: AsistenciaTipo;
  observacion: string | null;
}

export interface EstudianteAsistencia {
  id_inscripcion: number;
  id_usuario: number;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  foto: string | null;
  carrera?: string | null;
  asistencias: Record<string, AsistenciaRegistro>;
}

export interface GrupoData {
  grupo_materia_docente: GrupoMateriaDocenteDetalle;
  gestion: Gestion;
  requires_configuracion: RequiresConfiguracion;
  fechas_sugeridas: FechasSugeridas | null;
  generacion: Generacion;
  sesiones: Sesion[];
  estudiantes: EstudianteAsistencia[];
}

export interface GrupoDataResponse {
  data: GrupoData;
}

export interface AsistenciaItemPayload {
  id_inscripcion: number;
  tipo: AsistenciaTipo;
  observacion?: string | null;
}

export interface TomarSesionPayload {
  asistencias: AsistenciaItemPayload[];
}

export interface CambiarEstadoSesionPayload {
  estado: 'cancelada' | 'feriado';
  motivo: string;
}

export interface ActualizarFechasMateriaPayload {
  fecha_inicio: string;
  fecha_fin: string;
}

export interface SesionResponse {
  message: string;
  data: Sesion;
}

export interface ActualizarFechasMateriaResponse {
  message: string;
  data: { id_materia: number; fecha_inicio: string | null; fecha_fin: string | null; };
}

export interface MessageResponse {
  message: string;
  data: Sesion;
}

export type LocalAttendanceState = Record<number, { tipo: AsistenciaTipo | null; observacion: string }>;

export interface Horario {
  idHorario: number;
  horaInicio: string;
  horaFin: string;
  dia?: string;
}
