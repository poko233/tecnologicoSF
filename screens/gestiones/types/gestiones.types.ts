// screens/gestiones/types/gestiones.types.ts

export type Periodo = "Anual" | "Semestral" | "Trimestral" | "Mensual" | "Otro";
export type EstadoGestion = "activo" | "inactivo" | "cerrado";

export interface Gestion {
  id: number;
  nombre: string;
  anio: number;
  periodo: Periodo;
  estado: EstadoGestion;
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string;
  cerrado_por: { id: number; nombre: string } | null;
  fecha_cierre: string | null; // ISO 8601
  created_at: string;
  updated_at: string;
}

// ✅ CORRECCIÓN: Agregamos los campos que devuelve Laravel para que TS no falle
export interface GestionesResponse {
  data: Gestion[];
  meta: {
    total: number;
    per_page: number;
    current_page: number; // <-- Agregado
    last_page: number; // <-- Agregado
    from: number; // <-- Agregado
    to: number; // <-- Agregado
    // page: number;      // Opcional, el backend NO lo envía, lo mapearemos en el hook
  };
  message: string;
}

export interface GestionFormData {
  nombre: string;
  anio: number;
  periodo: Periodo;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface GestionUpdateData extends Partial<GestionFormData> {
  estado?: EstadoGestion;
}

export interface GestionFilters {
  estado?: EstadoGestion;
  periodo?: Periodo;
  anio?: number;
  page?: number;
}
