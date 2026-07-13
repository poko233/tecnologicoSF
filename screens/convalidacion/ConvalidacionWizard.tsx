// screens/convalidacion/ConvalidacionWizard.tsx
import { useTheme } from '@theme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ConvalidacionHeader } from './components/ConvalidacionHeader';
import { StepperConvalidacion } from './components/StepperConvalidacion';
import {
  ConvalidacionProvider,
  useConvalidacionContext,
} from './context/ConvalidacionContext';
import { Paso1DatosEstudiante } from './steps/Paso1DatosEstudiante';
import { Paso2Documentos } from './steps/Paso2Documentos';
import { Paso3Materias } from './steps/Paso3Materias';
import { Paso4Pago } from './steps/Paso4Pago';

function ConvalidacionWizardContent() {
  const { theme } = useTheme();
  const { pasoActual, codigoSolicitud } = useConvalidacionContext();

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return <Paso1DatosEstudiante />;
      case 2:
        return <Paso2Documentos />;
      case 3:
        return <Paso3Materias />;
      case 4:
        return <Paso4Pago />;
      default:
        return <Paso1DatosEstudiante />;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ConvalidacionHeader codigoSolicitud={codigoSolicitud} />
        <StepperConvalidacion pasoActual={pasoActual} />
        <View style={styles.pasoContainer}>{renderPaso()}</View>
      </ScrollView>
    </View>
  );
}

export function ConvalidacionWizard() {
  return (
    <ConvalidacionProvider>
      <ConvalidacionWizardContent />
    </ConvalidacionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  pasoContainer: {
    flex: 1,
  },
});
