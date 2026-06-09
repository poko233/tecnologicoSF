// screens/asistencia/hooks/useReporteAsistencia.ts
import { useState } from "react";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";
import { descargarReporteAsistencia } from "../services/asistencia.service";

export function useReporteAsistencia() {
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const descargar = async (
    idGrupoMateriaDocente: number,
    formato: "csv" | "pdf",
  ) => {
    const setLoading = formato === "csv" ? setLoadingCsv : setLoadingPdf;
    setLoading(true);

    try {
      const { blob, filename } = await descargarReporteAsistencia(
        idGrupoMateriaDocente,
        formato,
      );

      if (Platform.OS === "web") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        Toast.show({
          type: "success",
          text1: `Reporte ${formato.toUpperCase()} descargado`,
        });
      } else {
        // expo-file-system v2: usar .default para acceder a la API
        const FileSystem = await import("expo-file-system");
        const Sharing = await import("expo-sharing");

        const fs = (FileSystem as any).default ?? FileSystem;
        const mimeType = formato === "pdf" ? "application/pdf" : "text/csv";

        // Blob → base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const uri = (fs.documentDirectory ?? fs.cacheDirectory ?? "") + filename;
        await fs.writeAsStringAsync(uri, base64, { encoding: "base64" });

        const sharing = (Sharing as any).default ?? Sharing;
        await sharing.shareAsync(uri, {
          mimeType,
          dialogTitle: `Reporte ${formato.toUpperCase()}`,
          UTI:
            formato === "pdf"
              ? "com.adobe.pdf"
              : "public.comma-separated-values-text",
        });

        Toast.show({
          type: "success",
          text1: `Reporte ${formato.toUpperCase()} listo`,
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error al descargar el reporte",
        text2: err.message ?? "Intenta de nuevo",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    descargarCsv: (id: number) => descargar(id, "csv"),
    descargarPdf: (id: number) => descargar(id, "pdf"),
    loadingCsv,
    loadingPdf,
  };
}