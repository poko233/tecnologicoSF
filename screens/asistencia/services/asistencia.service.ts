// screens/asistencia/services/asistencia.service.ts
import { httpClient } from '@/http/httpClient';
import { ActualizarFechasMateriaPayload, ActualizarFechasMateriaResponse, CambiarEstadoSesionPayload, GrupoAsignado, GrupoDataResponse, MessageResponse, SesionResponse, TomarSesionPayload } from '../types/asistencia.types';

export const getGruposAsignados = (signal?: AbortSignal) => httpClient.getAuth<{ data: GrupoAsignado[] }>('/api/docente/grupos-asignados', 'Error al cargar grupos', signal);
export const getGrupoEstudiantes = (id: number, signal?: AbortSignal) => httpClient.getAuth<GrupoDataResponse>(`/api/docente/grupos-asignados/${id}/estudiantes`, 'Error al cargar estudiantes', signal);
export const tomarSesion = (idSesion: number, payload: TomarSesionPayload) => httpClient.postAuth<SesionResponse>(`/api/docente/sesiones/${idSesion}/asistencia`, payload, 'Error al registrar asistencia');
export const cambiarEstadoSesion = (idSesion: number, payload: CambiarEstadoSesionPayload) => httpClient.patchAuth<SesionResponse>(`/api/docente/sesiones/${idSesion}/estado`, payload, 'Error al cambiar estado de la sesión');
export const reabrirSesion = (idSesion: number) => httpClient.postAuth<SesionResponse>(`/api/docente/sesiones/${idSesion}/reabrir`, {}, 'Error al reabrir sesión');
export const limpiarSesion = (idSesion: number) => httpClient.deleteAuth<MessageResponse>(`/api/docente/sesiones/${idSesion}/limpiar`, 'Error al limpiar sesión');
export const actualizarFechasMateria = (idMateria: number, payload: ActualizarFechasMateriaPayload) => httpClient.patchAuth<ActualizarFechasMateriaResponse>(`/api/materias/${idMateria}/fechas`, payload, 'Error al actualizar fechas de la materia');

export const descargarReporteAsistencia = async (idGrupoMateriaDocente: number, formato: 'xlsx' | 'pdf'): Promise<{ blob: Blob; filename: string }> => {
  const endpoint = formato === 'pdf' ? 'pdf' : 'excel';
  const mime = formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const res = await (httpClient as any)._rawFetch(`/api/docente/grupos-asignados/${idGrupoMateriaDocente}/reporte/${endpoint}`, mime);
  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]+)/i);
  const ext = formato === 'pdf' ? 'pdf' : 'xlsx';
  const filename = match?.[1]?.trim() ?? `asistencia_grupo${idGrupoMateriaDocente}.${ext}`;
  return { blob, filename };
};
