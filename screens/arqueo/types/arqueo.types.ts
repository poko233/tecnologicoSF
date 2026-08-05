// types/arqueo.types.ts
export interface Conteo {
  billete_200: number;
  billete_100: number;
  billete_50: number;
  billete_20: number;
  billete_10: number;
  moneda_5: number;
  moneda_2: number;
  moneda_1: number;
}

export type EstadoArqueo = "INICIADO" | "TERMINADO";

export interface UsuarioData {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  usuario: string;
}

export interface Ingreso {
  id: number;
  monto: number;
  metodo: "EFECTIVO" | "TARJETA" | "QR" | "TRANSFERENCIA";
  detalle: string | null;
  comprobante: string | null;
  fecha_registro: string; // ISO
  estado: "VALIDO" | "ANULADO";
  usuario: string;
  tipo_transaccion: string | null;
}

export interface Egreso {
  id: number;
  monto: number;
  metodo: "EFECTIVO" | "TARJETA" | "QR" | "TRANSFERENCIA";
  detalle: string | null;
  comprobante: string | null;
  fecha_registro: string; // ISO
  estado: "VALIDO" | "ANULADO";
  usuario: string;
  tipo_transaccion: string | null;
}

export interface Pago {
  id: number;
  monto: number;
  metodo: "EFECTIVO" | "TARJETA" | "QR" | "TRANSFERENCIA";
  comprobante: string | null;
  observacion: string | null;
  fecha: string;
  estudiante: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    ci: string;
  } | null;
  cuotas: {
    id: number;
    numeroCuota: string;
    tipo: "MATRICULA" | "MENSUAL" | "CONVALIDACION";
    monto: number;
    estadoCuota: string;
    fecha_vencimiento: string;
    fecha_pago: string;
  }[];
}

export interface Arqueo {
  id: number;
  turno: string;
  fecha_apertura: string;
  fecha_cierre: string | null;
  saldo_anterior: number;
  total_efectivo: number | null;
  total_tarjeta: number | null;
  total_qr: number | null;
  total_transferencia: number | null;
  total_general: number | null;
  conteo: Conteo | null;
  estado: EstadoArqueo;
  usuario: string | UsuarioData;
  created_at: string;
  pagos?: Pago[];
  ingresos?: Ingreso[];
  egresos?: Egreso[];
  ventasInventario?: any[];
}
