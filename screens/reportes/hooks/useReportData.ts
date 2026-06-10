import { useTheme } from "@/theme/useTheme";
import { ReportCardItem, SummaryMetric } from "../types/reportes.types";

export function useReportData() {
  const { theme } = useTheme();

  const summaryMetrics: SummaryMetric[] = [
    {
      label: "Total General de Inscritos",
      value: "1,284",
      iconName: "Users",
      // backgroundColor por defecto será theme.colors.primary
    },
    {
      label: "Docentes Activos",
      value: "86",
      iconName: "UserCheck",
      backgroundColor: theme.colors.secondary,
    },
    {
      label: "Inscritos Hoy",
      value: "24",
      iconName: "UserPlus",
      backgroundColor: theme.colors.info,
    },
  ];

  const reportCards: ReportCardItem[] = [
    {
      id: "rango-tiempo",
      iconName: "Clock",
      title: "Inscritos por tiempo",
      description:
        "Segmentación por día, semana, mes o rangos personalizados de fechas.",
      accentColor: "primary",
    },
    {
      id: "carrera",
      iconName: "GraduationCap",
      title: "Inscritos por carrera",
      description:
        "Distribución de estudiantes según su programa académico actual.",
      accentColor: "primary",
    },
    {
      id: "lista-grupo",
      iconName: "Badge",
      title: "Lista Oficial por Grupo",
      description:
        "Nómina completa de estudiantes vinculados a un docente y grupo específico.",
      accentColor: "primary",
    },
    {
      id: "expedicion",
      iconName: "Fingerprint",
      title: "Estudiantes por CI",
      description:
        "Listado organizado por lugar de expedición de documento de identidad.",
      accentColor: "primary",
    },
    {
      id: "ingresos",
      iconName: "Banknote",
      title: "Ingresos por fecha",
      description:
        "Reporte financiero de recaudación en una fecha o periodo específico.",
      accentColor: "primary",
    },
    {
      id: "historial",
      iconName: "History",
      title: "Historial de Accesos",
      description:
        "Logs detallados de entrada de estudiantes, docentes y personal administrativo.",
      accentColor: "primary",
    },
    {
      id: "coordinacion",
      iconName: "FileWarning",
      title: "Pasar a Coordinación",
      description:
        "Estudiantes derivados al área académica para revisión de estado.",
      accentColor: "destructive",
    },
    {
      id: "contabilidad",
      iconName: "Landmark",
      title: "Contabilidad",
      description:
        "Derivaciones financieras para regularización de deudas o trámites.",
      accentColor: "secondary",
    },
  ];

  return { summaryMetrics, reportCards };
}
