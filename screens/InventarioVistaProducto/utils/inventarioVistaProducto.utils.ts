import { InventarioVistaProducto } from "../types/inventarioVistaProducto.types";

export function formatearNumero(
  valor: number | null | undefined,
): string {
  return new Intl.NumberFormat("es-BO").format(
    Number(valor ?? 0),
  );
}

export function obtenerEstadoStockLabel(
  estado: InventarioVistaProducto["estadoStock"],
): string {
  switch (estado) {
    case "DISPONIBLE":
      return "Disponible";

    case "BAJO":
      return "Stock bajo";

    case "SIN_STOCK":
      return "Sin stock";

    default:
      return "Sin estado";
  }
}

export function obtenerEstadoProductoLabel(
  estado: InventarioVistaProducto["estado"],
): string {
  return estado === "ACTIVO"
    ? "Activo"
    : "Inactivo";
}