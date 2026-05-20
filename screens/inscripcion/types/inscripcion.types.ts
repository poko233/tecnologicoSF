export type Genero = "Masculino" | "Femenino";

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

export interface GrupoSeleccionado {
  idGrupo: number;
  nombre: string;
  codigo: string;
  paralelo: string;
  turno: "mañana" | "tarde" | "noche";
  horario: number | string;
  gestion: string;
  cupos: number | string;
  tipo: "Capacitacion" | "Curso";
  estado: string;
  nombreMateria?: string;
  nombreCarrera?: string;
}

export interface InscripcionFormData {
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  genero: Genero;
  carnet: string;
  expedidoEn: DepartamentoBolivia;
  fechaNacimiento: string;
  direccion: string;
  celular: string;
  referenciaNombre: string;
  referenciaParentesco: string;
  referenciaNumero: string;

  gruposSeleccionados: GrupoSeleccionado[];
}

/* PASO 2 - ACADÉMICO */

export type TipoInscripcion = "carrera" | "curso";

export interface Carrera {
  idCarrera: number;
  nombreCarrera: string;
  codigo: string;
  tipo: "Carrera" | "Curso" | "Capacitacion" | string;
  duracionMeses: number;
  cargaHoraria: string;
  costo: number | string;
  regimen: "Anual" | "Semestral";
  denominacionTituloProfesional?: string | null;
  cuotaMes?: number | string | null;
  numeroCuotas?: number | null;
  estadoCarrera: "activo" | "inactivo";
  idArea?: number | null;
}

export interface Materia {
  idMateria: number;
  nombreMateria: string;
  codigo: string;
  semestre: number;
  estado: string;
  idPrerequisito?: number | null;
}

export interface Grupo {
  idGrupo: number;
  nombre: string;
  codigo: string;
  paralelo: string;
  turno: "mañana" | "tarde" | "noche";
  horario: number | string;
  gestion: string;
  cupos: number | string;
  tipo: "Capacitacion" | "Curso";
  estado: string;
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

/* PASO 4 - RESUMEN FINAL */

export interface DocumentoResumen {
  idDocumentoEstudiante: number;
  nombreDocumento: string;
  ubicacionArchivo: string;
  estadoDocumento: "Debe" | "Entregado" | string;
}

export interface ResumenInscripcion {
  usuario: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    ci: string;
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