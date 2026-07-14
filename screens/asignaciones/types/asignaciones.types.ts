export type TurnoInscripcion = "Mañana" | "Tarde" | "Noche";

export type EstadoAcademicoMateria =
  | "nueva"
  | "aprobada"
  | "reprobada"
  | "abandono"
  | "pendiente"
  | "inscrita";

export type CarreraAsignacion = {
  idCarrera: number;
  nombreCarrera: string;
  codigo?: string | null;
  regimen?: string | null;
  tipo?: string | null;
  estadoCarrera?: string | null;
  tipoNivel?: string | null;
  nivelesAcademicos?: number[];
};

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
  created_at?: string | null;
  updated_at?: string | null;

  yaInscrito?: boolean | number | string | null;
  puedeInscribir?: boolean;
  tieneMateriasDesbloqueadas?: boolean;

  materiasPendientesAnterioresCount?: number;
  tienePendientesAnteriores?: boolean;

  nivelesAcademicos?: Array<string | number>;
  nivelesPorCarrera?: {
    idCarrera: number | string;
    niveles: Array<string | number>;
  }[];
};

export type GrupoDisponible = {
  idGrupo: number;
  idGestion?: number | null;
  nombreGrupo: string;
  codigoGrupo: string;
  paralelo: string;
  turno: TurnoInscripcion;
  gestion: string | number;
  anioGestion?: string | number | null;
  periodoGestion?: string | null;
  estadoGestion?: string | null;
  cupos: number;
};

export type MateriaPendienteAnterior = {
  idMateria: number;
  nombreMateria: string;
  codigoMateria: string;
  semestre: number;
  estadoAcademico?: EstadoAcademicoMateria | null;
  estadoNotaHistorial?: "Aprobado" | "Reprobado" | "Abandono" | string | null;
  notaFinalHistorial?: number | null;
  segundaInstanciaNotaHistorial?: number | null;
  periodoGestionHistorial?: string | null;
  fechaCierreHistorial?: string | null;
};

export type MateriaBloqueadaPrerequisito = {
  idMateria: number;
  nombreMateria: string;
  codigoMateria: string;
  semestre: number;
  idPrerequisito?: number | null;
  nombrePrerequisito?: string | null;
  codigoPrerequisito?: string | null;
  motivoBloqueo?: string | null;
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

  estadoAcademico?: EstadoAcademicoMateria | null;
  estadoNotaHistorial?: "Aprobado" | "Reprobado" | "Abandono" | string | null;
  notaFinalHistorial?: number | null;
  segundaInstanciaNotaHistorial?: number | null;
  periodoGestionHistorial?: string | null;
  fechaCierreHistorial?: string | null;
};

export type DocumentoEstudiante = {
  idDocumentoEstudiante: number;
  idUsuario: number;
  nombreDocumento: string;
  estadoDocumento: string | number;
  ubicacionArchivo?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type InscripcionDetalle = {
  idInscripcion: number;
  idGrupo: number;
  idGestion?: number | null;
  nombreGrupo: string;
  codigoGrupo: string;
  paralelo: string;
  turno: string;
  gestion: string | number;
  anioGestion?: string | number | null;
  periodoGestion?: string | null;
  estadoGestion?: string | null;
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
  tipo?: string | null;
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

export type GestionActiva = {
  id: number;
  nombre: string;
  anio: string | number;
  periodo: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  estado: string;
};

export type MateriasSemestreUnoResponse = {
  materias?: MateriaSemestreUno[];
  data?: MateriaSemestreUno[];

  materiasPendientesAnteriores?: MateriaPendienteAnterior[];
  tienePendientesAnteriores?: boolean;
  totalPendientesAnteriores?: number;

  materiasBloqueadasPrerequisito?: MateriaBloqueadaPrerequisito[];
  totalMateriasBloqueadasPrerequisito?: number;

  esNivelInicial?: boolean;
  nivelSeleccionado?: number;
  labelNivel?: string;
  gestionActiva?: GestionActiva | null;
};

export type InscripcionRealizada = {
  materia: string;
  idGrupo: number;
  turno: TurnoInscripcion;
};

export type InscribirResponse = {
  message: string;
  turno?: TurnoInscripcion;
  nivelSeleccionado?: number;
  gestionActiva?: GestionActiva | null;

  inscritas: Array<string | InscripcionRealizada>;
  omitidas: string[];
  sinCupos?: string[];
  sinGestion?: string[];
  cuposDescontados?: number;

  materiasPendientesAnteriores?: MateriaPendienteAnterior[];
  tienePendientesAnteriores?: boolean;
  totalPendientesAnteriores?: number;

  materiasBloqueadasPrerequisito?: MateriaBloqueadaPrerequisito[];
  totalMateriasBloqueadasPrerequisito?: number;
  esNivelInicial?: boolean;
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