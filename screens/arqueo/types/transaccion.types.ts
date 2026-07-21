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
  fecha_registro: string; // ISO
  estado: "VALIDO" | "ANULADO";
  usuario: string;
  tipo_transaccion: string | null;
}
