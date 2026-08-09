import {
    IngresoProductoForm,
    IngresoProductoPayload,
    UsuarioIngresoProducto,
} from "../types/ingresoProductos.types";

export type IngresoProductoFormErrors = Partial<
  Record<keyof IngresoProductoForm, string>
>;

export function fechaLocalHoy(): string {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");
  const day = String(ahora.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function crearIngresoProductoForm(): IngresoProductoForm {
  return {
    idProducto: "",
    cantidad: "",
    fechaIngreso: fechaLocalHoy(),
  };
}

export function validarIngresoProductoForm(
  form: IngresoProductoForm,
): IngresoProductoFormErrors {
  const errors: IngresoProductoFormErrors = {};
  const idProducto = Number(form.idProducto);
  const cantidad = Number(form.cantidad);

  if (!Number.isInteger(idProducto) || idProducto <= 0) {
    errors.idProducto = "Selecciona un producto del inventario.";
  }

  if (!/^\d+$/.test(form.cantidad.trim()) || !Number.isInteger(cantidad)) {
    errors.cantidad = "La cantidad debe ser un número entero.";
  } else if (cantidad <= 0) {
    errors.cantidad = "La cantidad debe ser mayor a cero.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fechaIngreso)) {
    errors.fechaIngreso = "La fecha debe tener el formato AAAA-MM-DD.";
  } else {
    const [year, month, day] = form.fechaIngreso.split("-").map(Number);
    const fecha = new Date(year, month - 1, day);

    if (
      fecha.getFullYear() !== year ||
      fecha.getMonth() !== month - 1 ||
      fecha.getDate() !== day
    ) {
      errors.fechaIngreso = "La fecha ingresada no es válida.";
    } else if (form.fechaIngreso > fechaLocalHoy()) {
      errors.fechaIngreso = "La fecha de ingreso no puede ser futura.";
    }
  }

  return errors;
}

export function ingresoFormAPayload(
  form: IngresoProductoForm,
): IngresoProductoPayload {
  return {
    idProducto: Number(form.idProducto),
    cantidad: Number(form.cantidad),
    fechaIngreso: form.fechaIngreso,
  };
}

export function formatearFechaIngreso(value?: string | null): string {
  const fecha = String(value ?? "").slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);

  if (!match) return value || "-";

  return `${match[3]}/${match[2]}/${match[1]}`;
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
