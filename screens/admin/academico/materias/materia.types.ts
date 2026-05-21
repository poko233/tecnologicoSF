// materia.types.ts
export interface Materia {
  idMateria: number
  nombreMateria: string
  codigo: string
  semestre: number
  estado: 'activo' | 'inactivo'
  idPrerequisito?: number
  prerequisito?: { idMateria: number; nombreMateria: string }
}
