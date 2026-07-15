// screens/convalidacion/hooks/usePaso3Materias.ts
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { convalidacionService } from '../services/convalidacionService';
import type { DetalleConvalidacion, MateriaDestino } from '../types';

export function usePaso3Materias(
  solicitudId: number | null,
  idCarreraDestino: number | null
) {
  const [materias, setMaterias] = useState<MateriaDestino[]>([]);
  const [detalles, setDetalles] = useState<DetalleConvalidacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (solicitudId && idCarreraDestino) {
      loadData();
    }
  }, [solicitudId, idCarreraDestino]);

  const loadData = async () => {
    if (!solicitudId || !idCarreraDestino) {
      return;
    }

    try {
      setLoadingData(true);
      const [materiasRes, detallesRes] = await Promise.all([
        convalidacionService.getMateriasCarrera(idCarreraDestino),
        convalidacionService.getDetalles(solicitudId),
      ]);
      setMaterias((materiasRes as any).materias || (materiasRes as any).data || []);
      setDetalles((detallesRes as any).data || (detallesRes as any).detalles || []);
    } catch (error: any) {
      console.error('Error cargando datos del paso 3:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'No se pudieron cargar los datos',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const agregarMateria = async (data: {
    materia_origen_nombre: string;
    materia_origen_institucion: string;
    nota_origen: number;
    idMateriaDestino: number;
  }) => {
    if (!solicitudId) return false;

    try {
      setLoading(true);
      const response = await convalidacionService.agregarDetalle(
        solicitudId,
        data
      );
      setDetalles((prev) => [...prev, response.data]);
      Toast.show({
        type: 'success',
        text1: 'Materia agregada',
        text2: 'La materia se agregó correctamente',
      });
      return true;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'No se pudo agregar la materia',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const eliminarMateria = async (detalleId: number) => {
    if (!solicitudId) return;

    try {
      await convalidacionService.eliminarDetalle(solicitudId, detalleId);
      setDetalles((prev) => prev.filter((d) => d.id !== detalleId));
      Toast.show({
        type: 'success',
        text1: 'Materia eliminada',
        text2: 'La materia se eliminó correctamente',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'No se pudo eliminar la materia',
      });
    }
  };

  return {
    materias,
    detalles,
    loading,
    loadingData,
    agregarMateria,
    eliminarMateria,
    refetch: loadData,
  };
}
