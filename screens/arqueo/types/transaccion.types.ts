// screens/arqueo/types/transaccion.types.ts
export interface TipoTransaccion {
  id: number;
  codigo: string;
  transaccion: string;
  tipo: "INGRESO" | "EGRESO";
}

export interface Transaccion {
  id: number;
  arqueo_id: number;
  monto: number;
  metodo: "EFECTIVO" | "TARJETA" | "QR" | "TRANSFERENCIA";
  detalle: string | null;
  comprobante: string | null;
  fecha_registro: string;
  estado: "VALIDO" | "ANULADO";
  usuario: string;
  tipo_transaccion: string | TipoTransaccion | null;
}

export interface IngresoCombinado {
  id: string;
  fecha: string;
  fecha_registro: string;
  concepto: string;
  metodo: string;
  monto: number;
  estado: "VALIDO" | "ANULADO";
  tipo: string;
  origen: "pago" | "ingreso" | "egreso" | "venta";
  idOriginal: number;
  usuario: string;
  comprobante: string | null;
  detalle: string | null;
  tipo_transaccion: string | TipoTransaccion | null;
}
