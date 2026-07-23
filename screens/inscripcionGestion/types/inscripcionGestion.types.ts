export type EstadoGestionIG =
  | "activo"
  | "inactivo"
  | "cerrado"
  | string;

export type GestionIG = {
  id: number;
  nombre: string;
  anio: string | number;
  periodo: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  estado: EstadoGestionIG;
  cerrado_por?: number | null;
  fecha_cierre?: string | null;
  totalCarrerasAsignadas?: number;
};

export type GestionAsignadaIG = {
  id: number;
  nombre: string;
  anio: string | number;
  periodo: string;
  estado: string;
};

export type CarreraIG = {
  idCarrera: number;
  nombreCarrera: string;
  codigo?: string | null;
  regimen?: string | null;
  tipo?: string | null;
  estadoCarrera?: string | null;

  totalEstudiantes: number;
  materiasActivas: number;
  materiasDisponiblesGestion: number;

  gruposDisponiblesGestion: number;
  gruposActivos: number;
  gruposParaMover: number;
  gruposEnGestionSeleccionada: number;
  gruposEnOtraGestionActiva: number;
  cuposTotalesGestion: number;

  disponible: boolean;
  motivoNoDisponible: string;

  estaAsignada: boolean;
  asignadaAEstaGestion: boolean;
  asignacionCompleta: boolean;
  asignacionParcial: boolean;
  asignadaAOtraGestion: boolean;

  idGestionAsignada?: number | null;
  gestionAsignada?: GestionAsignadaIG | null;
  gestionAsignadaTexto?: string | null;

  estudiantesInscritosGestionAsignada: number;
  materiasInscritasGestionAsignada: number;
};

export type ResumenDatosIG = {
  totalCarreras: number;
  totalCarrerasAsignadas: number;
  totalCarrerasDisponibles: number;
  totalCarrerasNoDisponibles: number;
  totalGruposEnGestion: number;
  totalGruposParaMover: number;
};

export type DatosIGResponse = {
  idGestionSeleccionada: number | null;
  gestionSeleccionada?: GestionIG | null;
  gestiones: GestionIG[];
  carreras: CarreraIG[];
  carrerasAsignadas?: CarreraIG[];
  carrerasDisponibles?: CarreraIG[];
  carrerasNoDisponibles: CarreraIG[];
  resumen?: ResumenDatosIG;
};

export type GrupoResultadoIG = {
  idGrupo: number;
  grupo: string;
  codigoGrupo?: string | null;
  paralelo?: string | null;
  turno?: string | null;
  cupos?: number;
  idCarrera: number;
  carrera: string;
  motivo?: string | null;
  gestionActual?: string | null;
  gestionAnterior?: string | null;
  gestionNueva?: string | null;
};

export type AsignarCarrerasIGPayload = {
  idGestion: number;
  carreras: number[];
};

export type AsignarCarrerasIGResponse = {
  message: string;
  gestion: GestionIG;
  carrerasSeleccionadas: number[];
  totalGruposActualizados: number;
  gruposActualizados: GrupoResultadoIG[];
  omitidos: GrupoResultadoIG[];
  bloqueados: GrupoResultadoIG[];
};

export type EstadoAsignacionGrupoIG =
  | "en_gestion"
  | "movible"
  | "bloqueado"
  | "inactivo"
  | string;

export type GestionGrupoIG = {
  id: number;
  nombre?: string | null;
  anio?: string | number | null;
  periodo?: string | null;
  estado?: string | null;
  texto: string;
};

export type MateriaGrupoCarreraIG = {
  idMateria: number;
  idGrupoMateriaDocente: number;
  nombreMateria: string;
  codigoMateria?: string | null;
  semestre?: number | null;
};

export type CarreraRelacionadaGrupoIG = {
  idCarrera: number;
  nombreCarrera: string;
  codigo?: string | null;
  regimen?: string | null;
  estadoCarrera?: string | null;
  compatibleConGestionDestino: boolean;
};

export type GrupoCarreraIG = {
  idGrupo: number;
  nombreGrupo: string;
  codigoGrupo?: string | null;
  paralelo?: string | null;
  turno?: string | null;
  cupos: number;
  tipoGrupo?: string | null;
  estadoGrupo?: string | null;

  idGestionActual?: number | null;
  gestionActual?: GestionGrupoIG | null;
  idGestionDestino: number;
  gestionDestinoTexto: string;

  estadoAsignacion: EstadoAsignacionGrupoIG;
  puedeMover: boolean;
  conflicto: boolean;
  tipoConflicto?: string | null;
  motivo: string;

  materiasCarrera: MateriaGrupoCarreraIG[];
  totalMateriasCarrera: number;

  carrerasRelacionadas: CarreraRelacionadaGrupoIG[];
  otrasCarrerasRelacionadas: CarreraRelacionadaGrupoIG[];
  grupoCompartido: boolean;
  advertenciaCompartido?: string | null;
};

export type ResumenGruposCarreraIG = {
  totalGrupos: number;
  gruposEnGestion: number;
  gruposMovibles: number;
  gruposBloqueados: number;
  gruposInactivos: number;
  gruposCompartidos: number;
};

export type DetalleGruposCarreraIGResponse = {
  gestionDestino: GestionIG;
  carrera: Pick<
    CarreraIG,
    | "idCarrera"
    | "nombreCarrera"
    | "codigo"
    | "regimen"
    | "tipo"
    | "estadoCarrera"
  >;
  resumen: ResumenGruposCarreraIG;
  grupos: GrupoCarreraIG[];
};
