// screens/convalidacion/services/convalidacionService.ts
import { httpClient } from '@http';
import type {
  Carrera,
  Cuota,
  DetalleConvalidacion,
  Documento,
  Gestion,
  MateriaDestino,
  SolicitudConvalidacion
} from '../types';

export const convalidacionService = {
  // Paso 1 - Datos del estudiante
  getCarreras: () => httpClient.getAuth<{ data: Carrera[] }>('/api/carreras'),

  getGestiones: () => httpClient.getAuth<{ data: Gestion[] }>('/api/gestiones'),
  resolverSolicitud: (id: number, data: any) =>
    httpClient.postAuth<{ success: boolean }>(
      `/api/convalidacion/solicitudes/${id}/resolver`,
      { ...data, _method: 'PATCH' }
    ),
  crearSolicitud: (data: any) =>
    httpClient.postAuth<{ success: boolean; data: SolicitudConvalidacion }>(
      '/api/convalidacion/solicitudes',
      data
    ),

  // Paso 2 - Documentos
  getDocumentos: (id: number) =>
    httpClient.getAuth<{ data: Documento[] }>(
      `/api/convalidacion/solicitudes/${id}/documentos`
    ),

  subirDocumento: (id: number, formData: FormData) =>
    httpClient.postFormData<{ success: boolean; data: Documento }>(
      `/api/convalidacion/solicitudes/${id}/documentos`,
      formData
    ),

  eliminarDocumento: (id: number, docId: number) =>
    httpClient.deleteAuth<{ success: boolean }>(
      `/api/convalidacion/solicitudes/${id}/documentos/${docId}`
    ),

  // Paso 3 - Materias a convalidar
  getMateriasCarrera: (idCarrera: number) =>
    httpClient.getAuth<{ materias: MateriaDestino[] }>(
      `/api/carreras/${idCarrera}/materias`
    ),

  getDetalles: (id: number) =>
    httpClient.getAuth<{ data: DetalleConvalidacion[] }>(
      `/api/convalidacion/solicitudes/${id}/detalles`
    ),

  agregarDetalle: (id: number, data: any) =>
    httpClient.postAuth<{ success: boolean; data: DetalleConvalidacion }>(
      `/api/convalidacion/solicitudes/${id}/detalles`,
      data
    ),

  eliminarDetalle: (id: number, detalleId: number) =>
    httpClient.deleteAuth<{ success: boolean }>(
      `/api/convalidacion/solicitudes/${id}/detalles/${detalleId}`
    ),

  // Paso 4 - Pago
  getCuota: (id: number) =>
    httpClient.getAuth<{ data: Cuota }>(
      `/api/convalidacion/solicitudes/${id}/cuota`
    ),

  crearCuota: (id: number, data: any) =>
    httpClient.postAuth<{ success: boolean; data: Cuota }>(
      `/api/convalidacion/solicitudes/${id}/cuota`,
      data
    ),

  registrarPago: (id: number, data: any) =>
    httpClient.postAuth<{ success: boolean }>(
      `/api/convalidacion/solicitudes/${id}/pago`,
      data
    ),

  // Paso 5 - Resolución académica
  getSolicitud: (id: number) =>
    httpClient.getAuth<{ success: boolean; data: any }>(
      `/api/convalidacion/solicitudes/${id}`
    ),
  
};
