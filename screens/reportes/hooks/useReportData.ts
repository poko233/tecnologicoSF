import { useTheme } from "@/theme/useTheme";
import { ReportCardItem } from "../types/reportes.types";

export function useReportData() {
  const { theme } = useTheme();

  const reportCards: ReportCardItem[] = [
    {
      id: "centralizador",
      iconName: "FileSpreadsheet",
      title: "Centralizador de Calificaciones",
      description: "Reporte completo de notas por carrera, gestión y turno.",
      accentColor: "primary",
    },
    {
      id: "carrera",
      iconName: "GraduationCap",
      title: "Inscritos por carrera",
      description: "Distribución de estudiantes según su programa académico.",
      accentColor: "primary",
    },
    {
      id: "lista-grupo",
      iconName: "Badge",
      title: "Lista Oficial por Grupo",
      description: "Nómina completa de estudiantes por grupo y docente.",
      accentColor: "primary",
    },
    // ✅ NUEVA TARJETA PARA PAGOS
    {
      id: "pagos",
      iconName: "Coins",
      title: "Reporte de Pagos",
      description:
        "Historial de pagos por estudiante o grupo con observaciones.",
      accentColor: "primary",
    },
  ];

  return { reportCards };
}
