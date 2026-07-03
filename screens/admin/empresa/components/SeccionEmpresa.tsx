import { useTheme } from '@theme';
import { ChevronDown, LucideProps, Pencil, Save } from 'lucide-react-native';
import React, { PropsWithChildren, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface SeccionEmpresaProps extends PropsWithChildren {
  titulo: string;
  descripcion?: string;
  icono?: React.ComponentType<LucideProps>;
  /** Si la sección inicia expandida (por defecto: cerrada). */
  iniciaAbierta?: boolean;
  /**
   * Si se proveen `onEditar`/`onGuardar`, se muestran botones de
   * acción (lápiz / disquete) alineados a la derecha del header,
   * antes del chevron.
   */
  editando?: boolean;
  guardando?: boolean;
  onEditar?: () => void;
  onGuardar?: () => void;
}

/**
 * Sección colapsable (acordeón) del formulario de empresa.
 * Header: ícono + título a la izquierda; botones de
 * editar/guardar (si se proveen) + chevron a la derecha.
 */
export function SeccionEmpresa({
  titulo,
  descripcion,
  icono: Icono,
  iniciaAbierta = false,
  editando,
  guardando = false,
  onEditar,
  onGuardar,
  children,
}: SeccionEmpresaProps) {
  const { theme } = useTheme();
  const [abierta, setAbierta] = useState(iniciaAbierta);
  const progreso = useSharedValue(iniciaAbierta ? 1 : 0);

  const alternar = () => {
    const siguiente = !abierta;
    setAbierta(siguiente);
    progreso.value = withTiming(siguiente ? 1 : 0, { duration: 220 });
  };

  const estiloChevron = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progreso.value * 180}deg` }],
  }));

  const mostrarAcciones = Boolean(onEditar || onGuardar);

  return (
    <View
      style={[
        styles.contenedor,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.encabezado}>
        <Pressable
          onPress={alternar}
          style={({ pressed }) => [
            styles.tituloFila,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityState={{ expanded: abierta }}
        >
          {Icono && (
            <View
              style={[
                styles.iconoContenedor,
                { backgroundColor: theme.colors.primarySubtle },
              ]}
            >
              <Icono size={18} color={theme.colors.primary} />
            </View>
          )}
          <View style={styles.tituloTextos}>
            <Text style={[styles.titulo, { color: theme.colors.text }]}>
              {titulo}
            </Text>
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
          </View>
        </Pressable>

        <View style={styles.accionesFila}>
          {mostrarAcciones && (
            <>
              {onEditar && (
                <Pressable
                  onPress={onEditar}
                  style={[
                    styles.botonAccion,
                    {
                      backgroundColor: editando
                        ? theme.colors.disabled
                        : theme.colors.primary,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ${titulo}`}
                >
                  <Pencil size={16} color={theme.colors.primaryForeground} />
                </Pressable>
              )}

              {onGuardar && editando && (
                <Pressable
                  onPress={onGuardar}
                  disabled={guardando}
                  style={[
                    styles.botonAccion,
                    {
                      backgroundColor: guardando
                        ? theme.colors.disabled
                        : theme.colors.success,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Guardar ${titulo}`}
                >
                  {guardando ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.successForeground}
                    />
                  ) : (
                    <Save size={16} color={theme.colors.successForeground} />
                  )}
                </Pressable>
              )}
            </>
          )}

          <Pressable
            onPress={alternar}
            style={({ pressed }) => [
              styles.botonChevron,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ expanded: abierta }}
          >
            <Animated.View style={estiloChevron}>
              <ChevronDown size={20} color={theme.colors.primary} />
            </Animated.View>
          </Pressable>
        </View>
      </View>

      {abierta && (
        <View
          style={[
            styles.contenido,
            { borderTopColor: theme.colors.divider },
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  tituloFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconoContenedor: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloTextos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  descripcion: {
    fontSize: 13,
  },
  accionesFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botonAccion: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonChevron: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contenido: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
});