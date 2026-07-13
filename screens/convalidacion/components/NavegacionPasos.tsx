// screens/convalidacion/components/NavegacionPasos.tsx
import { useTheme } from '@theme';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface NavegacionPasosProps {
  pasoActual: number;
  onAnterior: () => void;
  onSiguiente: () => void;
  siguienteLabel?: string;
  siguienteDisabled?: boolean;
  loading?: boolean;
}

export function NavegacionPasos({
  pasoActual,
  onAnterior,
  onSiguiente,
  siguienteLabel = 'Siguiente →',
  siguienteDisabled = false,
  loading = false,
}: NavegacionPasosProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {pasoActual > 1 && (
        <TouchableOpacity
          onPress={onAnterior}
          style={[
            styles.button,
            styles.buttonOutline,
            { borderColor: theme.colors.border },
          ]}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>
            ← Anterior
          </Text>
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }} />
      <TouchableOpacity
        onPress={onSiguiente}
        style={[
          styles.button,
          styles.buttonFilled,
          {
            backgroundColor: siguienteDisabled
              ? theme.colors.backgroundTertiary
              : theme.colors.info,
          },
        ]}
        disabled={siguienteDisabled || loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.buttonTextWhite}>{siguienteLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonOutline: {
    borderWidth: 1,
  },
  buttonFilled: {},
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextWhite: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
