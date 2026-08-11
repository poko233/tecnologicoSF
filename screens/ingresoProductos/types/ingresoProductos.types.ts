export type EstadoProductoIngreso = "ACTIVO" | "INACTIVO";

export type CategoriaDisponibleIngreso = {
  idCategoria: number;
  nombre: string;
  estado?: EstadoProductoIngreso;
};

export type ImagenProductoIngreso = {
  idImagen?: number;
  urlFoto: string;
  esPrincipal?: boolean;
};

export type ProductoDisponibleIngreso = {
  idProducto: number;
  sku: string;
  nombre: string;
  stock: number;
  unidadMedida: string;
  estado: EstadoProductoIngreso;
  idCategoria?: number | null;
  precioCompra?: number;
  precioVenta?: number;
  imagenPrincipal?: string | null;
  imagenes?: ImagenProductoIngreso[];
  categoria?: CategoriaDisponibleIngreso | null;
};

export type ProductoIngresoItem = {
  idProducto: number;
  sku: string;
  nombre: string;
  stock: number;
  unidadMedida: string;
  cantidad: number;
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

export type IngresoProductoDetalle = {
  idDetalleIngresoProducto: number;
  idIngresoProducto: number;
  idProducto: number;
  cantidad: number;
  stockAnterior: number;
  stockPosterior: number;
  producto: ProductoIngresoResumen | null;
};

export type IngresoProducto = {
  idIngresoProducto: number;
  idUsuario: number;
  fechaIngreso: string;
  observacion: string | null;
  totalItems: number;
  usuario: UsuarioIngresoProducto | null;
  detalles: IngresoProductoDetalle[];
  created_at: string | null;
};

export type IngresoProductoPayload = {
  fechaIngreso: string;
  observacion?: string | null;
  detalles: Array<{
    idProducto: number;
    cantidad: number;
  }>;
};

export type IngresosProductoResponse = {
  ingresos: IngresoProducto[];
};

export type ProductosIngresoResponse = {
  productos: ProductoDisponibleIngreso[];
};

export type CategoriasIngresoResponse = {
  categorias: CategoriaDisponibleIngreso[];
};

export type GuardarIngresoProductoResponse = {
  message: string;
  ingreso: IngresoProducto;
};

export type TabIngresoProducto = "realizar" | "historial";
