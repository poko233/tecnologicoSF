// screens/convalidacion/hooks/usePaso1.ts
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { convalidacionService } from '../services/convalidacionService';
import type { Carrera, Gestion, Paso1FormData } from '../types';

export function usePaso1() {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState<Paso1FormData>({
    ci: '',
    expedido: 'CBBA',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    genero: 'MASCULINO',
    fecha_nac: null,
    email: '',
    telefono: '',
    celular: '',
    direccion: '',
    matricula: '',
    idCarreraDestino: null,
    idGestion: null,
    tipo: 'externa',
    institucion_origen: '',
    carrera_origen_nombre: '',
    motivo: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [carrerasRes, gestionesRes] = await Promise.all([
        convalidacionService.getCarreras(),
        convalidacionService.getGestiones(),
      ]);
      console.log('Carreras cargadas:', carrerasRes.data);
      console.log('Gestiones cargadas:', gestionesRes.data);
      setCarreras(carrerasRes.data || []);
      setGestiones(gestionesRes.data || []);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'No se pudieron cargar los datos',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const updateField = <K extends keyof Paso1FormData>(
    field: K,
    value: Paso1FormData[K]
  ) => {
    console.log(`Actualizando campo ${field}:`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.ci.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'El CI es obligatorio',
      });
      return false;
    }
    if (!formData.nombres.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'Los nombres son obligatorios',
      });
      return false;
    }
    if (!formData.apellidoPaterno.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'El apellido paterno es obligatorio',
      });
      return false;
    }
    if (!formData.fecha_nac) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'La fecha de nacimiento es obligatoria',
      });
      return false;
    }
    if (!formData.matricula.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'La matrícula es obligatoria',
      });
      return false;
    }
    if (!formData.idCarreraDestino) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'Debe seleccionar una carrera destino',
      });
      return false;
    }
    if (!formData.idGestion) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'Debe seleccionar una gestión',
      });
      return false;
    }
    if (!formData.institucion_origen.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'La institución de origen es obligatoria',
      });
      return false;
    }
    if (!formData.carrera_origen_nombre.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'La carrera de origen es obligatoria',
      });
      return false;
    }
    return true;
  };

  const submitForm = async () => {
    if (!validateForm()) return null;

    try {
      setLoading(true);
      const payload = {
        ...formData,
        fecha_nac: formData.fecha_nac
          ? formData.fecha_nac.toISOString().split('T')[0]
          : '',
      };
      const response = await convalidacionService.crearSolicitud(payload);
      Toast.show({
        type: 'success',
        text1: 'Solicitud creada',
        text2: 'Los datos se guardaron correctamente',
      });
      return response.data;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'No se pudo crear la solicitud',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    updateField,
    carreras,
    gestiones,
    loading,
    loadingData,
    submitForm,
  };
}
