import { Platform } from "react-native";

import { BASE_URL } from "../../../http/httpClient";
import { getToken } from "../../../storage/secureStorage";
import {
    ApiMessageResponse,
    ArchivoImagenInventario,
    CategoriaPayload,
    CategoriaResponse,
    CategoriasResponse,
    EstadoInventario,
    ProductoPayload,
    ProductoResponse,
    ProductosResponse,
} from "../types/inventario.types";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  isFormData?: boolean;
};

async function inventarioRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = await getToken();
  const method = options.method ?? "GET";
  const isFormData = options.isFormData === true;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData && options.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
    },
    body:
      options.body === undefined
        ? undefined
        : isFormData
          ? options.body
          : JSON.stringify(options.body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.message || `La solicitud falló con estado ${response.status}.`,
    ) as Error & { data?: any; status?: number };

    error.data = data;
    error.status = response.status;
    throw error;
  }

  return data as T;
}

export async function obtenerProductosInventario() {
  return inventarioRequest<ProductosResponse>("/api/inventario/productos");
}

export async function obtenerCategoriasInventario() {
  return inventarioRequest<CategoriasResponse>("/api/inventario/categorias");
}

export async function crearProductoInventario(payload: ProductoPayload) {
  return inventarioRequest<ProductoResponse>("/api/inventario/productos", {
    method: "POST",
    body: payload,
  });
}

export async function actualizarProductoInventario(
  idProducto: number,
  payload: ProductoPayload,
) {
  return inventarioRequest<ProductoResponse>(
    `/api/inventario/productos/${idProducto}`,
    {
      method: "PUT",
      body: payload,
    },
  );
}

export async function cambiarEstadoProductoInventario(
  idProducto: number,
  estado: EstadoInventario,
) {
  return inventarioRequest<ProductoResponse>(
    `/api/inventario/productos/${idProducto}/estado`,
    {
      method: "PATCH",
      body: { estado },
    },
  );
}

export async function eliminarProductoInventario(idProducto: number) {
  return inventarioRequest<ApiMessageResponse>(
    `/api/inventario/productos/${idProducto}`,
    { method: "DELETE" },
  );
}

export async function crearCategoriaInventario(payload: CategoriaPayload) {
  return inventarioRequest<CategoriaResponse>("/api/inventario/categorias", {
    method: "POST",
    body: payload,
  });
}

export async function actualizarCategoriaInventario(
  idCategoria: number,
  payload: CategoriaPayload,
) {
  return inventarioRequest<CategoriaResponse>(
    `/api/inventario/categorias/${idCategoria}`,
    {
      method: "PUT",
      body: payload,
    },
  );
}

export async function cambiarEstadoCategoriaInventario(
  idCategoria: number,
  estado: EstadoInventario,
) {
  return inventarioRequest<CategoriaResponse>(
    `/api/inventario/categorias/${idCategoria}/estado`,
    {
      method: "PATCH",
      body: { estado },
    },
  );
}

export async function eliminarCategoriaInventario(idCategoria: number) {
  return inventarioRequest<ApiMessageResponse>(
    `/api/inventario/categorias/${idCategoria}`,
    { method: "DELETE" },
  );
}

export async function subirImagenProductoInventario(
  idProducto: number,
  params: {
    archivo?: ArchivoImagenInventario | null;
    urlFoto?: string | null;
    esPrincipal?: boolean;
  },
) {
  const formData = new FormData();

  if (params.archivo) {
    if (Platform.OS === "web") {
      if (!params.archivo.file) {
        throw new Error("No se pudo leer la imagen seleccionada.");
      }

      formData.append("imagen", params.archivo.file, params.archivo.name);
    } else {
      formData.append("imagen", {
        uri: params.archivo.uri,
        name: params.archivo.name,
        type: params.archivo.type,
      } as any);
    }
  }

  if (params.urlFoto?.trim()) {
    formData.append("urlFoto", params.urlFoto.trim());
  }

  formData.append("esPrincipal", params.esPrincipal ? "1" : "0");

  return inventarioRequest<ProductoResponse & { message?: string }>(
    `/api/inventario/productos/${idProducto}/imagenes`,
    {
      method: "POST",
      body: formData,
      isFormData: true,
    },
  );
}

export async function marcarImagenPrincipalInventario(
  idProducto: number,
  idImagen: number,
) {
  return inventarioRequest<ProductoResponse>(
    `/api/inventario/productos/${idProducto}/imagenes/${idImagen}/principal`,
    {
      method: "PATCH",
      body: {},
    },
  );
}

export async function eliminarImagenProductoInventario(
  idProducto: number,
  idImagen: number,
) {
  return inventarioRequest<ProductoResponse>(
    `/api/inventario/productos/${idProducto}/imagenes/${idImagen}`,
    {
      method: "DELETE",
    },
  );
}
