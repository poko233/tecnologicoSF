export interface ReportCardItem {
  id: string;
  iconName: string; // nombre de ícono de lucide-react-native (ej: "Badge")
  title: string;
  description: string;
  accentColor?: "primary" | "secondary" | "destructive" | "info";
}

export interface SummaryMetric {
  label: string;
  value: string;
  iconName: string;
  backgroundColor?: string; // por defecto, theme.colors.primary
}
