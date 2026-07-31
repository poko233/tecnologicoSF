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

  /** Turno guardado en CarreraUsuario para la carrera seleccionada. */
  turnoPreferido?: TurnoInscripcion | null;

  /**
   * Turno efectivo del estudiante en la gestión activa.
   * Prioriza el turno de su inscripción y usa turnoPreferido como respaldo.
   */
  turnoEstudiante?: TurnoInscripcion | null;

  /** Estado del plan de cuotas para la carrera y gestión activas. */
  tieneCuotasGestion?: boolean | number | string | null;
  requiereCuotasGestion?: boolean | number | string | null;
  totalCuotasGestion?: number;
  totalCuotasMensualesGestion?: number;
  totalCuotasCondonadasGestion?: number;
  estadoCuotasGestion?: "CON_CUOTAS" | "SIN_CUOTAS" | string | null;
  planCuotasReutilizado?: boolean | number | string | null;

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

  /** Fechas propias de la materia, no del grupo. */
  fechaInicio?: string | null;
  fechaFin?: string | null;

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

  /** Fechas de la materia seleccionada. */
  fechaInicio?: string | null;
  fechaFin?: string | null;
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
  fechaInicio?: string | null;
  fechaFin?: string | null;
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
  turnoPreferido?: TurnoInscripcion | null;
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

export type EstadoCuotaGestion = "Debe" | "Pagado" | "Condonado";

export type CuotaGestion = {
  idCuota: number;
  idUsuario: number;
  idCarrera: number | null;
  idGestion: number | null;
  tipo: "MATRICULA" | "MENSUAL" | "CONVALIDACION" | string;
  numeroCuota: number | string;
  monto: number | string;
  descuento: number | string;
  fecha_vencimiento?: string | null;
  estadoCuota: EstadoCuotaGestion;
  fecha_pago?: string | null;
};

export type CarreraCuotasGestion = {
  idCarrera: number;
  nombreCarrera: string;
  codigo?: string | null;
  tipo?: string | null;
  regimen?: string | null;
  estadoCarrera?: string | null;
  costo?: number | string | null;
  costo_matricula?: number | string | null;
  costoMatricula?: number | string | null;
  cuota_mensual?: number | string | null;
  cuotas_por_anio?: number | string | null;
  numeroCuotas?: number | string | null;
  duracion_meses?: number | string | null;
  duracionMeses?: number | string | null;
};

export type UltimoPlanCuotasGestion = {
  disponible: boolean;
  esLegacy?: boolean;
  gestion: GestionActiva;
  totalCuotas: number;
  totalCuotasMensuales: number;
  totalCuotasCondonadas: number;
  totalCuotasPagadas: number;
  matricula: CuotaGestion;
  cuotas: CuotaGestion[];
  copiaMontos: boolean;
  copiaDescuentos: boolean;
  copiaCondonaciones: boolean;
  copiaPagos: boolean;
  copiaFechas: boolean;
};

export type PlanCuotaGestionReutilizado = {
  idPlanCuotaGestion: number;
  idGestionDestino: number;
  idGestionOrigen?: number | null;
  tipoOrigen: "GESTION" | "LEGACY" | string;
  gestionOrigen?: GestionActiva | null;
  totalCuotas: number;
  totalCuotasMensuales: number;
  totalCuotasCondonadas: number;
  totalCuotasPagadas: number;
};

export type CuotasGestionResponse = {
  codigo:
    | "CUOTAS_GESTION_REGISTRADAS"
    | "CUOTAS_GESTION_REQUERIDAS"
    | string;
  tieneCuotasGestion: boolean;
  totalCuotasGestion: number;
  totalCuotasMensuales: number;
  gestionActiva: GestionActiva;
  carrera: CarreraCuotasGestion;
  turnoPreferido?: TurnoInscripcion | null;
  cuotas: CuotaGestion[];
  planReutilizado?: boolean;
  planCuotaGestion?: PlanCuotaGestionReutilizado | null;
  puedeMantenerCuotasAnteriores?: boolean;
  puedeReutilizarPlanAnterior?: boolean;
  ultimoPlanCuotas?: UltimoPlanCuotasGestion | null;
  message: string;
};

export type CuotaGestionEditablePayload = {
  numeroCuota: number;
  monto: number;
  descuento: number;
  fecha_vencimiento: string;
  estadoCuota: "Debe" | "Condonado";
};

export type GuardarCuotasGestionPayload = {
  idCarrera: number;
  idGestion: number;
  turnoPreferido: TurnoInscripcion;
  matricula: {
    monto: number;
    descuento: number;
    fecha_vencimiento: string;
  };
  cuotas: CuotaGestionEditablePayload[];
};

export type ReutilizarPlanCuotasGestionPayload = {
  idCarrera: number;
  idGestion: number;
};

export type ReutilizarPlanCuotasGestionResponse =
  GuardarCuotasGestionResponse & {
    reutilizado: true;
    idPlanCuotaGestion?: number;
    totalCuotasVinculadas?: number;
  };

export type GuardarCuotasGestionResponse = {
  ok: boolean;
  guardado: boolean;
  actualizado: boolean;
  carreraCreada?: boolean;
  carreraCambiada?: boolean;
  idCarreraAnterior?: number | null;
  idCarreraActual: number;
  idGestion: number;
  gestionActiva: GestionActiva;
  turnoPreferido: TurnoInscripcion;
  message: string;
  total_insertado?: number;
  total_actualizado?: number;
  total_eliminado?: number;
  total_protegido?: number;
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
  code?: string;
  requiereCuotas?: boolean;
  cuotasGestion?: CuotasGestionResponse | null;
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
