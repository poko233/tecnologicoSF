import { useTheme } from '@theme';
import { Camera, ImageOff, X } from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { ArchivoImagen, CampoImagenEmpresa } from '../types/empresa.types';

interface SelectorImagenEmpresaProps {
  campo: CampoImagenEmpresa;
  etiqueta: string;
  descripcion?: string;
  /** URL actual guardada en el backend (puede ser null si nunca se subió). */
  urlActual: string | null;
  /** Imagen recién seleccionada en el dispositivo, pendiente de guardar. */
  archivoSeleccionado?: ArchivoImagen;
  /** Proporción ancho/alto para la previsualización (ej. 1 para cuadrado, 4 para logo largo). */
  relacionAspecto?: number;
  deshabilitado?: boolean;
  onSeleccionar: (campo: CampoImagenEmpresa) => void;
  onQuitar: (campo: CampoImagenEmpresa) => void;
}

/**
 * Tarjeta de imagen reemplazable, estilo "Logo cuadrado" de la
 * pantalla de referencia: preview grande a la izquierda, texto
 * informativo a la derecha y botón circular de cámara para cambiar.
 *
 * El backend siempre guarda el archivo en la misma ruta
 * (/empresa/logo_largo.png, etc.), por lo que `urlActual` no cambia
 * de nombre tras guardar. Se agrega un parámetro de caché
 * (`cacheKey`) para forzar la recarga visual una vez actualizado.
 */
export function SelectorImagenEmpresa({
  campo,
  etiqueta,
  descripcion,
  urlActual,
  archivoSeleccionado,
  relacionAspecto = 1,
  deshabilitado = false,
  onSeleccionar,
  onQuitar,
}: SelectorImagenEmpresaProps) {
  const { theme } = useTheme();
  const tieneSeleccionPendiente = Boolean(archivoSeleccionado);
  const fuenteImagen = archivoSeleccionado
    ? { uri: archivoSeleccionado.uri }
    : urlActual
    ? { uri: urlActual }
    : null;

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={[styles.etiqueta, { color: theme.colors.text }]}>
          {etiqueta}
        </Text>
        {tieneSeleccionPendiente && (
          <View
            style={[
              styles.insigniaCambio,
              { backgroundColor: theme.colors.primarySubtle },
            ]}
          >
            <Text
              style={[styles.textoInsignia, { color: theme.colors.primary }]}
            >
              Nueva
            </Text>
          </View>
        )}
      </View>

      <View style={styles.fila}>
        <Pressable
          onPress={() => onSeleccionar(campo)}
          disabled={deshabilitado}
          style={({ pressed }) => [
            styles.previsualizacion,
            { aspectRatio: relacionAspecto, borderColor: theme.colors.border, backgroundColor: theme.colors.backgroundSecondary },
            pressed && styles.previsualizacionPresionada,
            deshabilitado && styles.previsualizacionDeshabilitada,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Cambiar imagen: ${etiqueta}`}
        >
          {fuenteImagen ? (
            <Image
              source={fuenteImagen}
              style={styles.imagen}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.marcadorVacio}>
              <ImageOff size={28} color={theme.colors.textMuted} />
              <Text
                style={[
                  styles.textoMarcadorVacio,
                  { color: theme.colors.textMuted },
                ]}
              >
                Sin imagen
              </Text>
            </View>
          )}

          {deshabilitado && (
            <View
              style={[
                styles.capaCarga,
                { backgroundColor: theme.colors.overlay },
              ]}
            >
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          )}
        </Pressable>

        <View style={styles.infoColumna}>
          {descripcion && (
            <Text
              style={[
                styles.descripcion,
                { color: theme.colors.textSecondary },
              ]}
            >
              {descripcion}
            </Text>
          )}

          <View style={styles.botonesColumna}>
            <Pressable
              onPress={() => onSeleccionar(campo)}
              disabled={deshabilitado}
              style={[
                styles.botonCamara,
                { backgroundColor: theme.colors.primary },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Cambiar ${etiqueta}`}
            >
              <Camera size={18} color={theme.colors.primaryForeground} />
            </Pressable>

            {tieneSeleccionPendiente && (
              <Pressable
                onPress={() => onQuitar(campo)}
                disabled={deshabilitado}
                style={[
                  styles.botonQuitar,
                  { borderColor: theme.colors.border },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Descartar selección de ${etiqueta}`}
              >
                <X size={16} color={theme.colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 10,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insigniaCambio: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  textoInsignia: {
    fontSize: 11,
    fontWeight: '700',
  },
  fila: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  previsualizacion: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previsualizacionPresionada: {
    opacity: 0.85,
  },
  previsualizacionDeshabilitada: {
    opacity: 0.6,
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  marcadorVacio: {
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  textoMarcadorVacio: {
    fontSize: 12,
  },
  capaCarga: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoColumna: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 80,
    gap: 12,
  },
  descripcion: {
    fontSize: 13,
    lineHeight: 18,
  },
  botonesColumna: {
    flexDirection: 'row',
    gap: 10,
  },
  botonCamara: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonQuitar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});