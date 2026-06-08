export type Rol = {
  id: number;
  rol: string;
  descripcion?: string | null;
};

export type NumeroReferencia = {
  idNumeroReferencia: number;
  parentesco: string | null;
  numeroReferencia: string | null;
  nombreContactoReferencia: string | null;
  idUsuario: number;
};

export type UsuarioRRHH = {
  id: number;
  usuario: string;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  genero: "MASCULINO" | "FEMENINO";
  fecha_nac: string | null;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  direccion: string | null;
  expedido: string | null;
  codigo_qr?: string | null;
  verificacion?: string | null;
  foto?: string | null;
  estado: "ACTIVO" | "INACTIVO";
  roles?: Rol[];
  numeroReferencias?: NumeroReferencia[];
  numero_referencias?: NumeroReferencia[];
  esEstudiante?: boolean;
};

export type UsuarioRRHHForm = {
  usuario: string;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  genero: "MASCULINO" | "FEMENINO";
  fecha_nac: string;
  email: string;
  telefono: string;
  celular: string;
  direccion: string;
  expedido: string;
  estado: "ACTIVO" | "INACTIVO";
};