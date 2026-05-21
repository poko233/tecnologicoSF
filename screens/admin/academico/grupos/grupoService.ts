import { httpClient } from '@http'
import { Grupo } from './grupo.types'

export const grupoService = {
  getAll: async (): Promise<Grupo[]> => {
    const res = await httpClient.getAuth<{ data: Grupo[] }>('/api/grupos')
    return res.data ?? (res as any)
  },
  create: async (data: Partial<Grupo>): Promise<Grupo> => {
    const res = await httpClient.postAuth<{ data: Grupo }>('/api/grupos', data)
    return res.data ?? (res as any)
  },
  update: async (id: number, data: Partial<Grupo>): Promise<Grupo> => {
    const res = await httpClient.putAuth<{ data: Grupo }>(`/api/grupos/${id}`, data)
    return res.data ?? (res as any)
  },
  delete: async (id: number): Promise<void> => {
    await httpClient.deleteAuth(`/grupos/${id}`)
  },
}
