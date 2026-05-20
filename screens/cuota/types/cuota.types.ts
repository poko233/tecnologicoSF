// Types for the Cuota module (Student management)

export interface Estudiante {
  id: number;
  ci: string;
  nombres: string;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  nombreCompleto: string;
  matricula: string | null;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  foto: string | null;
  estado: "ACTIVO" | "INACTIVO";
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
export interface Cuota {
  idCuota: number;
  idPlanPago: number | null; // puede ser null si no pertenece a un plan
  idUsuario: number;
  idCarrera: number | null; // nuevo campo
  tipo: "MATRICULA" | "MENSUAL";
  monto: number;
  numeroCuota: string;
  fecha_vencimiento: string | null;
  descuento: number;
  estadoCuota: "Debe" | "Pagado" | "Condonado";
  fecha_pago: string | null;
}

export interface CarreraInscrita {
  idCarrera: number;
  nombreCarrera: string;
  codigo: string;
  regimen: string;
  duracion: number;
  cuotas_por_anio: number;
  cuota_mensual: number;
  costo_matricula: number;
  costo: number;
  // otros campos que necesites
}

export interface CuotaConCarrera extends Cuota {
  carrera?: CarreraInscrita;
}
