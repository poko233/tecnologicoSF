import { BASE_URL } from "../../../http/httpClient";
import { getToken } from "../../../storage/secureStorage";

import {
    InventarioVistaFiltros,
    InventarioVistaResponse,
} from "../types/inventarioVistaProducto.types";

function agregarParametro(
  params: string[],
  nombre: string,
  valor: string | number | null | undefined,
) {
  if (
    valor === undefined ||
    valor === null
  ) {
    return;
  }

  const texto = String(valor).trim();

  if (!texto) {
    return;
  }

  params.push(
    `${encodeURIComponent(nombre)}=${encodeURIComponent(
      texto,
    )}`,
  );
}

function construirQuery(
  filtros: InventarioVistaFiltros,
): string {
  const params: string[] = [];

  agregarParametro(
    params,
    "buscar",
    filtros.buscar,
  );

  agregarParametro(
    params,
    "idCategoria",
    filtros.idCategoria,
  );

  agregarParametro(
    params,
    "estado",
    filtros.estado,
  );

  agregarParametro(
    params,
    "estadoStock",
    filtros.estadoStock,
  );

  if (params.length === 0) {
    return "";
  }

  return `?${params.join("&")}`;
}

export async function obtenerInventarioVistaProductos(
  filtros: InventarioVistaFiltros,
): Promise<InventarioVistaResponse> {
  const token = await getToken();

  const query = construirQuery(filtros);

  const response = await fetch(
    `${BASE_URL}/api/inventario-vista-producto${query}`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    },
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        `Error ${response.status} al consultar el inventario.`,
    ) as Error & {
      status?: number;
      data?: any;
    };

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data as InventarioVistaResponse;
}