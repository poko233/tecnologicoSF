export interface ReportCardItem {
  id: string;
  iconName: string;
  title: string;
  description: string;
  accentColor?: "primary" | "secondary" | "destructive" | "info";
}

export interface SummaryMetric {
  label: string;
  value: string;
  iconName: string;
  backgroundColor?: string;
}

// ---------- NUEVOS TIPOS PARA INSCRITOS ----------
export interface CarreraFiltro {
  idCarrera: number;
  nombreCarrera: string;
  codigo: string;
  regimen: string;
}

export interface TurnoFiltro {
  valor: string;
  etiqueta: string;
}

export interface InscritosFiltrosResponse {
  carreras: CarreraFiltro[];
  gestiones: GestionFiltro[];
  turnos: TurnoFiltro[];
}

export interface InscritosDownloadParams {
  formato: "xlsx" | "pdf";
  idCarrera?: number[];
  turno?: string;
  idGestion?: number;
  semestre?: number;
  anio?: number;
}

// Tipo para las opciones del selector
export interface SelectorOption {
  id: number | string;
  label: string;
  subtitle?: string;
}
// ---------- NUEVOS TIPOS PARA EL REPORTE DE PAGOS ----------
export interface GestionFiltro {
  id: number;
  nombre: string;
  anio: number;
  periodo: string;
  estado: string;
}

export interface GrupoFiltro {
  id: number;
  nombre: string;
  codigo: string;
  paralelo: string;
  turno: string;
  idGestion: number;
  gestion: string | null;
}

export interface PagosFiltrosResponse {
  grupos: {
    data: GrupoFiltro[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    links?: {
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }[];
  };
  gestiones: GestionFiltro[];
}

export interface EstudianteSearchResult {
  id: number;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  matricula: string | null;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  foto: string | null;
  estado: string;
}

export interface PagosDownloadParams {
  formato: "xlsx" | "pdf";
  estudiante_id?: number;
  grupo_id?: number;
  gestion_id?: number;
  solo_ultimo_pago?: boolean;
  incluir_observaciones?: boolean;
}

export type PagosReportType = "estudiante" | "grupo";

export interface PagosFiltersState {
  tipo: PagosReportType;
  estudianteId: number | null;
  estudianteNombre: string | null;
  grupoId: number | null;
  grupoNombre: string | null;
  gestionId: number | null;
  soloUltimoPago: boolean;
  incluirObservaciones: boolean;
}
