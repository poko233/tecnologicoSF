// screens/convalidacion/hooks/usePaso2Documentos.ts
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { convalidacionService } from '../services/convalidacionService';
import type { Documento, DocumentoRequerido } from '../types';

export const DOCUMENTOS_REQUERIDOS: DocumentoRequerido[] = [
  {
    tipo: 'certificado_notas',
    nombre: 'Certificado de notas',
    descripcion:
      'Notas originales de la institución de origen, con sello y firma del secretario académico.',
    obligatorio: true,
    accept: 'pdf,jpg,jpeg,png',
    icono: 'document-text',
  },
  {
    tipo: 'constancia_institucional',
    nombre: 'Constancia institucional',
    descripcion:
      'Documento que acredita la institución de origen: resolución ministerial o código SIE.',
    obligatorio: true,
    accept: 'pdf,jpg,jpeg,png',
    icono: 'business',
  },
  {
    tipo: 'programa_analitico',
    nombre: 'Programa analítico',
    descripcion:
      'Sílabo o programa de cada materia a convalidar, con contenido mínimo y carga horaria.',
    obligatorio: true,
    accept: 'pdf,jpg,jpeg,png',
    icono: 'clipboard',
  },
  {
    tipo: 'documento_identidad',
    nombre: 'Documento de identidad',
    descripcion:
      'Fotocopia del carnet de identidad vigente del estudiante (anverso y reverso).',
    obligatorio: false,
    accept: 'jpg,jpeg,png',
    icono: 'card',
  },
];

export function usePaso2Documentos(solicitudId: number | null) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (solicitudId) {
      loadDocumentos();
    }
  }, [solicitudId]);

  const loadDocumentos = async () => {
    if (!solicitudId) return;
    try {
      setLoading(true);
      const response = await convalidacionService.getDocumentos(solicitudId);
      setDocumentos(response.data || []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'No se pudieron cargar los documentos',
      });
    } finally {
      setLoading(false);
    }
  };

  const subirDocumento = async (tipo: string) => {
    if (!solicitudId) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setUploading(true);

      const formData = new FormData();
      formData.append('tipo', tipo);

      // En web, file.file existe y es un File real
      // En móvil, necesitamos crear el objeto con uri, name, type
      if (file.file) {
        // Web: usar el File directamente
        formData.append('archivo', file.file, file.name);
      } else {
        // Móvil: usar el formato { uri, name, type }
        formData.append('archivo', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        } as any);
      }


      const response = await convalidacionService.subirDocumento(
        solicitudId,
        formData
      );

      setDocumentos((prev) => [...prev, response.data]);

      Toast.show({
        type: 'success',
        text1: 'Documento subido',
        text2: 'El archivo se cargó correctamente',
      });
    } catch (error: any) {
      console.error('Error subiendo documento:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'No se pudo subir el documento',
      });
    } finally {
      setUploading(false);
    }
  };

  const eliminarDocumento = async (docId: number) => {
    if (!solicitudId) return;

    try {
      await convalidacionService.eliminarDocumento(solicitudId, docId);
      setDocumentos((prev) => prev.filter((doc) => doc.id !== docId));
      Toast.show({
        type: 'success',
        text1: 'Documento eliminado',
        text2: 'El archivo se eliminó correctamente',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'No se pudo eliminar el documento',
      });
    }
  };

  const getDocumentoByTipo = (tipo: string): Documento | undefined => {
    return documentos.find((doc) => doc.tipo === tipo);
  };

  const validarObligatorios = (): boolean => {
    const obligatorios = DOCUMENTOS_REQUERIDOS.filter((d) => d.obligatorio);
    const faltantes = obligatorios.filter(
      (d) => !documentos.some((doc) => doc.tipo === d.tipo)
    );
    return faltantes.length === 0;
  };

  const cantidadFaltantes = (): number => {
    const obligatorios = DOCUMENTOS_REQUERIDOS.filter((d) => d.obligatorio);
    return obligatorios.filter(
      (d) => !documentos.some((doc) => doc.tipo === d.tipo)
    ).length;
  };

  return {
    documentos,
    loading,
    uploading,
    subirDocumento,
    eliminarDocumento,
    getDocumentoByTipo,
    validarObligatorios,
    cantidadFaltantes,
    refetch: loadDocumentos,
  };
}
