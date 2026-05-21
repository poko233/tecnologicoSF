// area.types.ts
export interface Area {
  idArea: number
  nombre: string
  descripccion?: string
  estado: 'activo' | 'inactivo'
}
