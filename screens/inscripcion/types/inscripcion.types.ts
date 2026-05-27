export type Genero =
  | "Masculino"
  | "Femenino";

export type DepartamentoBolivia =
  | "La Paz"
  | "Cochabamba"
  | "Santa Cruz"
  | "Oruro"
  | "Potosí"
  | "Chuquisaca"
  | "Tarija"
  | "Beni"
  | "Pando";

export interface HorarioGrupo {
  idHorario: number;

  dia: string;

  horaInicio: string;

  horaFin: string;
}

export interface GrupoSeleccionado {
  idGrupo: number;

  idMateria?: number;

  idDocente?: number;

  nombre: string;

  nombreGrupo?: string;

  codigo: string;

  paralelo: string;

  turno:
    | "mañana"
    | "tarde"
    | "noche"
    | "Mañana"
    | "Tarde"
    | "Noche"
    | string;

  horario: number | string;

  gestion: string;

  cupos: number | string;

  capacidad?: number | string;

  tipo: string;

  estado: string;

  horarios?: HorarioGrupo[];

  nombreMateria?: string;

  nombreCarrera?: string;
}

export interface InscripcionFormData {
  apellidoPaterno: string;

  apellidoMaterno: string;

  nombres: string;

  genero: Genero;

  carnet: string;

  email: string;

  expedidoEn: DepartamentoBolivia;

  fechaNacimiento: string;

  direccion: string;

  celular: string;

  referenciaNombre: string;

  referenciaParentesco: string;

  referenciaNumero: string;

  gruposSeleccionados: GrupoSeleccionado[];
}

export interface InscripcionErrors {
  apellidoPaterno?: string;

  apellidoMaterno?: string;

  nombres?: string;

  genero?: string;

  carnet?: string;

  email?: string;

  expedidoEn?: string;

  fechaNacimiento?: string;

  direccion?: string;

  celular?: string;

  referenciaNombre?: string;

  referenciaParentesco?: string;

  referenciaNumero?: string;
}

/* =========================================================
   PASO 2 - ACADÉMICO
========================================================= */

export type TipoInscripcion =
  | "carrera"
  | "curso";

export interface Carrera {
  idCarrera: number;

  nombreCarrera: string;

  codigo: string;

  tipo:
    | "Carrera"
    | "Curso"
    | "Capacitacion"
    | string;

  duracionMeses: number;

  cargaHoraria: string;

  costo: number | string;

  regimen:
    | "Anual"
    | "Semestral"
    | "Mensual"
    | string;

  denominacionTituloProfesional?:
    | string
    | null;

  cuotaMes?:
    | number
    | string
    | null;

  numeroCuotas?:
    | number
    | null;

  estadoCarrera:
    | "activo"
    | "inactivo";

  idArea?: number | null;
}

export interface Materia {
  idMateria: number;

  idCarrera?: number;

  nombreMateria: string;

  codigo: string;

  semestre: number;

  estado: string;

  idPrerequisito?:
    | number
    | null;
}

export interface Grupo {
  idGrupo: number;

  idMateria?: number;

  idDocente?: number;

  nombre: string;

  nombreGrupo?: string;

  codigo: string;

  paralelo: string;

  turno:
    | "mañana"
    | "tarde"
    | "noche"
    | "Mañana"
    | "Tarde"
    | "Noche"
    | string;

  horario: number | string;

  gestion: string;

  cupos: number | string;

  capacidad?: number | string;

  tipo: string;

  estado: string;

  horarios?: HorarioGrupo[];

  nombreMateria?: string;
}

export interface CarrerasResponse {
  carreras: Carrera[];
}

export interface MateriasResponse {
  materias: Materia[];
}

export interface GruposResponse {
  grupos: Grupo[];
}

export interface InscripcionAcademicaPayload {
  idUsuario: number;

  idCarrera: number;

  grupos: number[];
}

/* =========================================================
   PASO 4 - RESUMEN FINAL
========================================================= */

export interface DocumentoResumen {
  idDocumentoEstudiante: number;

  nombreDocumento: string;

  ubicacionArchivo: string;

  estadoDocumento:
    | "Debe"
    | "Entregado"
    | string;
}

export interface ResumenInscripcion {
  usuario: {
    id: number;

    nombres: string;

    apellidoPaterno: string;

    apellidoMaterno: string;

    ci: string;

    email?: string;

    celular?: string;

    direccion?: string;
  };

  carrera: Carrera | null;

  grupos: Grupo[];

  documentos: DocumentoResumen[];

  validacion: {
    datosPersonales: boolean;

    datosAcademicos: boolean;

    documentosCargados: boolean;
  };
}