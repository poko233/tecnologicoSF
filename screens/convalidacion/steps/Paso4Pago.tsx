// screens/convalidacion/steps/Paso4Pago.tsx
import { DatePickerField } from '@/screens/auth/components/DatePickerField';
import { useTheme } from '@theme';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SelectField } from '../components/SelectField';
import { useConvalidacionContext } from '../context/ConvalidacionContext';
import { usePaso4Pago } from '../hooks/usePaso4Pago';

const METODOS_PAGO = [
  { value: 'TRANSFERENCIA', label: 'Banco Unión — depósito' },
  { value: 'EFECTIVO', label: 'Pago en caja' },
  { value: 'QR', label: 'QR / billetera digital' },
];

export function Paso4Pago() {
  const { theme } = useTheme();
  const { solicitudId, gestionLabel, retrocederPaso, resetWizard } =
    useConvalidacionContext();
  const { cuota, formData, updateField, loading, loadingData, registrarPago } =
    usePaso4Pago(solicitudId);

  const handleFinalizar = async () => {
    const success = await registrarPago();
    if (success) {
      // Mostrar mensaje de éxito
      Toast.show({
        type: 'success',
        text1: '¡Solicitud completada!',
        text2: 'La solicitud de convalidación se registró correctamente',
        visibilityTime: 5000,
      });

      // Esperar 2 segundos y luego reiniciar el wizard
      setTimeout(() => {
        resetWizard();
        Toast.show({
          type: 'info',
          text1: 'Nueva solicitud',
          text2: 'Puede crear una nueva solicitud de convalidación',
          visibilityTime: 3000,
        });
      }, 2000);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[styles.loadingText, { color: theme.colors.textSecondary }]}
        >
          Cargando información de pago...
        </Text>
      </View>
    );
  }

  const cantidadMaterias = cuota?.cantidad_materias || 0;
  const arancelPorMateria = formData.arancel_por_materia;
  const descuento = formData.descuento;

  // Calcular el total dinámicamente
  const subtotal = cantidadMaterias * arancelPorMateria;
  const monto = subtotal - descuento;


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
        PAGO POR CONVALIDACIÓN
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>
            Materias solicitadas
          </Text>
          <Text style={[styles.rowValue, { color: theme.colors.text }]}>
            {cantidadMaterias} materias
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>
            Arancel por materia
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.rowValue, { color: theme.colors.text }]}>Bs.</Text>
            <TextInput
              style={[
                styles.miniInput,
                {
                  backgroundColor: theme.colors.input,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text,
                },
              ]}
              value={String(arancelPorMateria)}
              onChangeText={(text) => {
                const value = parseFloat(text) || 0;
                updateField('arancel_por_materia', value);
              }}
              keyboardType="numeric"
              placeholder="100"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>
            Gestión
          </Text>
          <Text style={[styles.rowValue, { color: theme.colors.text }]}>
            {gestionLabel}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>
            Descuento
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.rowValue, { color: theme.colors.success }]}>— Bs.</Text>
            <TextInput
              style={[
                styles.miniInput,
                {
                  backgroundColor: theme.colors.input,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text,
                },
              ]}
              value={String(descuento)}
              onChangeText={(text) => {
                const value = parseFloat(text) || 0;
                updateField('descuento', value);
              }}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View
          style={[
            styles.totalBox,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={styles.totalLabel}>Total a cancelar</Text>
          <Text style={styles.totalValue}>Bs. {monto.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={[styles.label, { color: theme.colors.textMuted }]}>
        FORMA DE PAGO *
      </Text>
      <SelectField
        value={formData.metodo}
        onChange={(value) => updateField('metodo', value as any)}
        options={METODOS_PAGO}
        placeholder="Seleccione forma de pago"
      />

      <Text style={[styles.label, { color: theme.colors.textMuted }]}>
        Nº DE COMPROBANTE
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.input,
            borderColor: theme.colors.inputBorder,
            color: theme.colors.text,
          },
        ]}
        value={formData.comprobante}
        onChangeText={(text) => updateField('comprobante', text)}
        placeholder="Número de comprobante (opcional)"
        placeholderTextColor={theme.colors.textMuted}
      />

      {/* Fecha de pago */}
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>
        FECHA DE PAGO *
      </Text>
      <DatePickerField
        label="Seleccione fecha"
        value={formData.fecha_pago.toISOString().split('T')[0]}
        onChange={(dateString) => {
          const date = new Date(dateString + 'T12:00:00');
          updateField('fecha_pago', date);
        }}
      />

      <Text style={[styles.label, { color: theme.colors.textMuted }]}>
        ESTADO
      </Text>
      <View
        style={[
          styles.badge,
          { backgroundColor: theme.colors.warning + '20' },
        ]}
      >
        <Text style={[styles.badgeText, { color: theme.colors.warning }]}>
          Pendiente verificación
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={retrocederPaso}
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
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={handleFinalizar}
          style={[
            styles.button,
            styles.buttonFilled,
            { backgroundColor: theme.colors.success },
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonTextWhite}>✓ Finalizar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 14,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  totalBox: {
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.3,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  miniInput: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 20,
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
