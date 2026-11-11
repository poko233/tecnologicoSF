// screens/asistencia/components/sessions/ControlSesionModal.tsx
import { useTheme } from '@/theme/useTheme';
import { AlertTriangle, LockOpen, Play, Trash2, X } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Sesion } from '../../types/asistencia.types';

interface Props {
  visible: boolean; sesion: Sesion | null; gestionCerrada: boolean; onClose: () => void;
  onTomarAsistencia: (sesion: Sesion) => void; onChangeEstado: (estado: 'cancelada' | 'feriado', motivo: string) => Promise<void>;
  onReabrir: () => Promise<void>; onLimpiar: () => Promise<void>;
}

export function ControlSesionModal({ visible, sesion, gestionCerrada, onClose, onTomarAsistencia, onChangeEstado, onReabrir, onLimpiar }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [estado, setEstado] = useState<'tomada' | 'feriado' | 'cancelada'>('tomada');
  const [motivo, setMotivo] = useState('');
  const [busy, setBusy] = useState<null | 'save' | 'reabrir' | 'limpiar'>(null);

  useEffect(() => {
    if (sesion) {
      setEstado(sesion.estado === 'feriado' ? 'feriado' : sesion.estado === 'cancelada' ? 'cancelada' : 'tomada');
      setMotivo(sesion.observacion ?? '');
    }
  }, [sesion]);

  if (!sesion) return null;

  const wasTomada = sesion.estado === 'tomada';
  const canCancel = sesion.estado === 'programada' || sesion.estado === 'tomada';
  const canReabrir = sesion.estado === 'cancelada' || sesion.estado === 'feriado';
  const canLimpiar = sesion.estado === 'tomada';

  const handleSaveEstado = async () => {
    if (!motivo.trim()) { Toast.show({ type: 'error', text1: 'Motivo obligatorio', text2: 'Debes indicar el motivo.' }); return; }
    setBusy('save');
    try { await onChangeEstado(estado as 'cancelada' | 'feriado', motivo.trim()); Toast.show({ type: 'success', text1: 'Estado actualizado' }); onClose(); }
    catch (err: any) { Toast.show({ type: 'error', text1: 'Error', text2: err?.message ?? 'Intenta de nuevo.' }); }
    finally { setBusy(null); }
  };

  const handleReabrir = async () => { setBusy('reabrir'); try { await onReabrir(); Toast.show({ type: 'success', text1: 'Sesión reabierta' }); onClose(); } catch (err: any) { Toast.show({ type: 'error', text1: 'Error', text2: err?.message }); } finally { setBusy(null); } };
  const handleLimpiar = () => {
    Alert.alert('Limpiar asistencias', 'Se eliminarán todas las asistencias registradas de esta sesión. Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpiar', style: 'destructive', onPress: async () => { setBusy('limpiar'); try { await onLimpiar(); Toast.show({ type: 'success', text1: 'Sesión limpiada' }); onClose(); } catch (err: any) { Toast.show({ type: 'error', text1: 'Error', text2: err?.message }); } finally { setBusy(null); } } },
    ]);
  };

  const statusBadge = sesion.estado === 'tomada' ? { bg: c.success + '22', fg: c.success, label: 'TOMADA' }
    : sesion.estado === 'feriado' ? { bg: '#ede9fe', fg: '#6d28d9', label: 'FERIADO' }
    : sesion.estado === 'cancelada' ? { bg: c.destructive + '22', fg: c.destructive, label: 'CANCELADA' }
    : { bg: c.backgroundSecondary, fg: c.textSecondary, label: 'PROGRAMADA' };

  return (
    <AnimatePresence>
      {visible && (
        <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
          <View style={[styles.overlay, { backgroundColor: c.overlay }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            <MotiView from={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'timing', duration: 150 }}
              style={[styles.modal, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[styles.header, { borderBottomColor: c.border }]}>
                <View>
                  <Text style={[styles.title, { color: c.text }]}>Sesión #{sesion.id}</Text>
                  <Text style={[styles.sub, { color: c.textSecondary }]}>{sesion.fecha} · {sesion.dia ?? '—'} · {sesion.horaInicio?.slice(0, 5) ?? '—'}-{sesion.horaFin?.slice(0, 5) ?? '—'}</Text>
                </View>
                <MotiPressable onPress={onClose} disabled={busy !== null}><View style={[styles.closeBtn, { backgroundColor: c.backgroundSecondary, opacity: busy !== null ? 0.5 : 1 }]}><X size={16} color={c.textSecondary} /></View></MotiPressable>
              </View>
              <View style={styles.kpiRow}>
                <Kpi label="Presentes" value={sesion.resumen.presentes} color={c.success} bg={c.success + '15'} />
                <Kpi label="Atrasos" value={sesion.resumen.atrasos} color={c.warning} bg={c.warning + '15'} />
                <Kpi label="Faltas" value={sesion.resumen.faltas} color={c.destructive} bg={c.destructive + '15'} />
                <Kpi label="Permisos" value={sesion.resumen.permisos} color={c.info} bg={c.info + '15'} />
              </View>
              <View style={[styles.audit, { backgroundColor: c.backgroundSecondary }]}>
                <View style={styles.auditRow}><Text style={[styles.auditLabel, { color: c.textMuted }]}>Tomada por</Text><Text style={[styles.auditValue, { color: c.text }]}>{sesion.tomada_por ?? '—'}</Text></View>
                <View style={styles.auditRow}><Text style={[styles.auditLabel, { color: c.textMuted }]}>Estado</Text><View style={[styles.badge, { backgroundColor: statusBadge.bg }]}><Text style={[styles.badgeText, { color: statusBadge.fg }]}>{statusBadge.label}</Text></View></View>
                {sesion.observacion && <View style={styles.auditRow}><Text style={[styles.auditLabel, { color: c.textMuted }]}>Motivo</Text><Text style={[styles.auditValue, { color: c.text, flex: 1 }]} numberOfLines={2}>{sesion.observacion}</Text></View>}
              </View>
              <MotiPressable onPress={() => onTomarAsistencia(sesion)} disabled={gestionCerrada || busy !== null}>
                <View style={[styles.primaryBtn, { backgroundColor: c.primary, opacity: gestionCerrada ? 0.5 : 1 }]}>
                  <Play size={14} color={c.primaryForeground} />
                  <Text style={[styles.primaryBtnText, { color: c.primaryForeground }]}>{sesion.estado === 'tomada' ? 'Editar Asistencia' : 'Tomar Asistencia'}</Text>
                </View>
              </MotiPressable>
              {canCancel && (
                <View style={{ gap: 8, opacity: gestionCerrada ? 0.5 : 1 }}>
                  <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Cambiar estado (PATCH)</Text>
                  <View style={styles.chipsRow}>
                    {(['feriado', 'cancelada'] as const).map((opt) => (
                      <Pressable key={opt} onPress={() => setEstado(opt)} disabled={gestionCerrada || busy !== null} style={[styles.chip, { borderColor: estado === opt ? c.primary : c.border, backgroundColor: estado === opt ? c.primary + '15' : 'transparent', opacity: gestionCerrada || busy !== null ? 0.4 : 1 }]}>
                        <Text style={[styles.chipText, { color: estado === opt ? c.primary : c.textSecondary }]}>{opt === 'feriado' ? 'Feriado' : 'Cancelada'}</Text>
                      </Pressable>
                    ))}
                  </View>
                  {estado !== 'tomada' && (
                    <>
                      {wasTomada && (
                        <View style={[styles.warnBanner, { backgroundColor: c.destructive + '15' }]}>
                          <AlertTriangle size={14} color={c.destructive} />
                          <Text style={[styles.warnText, { color: c.destructive }]}>Esta sesión tiene asistencia registrada. Al cancelar se borrará y no contará para la nota.</Text>
                        </View>
                      )}
                      <TextInput placeholder="Motivo obligatorio..." placeholderTextColor={c.textMuted} value={motivo} onChangeText={setMotivo} multiline style={[styles.textarea, { color: c.text, backgroundColor: c.backgroundSecondary, borderColor: c.border }]} />
                    </>
                  )}
                </View>
              )}
              {(canReabrir || canLimpiar) && (
                <View style={[styles.dangerRow, { borderTopColor: c.divider }]}>
                  {canReabrir && (
                    <MotiPressable onPress={handleReabrir} disabled={busy !== null || gestionCerrada}>
                      <View style={[styles.ghostBtn, { borderColor: c.warning, opacity: gestionCerrada || busy !== null ? 0.4 : 1 }]}>
                        {busy === 'reabrir' ? <ActivityIndicator size="small" color={c.warning} /> : <LockOpen size={12} color={c.warning} />}
                        <Text style={[styles.ghostBtnText, { color: c.warning }]}>Reabrir</Text>
                      </View>
                    </MotiPressable>
                  )}
                  {canLimpiar && (
                    <MotiPressable onPress={handleLimpiar} disabled={busy !== null || gestionCerrada}>
                      <View style={[styles.ghostBtn, { borderColor: c.destructive, opacity: gestionCerrada || busy !== null ? 0.4 : 1 }]}>
                        {busy === 'limpiar' ? <ActivityIndicator size="small" color={c.destructive} /> : <Trash2 size={12} color={c.destructive} />}
                        <Text style={[styles.ghostBtnText, { color: c.destructive }]}>Limpiar</Text>
                      </View>
                    </MotiPressable>
                  )}
                </View>
              )}
              {gestionCerrada && (
                <View style={[styles.warnBanner, { backgroundColor: c.warning + '15' }]}>
                  <AlertTriangle size={14} color={c.warning} />
                  <Text style={[styles.warnText, { color: c.warning }]}>Gestión cerrada — solo lectura para nuevas tomas.</Text>
                </View>
              )}
              <View style={[styles.footer, { borderTopColor: c.border }]}>
                <Pressable onPress={onClose} disabled={busy !== null}><Text style={[styles.cancelText, { color: c.textSecondary }]}>Cancelar</Text></Pressable>
                {canCancel && estado !== 'tomada' && (
                  <MotiPressable onPress={handleSaveEstado} disabled={busy !== null || gestionCerrada}>
                    <View style={[styles.saveBtn, { backgroundColor: c.primary, opacity: gestionCerrada || busy !== null ? 0.5 : 1 }]}>
                      {busy === 'save' ? <ActivityIndicator color={c.primaryForeground} /> : <Text style={[styles.saveText, { color: c.primaryForeground }]}>Guardar</Text>}
                    </View>
                  </MotiPressable>
                )}
              </View>
              {busy !== null && (
                <View style={[styles.busyOverlay, { backgroundColor: c.overlay }]}>
                  <ActivityIndicator size="large" color={c.primary} />
                  <Text style={{ color: c.textSecondary, marginTop: 8, fontSize: 12 }}>
                    {busy === 'save' ? 'Guardando...' : busy === 'reabrir' ? 'Reabriendo...' : 'Limpiando...'}
                  </Text>
                </View>
              )}
            </MotiView>
          </View>
        </Modal>
      )}
    </AnimatePresence>
  );
}

function Kpi({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return <View style={[kStyles.kpi, { backgroundColor: bg }]}><Text style={[kStyles.kpiLabel, { color }]}>{label}</Text><Text style={[kStyles.kpiValue, { color }]}>{value}</Text></View>;
}
const kStyles = StyleSheet.create({ kpi: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 8 }, kpiLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' }, kpiValue: { fontSize: 16, fontWeight: '900', marginTop: 1 } });
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  modal: { width: '100%', maxWidth: 480, borderRadius: 16, borderWidth: 1, padding: 16, gap: 12, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', borderBottomWidth: 1, paddingBottom: 10 },
  title: { fontSize: 16, fontWeight: '800' }, sub: { fontSize: 11, marginTop: 2 },
  closeBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  kpiRow: { flexDirection: 'row', gap: 6 }, audit: { borderRadius: 10, padding: 10, gap: 6 },
  auditRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, auditLabel: { fontSize: 10, fontWeight: '700', width: 70 }, auditValue: { fontSize: 11, fontWeight: '600' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }, badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 10 },
  primaryBtnText: { fontSize: 13, fontWeight: '800' },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  chipsRow: { flexDirection: 'row', gap: 6 }, chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 }, chipText: { fontSize: 11, fontWeight: '700' },
  textarea: { minHeight: 60, textAlignVertical: 'top', borderRadius: 8, borderWidth: 1, padding: 8, fontSize: 12 },
  dangerRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1 },
  ghostBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  ghostBtnText: { fontSize: 11, fontWeight: '700' },
  warnBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  warnText: { fontSize: 10, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1 },
  cancelText: { fontSize: 12, fontWeight: '600' }, saveBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 8 }, saveText: { fontSize: 12, fontWeight: '800' },
  busyOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', borderRadius: 16, zIndex: 20 },
});
