export type Genero = "MASCULINO" | "FEMENINO";

export type EstadoUsuario = "ACTIVO" | "INACTIVO";
export type EstadoDocente = "activo" | "inactivo";

export type Expedido =
  | "LPZ"
  | "CBBA"
  | "OR"
  | "PT"
  | "TJ"
  | "SCZ"
  | "BN"
  | "PD"
  | "CH"
  | "QR"
  | "EXT";

export type RolUsuario = {
  id?: number;
  idRol?: number;
  rol: string;
  descripcion?: string | null;
};

export type UsuarioDocente = {
  id: number;
  usuario: string;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  genero: Genero;
  fecha_nac: string;
  email?: string | null;
  celular?: string | null;
  direccion?: string | null;
  expedido: Expedido;
  estado: EstadoUsuario;
  roles?: RolUsuario[];
};

export type UsuarioDisponibleDocente = {
  id: number;
  usuario: string;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  email?: string | null;
  celular?: string | null;
  estado: EstadoUsuario;
  roles?: RolUsuario[];
};

export type PaginacionUsuarios = {
  paginaActual: number;
  ultimaPagina: number;
  porPagina: number;
  total: number;
  desde: number;
  hasta: number;
};

export type Docente = {
  idDocente: number;
  profesion: string;
  abreviaturaProfesional?: string | null;
  fechaRegistro: string;
  estadoDocente: EstadoDocente;
  usuario?: UsuarioDocente;
};

export type DocenteForm = {
  usuario: string;
  ci: string;
  expedido: Expedido;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  genero: Genero;
  fecha_nac: string;
  email: string;
  celular: string;
  direccion: string;
  estado: EstadoUsuario;
  profesion: string;
  abreviaturaProfesional: string;
  estadoDocente: EstadoDocente;
};

export type AsignarUsuarioExistentePayload = {
  idUsuario: number;
  profesion: string;
  abreviaturaProfesional?: string | null;
};

export type DocentesResponse = {
  docentes: Docente[];
};

export type UsuariosDisponiblesResponse = {
  usuarios: UsuarioDisponibleDocente[];
  paginacion: PaginacionUsuarios;
};

export const EXPEDIDOS: { label: string; value: Expedido }[] = [
  { label: "La Paz", value: "LPZ" },
  { label: "Cochabamba", value: "CBBA" },
  { label: "Oruro", value: "OR" },
  { label: "Potosí", value: "PT" },
  { label: "Tarija", value: "TJ" },
  { label: "Santa Cruz", value: "SCZ" },
  { label: "Beni", value: "BN" },
  { label: "Pando", value: "PD" },
  { label: "Chuquisaca", value: "CH" },
  { label: "QR", value: "QR" },
  { label: "Exterior", value: "EXT" },
];

export const initialDocenteForm: DocenteForm = {
  usuario: "",
  ci: "",
  expedido: "CBBA",
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  genero: "MASCULINO",
  fecha_nac: "",
  email: "",
  celular: "",
  direccion: "",
  estado: "ACTIVO",
  profesion: "",
  abreviaturaProfesional: "",
  estadoDocente: "activo",
};
