export type ConceptoBaja = 'DAÑADO' | 'VENCIDO' | 'PERDIDA' | 'AJUSTE';

export interface InventarioBaja {
  idBaja: number;
  registradoPor: number;
  concepto: ConceptoBaja;
  totalBaja: number;
  observacion?: string | null;
  fechaBaja: string;
  encargado?: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
  detalles: InventarioBajaDetalle[];
  created_at?: string;
  updated_at?: string;
}

export interface InventarioBajaDetalle {
  idDetalleBaja: number;
  idBaja: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subTotal: number;
  producto?: {
    nombre: string;
    sku: string;
    codigoBarras?: string;
    imagenPrincipal?: string;
  };
}

export interface BajaForm {
  concepto: ConceptoBaja | '';
  observacion: string;
  productos: ProductoBajaItem[];
}

export interface ProductoBajaItem {
  idProducto: number;
  nombre: string;
  sku: string;
  codigoBarras?: string;
  stock: number;
  precioVenta: number;
  cantidad: number;
  subTotal: number;
  imagenPrincipal?: string;
}

export interface BajaPayload {
  concepto: ConceptoBaja;
  observacion?: string | null;
  detalles: Array<{
    idProducto: number;
    cantidad: number;
    precioUnitario: number;
    subTotal: number;
  }>;
}

export interface BajasResponse {
  data: InventarioBaja[];
  message?: string;
}

export interface BajaResponse {
  data: InventarioBaja;
  message?: string;
}

export type TabBaja = 'realizar' | 'historial';
