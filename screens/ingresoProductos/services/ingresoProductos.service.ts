import * as FileSystemNS from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { BASE_URL, httpClient } from "../../../http/httpClient";
import { getToken } from "../../../storage/secureStorage";
import {
  GuardarIngresoProductoResponse,
  IngresoProductoPayload,
  IngresosProductoResponse,
  ProductosIngresoResponse,
} from "../types/ingresoProductos.types";

export async function obtenerIngresosProducto() {
  return httpClient.getAuth<IngresosProductoResponse>(
    "/api/inventario/ingresos",
    "No se pudo cargar el historial de ingresos",
  );
}

export async function obtenerProductosParaIngreso() {
  return httpClient.getAuth<ProductosIngresoResponse>(
    "/api/inventario/productos?estado=ACTIVO",
    "No se pudieron cargar los productos del inventario",
  );
}

export async function guardarIngresoProducto(
  payload: IngresoProductoPayload,
) {
  return httpClient.postAuth<GuardarIngresoProductoResponse>(
    "/api/inventario/ingresos",
    payload,
  );
}

async function mensajeRespuestaError(
  response: Response,
): Promise<string> {
  try {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await response.json();

      return (
        body?.message ||
        "No se pudo generar el recibo."
      );
    }

    const text = await response.text();

    return (
      text ||
      "No se pudo generar el recibo."
    );
  } catch {
    return "No se pudo generar el recibo.";
  }
}

export async function descargarReciboIngresoProducto(
  idIngresoProducto: number,
): Promise<void> {
  /*
   * WEB:
   * Abrimos primero una pestaña vacía.
   * Esto evita que el navegador bloquee la ventana
   * mientras esperamos el token y el PDF.
   */
  let ventanaPreview: any = null;

  if (
    Platform.OS === "web" &&
    typeof window !== "undefined"
  ) {
    ventanaPreview = window.open(
      "about:blank",
      "_blank",
    );

    if (ventanaPreview) {
      try {
        ventanaPreview.opener = null;
        ventanaPreview.document.title =
          "Cargando recibo...";

        ventanaPreview.document.body.innerHTML = `
          <div style="
            font-family: Arial, sans-serif;
            height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            color: #475569;
          ">
            <div style="text-align:center;">
              <div style="
                font-size:18px;
                font-weight:700;
                color:#0f172a;
                margin-bottom:8px;
              ">
                Generando recibo
              </div>
              <div style="font-size:14px;">
                Espere un momento...
              </div>
            </div>
          </div>
        `;
      } catch {
        // La pestaña igualmente puede utilizarse.
      }
    }
  }

  try {
    const token = await getToken();

    if (!token) {
      if (ventanaPreview) {
        ventanaPreview.close();
      }

      throw new Error(
        "Tu sesión expiró. Vuelve a iniciar sesión.",
      );
    }

    const endpoint =
      `${String(BASE_URL).replace(/\/$/, "")}` +
      `/api/inventario/ingresos/` +
      `${idIngresoProducto}/recibo`;

    const nombreArchivo =
      `recibo-ingreso-${idIngresoProducto}.pdf`;

    const headers = {
      Accept: "application/pdf",
      Authorization: `Bearer ${token}`,
    };

    /*
     * WEB
     * Se obtiene el PDF autenticado y se muestra
     * en el visor PDF del navegador.
     */
    if (Platform.OS === "web") {
      const response = await fetch(endpoint, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        if (ventanaPreview) {
          ventanaPreview.close();
        }

        throw new Error(
          await mensajeRespuestaError(response),
        );
      }

      const blob = await response.blob();

      const pdfBlob = new Blob([blob], {
        type: "application/pdf",
      });

      const objectUrl =
        URL.createObjectURL(pdfBlob);

      if (
        ventanaPreview &&
        !ventanaPreview.closed
      ) {
        ventanaPreview.location.replace(
          objectUrl,
        );
      } else {
        /*
         * Si el navegador bloqueó la nueva pestaña,
         * mostramos el PDF en la pestaña actual.
         */
        window.location.href = objectUrl;
      }

      /*
       * Damos tiempo suficiente al visor para
       * cargar completamente el documento.
       */
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 10 * 60 * 1000);

      return;
    }

    /*
     * ANDROID / IOS
     */
    const FileSystem =
      FileSystemNS as any;

    const cacheDirectory =
      FileSystem.cacheDirectory;

    if (!cacheDirectory) {
      throw new Error(
        "No se pudo acceder al almacenamiento temporal.",
      );
    }

    const fileUri =
      `${cacheDirectory}${nombreArchivo}`;

    const result =
      await FileSystem.downloadAsync(
        endpoint,
        fileUri,
        {
          headers,
        },
      );

    if (
      Number(result?.status ?? 500) >= 400
    ) {
      throw new Error(
        "No se pudo obtener el recibo PDF.",
      );
    }

    if (
      !(await Sharing.isAvailableAsync())
    ) {
      throw new Error(
        "El dispositivo no permite abrir o compartir el PDF.",
      );
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: "application/pdf",
      dialogTitle:
        "Abrir recibo de ingreso",
      UTI: "com.adobe.pdf",
    });
  } catch (error) {
    if (
      ventanaPreview &&
      !ventanaPreview.closed
    ) {
      ventanaPreview.close();
    }

    throw error;
  }
}