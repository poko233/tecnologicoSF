import { useTheme } from "@/theme/useTheme";
import { ReportCardItem } from "../types/reportes.types";

export function useReportData() {
  const { theme } = useTheme();

  const reportCards: ReportCardItem[] = [
    {
      id: "centralizador",
      iconName: "FileSpreadsheet",
      title: "Centralizador de Calificaciones",
      description:
        "Reporte completo de notas por carrera, gestión y turno con todas las materias.",
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
  ];

  return { reportCards };
}