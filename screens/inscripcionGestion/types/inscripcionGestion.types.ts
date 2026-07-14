export type GestionIG = {
  id: number;
  nombre: string;
  anio: string | number;
  periodo: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  estado: "activo" | "inactivo" | "cerrado" | string;
  cerrado_por?: number | null;
  fecha_cierre?: string | null;
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
  materiasDisponiblesGestion: number;
  gruposDisponiblesGestion: number;

  disponible: boolean;
  motivoNoDisponible: string;

  estaAsignada: boolean;
  asignadaAEstaGestion: boolean;
  asignadaAOtraGestion: boolean;

  idGestionAsignada?: number | null;
  gestionAsignada?: GestionAsignadaIG | null;
  gestionAsignadaTexto?: string | null;

  estudiantesInscritosGestionAsignada: number;
  materiasInscritasGestionAsignada: number;
};

export type DatosIGResponse = {
  idGestionSeleccionada: number | null;
  gestionSeleccionada?: GestionIG | null;
  gestiones: GestionIG[];
  carreras: CarreraIG[];
  carrerasNoDisponibles: CarreraIG[];
  resumen?: {
    totalCarrerasDisponibles: number;
    totalCarrerasNoDisponibles: number;
  };
};

export type ResultadoIGItem = {
  idUsuario: number;
  estudiante: string;
  idCarrera?: number;
  idMateria?: number;
  materia?: string;
  idGrupo?: number;
  grupo?: string;
  turno?: string;
  motivo?: string;
};

export type InscribirIGPayload = {
  idGestion: number;
  carreras: number[];
};

export type InscribirIGResponse = {
  message: string;
  gestion: GestionIG;
  carrerasSeleccionadas: number[];
  totalInscripcionesCreadas: number;
  cuposDescontados: number;
  inscritos: ResultadoIGItem[];
  omitidos: ResultadoIGItem[];
  sinCupos: ResultadoIGItem[];
};