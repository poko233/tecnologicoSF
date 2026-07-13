// screens/convalidacion/components/StepperConvalidacion.tsx
import { useTheme } from '@theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StepperConvalidacionProps {
  pasoActual: number; // 1-4
}

const PASOS = [
  { numero: 1, label: 'Datos del\nestudiante' },
  { numero: 2, label: 'Documentos' },
  { numero: 3, label: 'Materias' },
  { numero: 4, label: 'Pago' },
];

export function StepperConvalidacion({ pasoActual }: StepperConvalidacionProps) {
  const { theme } = useTheme();

  const getStepColor = (numeroPaso: number) => {
    if (numeroPaso < pasoActual) return theme.colors.success; // Completado
    if (numeroPaso === pasoActual) return theme.colors.info; // Activo
    return theme.colors.backgroundTertiary; // Pendiente
  };

  const getTextColor = (numeroPaso: number) => {
    if (numeroPaso < pasoActual) return theme.colors.success;
    if (numeroPaso === pasoActual) return theme.colors.info;
    return theme.colors.textMuted;
  };

  const getLineColor = (index: number) => {
    // La línea antes del paso index+1
    if (index + 1 < pasoActual) return theme.colors.success;
    return theme.colors.border;
  };

  return (
    <View style={styles.container}>
      {PASOS.map((paso, index) => (
        <React.Fragment key={paso.numero}>
          <View style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: getStepColor(paso.numero),
                  borderColor: getStepColor(paso.numero),
                },
              ]}
            >
              <Text style={styles.circleText}>{paso.numero}</Text>
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: getTextColor(paso.numero),
                  fontWeight: paso.numero === pasoActual ? 'bold' : 'normal',
                },
              ]}
            >
              {paso.label}
            </Text>
          </View>
          {index < PASOS.length - 1 && (
            <View
              style={[
                styles.line,
                { backgroundColor: getLineColor(index) },
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  stepContainer: {
    alignItems: 'center',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  circleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 60,
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
});
