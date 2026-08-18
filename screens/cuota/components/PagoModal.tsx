import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/useTheme';
import { Cuota, MetodoPago } from '../types/cuota.types';
import Toast from 'react-native-toast-message';

interface PagoModalProps {
  visible: boolean;
  cuota: Cuota | null;
  onClose: () => void;
  onPagar: (monto: number, metodo: MetodoPago, comprobante?: string, observacion?: string) => Promise<void>;
}

const METODOS: { value: MetodoPago; label: string; icon: string }[] = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: 'cash-outline' },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: 'swap-horizontal-outline' },
  { value: 'TARJETA', label: 'Tarjeta', icon: 'card-outline' },
  { value: 'QR', label: 'QR', icon: 'qr-code-outline' },
];

export const PagoModal: React.FC<PagoModalProps> = ({
  visible,
  cuota,
  onClose,
  onPagar,
}) => {
  const { theme } = useTheme();
  const c = theme.colors;

  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState<MetodoPago>('EFECTIVO');
  const [comprobante, setComprobante] = useState('');
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePagar = async () => {
    if (!cuota) return;

    const montoNum = parseFloat(monto);

    if (isNaN(montoNum) || montoNum <= 0) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Ingresa un monto válido' });
      return;
    }

    if (montoNum > cuota.saldo) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `El monto no puede superar el saldo (Bs. ${cuota.saldo.toFixed(2)})`,
      });
      return;
    }

    setLoading(true);
    try {
      await onPagar(montoNum, metodo, comprobante || undefined, observacion || undefined);
      
      // Limpiar formulario
      setMonto('');
      setComprobante('');
      setObservacion('');
      setMetodo('EFECTIVO');
      
      onClose();
    } catch (error) {
      console.error('Error al pagar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePagarSaldoCompleto = () => {
    if (cuota) {
      setMonto(cuota.saldo.toFixed(2));
    }
  };

  if (!cuota) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: c.card }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: c.text }]}>Registrar Pago</Text>
              <Pressable onPress={onClose} disabled={loading}>
                <Ionicons name="close" size={24} color={c.text} />
              </Pressable>
            </View>

            {/* Info de la cuota */}
            <View style={[styles.cuotaInfo, { backgroundColor: c.backgroundSecondary }]}>
              <Text style={[styles.cuotaLabel, { color: c.textMuted }]}>Cuota</Text>
              <Text style={[styles.cuotaNombre, { color: c.text }]}>{cuota.concepto}</Text>

              <View style={styles.montoRow}>
                <Text style={[styles.label, { color: c.textMuted }]}>Total adeudado:</Text>
                <Text style={[styles.value, { color: c.text }]}>
                  Bs. {cuota.total_adeudado.toFixed(2)}
                </Text>
              </View>

              <View style={styles.montoRow}>
                <Text style={[styles.label, { color: c.textMuted }]}>Ya pagado:</Text>
                <Text style={[styles.value, { color: c.success }]}>
                  Bs. {cuota.monto_pagado.toFixed(2)}
                </Text>
              </View>

              <View style={styles.montoRow}>
                <Text style={[styles.label, { color: c.textMuted }]}>Saldo pendiente:</Text>
                <Text style={[styles.valueBold, { color: c.destructive }]}>
                  Bs. {cuota.saldo.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Monto a pagar */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.text }]}>Monto a pagar *</Text>
              <View style={styles.montoInputRow}>
                <TextInput
                  style={[styles.input, { backgroundColor: c.input, color: c.text, borderColor: c.border }]}
                  placeholder="0.00"
                  placeholderTextColor={c.textMuted}
                  value={monto}
                  onChangeText={setMonto}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
                <Pressable
                  style={[styles.btnSaldoCompleto, { backgroundColor: c.primary }]}
                  onPress={handlePagarSaldoCompleto}
                  disabled={loading}
                >
                  <Text style={[styles.btnText, { color: c.primaryForeground }]}>Saldo completo</Text>
                </Pressable>
              </View>
            </View>

            {/* Método de pago */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.text }]}>Método de pago *</Text>
              <View style={styles.metodosGrid}>
                {METODOS.map((m) => (
                  <Pressable
                    key={m.value}
                    style={[
                      styles.metodoCard,
                      {
                        backgroundColor: metodo === m.value ? c.primary : c.input,
                        borderColor: metodo === m.value ? c.primary : c.border,
                      },
                    ]}
                    onPress={() => setMetodo(m.value)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={m.icon as any}
                      size={24}
                      color={metodo === m.value ? c.primaryForeground : c.text}
                    />
                    <Text
                      style={[
                        styles.metodoLabel,
                        { color: metodo === m.value ? c.primaryForeground : c.text },
                      ]}
                    >
                      {m.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Comprobante (opcional) */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.text }]}>Nº Comprobante (opcional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.input, color: c.text, borderColor: c.border }]}
                placeholder="REC-001"
                placeholderTextColor={c.textMuted}
                value={comprobante}
                onChangeText={setComprobante}
                editable={!loading}
              />
            </View>

            {/* Observación (opcional) */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.text }]}>Observación (opcional)</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: c.input, color: c.text, borderColor: c.border },
                ]}
                placeholder="Primer abono de la cuota..."
                placeholderTextColor={c.textMuted}
                value={observacion}
                onChangeText={setObservacion}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>

            {/* Botones */}
            <View style={styles.actions}>
              <Pressable
                style={[styles.btnSecondary, { borderColor: c.border }]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={[styles.btnSecondaryText, { color: c.text }]}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.btnPrimary, { backgroundColor: c.primary }]}
                onPress={handlePagar}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={c.primaryForeground} />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color={c.primaryForeground} />
                    <Text style={[styles.btnPrimaryText, { color: c.primaryForeground }]}>
                      Confirmar Pago
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 12,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  cuotaInfo: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  cuotaLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  cuotaNombre: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  montoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  valueBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  montoInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  btnSaldoCompleto: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metodosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metodoCard: {
    flex: 1,
    minWidth: 100,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    gap: 4,
  },
  metodoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btnSecondary: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
