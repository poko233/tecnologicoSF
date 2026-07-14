export type RolEstudiante = {
  id?: number;
  idRol?: number;
  rol: string;
  descripcion?: string | null;
};

export type ReferenciaEstudiante = {
  idNumeroReferencia?: number;
  idUsuario?: number;
  nombreContactoReferencia?: string | null;
  parentesco?: string | null;
  numeroReferencia?: string | null;
};

export type DocumentoEstudiante = {
  idDocumentoEstudiante: number;
  idUsuario?: number;
  nombreDocumento?: string | null;
  ubicacionArchivo?: string | null;
  archivoUrl?: string | null;
  estadoDocumento?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PromocionEstudiante = {
  id?: number;
  user_id?: number;
  tipo?: string | null;
  descripcion?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  creado_por?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type EstudianteUsuario = {
  id: number;
  usuario: string;
  ci: string;
  nombres: string;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  genero?: "MASCULINO" | "FEMENINO" | string | null;
  fecha_nac?: string | null;
  email?: string | null;
  telefono?: string | null;
  celular?: string | null;
  direccion?: string | null;
  matricula?: string | null;
  expedido?: string | null;
  codigo_qr?: string | null;
  foto?: string | null;
  estado?: "ACTIVO" | "INACTIVO" | string | null;
  created_at?: string | null;
  updated_at?: string | null;

  fechaInscripcion?: string | null;
  fotoUrl?: string | null;
  qrUrl?: string | null;
  esEstudiante?: boolean;

  observacionPromociones?: string | null;
  promociones?: PromocionEstudiante[];

  roles?: RolEstudiante[];
  documentos?: DocumentoEstudiante[];

  numeroReferencias?: ReferenciaEstudiante | ReferenciaEstudiante[] | null;
  numero_referencias?: ReferenciaEstudiante | ReferenciaEstudiante[] | null;
};

export type EstudianteForm = {
  usuario: string;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  genero: "MASCULINO" | "FEMENINO";
  fecha_nac: string;
  email: string;
  telefono: string;
  celular: string;
  direccion: string;
  expedido: string;
  estado: "ACTIVO" | "INACTIVO";

  referenciaNombre: string;
  referenciaParentesco: string;
  referenciaNumero: string;
  observacionPromociones: string;
};

export type FotoEstudianteArchivo = {
  uri: string;
  name: string;
  type: string;
  file?: any;
};

export type EstudiantesResponse = {
  estudiantes: EstudianteUsuario[];
};

export type EstudianteDetalleResponse = {
  estudiante: EstudianteUsuario;
};

export type EstudianteUpdateResponse = {
  message: string;
  estudiante: EstudianteUsuario;
};