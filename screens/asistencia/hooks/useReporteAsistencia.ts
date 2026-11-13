// screens/asistencia/hooks/useReporteAsistencia.ts
import { useState } from "react";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";
import { descargarReporteAsistencia } from "../services/asistencia.service";

export function useReporteAsistencia() {
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // EXCEL → descarga (sin cambios)
  // ─────────────────────────────────────────────────────────────
  const descargarCsv = async (idGrupoMateriaDocente: number) => {
    setLoadingCsv(true);
    try {
      const { blob, filename } = await descargarReporteAsistencia(
        idGrupoMateriaDocente,
        "xlsx",
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
        Toast.show({ type: "success", text1: "Reporte Excel descargado" });
      } else {
        const FileSystem = await import("expo-file-system");
        const Sharing = await import("expo-sharing");
        const fs = (FileSystem as any).default ?? FileSystem;
        const sharing = (Sharing as any).default ?? Sharing;

        const base64 = await blobToBase64(blob);
        const uri =
          (fs.cacheDirectory ?? fs.documentDirectory ?? "") + filename;
        await fs.writeAsStringAsync(uri, base64, { encoding: "base64" });

        await sharing.shareAsync(uri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Reporte Excel",
          UTI: "org.openxmlformats.spreadsheetml.sheet",
        });
        Toast.show({ type: "success", text1: "Reporte Excel listo" });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error al generar Excel",
        text2: err?.message ?? "Intenta de nuevo",
      });
    } finally {
      setLoadingCsv(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PDF → NUEVA VENTANA REAL + DIÁLOGO DE IMPRESIÓN
  // ─────────────────────────────────────────────────────────────
  const imprimirPdf = async (idGrupoMateriaDocente: number) => {
    setLoadingPdf(true);

    let printWindow: Window | null = null;
    let pdfUrl: string | null = null;

    try {
      if (Platform.OS === "web") {
        // 🚨 LA CLAVE ESTÁ AQUÍ: Usar un nombre en lugar de "_blank".
        // Al pasar "PrintWindow" como nombre, obligamos al navegador a crear
        // una ventana independiente y NO una pestaña.
        printWindow = window.open(
          "",
          "PrintWindow",
          "popup=yes,width=1200,height=850,left=100,top=50,resizable=yes,scrollbars=yes",
        );

        // Si el navegador bloqueó el popup (por bloqueador o configuración)
        if (!printWindow || printWindow.closed) {
          Toast.show({
            type: "error",
            text1: "Ventana emergente bloqueada",
            text2: "Permite las ventanas emergentes para imprimir el reporte.",
            visibilityTime: 6000,
          });
          setLoadingPdf(false);
          return;
        }

        // Mostrar pantalla de carga inmediata en la nueva ventana
        printWindow.document.open();
        printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="UTF-8" />
              <title>Generando reporte de asistencia</title>
              <style>
                * { box-sizing: border-box; }
                html, body {
                  margin: 0; width: 100%; height: 100%;
                  font-family: system-ui, sans-serif;
                  background: #f8fafc; color: #475569;
                  display: flex; align-items: center; justify-content: center;
                }
                .loading { text-align: center; }
                .spinner {
                  width: 38px; height: 38px;
                  border: 4px solid #e2e8f0;
                  border-top-color: #7c3aed;
                  border-radius: 50%;
                  animation: spin 0.8s linear infinite;
                  margin: 0 auto 16px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
              </style>
            </head>
            <body>
              <div class="loading">
                <div class="spinner"></div>
                <p>Generando reporte de asistencia...</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }

      // 2. OBTENER EL PDF DEL BACKEND
      const { blob } = await descargarReporteAsistencia(
        idGrupoMateriaDocente,
        "pdf",
      );

      if (Platform.OS === "web") {
        if (!printWindow || printWindow.closed) {
          throw new Error("La ventana de impresión fue cerrada manualmente.");
        }

        pdfUrl = URL.createObjectURL(blob);
        const doc = printWindow.document;

        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="UTF-8" />
              <title>Reporte de asistencia</title>
              <style>
                html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
                iframe { display: block; width: 100%; height: 100%; border: none; }
              </style>
            </head>
            <body>
              <iframe id="pdfFrame"></iframe>
            </body>
          </html>
        `);
        doc.close();

        const frame = doc.getElementById(
          "pdfFrame",
        ) as HTMLIFrameElement | null;

        if (!frame) {
          throw new Error("No se pudo preparar la vista del PDF.");
        }

        // Disparar la impresión cuando el iframe termine de cargar el PDF
        frame.onload = () => {
          window.setTimeout(() => {
            if (!printWindow || printWindow.closed) return;
            try {
              printWindow.focus();
              frame.contentWindow?.focus();
              frame.contentWindow?.print();
            } catch {
              // Si el navegador bloquea la impresión automática,
              // el usuario aún puede usar Ctrl+P / Cmd+P en esa ventana.
            }
          }, 800); // Dar tiempo al visor de PDF
        };

        frame.src = pdfUrl;
        printWindow.focus();

        Toast.show({
          type: "info",
          text1: "Vista de impresión abierta",
          text2: "Selecciona la impresora en la nueva ventana.",
        });

        // Limpieza
        const urlToRevoke = pdfUrl;
        window.setTimeout(() => URL.revokeObjectURL(urlToRevoke), 120_000);
      } else {
        // ── NATIVO (iOS / Android) ──
        const FileSystem = await import("expo-file-system");
        const Print = await import("expo-print");

        const fs = (FileSystem as any).default ?? FileSystem;
        const print = (Print as any).default ?? Print;

        const base64 = await blobToBase64(blob);
        const filename = `asistencia_${idGrupoMateriaDocente}.pdf`;
        const uri =
          (fs.cacheDirectory ?? fs.documentDirectory ?? "") + filename;

        await fs.writeAsStringAsync(uri, base64, { encoding: "base64" });
        await print.printAsync({ uri });

        Toast.show({
          type: "success",
          text1: "Diálogo de impresión abierto",
        });
      }
    } catch (err: any) {
      if (printWindow && !printWindow.closed) {
        try {
          printWindow.close();
        } catch {
          /* no-op */
        }
      }
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      Toast.show({
        type: "error",
        text1: "Error al generar PDF",
        text2: err?.message ?? "Intenta de nuevo",
      });
    } finally {
      setLoadingPdf(false);
    }
  };

  return {
    descargarCsv,
    imprimirPdf,
    loadingCsv,
    loadingPdf,
  };
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
