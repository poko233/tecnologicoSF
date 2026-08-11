import { UsuarioIngresoProducto } from "../types/ingresoProductos.types";

export function fechaLocalHoy(): string {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");
  const day = String(ahora.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function fechaIngresoEsValida(fechaIngreso: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaIngreso)) {
    return "La fecha debe tener el formato AAAA-MM-DD.";
  }

  const [year, month, day] = fechaIngreso.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);

  if (
    fecha.getFullYear() !== year ||
    fecha.getMonth() !== month - 1 ||
    fecha.getDate() !== day
  ) {
    return "La fecha ingresada no es válida.";
  }

  if (fechaIngreso > fechaLocalHoy()) {
    return "La fecha de ingreso no puede ser futura.";
  }

  return null;
}

export function formatearFechaIngreso(value?: string | null): string {
  const fecha = String(value ?? "").slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);

  if (!match) return value || "-";

  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function formatearFechaHoraIngreso(value?: string | null): string {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return formatearFechaIngreso(value);
  }

  return date.toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatearNumero(value?: number | null): string {
  return Number(value ?? 0).toLocaleString("es-BO");
}

export function nombreUsuarioIngreso(
  usuario?: UsuarioIngresoProducto | null,
): string {
  if (!usuario) return "Usuario no disponible";

  if (usuario.nombreCompleto?.trim()) return usuario.nombreCompleto.trim();

  return usuario.usuario?.trim() || `Usuario #${usuario.id}`;
}

export function normalizarBusquedaIngreso(value?: string | null): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function obtenerMensajeErrorIngreso(error: unknown): string {
  const value = error as any;

  return (
    value?.response?.data?.message ||
    value?.data?.message ||
    value?.message ||
    "Ocurrió un error inesperado."
  );
}
