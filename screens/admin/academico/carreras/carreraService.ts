import { httpClient } from '@http'
import { Carrera } from './carrera.types'

export const carreraService = {
  getAll: async (): Promise<Carrera[]> => {
    const res = await httpClient.getAuth<{ data: Carrera[] }>('/api/carreras')
    return res.data ?? (res as any)
  },

  create: async (data: Partial<Carrera>): Promise<Carrera> => {
    const { costo, area, ...body } = data as any
    const res = await httpClient.postAuth<{ data: Carrera }>('/api/carreras', body)
    return res.data ?? (res as any)
  },

  update: async (id: number, data: Partial<Carrera>): Promise<Carrera> => {
    const { costo, area, ...body } = data as any
    const res = await httpClient.putAuth<{ data: Carrera }>(`/api/carreras/${id}`, body)
    return res.data ?? (res as any)
  },

  delete: async (id: number): Promise<void> => {
    await httpClient.deleteAuth(`/api/carreras/${id}`)
  },
}
