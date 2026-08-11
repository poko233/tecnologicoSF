import { httpClient } from '@http';
import {
  InventarioVenta,
  VentaFormData,
  FiltrosVenta,
  AnularVentaRequest,
  AnularVentaResponse,
  VentasListResponse
} from '../types/venta.types';

const BASE_URL = '/api/inventario/ventas';

export const ventaService = {
  /**
   * Obtiene todas las ventas con filtros opcionales
   */
  async getAll(params?: {
    search?: string;
    estado?: string;
    metodo_pago?: string;
    mes?: string; // Formato YYYY-MM
    fecha_inicio?: string; // Formato YYYY-MM-DD
    fecha_fin?: string; // Formato YYYY-MM-DD
    arqueo_id?: number;
    page?: number;
    per_page?: number;
  }): Promise<{
    data: InventarioVenta[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append('search', params.search);
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.metodo_pago) queryParams.append('metodo_pago', params.metodo_pago);
    if (params?.mes) queryParams.append('mes', params.mes);
    if (params?.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);
    if (params?.arqueo_id) queryParams.append('arqueo_id', params.arqueo_id.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const url = queryParams.toString()
      ? `${BASE_URL}?${queryParams.toString()}`
      : BASE_URL;

    const response = await httpClient.getAuth<{
      data: InventarioVenta[];
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number | null;
      to: number | null;
      message: string;
    }>(url);

    return {
      data: response.data,
      current_page: response.current_page,
      last_page: response.last_page,
      per_page: response.per_page,
      total: response.total,
      from: response.from,
      to: response.to,
    };
  },

  /**
   * Obtiene el detalle de una venta específica
   */
  async getById(idVenta: number): Promise<InventarioVenta> {
    const response = await httpClient.getAuth<{
      data: InventarioVenta;
      message: string;
    }>(`${BASE_URL}/${idVenta}`);

    return response.data;
  },

  /**
   * Crea una nueva venta
   */
  async create(data: VentaFormData): Promise<InventarioVenta> {
    const response = await httpClient.postAuth<{
      data: InventarioVenta;
      message: string;
    }>(BASE_URL, data);

    return response.data;
  },

  /**
   * Anula una venta con motivo y observación
   */
  async cancel(idVenta: number, data: AnularVentaRequest): Promise<AnularVentaResponse> {
    const response = await httpClient.postAuth<AnularVentaResponse>(
      `${BASE_URL}/${idVenta}/cancel`,
      data
    );

    return response;
  },

  /**
   * Obtiene ventas del mes actual o específico
   * @param mes - Mes (1-12)
   * @param anio - Año (YYYY)
   * @param page - Página (default: 1)
   */
  async getVentasDelMes(mes: number, anio: number, page: number = 1) {
    // Formatear mes en YYYY-MM (el backend lo convierte a rango automáticamente)
    const mesFormateado = `${anio}-${mes.toString().padStart(2, '0')}`;

    return this.getAll({ mes: mesFormateado, page });
  },

  /**
   * Obtiene ventas con filtros completos
   */
  async getVentasConFiltros(filtros: FiltrosVenta, page: number = 1, perPage: number = 25) {
    const params: any = { page, per_page: perPage };

    if (filtros.search) params.search = filtros.search;
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.metodo_pago) params.metodo_pago = filtros.metodo_pago;
    if (filtros.arqueo_id) params.arqueo_id = filtros.arqueo_id;

    // Prioridad: rango de fechas > mes > default (mes actual en backend)
    if (filtros.fecha_from && filtros.fecha_to) {
      // Rango de fechas personalizado
      params.fecha_inicio = filtros.fecha_from;
      params.fecha_fin = filtros.fecha_to;
    } else if (filtros.mes && filtros.anio) {
      // Mes específico (formato YYYY-MM)
      params.mes = `${filtros.anio}-${filtros.mes.toString().padStart(2, '0')}`;
    }
    // Si no hay ninguno, el backend usa mes actual por defecto

    return this.getAll(params);
  },
};
