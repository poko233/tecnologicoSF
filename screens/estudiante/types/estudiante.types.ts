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
  tipo?: string | null;
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

export type CarreraEstudiante = {
  idCarrera: number | string;
  nombreCarrera: string;
  codigo?: string | null;
  regimen?: string | null;
  tipo?: string | null;
  estadoCarrera?: string | null;
  idCarreraUsuario?: number | string | null;
  turnoPreferido?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type GestionCambioCarreraEstudiante = {
  idGestion: number;
  nombre?: string | null;
  anio?: number | string | null;
  periodo?: string | null;
};

export type ImpactoCambioCarreraEstudiante = {
  idCarreraActual: number;
  nombreCarreraActual: string;
  tieneInscripcionGestionActiva: boolean;
  requiereConfirmacion: boolean;
  totalInscripcionesCarreraAnterior: number;
  totalInscripcionesActivas: number;
  totalMateriasActivas: number;
  cuposADevolver: number;
  totalNotasActuales: number;
  totalNotasFinales?: number;
  totalNotasCompetencias?: number;
  totalNotasElementos?: number;
  totalAsistencias?: number;
  totalRegistrosHistorial: number;
  totalConvalidaciones?: number;
  gestionesActivas: GestionCambioCarreraEstudiante[];
  mensaje?: string | null;
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
  carreras?: CarreraEstudiante[];
  carreraActual?: CarreraEstudiante | null;
  carrerasDisponibles?: CarreraEstudiante[];
  cambioCarreraImpacto?: ImpactoCambioCarreraEstudiante | null;

  nivelesAcademicos?: string[];
  nivelesPorCarrera?: Array<{
    idCarrera: number | string;
    nombreCarrera?: string | null;
    regimen?: string | null;
    tipo?: string | null;
    tipoNivel?: string | null;
    niveles?: string[];
  }>;

  idCarrera?: number | string | null;
  nombreCarrera?: string | null;
  carreraNombre?: string | null;
  regimenCarrera?: string | null;
  tipoCarrera?: string | null;

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

  idCarrera: number | null;
  confirmarCambioCarrera?: boolean;
};

export type FotoEstudianteArchivo = {
  uri: string;
  name: string;
  type: string;
  file?: any;
};

export type EstadoMateriaHistorialEstudiante =
  | "APROBADO"
  | "REPROBADO"
  | "INSCRITO"
  | "PENDIENTE";

export type CarreraHistorialEstudiante = {
  idCarrera: number;
  nombreCarrera: string;
  codigo?: string | null;
  regimen?: string | null;
  tipo?: string | null;
  estadoCarrera?: string | null;
};

export type TipoHistorialEstudiante = "HISTORICO" | "GESTION_ACTUAL";

export type OrigenNotaHistorialEstudiante =
  | "HISTORIAL_ACADEMICO"
  | "NOTA_FINAL_ACTUAL"
  | "SEGUNDA_INSTANCIA"
  | "PROMEDIO_COMPETENCIAS"
  | "SIN_NOTA"
  | string;

export type MateriaHistorialEstudiante = {
  tipoHistorial?: TipoHistorialEstudiante;
  esGestionActual?: boolean;

  idCarrera: number;
  nombreCarrera: string;
  codigoCarrera?: string | null;
  regimen?: string | null;
  tipoCarrera?: string | null;
  estadoCarrera?: string | null;

  idMateria: number;
  nombreMateria: string;
  codigoMateria?: string | null;
  nivel: number;
  estadoRegistro?: string | null;
  notaAprobacion?: number | null;

  notaFinal?: number | null;
  notaActual?: number | null;
  notaAsistencia?: number | null;
  notaAcademica?: number | null;
  segundaInstanciaNota?: number | null;
  origenNota?: OrigenNotaHistorialEstudiante | null;

  idGestion?: number | null;
  gestion?: string | null;
  estadoGestion?: string | null;
  estadoMateria: EstadoMateriaHistorialEstudiante;
  observacion?: string | null;

  idInscripcion?: number | null;
  idGrupo?: number | null;
  idGrupoMateriaDocente?: number | null;
  nombreGrupo?: string | null;
  codigoGrupo?: string | null;
  paralelo?: string | null;
  turno?: string | null;
  fechaInscripcionMateria?: string | null;
};

export type ResumenHistorialEstudiante = {
  totalMaterias: number;
  materiasActivas?: number;
  materiasInactivas?: number;
  aprobadas: number;
  reprobadas: number;
  inscritas: number;
  pendientes: number;
  conNota: number;
  promedioGeneral?: number | null;
};

export type GestionActualHistorialEstudiante = {
  id: number;
  nombre: string;
  estado?: string | null;
};

export type HistorialEstudianteResponse = {
  estudiante: EstudianteUsuario;
  carreras: CarreraHistorialEstudiante[];

  /** Compatibilidad: mantiene el historial histórico. */
  materias: MateriaHistorialEstudiante[];
  resumen: ResumenHistorialEstudiante;

  materiasHistoricas?: MateriaHistorialEstudiante[];
  materiasGestionActual?: MateriaHistorialEstudiante[];
  resumenHistorico?: ResumenHistorialEstudiante;
  resumenGestionActual?: ResumenHistorialEstudiante;
  gestionesActuales?: GestionActualHistorialEstudiante[];
};

export type EstudiantesResponse = {
  estudiantes: EstudianteUsuario[];
};

export type EstudianteDetalleResponse = {
  estudiante: EstudianteUsuario;
};

export type ResultadoCambioCarreraEstudiante = {
  carreraCambiada?: boolean;
  carreraCreada?: boolean;
  requiereConfirmacion?: boolean;
  idCarreraAnterior?: number | null;
  nombreCarreraAnterior?: string | null;
  idCarreraNueva?: number | null;
  nombreCarreraNueva?: string | null;
  cuposDevueltos?: number;
  materiasDepuradas?: number;
  notasDepuradas?: number;
  asistenciasDepuradas?: number;
  convalidacionesDepuradas?: number;
  historialDepurado?: number;
};

export type EstudianteUpdateResponse = {
  message: string;
  estudiante: EstudianteUsuario;
  cambioCarrera?: ResultadoCambioCarreraEstudiante | null;
};
