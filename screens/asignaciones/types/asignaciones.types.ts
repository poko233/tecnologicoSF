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
  notaAprobacion?: number | null;
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
  puedeInscribir?: boolean | number | string | null;
  tieneMateriasDesbloqueadas?: boolean | number | string | null;
  inscripcionCompletaNivel?: boolean | number | string | null;

  totalMateriasInscritasNivel?: number;
  totalMateriasDisponiblesNivel?: number;

  materiasPendientesAnterioresCount?: number;
  tienePendientesAnteriores?: boolean | number | string | null;

  nivelesAcademicos?: Array<string | number>;
  nivelesPorCarrera?: {
    idCarrera: number | string;
    niveles: Array<string | number>;
  }[];
};

export type GrupoDisponible = {
  idGrupoMateriaDocente: number;
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
  estudianteYaEnGrupo?: boolean;
};

export type MateriaPendienteAnterior = {
  idMateria: number;
  nombreMateria: string;
  codigoMateria: string;
  semestre: number;
  notaAprobacion?: number | null;
  estadoAcademico?: EstadoAcademicoMateria | null;
  estadoNotaHistorial?: "Aprobado" | "Reprobado" | "Abandono" | string | null;
  notaFinalHistorial?: number | null;
  segundaInstanciaNotaHistorial?: number | null;
  notaEfectivaHistorial?: number | null;
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
  notaAprobacion?: number | null;

  yaInscrito: boolean;
  seleccionable?: boolean;
  motivoNoSeleccionable?: string | null;

  grupoSeleccionado: GrupoDisponible | null;
  gruposDisponibles: GrupoDisponible[];

  estadoAcademico?: EstadoAcademicoMateria | null;
  estadoNotaHistorial?: "Aprobado" | "Reprobado" | "Abandono" | string | null;
  notaFinalHistorial?: number | null;
  segundaInstanciaNotaHistorial?: number | null;
  notaEfectivaHistorial?: number | null;
  periodoGestionHistorial?: string | null;
  fechaCierreHistorial?: string | null;
};

/**
 * Representación completa de una materia usada por los modales.
 * Sirve tanto para agregar como para retirar una materia.
 */
export type SeleccionMateriaInscripcion = {
  idMateria: number;
  idGrupoMateriaDocente: number;
  idGrupo: number;
  nombreMateria: string;
  codigoMateria: string;
  nivel: number;
  nivelLabel: string;
  turno: TurnoInscripcion;
  nombreGrupo: string;
  codigoGrupo: string;
  paralelo: string;
  cupos: number;
};

export type SeleccionMateriaPayload = Pick<
  SeleccionMateriaInscripcion,
  "idMateria" | "idGrupoMateriaDocente" | "nivel" | "turno"
>;

export type RetiroMateriaPayload = Pick<
  SeleccionMateriaInscripcion,
  "idMateria" | "idGrupoMateriaDocente"
>;

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
  idGrupoMateriaDocente: number;
  nombreGrupo: string;
  codigoGrupo: string;
  paralelo: string;
  turno: TurnoInscripcion | string;
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
  tipoNivel?: string | null;
  nivelesAcademicos?: number[];
  notaAprobacion?: number | null;
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
  nivelesAcademicos?: number[];
  labelNivel?: string;
  notaAprobacion?: number | null;
  gestionActiva?: GestionActiva | null;
};

export type MateriaActualizada = {
  idMateria: number;
  materia: string;
  codigoMateria?: string | null;
  nivel: number;
  idGrupo: number;
  idGrupoMateriaDocente: number;
  grupo: string;
  paralelo?: string | null;
  turno: TurnoInscripcion;
};

export type ActualizarInscripcionResponse = {
  message: string;
  gestionActiva?: GestionActiva | null;
  agregadas: MateriaActualizada[];
  retiradas: MateriaActualizada[];
  inscritas?: MateriaActualizada[];
  cuposDescontados?: number;
  cuposDevueltos?: number;
};

/** Compatibilidad con código anterior. */
export type InscribirResponse = ActualizarInscripcionResponse;

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