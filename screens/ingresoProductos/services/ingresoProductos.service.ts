import * as FileSystemNS from "expo-file-system";
import * as Sharing from "expo-sharing";

import {
  Platform,
} from "react-native";

import {
  BASE_URL,
  httpClient,
} from "../../../http/httpClient";

import {
  getToken,
} from "../../../storage/secureStorage";

import {
  CategoriasIngresoResponse,
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

export async function obtenerCategoriasParaIngreso() {
  return httpClient.getAuth<CategoriasIngresoResponse>(
    "/api/inventario/categorias?estado=ACTIVO",
    "No se pudieron cargar las categorías del inventario",
  );
}

export async function guardarIngresoProducto(
  payload: IngresoProductoPayload,
) {
  return httpClient.postAuth<
    GuardarIngresoProductoResponse
  >(
    "/api/inventario/ingresos",
    payload,
  );
}

export type VentanaPrevisualizacionRecibo = {
  closed: boolean;

  opener: unknown;

  document: {
    title: string;

    body: {
      innerHTML: string;
    };
  };

  location: {
    replace: (url: string) => void;
  };

  close: () => void;
} | null;

/**
 * Debe ejecutarse directamente desde el clic del usuario,
 * antes de comenzar el POST.
 *
 * De esta forma Chrome no bloquea la vista previa como
 * ventana emergente.
 */
export function prepararVentanaPrevisualizacionRecibo():
  VentanaPrevisualizacionRecibo {
  if (
    Platform.OS !== "web" ||
    typeof window === "undefined"
  ) {
    return null;
  }

  const ventanaPreview = window.open(
    "about:blank",
    "_blank",
  );

  if (!ventanaPreview) {
    return null;
  }

  try {
    ventanaPreview.opener = null;

    ventanaPreview.document.title =
      "Generando recibo de ingreso...";

    ventanaPreview.document.body.innerHTML = `
      <div
        style="
          font-family: Arial, sans-serif;
          height: 100vh;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          color: #475569;
        "
      >
        <div style="text-align: center;">
          <div
            style="
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 8px;
            "
          >
            Generando recibo
          </div>

          <div style="font-size: 14px;">
            El ingreso fue enviado. Espere un momento...
          </div>
        </div>
      </div>
    `;
  } catch {
    /*
     * La pestaña continúa siendo válida aunque el navegador
     * limite la modificación de su contenido.
     */
  }

  return ventanaPreview;
}

export function cerrarVentanaPrevisualizacionRecibo(
  ventanaPreview?:
    VentanaPrevisualizacionRecibo,
): void {
  if (
    ventanaPreview &&
    !ventanaPreview.closed
  ) {
    ventanaPreview.close();
  }
}

async function mensajeRespuestaError(
  response: Response,
): Promise<string> {
  try {
    const contentType =
      response.headers.get("content-type") || "";

    if (
      contentType.includes(
        "application/json",
      )
    ) {
      const body = await response.json();

      return (
        body?.message ||
        "No se pudo generar el recibo."
      );
    }

    const mensaje = await response.text();

    return (
      mensaje ||
      "No se pudo generar el recibo."
    );
  } catch {
    return "No se pudo generar el recibo.";
  }
}

export async function previsualizarReciboIngresoProducto(
  idIngresoProducto: number,
  ventanaPreparada?:
    VentanaPrevisualizacionRecibo,
): Promise<void> {
  let ventanaPreview =
    ventanaPreparada ?? null;

  /*
   * Cuando se abre desde el historial no existe una ventana
   * preparada, por lo que se crea una nueva.
   */
  if (
    Platform.OS === "web" &&
    (!ventanaPreview ||
      ventanaPreview.closed)
  ) {
    ventanaPreview =
      prepararVentanaPrevisualizacionRecibo();
  }

  try {
    const token = await getToken();

    if (!token) {
      cerrarVentanaPrevisualizacionRecibo(
        ventanaPreview,
      );

      throw new Error(
        "Tu sesión expiró. Vuelve a iniciar sesión.",
      );
    }

    const baseUrlLimpia =
      String(BASE_URL).replace(/\/$/, "");

    const endpoint =
      `${baseUrlLimpia}` +
      `/api/inventario/ingresos/` +
      `${idIngresoProducto}/recibo`;

    const nombreArchivo =
      `recibo-ingreso-` +
      `${idIngresoProducto}.pdf`;

    const headers = {
      Accept: "application/pdf",
      Authorization: `Bearer ${token}`,
    };

    /*
     * Vista previa para Expo Web.
     */
    if (Platform.OS === "web") {
      const response = await fetch(
        endpoint,
        {
          method: "GET",
          headers,
        },
      );

      if (!response.ok) {
        cerrarVentanaPrevisualizacionRecibo(
          ventanaPreview,
        );

        throw new Error(
          await mensajeRespuestaError(response),
        );
      }

      const pdfBlob =
        await response.blob();

      const objectUrl =
        URL.createObjectURL(pdfBlob);

      if (
        ventanaPreview &&
        !ventanaPreview.closed
      ) {
        ventanaPreview.location.replace(
          objectUrl,
        );
      } else if (
        typeof window !== "undefined"
      ) {
        /*
         * Si el navegador bloqueó la pestaña,
         * se muestra el PDF en la pestaña actual.
         */
        window.location.assign(objectUrl);
      }

      /*
       * Se mantiene la URL durante diez minutos para que
       * el visor del navegador pueda imprimir o descargar.
       */
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 10 * 60 * 1000);

      return;
    }

    /*
     * Funcionamiento para Android e iOS.
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

    const result =
      await FileSystem.downloadAsync(
        endpoint,
        `${cacheDirectory}${nombreArchivo}`,
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

    const sharingDisponible =
      await Sharing.isAvailableAsync();

    if (!sharingDisponible) {
      throw new Error(
        "El dispositivo no permite abrir o compartir el PDF.",
      );
    }

    await Sharing.shareAsync(
      result.uri,
      {
        mimeType: "application/pdf",
        dialogTitle:
          "Abrir recibo de ingreso",
        UTI: "com.adobe.pdf",
      },
    );
  } catch (error) {
    cerrarVentanaPrevisualizacionRecibo(
      ventanaPreview,
    );

    throw error;
  }
}