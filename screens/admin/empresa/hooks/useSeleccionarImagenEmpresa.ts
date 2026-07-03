import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import {
    ArchivoImagen,
    CAMPOS_IMAGEN_EMPRESA,
    CampoImagenEmpresa,
} from '../types/empresa.types';

type ImagenesSeleccionadas = Partial<Record<CampoImagenEmpresa, ArchivoImagen>>;

interface UseSeleccionarImagenEmpresaResult {
  imagenes: ImagenesSeleccionadas;
  seleccionarImagen: (campo: CampoImagenEmpresa) => Promise<void>;
  quitarImagen: (campo: CampoImagenEmpresa) => void;
  limpiarImagenes: () => void;
}

/**
 * Relación de aspecto recomendada por campo (solo afecta el recorte
 * sugerido en el picker; el backend acepta cualquier imagen válida).
 */
const ASPECTO_POR_CAMPO: Record<CampoImagenEmpresa, [number, number]> = {
  LOGO_CUADRADO: [1, 1],
  LOGO_LARGO: [4, 1],
  BANER_INICIO: [16, 9],
  ICONO: [1, 1],
};

/**
 * Maneja la selección de imágenes (LOGO_CUADRADO, LOGO_LARGO,
 * BANER_INICIO, ICONO) desde la galería del dispositivo, generando
 * el objeto ArchivoImagen listo para enviar en el FormData.
 */
export function useSeleccionarImagenEmpresa(): UseSeleccionarImagenEmpresaResult {
  const [imagenes, setImagenes] = useState<ImagenesSeleccionadas>({});

  const seleccionarImagen = useCallback(async (campo: CampoImagenEmpresa) => {
    if (!CAMPOS_IMAGEN_EMPRESA.includes(campo)) {
      return;
    }

    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert(
        'Permiso requerido',
        'Se necesita acceso a la galería para seleccionar una imagen.'
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: ASPECTO_POR_CAMPO[campo],
      quality: 0.85,
    });

    if (resultado.canceled || resultado.assets.length === 0) {
      return;
    }

    const asset = resultado.assets[0];
    const nombreArchivo = asset.fileName ?? obtenerNombrePorDefecto(campo, asset.uri);
    const tipoMime = asset.mimeType ?? inferirMimeType(nombreArchivo);

    const archivo: ArchivoImagen = {
      uri: asset.uri,
      name: nombreArchivo,
      type: tipoMime,
    };

    setImagenes((previas) => ({ ...previas, [campo]: archivo }));
  }, []);

  const quitarImagen = useCallback((campo: CampoImagenEmpresa) => {
    setImagenes((previas) => {
      const copia = { ...previas };
      delete copia[campo];
      return copia;
    });
  }, []);

  const limpiarImagenes = useCallback(() => {
    setImagenes({});
  }, []);

  return { imagenes, seleccionarImagen, quitarImagen, limpiarImagenes };
}

function obtenerNombrePorDefecto(campo: CampoImagenEmpresa, uri: string): string {
  const extension = uri.split('.').pop() ?? 'jpg';
  return `${campo.toLowerCase()}.${extension}`;
}

function inferirMimeType(nombreArchivo: string): string {
  const extension = nombreArchivo.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}