import { useTheme } from '@theme';
import { RefreshCw, ServerCrash } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface EstadoErrorEmpresaProps {
  mensaje: string;
  onReintentar: () => void;
}

/**
 * Estado de error a pantalla completa, usado cuando falla la carga
 * inicial de la configuración de empresa.
 */
export function EstadoErrorEmpresa({
  mensaje,
  onReintentar,
}: EstadoErrorEmpresaProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.contenedor, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.iconoContenedor,
          { backgroundColor: theme.colors.primarySubtle },
        ]}
      >
        <ServerCrash size={32} color={theme.colors.primary} />
      </View>

      <Text style={[styles.titulo, { color: theme.colors.text }]}>
        No se pudo cargar la configuración
      </Text>
      <Text style={[styles.mensaje, { color: theme.colors.textSecondary }]}>
        {mensaje}
      </Text>

      <Pressable
        onPress={onReintentar}
        style={({ pressed }) => [
          styles.boton,
          { backgroundColor: theme.colors.primary },
          pressed && { opacity: 0.85 },
        ]}
      >
        <RefreshCw size={16} color={theme.colors.primaryForeground} />
        <Text
          style={[styles.textoBoton, { color: theme.colors.primaryForeground }]}
        >
          Reintentar
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  iconoContenedor: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  mensaje: {
    fontSize: 14,
    textAlign: 'center',
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  textoBoton: {
    fontSize: 14,
    fontWeight: '700',
  },
});