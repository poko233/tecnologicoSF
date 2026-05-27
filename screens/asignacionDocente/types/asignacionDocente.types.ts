export type Carrera = {
  idCarrera: number;
  nombreCarrera?: string;
  nombre?: string;
  codigoCarrera?: string;
  codigo?: string;
  duracionMeses?: number;
  cargaHoraria?: string;
  costo?: string | number;
  regimen?: "Anual" | "Semestral" | "Mensual" | string;
  tipo?: string;
  estadoCarrera?: "activo" | "inactivo" | string;
  estado?: string;
};

export type Materia = {
  idMateria: number;
  idCarrera?: number;
  nombreMateria?: string;
  nombre?: string;
  codigo?: string;
  sigla?: string;
  semestre?: number;
  estado?: string;
  idPrerequisito?: number | null;
};

export type Horario = {
  idHorario: number;
  horaInicio: string;
  horaFin: string;
  dia: string;
};

export type Grupo = {
  idGrupo: number;
  nombreGrupo?: string;
  nombre?: string;
  codigo?: string;
  codigoGrupo?: string;
  turno?: string;
  modalidad?: string;
  estado?: string;
  horarios?: Horario[];
};

export type UsuarioDocente = {
  id: number;
  usuario?: string;
  ci?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string | null;
};

export type Docente = {
  idDocente: number;
  profesion?: string;
  abreviaturaProfesional?: string | null;
  abreviaturaProfesion?: string | null;
  fechaRegistro?: string;
  estadoDocente?: string;
  usuario?: UsuarioDocente;
};

export type AsignacionDocente = {
  idGrupoMateriaDocente: number;
  idGrupo: number;
  idMateria: number;
  idDocente: number;
  materia?: Materia;
  grupo?: Grupo;
  docente?: Docente;
};

export type AsignacionDocenteResponse = {
  carreras: Carrera[];
  materias: Materia[];
  grupos: Grupo[];
  docentes: Docente[];
  asignaciones: AsignacionDocente[];
};

export type GuardarAsignacionPayload = {
  idMateria: number;
  idDocente: number;
  grupos: number[];
};