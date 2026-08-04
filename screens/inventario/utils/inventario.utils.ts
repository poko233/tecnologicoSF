import {
    CategoriaForm,
    CategoriaPayload,
    EstadoStockInventario,
    InventarioProducto,
    ProductoForm,
    ProductoPayload,
} from "../types/inventario.types";

export const PRODUCTO_FORM_INICIAL: ProductoForm = {
  sku: "",
  codigoBarras: "",
  nombre: "",
  descripcion: "",
  precioCompra: "0",
  precioVenta: "",
  precioDescuento: "",
  stock: "0",
  stockMinimo: "0",
  unidadMedida: "Unidad",
  idCategoria: "",
  estado: "ACTIVO",
};

export const CATEGORIA_FORM_INICIAL: CategoriaForm = {
  nombre: "",
  descripcion: "",
  estado: "ACTIVO",
};

export function productoAForm(producto?: InventarioProducto | null): ProductoForm {
  if (!producto) return { ...PRODUCTO_FORM_INICIAL };

  return {
    sku: producto.sku ?? "",
    codigoBarras: producto.codigoBarras ?? "",
    nombre: producto.nombre ?? "",
    descripcion: producto.descripcion ?? "",
    precioCompra: String(producto.precioCompra ?? 0),
    precioVenta: String(producto.precioVenta ?? 0),
    precioDescuento:
      producto.precioDescuento === null || producto.precioDescuento === undefined
        ? ""
        : String(producto.precioDescuento),
    stock: String(producto.stock ?? 0),
    stockMinimo: String(producto.stockMinimo ?? 0),
    unidadMedida: producto.unidadMedida ?? "Unidad",
    idCategoria:
      producto.idCategoria === null || producto.idCategoria === undefined
        ? ""
        : String(producto.idCategoria),
    estado: producto.estado ?? "ACTIVO",
  };
}

function numeroSeguro(value: string, fallback = 0): number {
  const normalized = String(value ?? "").replace(",", ".").trim();
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function productoFormAPayload(form: ProductoForm): ProductoPayload {
  return {
    sku: form.sku.trim().toUpperCase(),
    codigoBarras: form.codigoBarras.trim() || null,
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    precioCompra: numeroSeguro(form.precioCompra),
    precioVenta: numeroSeguro(form.precioVenta),
    precioDescuento: form.precioDescuento.trim()
      ? numeroSeguro(form.precioDescuento)
      : null,
    stock: Math.max(0, Math.trunc(numeroSeguro(form.stock))),
    stockMinimo: Math.max(0, Math.trunc(numeroSeguro(form.stockMinimo))),
    unidadMedida: form.unidadMedida.trim() || "Unidad",
    idCategoria: form.idCategoria ? Number(form.idCategoria) : null,
    estado: form.estado,
  };
}

export function categoriaFormAPayload(form: CategoriaForm): CategoriaPayload {
  return {
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    estado: form.estado,
  };
}

export type ProductoFormErrors = Partial<Record<keyof ProductoForm, string>>;

export function validarProductoForm(form: ProductoForm): ProductoFormErrors {
  const errors: ProductoFormErrors = {};
  const precioVenta = numeroSeguro(form.precioVenta, Number.NaN);
  const precioCompra = numeroSeguro(form.precioCompra, Number.NaN);
  const precioDescuento = form.precioDescuento.trim()
    ? numeroSeguro(form.precioDescuento, Number.NaN)
    : null;
  const stock = numeroSeguro(form.stock, Number.NaN);
  const stockMinimo = numeroSeguro(form.stockMinimo, Number.NaN);

  if (!form.sku.trim()) errors.sku = "El SKU es obligatorio.";
  if (!form.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
  if (!form.precioVenta.trim() || !Number.isFinite(precioVenta) || precioVenta < 0) {
    errors.precioVenta = "Ingresa un precio de venta válido.";
  }
  if (!Number.isFinite(precioCompra) || precioCompra < 0) {
    errors.precioCompra = "Ingresa un precio de compra válido.";
  }
  if (
    precioDescuento !== null &&
    (!Number.isFinite(precioDescuento) ||
      precioDescuento < 0 ||
      (Number.isFinite(precioVenta) && precioDescuento > precioVenta))
  ) {
    errors.precioDescuento =
      "El descuento debe ser válido y no superar el precio de venta.";
  }
  if (!Number.isInteger(stock) || stock < 0) {
    errors.stock = "El stock debe ser un número entero igual o mayor a 0.";
  }
  if (!Number.isInteger(stockMinimo) || stockMinimo < 0) {
    errors.stockMinimo =
      "El stock mínimo debe ser un número entero igual o mayor a 0.";
  }
  if (!form.unidadMedida.trim()) {
    errors.unidadMedida = "La unidad de medida es obligatoria.";
  }

  return errors;
}

export function formatearMoneda(value?: number | string | null): string {
  const number = Number(value ?? 0);

  return `Bs. ${Number.isFinite(number) ? number.toFixed(2) : "0.00"}`;
}

export function formatearNumero(value?: number | string | null): string {
  const number = Number(value ?? 0);

  return Number.isFinite(number)
    ? new Intl.NumberFormat("es-BO").format(number)
    : "0";
}

export function obtenerEstadoStock(
  stock: number,
  stockMinimo: number,
): EstadoStockInventario {
  if (stock <= 0) return "SIN_STOCK";
  if (stock <= stockMinimo) return "BAJO";
  return "DISPONIBLE";
}

export function obtenerEstadoStockLabel(estado: EstadoStockInventario): string {
  if (estado === "SIN_STOCK") return "Sin stock";
  if (estado === "BAJO") return "Stock bajo";
  return "Disponible";
}

export function obtenerMensajeError(error: any, fallback: string): string {
  const data = error?.data ?? error?.response?.data;
  const validationErrors = data?.errors;

  if (validationErrors && typeof validationErrors === "object") {
    const first = Object.values(validationErrors).flat().find(Boolean);
    if (first) return String(first);
  }

  return (
    data?.message ||
    error?.message ||
    fallback
  );
}

export function normalizarBusqueda(value?: string | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
