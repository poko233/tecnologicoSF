export interface Horario {
  idHorario?: number
  dia: string
  horaInicio: string
  horaFin: string
}

export interface Grupo {
  idGrupo: number
  nombre: string
  codigo: string
  paralelo?: string
  turno: string
  gestion: string
  cupos: number 
  tipo?: string | null
  estado: 'activo' | 'inactivo'
  horarios: Horario[]
}
