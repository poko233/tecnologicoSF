export type EstadoProductoInventarioVista =
  | ""
  | "ACTIVO"
  | "INACTIVO";

export type EstadoStockInventarioVista =
  | ""
  | "DISPONIBLE"
  | "BAJO"
  | "SIN_STOCK";

export type InventarioVistaCategoria = {
  idCategoria: number;
  nombre: string;
  estado: string;
};

export type InventarioVistaProducto = {
  idProducto: number;

  sku: string;

  nombre: string;

  descripcion?: string | null;

  /*
   * Imagen principal del producto.
   */
  imagenPrincipal?: string | null;

  stock: number;

  stockMinimo: number;

  unidadMedida: string;

  idCategoria?: number | null;

  estado:
    | "ACTIVO"
    | "INACTIVO";

  estadoStock:
    | "DISPONIBLE"
    | "BAJO"
    | "SIN_STOCK";

  categoria?: {
    idCategoria: number;
    nombre: string;
  } | null;
};

export type InventarioVistaResumenGeneral = {
  totalProductos: number;

  unidadesDisponibles: number;

  productosConStock: number;

  productosSinStock: number;

  stockBajo: number;

  productosActivos: number;

  productosInactivos: number;
};

export type InventarioVistaResumenFiltrado = {
  totalProductos: number;

  unidadesDisponibles: number;
};

export type InventarioVistaFiltros = {
  buscar: string;

  idCategoria: string;

  estado:
    EstadoProductoInventarioVista;

  estadoStock:
    EstadoStockInventarioVista;
};

export type InventarioVistaResponse = {
  productos:
    InventarioVistaProducto[];

  categorias:
    InventarioVistaCategoria[];

  resumenGeneral:
    InventarioVistaResumenGeneral;

  resumenFiltrado:
    InventarioVistaResumenFiltrado;
};