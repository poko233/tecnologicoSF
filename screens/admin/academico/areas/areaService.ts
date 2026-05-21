import { httpClient } from '@http'
import { Area } from './area.types'

export const areaService = {
  getAll: async (): Promise<Area[]> => {
    const res = await httpClient.getAuth<{ data: Area[] }>('/api/areas')
    return res.data ?? (res as any)
  },

  create: async (data: Partial<Area>): Promise<Area> => {
    const res = await httpClient.postAuth<{ data: Area }>('/api/areas', data)
    return res.data ?? (res as any)
  },

  update: async (id: number, data: Partial<Area>): Promise<Area> => {
    const res = await httpClient.putAuth<{ data: Area }>(`/api/areas/${id}`, data)
    return res.data ?? (res as any)
  },

  delete: async (id: number): Promise<void> => {
    await httpClient.deleteAuth(`/api/areas/${id}`)
  },
}
