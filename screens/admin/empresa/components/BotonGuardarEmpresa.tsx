import { useTheme } from '@theme';
import { Save } from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';

interface BotonGuardarEmpresaProps {
  onPress: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
  texto?: string;
}

export function BotonGuardarEmpresa({
  onPress,
  cargando = false,
  deshabilitado = false,
  texto = 'Guardar cambios',
}: BotonGuardarEmpresaProps) {
  const { theme } = useTheme();
  const inactivo = cargando || deshabilitado;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.boton,
        {
          backgroundColor: inactivo
            ? theme.colors.disabled
            : theme.colors.primary,
        },
        pressed && !inactivo && styles.botonPresionado,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
    >
      {cargando ? (
        <ActivityIndicator color={theme.colors.primaryForeground} />
      ) : (
        <>
          <Save size={18} color={theme.colors.primaryForeground} />
          <Text
            style={[styles.texto, { color: theme.colors.primaryForeground }]}
          >
            {texto}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botonPresionado: {
    opacity: 0.85,
  },
  texto: {
    fontSize: 15,
    fontWeight: '700',
  },
});