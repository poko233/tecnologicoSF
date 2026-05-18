export interface PlanPago {
  id: number;
  idUsuario: number;
  gestion: number;
  matricula_economica: number;
  numero_cuotas: number;
  monto_cuota_promocion: number;
  monto_cuota_normal: number;
  matricula_numero: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
  cuotas?: Cuota[];
  resumen?: {
    total_cuotas: number;
    cuotas_pagadas: number;
    monto_total: number;
    monto_pagado: number;
    porcentaje_pagado: number;
  };
}

export interface Cuota {
  idCuota: number;
  idPlanPago: number | null;
  idUsuario: number;
  tipo: "MATRICULA" | "MENSUAL";
  monto: number;
  numeroCuota: string;
  fecha_vencimiento: string | null;
  descuento: number;
  estadoCuota: "Debe" | "Pagado" | "Condonado";
  fecha_pago: string | null;
}

export interface CrearPlanPagoData {
  usuario_id: number;
  gestion: number;
  numero_cuotas: number;
  monto_cuota: number;
  con_matricula_especial: boolean;
  monto_matricula_especial?: number;
  fecha_inicio?: string;
}
