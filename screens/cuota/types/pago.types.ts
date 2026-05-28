// screens/cuota/types/pago.types.ts

export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "QR";

export interface CuotaPago {
  idCuota: number;
  monto_pagado: number;
  // Datos extra de la cuota (se incluyen en la respuesta del backend)
  tipo?: "MATRICULA" | "MENSUAL";
  numeroCuota?: string;
  fecha_vencimiento?: string | null;
}

export interface Pago {
  idPago: number;
  idUsuario: number;
  monto: number;
  metodo: MetodoPago;
  comprobante: string | null;
  observacion: string | null;
  registrado_por: number;
  created_at: string;
  updated_at: string;
  cuotas: CuotaPago[]; // Relación muchos a muchos
  // El backend puede incluir datos del registrador
  registradoPor?: {
    id: number;
    nombres: string;
  };
  usuario?: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    ci: string;
  };
}
