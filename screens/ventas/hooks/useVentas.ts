import { useState, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { ventaService } from '../services/venta.service';
import { InventarioVenta, VentaFormData, CarritoItem } from '../types/venta.types';

export const useVentas = () => {
  const [ventas, setVentas] = useState<InventarioVenta[]>([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const cargarVentas = useCallback(async (params?: Parameters<typeof ventaService.getAll>[0]) => {
    setLoading(true);
    try {
      const response = await ventaService.getAll(params);
      setVentas(response.data);
      return response;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'No se pudieron cargar las ventas',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const crearVenta = useCallback(async (data: VentaFormData): Promise<InventarioVenta | null> => {
    setGuardando(true);
    try {
      const venta = await ventaService.create(data);
      Toast.show({
        type: 'success',
        text1: 'Venta registrada',
        text2: `Venta #${venta.idVenta} creada exitosamente`,
      });
      return venta;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al crear venta',
        text2: error?.message || 'No se pudo registrar la venta',
      });
      return null;
    } finally {
      setGuardando(false);
    }
  }, []);

  const anularVenta = useCallback(async (idVenta: number): Promise<boolean> => {
    setProcesando(true);
    try {
      await ventaService.cancel(idVenta);
      Toast.show({
        type: 'success',
        text1: 'Venta anulada',
        text2: 'La venta fue anulada correctamente',
      });
      return true;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al anular',
        text2: error?.message || 'No se pudo anular la venta',
      });
      return false;
    } finally {
      setProcesando(false);
    }
  }, []);

  return {
    ventas,
    loading,
    guardando,
    procesando,
    cargarVentas,
    crearVenta,
    anularVenta,
  };
};
