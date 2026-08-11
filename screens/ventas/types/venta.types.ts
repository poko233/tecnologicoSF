export type MetodoPago = "EFECTIVO" | "TARJETA" | "QR" | "TRANSFERENCIA";

export type EstadoVenta = "PENDIENTE" | "PAGADO" | "CANCELADO" | "ENTREGADO";

export interface InventarioVentaDetalle {
  idDetalleVenta?: number;
  idVenta?: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subTotal: number;
  producto?: {
    idProducto: number;
    nombre: string;
    sku: string;
    codigoBarras?: string;
    descripcion?: string;
    precioVenta: number;
    stock: number;
    idCategoria?: number;
    categoria?: {
      idCategoria: number;
      nombre: string;
    };
    imagenes?: {
      idImagen: number;
      urlFoto: string;
      esPrincipal: boolean;
    }[];
  };
}

export interface InventarioVenta {
  idVenta?: number;
  idUsuario?: number;
  registradoPor?: number;
  arqueo_id?: number;
  total: number;
  metodo_pago: MetodoPago;
  estado: EstadoVenta;
  fechaVenta?: string;
  observacion?: string;
  // Campos de anulación
  motivoAnulacion?: string;
  observacionAnulacion?: string;
  fechaAnulacion?: string;
  anuladoPor?: number;
  // Accessors computados
  estaAnulada?: boolean;
  puedeAnularse?: boolean;
  // Relaciones
  detalles: InventarioVentaDetalle[];
  usuario?: {
    id: number;
    nombres: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
  };
  registradoPorUsuario?: {
    id: number;
    nombres: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
  };
  anuladoPorUsuario?: {
    id: number;
    nombres: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
  };
  arqueo?: {
    id: number;
    turno: string;
    estado: string;
    fecha_apertura?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CarritoItem {
  idProducto: number;
  nombre: string;
  sku: string;
  precioUnitario: number;
  cantidad: number;
  subTotal: number;
  stock: number;
  imagenUrl?: string;
}

export interface VentaFormData {
  idUsuario?: number;
  metodo_pago: MetodoPago;
  observacion?: string;
  detalles: {
    idProducto: number;
    cantidad: number;
    precioUnitario?: number;
  }[];
}

export interface VentaResumen {
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
}

export interface FiltrosVenta {
  search?: string;
  estado?: EstadoVenta;
  metodo_pago?: MetodoPago;
  fecha_from?: string; // Formato YYYY-MM-DD (alias para fecha_inicio)
  fecha_to?: string; // Formato YYYY-MM-DD (alias para fecha_fin)
  arqueo_id?: number;
  mes?: number; // Mes (1-12)
  anio?: number; // Año (YYYY)
}

export interface AnularVentaRequest {
  motivo: string;
  observacion?: string;
}

export interface VentasListResponse {
  data: {
    data: InventarioVenta[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  message: string;
}

export interface AnularVentaResponse {
  success: boolean;
  data?: InventarioVenta;
  message: string;
}

export type TabVenta = "nueva" | "listado";
