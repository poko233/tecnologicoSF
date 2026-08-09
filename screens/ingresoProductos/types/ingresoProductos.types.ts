export type EstadoProductoIngreso = "ACTIVO" | "INACTIVO";

export type ProductoDisponibleIngreso = {
  idProducto: number;
  sku: string;
  nombre: string;
  stock: number;
  unidadMedida: string;
  estado: EstadoProductoIngreso;
  imagenPrincipal?: string | null;
};

export type UsuarioIngresoProducto = {
  id: number;
  usuario: string | null;
  ci: string | null;
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  nombreCompleto: string;
};

export type ProductoIngresoResumen = {
  idProducto: number;
  sku: string;
  nombre: string;
  unidadMedida: string;
};

export type IngresoProducto = {
  idIngresoProducto: number;
  idUsuario: number;
  idProducto: number;
  cantidad: number;
  fechaIngreso: string;
  stockAnterior: number;
  stockPosterior: number;
  usuario: UsuarioIngresoProducto | null;
  producto: ProductoIngresoResumen | null;
  created_at: string | null;
};

export type IngresoProductoPayload = {
  idProducto: number;
  cantidad: number;
  fechaIngreso: string;
};

export type IngresoProductoForm = {
  idProducto: string;
  cantidad: string;
  fechaIngreso: string;
};

export type IngresosProductoResponse = {
  ingresos: IngresoProducto[];
};

export type ProductosIngresoResponse = {
  productos: ProductoDisponibleIngreso[];
};

export type GuardarIngresoProductoResponse = {
  message: string;
  ingreso: IngresoProducto;
};
