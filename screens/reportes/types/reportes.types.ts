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

// NUEVO
export interface FiltroOpciones {
  carreras: { idCarrera: number; nombreCarrera: string; codigo: string }[];
  gestiones: string[];
  turnos: string[];
}