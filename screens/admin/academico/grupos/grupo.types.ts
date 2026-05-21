export interface Grupo {
  idGrupo: number
  nombre: string
  codigo: string
  paralelo?: string
  turno: string
  hora_inicio: string
  hora_fin: string
  gestion: string
  cupos: number
  tipo?: string
  estado: 'activo' | 'inactivo'
}
