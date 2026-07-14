// screens/convalidacion/hooks/usePaso4Pago.ts
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../../contexts/AuthContext';
import { convalidacionService } from '../services/convalidacionService';
import type { Cuota } from '../types';

export function usePaso4Pago(solicitudId: number | null) {
  const { user } = useAuth();
  const [cuota, setCuota] = useState<Cuota | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    metodo: 'TRANSFERENCIA' as 'TRANSFERENCIA' | 'EFECTIVO' | 'QR',
    comprobante: '',
    fecha_pago: new Date(),
    arancel_por_materia: 100,
    descuento: 0,
  });

  useEffect(() => {
    if (solicitudId) {
      loadCuota();
    }
  }, [solicitudId]);

  const loadCuota = async () => {
    if (!solicitudId) return;

    try {
      setLoadingData(true);
      console.log('Cargando cuota para solicitud:', solicitudId);
      const response = await convalidacionService.getCuota(solicitudId);
      console.log('Cuota cargada:', response.data);
      setCuota(response.data);

      // Si hay cuota, actualizar formData con los valores
      if (response.data) {
        setFormData(prev => ({
          ...prev,
          arancel_por_materia: response.data.arancel_por_materia || 100,
          descuento: response.data.descuento || 0,
        }));
      }
    } catch (error: any) {
      console.error('Error cargando cuota:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'No se pudo cargar la información de pago',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const registrarPago = async () => {
  if (!solicitudId || !user) return false;

  try {
    setLoading(true);

    // 1. Crear cuota si no existe
    if (!cuota || !cuota.id) {
      await convalidacionService.crearCuota(solicitudId, {
        arancel_por_materia: formData.arancel_por_materia,
        descuento: formData.descuento,
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0],
      });
    }

    // 2. Registrar el pago
    await convalidacionService.registrarPago(solicitudId, {
      metodo: formData.metodo,
      comprobante: formData.comprobante,
      fecha_pago: formData.fecha_pago.toISOString().split('T')[0],
    });

    // 3. ← NUEVO: Resolver la solicitud automáticamente
    // Esto crea CarreraUsuario, NotaFinal e HistorialAcademico
    await convalidacionService.resolverSolicitud(solicitudId, {
      estado: 'aprobada',
      observacion_resolucion: 'Solicitud procesada con pago registrado',
      fecha_resolucion: new Date().toISOString().split('T')[0],
    });

    Toast.show({
      type: 'success',
      text1: 'Pago registrado',
      text2: 'El pago se registró correctamente',
    });

    return true;
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: error?.message || 'No se pudo registrar el pago',
    });
    return false;
  } finally {
    setLoading(false);
  }
};

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    cuota,
    formData,
    updateField,
    loading,
    loadingData,
    registrarPago,
  };
}
