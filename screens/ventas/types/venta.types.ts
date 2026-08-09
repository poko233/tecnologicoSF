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
  arqueo?: {
    id: number;
    turno: string;
    estado: string;
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
