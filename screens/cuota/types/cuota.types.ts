// ========== ESTUDIANTE ==========

export interface Estudiante {
  id: number;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  matricula?: string;
  email?: string;
  telefono?: string;
  celular?: string;
  foto?: string;
  estado: string;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// ========== CARRERA ==========

export interface CarreraInscrita {
  idCarrera: number;
  nombreCarrera: string;
  codigo: string;
  regimen?: string;
  duracion?: number;
  cuota_mensual?: string;
  costo_matricula?: string;
  costo?: string;
  cuotas_por_anio?: number;
}

// ========== CUOTA ==========

export type EstadoCuota = 'Debe' | 'Parcial' | 'Pagado' | 'Condonado';
export type TipoCuota = 'MATRICULA' | 'MENSUAL';

export interface Cuota {
  idCuota: number;
  tipo: TipoCuota;
  numeroCuota: number;
  concepto: string;

  // Montos
  monto_base: number;
  recargo: number;
  descuento: number;
  total_adeudado: number;
  monto_pagado: number;
  saldo: number;

  // Estado
  estadoCuota: EstadoCuota;
  fecha_vencimiento?: string;
  fecha_pago?: string;
}

// ========== ABONO ==========

export interface Abono {
  idPago: number;
  fecha: string;
  monto: number;
  metodo: MetodoPago;
  registrado_por: string;
}

// ========== ESTADO DE CUENTA ==========

export interface CuotaConAbonos extends Cuota {
  abonos: Abono[];
  total_abonos: number;
}

export interface TotalesEstadoCuenta {
  total_adeudado: number;
  total_pagado: number;
  saldo_global: number;
  total_cuotas: number;
  cuotas_pagadas: number;
  cuotas_parciales: number;
  cuotas_pendientes: number;
}

export interface EstadoCuentaResponse {
  success: boolean;
  data: {
    cuotas: CuotaConAbonos[];
    totales: TotalesEstadoCuenta;
  };
}

// ========== PAGO ==========

export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'QR';

export interface CuotaConMonto {
  idCuota: number;
  monto_abonado: number;
}

export interface RegistrarPagoRequest {
  idUsuario: number;
  metodo: MetodoPago;
  cuotas: CuotaConMonto[];
  comprobante?: string;
  observacion?: string;
}

export interface PagoResponse {
  success: boolean;
  message: string;
  data: any;
}

// ========== HISTORIAL ABONOS ==========

export interface HistorialAbonosResponse {
  success: boolean;
  data: {
    cuota: {
      idCuota: number;
      tipo: TipoCuota;
      numeroCuota: number;
      monto_base: number;
      recargo: number;
      descuento: number;
      total_adeudado: number;
      monto_pagado: number;
      saldo: number;
      estadoCuota: EstadoCuota;
    };
    abonos: Abono[];
    total_abonos: number;
  };
}
