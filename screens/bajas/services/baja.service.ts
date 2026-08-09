import { BASE_URL } from "../../../http/httpClient";
import { getToken } from "../../../storage/secureStorage";
import {
  BajaPayload,
  BajaResponse,
  BajasResponse,
} from "../types/baja.types";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
};

async function bajaRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = await getToken();
  const method = options.method ?? "GET";

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
    },
    body:
      options.body === undefined ? undefined : JSON.stringify(options.body),
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

export async function registrarBaja(payload: BajaPayload) {
  return bajaRequest<BajaResponse>("/api/inventario/bajas", {
    method: "POST",
    body: payload,
  });
}

export async function obtenerHistorialBajas(filtros?: {
  fecha_inicio?: string;
  fecha_fin?: string;
  concepto?: string;
  idProducto?: number;
}) {
  const params = new URLSearchParams();

  if (filtros?.fecha_inicio) {
    params.append("fecha_inicio", filtros.fecha_inicio);
  }

  if (filtros?.fecha_fin) {
    params.append("fecha_fin", filtros.fecha_fin);
  }

  if (filtros?.concepto) {
    params.append("concepto", filtros.concepto);
  }

  if (filtros?.idProducto) {
    params.append("idProducto", filtros.idProducto.toString());
  }

  const query = params.toString();
  const url = `/api/inventario/bajas${query ? `?${query}` : ""}`;

  return bajaRequest<BajasResponse>(url);
}

export async function obtenerDetalleBaja(idBaja: number) {
  return bajaRequest<BajaResponse>(`/api/inventario/bajas/${idBaja}`);
}
