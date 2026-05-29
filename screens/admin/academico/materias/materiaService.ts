import { httpClient } from '@http'
import { Materia } from './materia.types'

export const materiaService = {
  getAll: async (): Promise<Materia[]> => {
    const res = await httpClient.getAuth<{ data: Materia[] }>('/api/materias')
    return res.data ?? (res as any)
  },

  create: async (data: Partial<Materia> & { idCarrera?: number }): Promise<Materia> => {
    const res = await httpClient.postAuth<{ data: Materia }>('/api/materias', data)
    return res.data ?? (res as any)
  },

  update: async (id: number, data: Partial<Materia> & { idCarrera?: number }): Promise<Materia> => {
    const res = await httpClient.putAuth<{ data: Materia }>(`/api/materias/${id}`, data)
    return res.data ?? (res as any)
  },

  delete: async (id: number): Promise<void> => {
    await httpClient.deleteAuth(`/api/materias/${id}`)
  },
}
