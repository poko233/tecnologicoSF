export interface Empresa {
  ID_EMPRESA: number;
  EMPRESA: string | null;
  SLOGAN: string | null;
  SIGLA: string | null;
  TELEFONO: string | null;
  CELULAR: string | null;
  EMAIL: string | null;
  DIRECCION: string | null;
  RESPONSABLE: string | null;
  LATITUD: string | number | null;
  LONGITUD: string | number | null;
  OBJETO: string | null;
  MISION: string | null;
  VISION: string | null;
  FACEBOOK: string | null;
  INSTAGRAM: string | null;
  TIKTOK: string | null;
  LINKEDIN: string | null;
  CARRITO: string | number | null;
  TIPO_CAMBIO: number | null;
  LOGO_CUADRADO: string | null;
  LOGO_LARGO: string | null;
  BANER_INICIO: string | null;
  ICONO: string | null;
  TITULO_CIERRE: string | null;
  MENSAJE_CIERRE: string | null;
  TITULO_INICIO: string | null;
  MENSAJE_INICIO: string | null;
  DOMINIO: string | null;
  SMTP_CORREO: string | null;
  CORREO_INSTITUCIONAL: string | null;
  // PWD_INSTITUCIONAL nunca se serializa (está en $hidden del modelo).
}


export type CampoImagenEmpresa =
  | 'LOGO_CUADRADO'
  | 'LOGO_LARGO'
  | 'BANER_INICIO'
  | 'ICONO';

export const CAMPOS_IMAGEN_EMPRESA: CampoImagenEmpresa[] = [
  'LOGO_CUADRADO',
  'LOGO_LARGO',
  'BANER_INICIO',
  'ICONO',
];

export interface ArchivoImagen {
  uri: string;
  name: string;
  type: string;
}


export type EmpresaFormData = Partial<
  Omit<Empresa, 'ID_EMPRESA' | CampoImagenEmpresa>
>;


export interface ActualizarEmpresaPayload {
  datos: EmpresaFormData;
  imagenes?: Partial<Record<CampoImagenEmpresa, ArchivoImagen>>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}