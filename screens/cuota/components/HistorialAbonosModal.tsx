import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/useTheme';
import { cuotaService } from '../services/cuota.service';
import { Abono } from '../types/cuota.types';
import Toast from 'react-native-toast-message';

interface HistorialAbonosModalProps {
  visible: boolean;
  cuotaId: number | null;
  onClose: () => void;
}

export const HistorialAbonosModal: React.FC<HistorialAbonosModalProps> = ({
  visible,
  cuotaId,
  onClose,
}) => {
  const { theme } = useTheme();
  const c = theme.colors;

  const [loading, setLoading] = useState(false);
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [cuotaInfo, setCuotaInfo] = useState<any>(null);

  useEffect(() => {
    if (visible && cuotaId) {
      cargarHistorial();
    }
  }, [visible, cuotaId]);

  const cargarHistorial = async () => {
    if (!cuotaId) return;

    setLoading(true);
    try {
      const response = await cuotaService.getHistorialAbonos(cuotaId);
      setAbonos(response.data.abonos);
      setCuotaInfo(response.data.cuota);
    } catch (error: any) {
      console.error('Error cargando historial:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'No se pudo cargar el historial',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case 'EFECTIVO':
        return 'cash-outline';
      case 'TRANSFERENCIA':
        return 'swap-horizontal-outline';
      case 'TARJETA':
        return 'card-outline';
      case 'QR':
        return 'qr-code-outline';
      default:
        return 'wallet-outline';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: c.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: c.text }]}>Historial de Abonos</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={c.text} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={c.primary} />
              <Text style={[styles.loadingText, { color: c.textMuted }]}>
                Cargando historial...
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Info de la cuota */}
              {cuotaInfo && (
                <View style={[styles.cuotaInfo, { backgroundColor: c.backgroundSecondary }]}>
                  <Text style={[styles.cuotaLabel, { color: c.textMuted }]}>Cuota</Text>
                  <Text style={[styles.cuotaNombre, { color: c.text }]}>
                    {cuotaInfo.tipo === 'MATRICULA' ? 'Matrícula' : `Cuota #${cuotaInfo.numeroCuota}`}
                  </Text>

                  <View style={styles.row}>
                    <Text style={[styles.label, { color: c.textMuted }]}>Total:</Text>
                    <Text style={[styles.value, { color: c.text }]}>
                      Bs. {cuotaInfo.total_adeudado.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={[styles.label, { color: c.textMuted }]}>Pagado:</Text>
                    <Text style={[styles.value, { color: c.success }]}>
                      Bs. {cuotaInfo.monto_pagado.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={[styles.label, { color: c.textMuted }]}>Saldo:</Text>
                    <Text style={[styles.valueBold, { color: c.destructive }]}>
                      Bs. {cuotaInfo.saldo.toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Lista de abonos */}
              {abonos.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="document-outline" size={48} color={c.textMuted} />
                  <Text style={[styles.emptyText, { color: c.textMuted }]}>
                    No hay abonos registrados
                  </Text>
                </View>
              ) : (
                <View style={styles.abonosList}>
                  <Text style={[styles.listTitle, { color: c.text }]}>
                    Abonos ({abonos.length})
                  </Text>

                  {abonos.map((abono, index) => (
                    <View
                      key={abono.idPago}
                      style={[styles.abonoCard, { backgroundColor: c.backgroundSecondary }]}
                    >
                      <View style={styles.abonoHeader}>
                        <View style={styles.abonoLeft}>
                          <View style={[styles.iconCircle, { backgroundColor: c.primary + '20' }]}>
                            <Ionicons
                              name={getMetodoIcon(abono.metodo) as any}
                              size={20}
                              color={c.primary}
                            />
                          </View>
                          <View>
                            <Text style={[styles.abonoMonto, { color: c.text }]}>
                              Bs. {abono.monto.toFixed(2)}
                            </Text>
                            <Text style={[styles.abonoMetodo, { color: c.textMuted }]}>
                              {abono.metodo}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.abonoNumero, { color: c.textMuted }]}>
                          #{index + 1}
                        </Text>
                      </View>

                      <View style={styles.abonoDetails}>
                        <View style={styles.detailRow}>
                          <Ionicons name="calendar-outline" size={14} color={c.textMuted} />
                          <Text style={[styles.detailText, { color: c.textMuted }]}>
                            {abono.fecha}
                          </Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Ionicons name="person-outline" size={14} color={c.textMuted} />
                          <Text style={[styles.detailText, { color: c.textMuted }]}>
                            {abono.registrado_por}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          {/* Footer */}
          <Pressable
            style={[styles.btnClose, { backgroundColor: c.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.btnCloseText, { color: c.primaryForeground }]}>Cerrar</Text>
          </Pressable>
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
    maxHeight: '80%',
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
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
  row: {
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
  abonosList: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  abonoCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  abonoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  abonoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  abonoMonto: {
    fontSize: 16,
    fontWeight: '700',
  },
  abonoMetodo: {
    fontSize: 11,
  },
  abonoNumero: {
    fontSize: 12,
    fontWeight: '600',
  },
  abonoDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
  },
  btnClose: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  btnCloseText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
