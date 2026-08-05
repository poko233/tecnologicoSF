import { httpClient } from '@http';
import { InventarioVenta, VentaFormData } from '../types/venta.types';

const BASE_URL = '/api/inventario/ventas';

export const ventaService = {
  /**
   * Obtiene todas las ventas con filtros opcionales
   */
  async getAll(params?: {
    search?: string;
    estado?: string;
    metodo_pago?: string;
    fecha_from?: string;
    fecha_to?: string;
    total_min?: number;
    total_max?: number;
    arqueo_id?: number;
    page?: number;
  }): Promise<{
    data: InventarioVenta[];
    current_page: number;
    last_page: number;
    total: number;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append('search', params.search);
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.metodo_pago) queryParams.append('metodo_pago', params.metodo_pago);
    if (params?.fecha_from) queryParams.append('fecha_from', params.fecha_from);
    if (params?.fecha_to) queryParams.append('fecha_to', params.fecha_to);
    if (params?.total_min !== undefined) queryParams.append('total_min', params.total_min.toString());
    if (params?.total_max !== undefined) queryParams.append('total_max', params.total_max.toString());
    if (params?.arqueo_id) queryParams.append('arqueo_id', params.arqueo_id.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const url = queryParams.toString()
      ? `${BASE_URL}?${queryParams.toString()}`
      : BASE_URL;

    const response = await httpClient.getAuth<{
      data: {
        data: InventarioVenta[];
        current_page: number;
        last_page: number;
        total: number;
      };
      message: string;
    }>(url);

    return response.data;
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
   * Anula una venta
   */
  async cancel(idVenta: number): Promise<InventarioVenta> {
    const response = await httpClient.postAuth<{
      data: InventarioVenta;
      message: string;
    }>(`${BASE_URL}/${idVenta}/cancel`, {});

    return response.data;
  },
};
