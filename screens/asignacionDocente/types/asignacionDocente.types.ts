export type Materia = {
  idMateria: number;
  nombreMateria?: string;
  nombre?: string;
  codigo?: string;
  sigla?: string;
  semestre?: number;
  estado?: string;
  idPrerequisito?: number | null;
};

export type Grupo = {
  idGrupo: number;
  nombreGrupo?: string;
  nombre?: string;
  codigo?: string;
  turno?: string;
  estado?: string;
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
