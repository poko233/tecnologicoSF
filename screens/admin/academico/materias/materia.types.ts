export interface Materia {
  idMateria: number
  nombreMateria: string
  codigo: string
  semestre: number
  estado: 'activo' | 'inactivo'
  idPrerequisito?: number
  prerequisito?: { idMateria: number; nombreMateria: string }
  carreras?: { idCarrera: number; nombreCarrera: string }[]
  fecha_inicio?: string
  fecha_fin?: string
}
