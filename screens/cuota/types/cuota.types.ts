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
