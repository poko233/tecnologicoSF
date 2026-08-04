export type EstadoInventario = "ACTIVO" | "INACTIVO";
export type EstadoStockInventario = "DISPONIBLE" | "BAJO" | "SIN_STOCK";
export type TabInventario = "productos" | "categorias";

export type InventarioCategoria = {
  idCategoria: number;
  nombre: string;
  descripcion?: string | null;
  estado: EstadoInventario;
  productos_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type InventarioProductoImagen = {
  idImagen: number;
  idProducto: number;
  urlFoto: string;
  urlOriginal?: string | null;
  orden: number;
  esPrincipal: boolean;
};

export type InventarioProducto = {
  idProducto: number;
  sku: string;
  codigoBarras?: string | null;
  nombre: string;
  descripcion?: string | null;
  precioCompra: number;
  precioVenta: number;
  precioDescuento?: number | null;
  stock: number;
  stockMinimo: number;
  unidadMedida: string;
  idCategoria?: number | null;
  estado: EstadoInventario;
  estadoStock: EstadoStockInventario;
  valorStock: number;
  categoria?: InventarioCategoria | null;
  imagenes: InventarioProductoImagen[];
  imagenPrincipal?: string | null;
  cantidadImagenes: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type InventarioResumen = {
  totalProductos: number;
  productosActivos: number;
  sinStock: number;
  stockBajo: number;
  unidadesDisponibles: number;
  valorInventario: number;
};

export type ProductoForm = {
  sku: string;
  codigoBarras: string;
  nombre: string;
  descripcion: string;
  precioCompra: string;
  precioVenta: string;
  precioDescuento: string;
  stock: string;
  stockMinimo: string;
  unidadMedida: string;
  idCategoria: string;
  estado: EstadoInventario;
};

export type CategoriaForm = {
  nombre: string;
  descripcion: string;
  estado: EstadoInventario;
};

export type ProductoPayload = {
  sku: string;
  codigoBarras: string | null;
  nombre: string;
  descripcion: string | null;
  precioCompra: number;
  precioVenta: number;
  precioDescuento: number | null;
  stock: number;
  stockMinimo: number;
  unidadMedida: string;
  idCategoria: number | null;
  estado: EstadoInventario;
};

export type CategoriaPayload = {
  nombre: string;
  descripcion: string | null;
  estado: EstadoInventario;
};

export type ProductosResponse = {
  productos: InventarioProducto[];
  resumen: InventarioResumen;
};

export type CategoriasResponse = {
  categorias: InventarioCategoria[];
};

export type ProductoResponse = {
  message?: string;
  producto: InventarioProducto;
};

export type CategoriaResponse = {
  message?: string;
  categoria: InventarioCategoria;
};

export type ApiMessageResponse = {
  message?: string;
};

export type ProductoFiltros = {
  buscar: string;
  idCategoria: string;
  estado: "" | EstadoInventario;
  stock: "" | "disponible" | "bajo" | "sin_stock";
};

export type CategoriaFiltros = {
  buscar: string;
  estado: "" | EstadoInventario;
};

export type ArchivoImagenInventario = {
  uri: string;
  name: string;
  type: string;
  file?: any;
};
