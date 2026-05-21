export interface Carrera {
  idCarrera: number
  nombreCarrera: string
  codigo: string
  tipo?: string
  regimen?: 'Anual' | 'Semestral' | 'Mensual' | 'Otro'
  duracion?: number
  duracion_meses?: number
  cargaHoraria: string
  costo: number
  costo_matricula?: number
  denominacionTitutloProfesional: string
  cuota_mensual?: number
  cuotas_por_anio?: number
  estadoCarrera: 'activo' | 'inactivo'
  idArea: number
  area?: { idArea: number; nombre: string }
}
