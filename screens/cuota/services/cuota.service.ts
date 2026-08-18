import { httpClient } from '@http';
import {
  Estudiante,
  PaginatedResponse,
  CarreraInscrita,
  Cuota,
  EstadoCuentaResponse,
  RegistrarPagoRequest,
  PagoResponse,
  HistorialAbonosResponse,
} from '../types/cuota.types';

const BASE_URL = '/api';

export const cuotaService = {
  /**
   * Buscar estudiantes por CI, nombre o matrícula
   */
  async searchStudents(
    search: string = '',
    perPage: number = 15
  ): Promise<PaginatedResponse<Estudiante>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('per_page', perPage.toString());

    return httpClient.getAuth<PaginatedResponse<Estudiante>>(
      `${BASE_URL}/cuota/search?${params.toString()}`
    );
  },

  /**
   * Obtener carreras de un estudiante
   */
  async getCarrerasEstudiante(estudianteId: number): Promise<CarreraInscrita[]> {
    return httpClient.getAuth<CarreraInscrita[]>(
      `${BASE_URL}/estudiantes/${estudianteId}/carreras`
    );
  },

  /**
   * Obtener carreras de un estudiante (alias para compatibilidad)
   */
  async getCarrerasByStudent(usuarioId: number): Promise<CarreraInscrita[]> {
    return httpClient.getAuth<CarreraInscrita[]>(
      `${BASE_URL}/estudiantes/${usuarioId}/carreras`
    );
  },

  /**
   * Obtener cuotas de un estudiante para una carrera
   */
  async getCuotasPorCarrera(
    estudianteId: number,
    carreraId: number
  ): Promise<Cuota[]> {
    return httpClient.getAuth<Cuota[]>(
      `${BASE_URL}/estudiantes/${estudianteId}/carreras/${carreraId}/cuotas`
    );
  },

  /**
   * Obtener cuotas de un estudiante para una carrera (alias para compatibilidad)
   */
  async getCuotasByCarrera(
    usuarioId: number,
    carreraId: number
  ): Promise<Cuota[]> {
    return httpClient.getAuth<Cuota[]>(
      `${BASE_URL}/estudiantes/${usuarioId}/carreras/${carreraId}/cuotas`
    );
  },

  /**
   * Obtener estado de cuenta completo con historial de abonos
   */
  async getEstadoCuenta(
    estudianteId: number,
    carreraId: number
  ): Promise<EstadoCuentaResponse> {
    return httpClient.getAuth<EstadoCuentaResponse>(
      `${BASE_URL}/estudiantes/${estudianteId}/carreras/${carreraId}/estado-cuenta`
    );
  },

  /**
   * Registrar pago parcial o total
   */
  async registrarPago(data: RegistrarPagoRequest): Promise<PagoResponse> {
    return httpClient.postAuth<PagoResponse>(`${BASE_URL}/pagos`, data);
  },

  /**
   * Obtener historial de abonos de una cuota
   */
  async getHistorialAbonos(cuotaId: number): Promise<HistorialAbonosResponse> {
    return httpClient.getAuth<HistorialAbonosResponse>(
      `${BASE_URL}/cuotas/${cuotaId}/abonos`
    );
  },
};
