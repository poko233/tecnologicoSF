export type TurnoInscripcion = "Mañana" | "Tarde" | "Noche";

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
  fechaInscripcion?: string | null;
  expedido?: string | null;
  estado?: string | null;
};

export type GrupoDisponible = {
  idGrupo: number;
  nombreGrupo: string;
  codigoGrupo: string;
  paralelo: string;
  turno: TurnoInscripcion;
  gestion: string | number;
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

  grupoSeleccionado: GrupoDisponible | null;
  gruposDisponibles: GrupoDisponible[];
};

export type DocumentoEstudiante = {
  idDocumentoEstudiante: number;
  idUsuario: number;
  nombreDocumento: string;
  estadoDocumento: string;
  ubicacionArchivo?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type InscripcionDetalle = {
  idInscripcion: number;
  idGrupo: number;
  nombreGrupo: string;
  codigoGrupo: string;
  paralelo: string;
  turno: string;
  gestion: string | number;
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

export type InscripcionRealizada = {
  materia: string;
  idGrupo: number;
  turno: TurnoInscripcion;
};

export type InscribirResponse = {
  message: string;
  turno: TurnoInscripcion;
  inscritas: InscripcionRealizada[];
  omitidas: string[];
  sinCupos?: string[];
  cuposDescontados?: number;
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