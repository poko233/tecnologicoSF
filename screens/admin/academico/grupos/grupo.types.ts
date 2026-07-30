export interface Horario {
  idHorario?: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
}

export interface Grupo {
  idGrupo: number;
  nombre: string;
  codigo: string;
  paralelo?: string;
  turno: string;
  idGestion: number; // ← cambia de "gestion: string"
  gestionNombre?: string; // ← nuevo campo (solo lectura desde backend)
  cupos: number;
  tipo?: string | null;
  estado: "activo" | "inactivo";
  horarios: Horario[];
  creadoEn?: string;
  actualizadoEn?: string;
}
