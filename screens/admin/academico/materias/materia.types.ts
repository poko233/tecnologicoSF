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

// Type para crear/actualizar materia (carreras como IDs)
export interface MateriaInput {
  nombreMateria: string
  codigo: string
  semestre: number
  estado?: 'activo' | 'inactivo'
  idPrerequisito?: number
  carreras?: number[]  // Solo IDs al crear/editar
  fecha_inicio?: string
  fecha_fin?: string
}
