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

export interface GestionFiltro {
  id: number;
  nombre: string;
  anio: number;
  periodo: string;
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
