export type Estudiante = {
  id: number;
  usuario?: string | null;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  genero?: string | null;
  fecha_nac?: string | null;
  email?: string | null;
  telefono?: string | null;
  celular?: string | null;
  direccion?: string | null;
  matricula?: string | null;
  expedido?: string | null;
  estado?: string | null;
};

export type GrupoSeleccionado = {
  idGrupo: number;
  nombreGrupo: string;
  codigoGrupo: string;
  paralelo: string;
  turno: string;
  gestion: string;
  cupos: number;
};

export type MateriaSemestreUno = {
  idMateria: number;
  nombreMateria: string;
  codigoMateria: string;
  semestre: number;
  idCarrera: number;
  nombreCarrera: string;
  yaInscrito: boolean;
  grupoSeleccionado: GrupoSeleccionado;
};

export type DocumentoEstudiante = {
  idDocumentoEstudiante: number;
  nombreDocumento: string;
  estadoDocumento: boolean | number;
  idUsuario: number;
};

export type InscripcionDetalle = {
  idInscripcion: number;
  idGrupo: number;
  nombreGrupo: string;
  codigoGrupo: string;
  paralelo: string;
  turno: string;
  gestion: string;
  idMateria: number;
  nombreMateria: string;
  codigoMateria: string;
  semestre: number;
  idCarrera?: number;
  nombreCarrera?: string;
};

export type CarreraEstudiante = {
  idCarrera: number;
  nombreCarrera: string;
  codigo: string;
  regimen: string;
  estadoCarrera: string;
};

export type DetalleEstudianteResponse = {
  estudiante: Estudiante;
  carreras: CarreraEstudiante[];
  documentos: DocumentoEstudiante[];
  documentosPendientes: string[];
  debeDocumentos: boolean;
  inscripciones: InscripcionDetalle[];
};

export type InscribirResponse = {
  message: string;
  inscritas: string[];
  omitidas: string[];
};

export type EstudianteForm = {
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  genero: string;
  ci: string;
  expedido: string;
  fecha_nac: string;
  email: string;
  telefono: string;
  celular: string;
  direccion: string;
  estado: string;
};