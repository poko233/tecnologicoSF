// screens/asistencia/components/sessions/FechasMateriaModal.tsx
import { useTheme } from '@/theme/useTheme';
import { AlertTriangle, CalendarRange, X } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';

interface Props { visible: boolean; fechaInicioSugerida: string; fechaFinSugerida: string; onClose: () => void; onSave: (fechaInicio: string, fechaFin: string) => Promise<void>; }

export function FechasMateriaModal({ visible, fechaInicioSugerida, fechaFinSugerida, onClose, onSave }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [fechaInicio, setFechaInicio] = useState(fechaInicioSugerida);
  const [fechaFin, setFechaFin] = useState(fechaFinSugerida);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (visible) { setFechaInicio(fechaInicioSugerida); setFechaFin(fechaFinSugerida); } }, [visible, fechaInicioSugerida, fechaFinSugerida]);
  const handleSave = async () => {
    if (!fechaInicio || !fechaFin) { Toast.show({ type: 'error', text1: 'Fechas requeridas', text2: 'Debes indicar inicio y fin.' }); return; }
    if (fechaInicio > fechaFin) { Toast.show({ type: 'error', text1: 'Rango inválido', text2: 'La fecha de inicio debe ser anterior o igual al fin.' }); return; }
    setSaving(true);
    try { await onSave(fechaInicio, fechaFin); Toast.show({ type: 'success', text1: 'Fechas actualizadas' }); onClose(); }
    catch (err: any) { Toast.show({ type: 'error', text1: 'Error', text2: err?.message }); }
    finally { setSaving(false); }
  };
  return (
    <AnimatePresence>
      {visible && (
        <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
          <View style={[styles.overlay, { backgroundColor: c.overlay }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'timing', duration: 150 }}
              style={[styles.modal, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[styles.header, { borderBottomColor: c.border }]}>
                <View style={styles.headerLeft}><CalendarRange size={18} color={c.primary} /><View><Text style={[styles.title, { color: c.text }]}>Configurar Fechas de Materia</Text><Text style={[styles.sub, { color: c.textMuted }]}>PATCH /materias/{'{id}'}/fechas</Text></View></View>
                <MotiPressable onPress={onClose}><View style={[styles.closeBtn, { backgroundColor: c.backgroundSecondary }]}><X size={16} color={c.textSecondary} /></View></MotiPressable>
              </View>
              <View style={[styles.warnBox, { backgroundColor: c.warning + '15' }]}>
                <AlertTriangle size={14} color={c.warning} />
                <Text style={[styles.warnText, { color: c.warning }]}>Esta acción recalcula la matriz de sesiones y afecta a <Text style={{ fontWeight: '800' }}>todos los grupos</Text> de esta materia en la gestión.</Text>
              </View>
              <View style={styles.grid}>
                <View style={{ flex: 1 }}><Text style={[styles.label, { color: c.textSecondary }]}>Fecha inicio</Text><TextInput value={fechaInicio} onChangeText={setFechaInicio} placeholder="YYYY-MM-DD" placeholderTextColor={c.textMuted} style={[styles.input, { backgroundColor: c.input, borderColor: c.inputBorder, color: c.text }]} /></View>
                <View style={{ flex: 1 }}><Text style={[styles.label, { color: c.textSecondary }]}>Fecha fin</Text><TextInput value={fechaFin} onChangeText={setFechaFin} placeholder="YYYY-MM-DD" placeholderTextColor={c.textMuted} style={[styles.input, { backgroundColor: c.input, borderColor: c.inputBorder, color: c.text }]} /></View>
              </View>
              <View style={[styles.footer, { borderTopColor: c.border }]}>
                <Pressable onPress={onClose}><Text style={[styles.cancelText, { color: c.textSecondary }]}>Cancelar</Text></Pressable>
                <MotiPressable onPress={handleSave} disabled={saving}><View style={[styles.saveBtn, { backgroundColor: c.primary }]}>{saving ? <ActivityIndicator color={c.primaryForeground} /> : <Text style={[styles.saveText, { color: c.primaryForeground }]}>Aplicar y Regenerar</Text>}</View></MotiPressable>
              </View>
            </MotiView>
          </View>
        </Modal>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  modal: { width: '100%', maxWidth: 460, borderRadius: 16, borderWidth: 1, padding: 16, gap: 12, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, paddingBottom: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 15, fontWeight: '800' }, sub: { fontSize: 10, marginTop: 2 },
  closeBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  warnBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: 10, borderRadius: 8 },
  warnText: { fontSize: 11, fontWeight: '500', flex: 1, lineHeight: 16 },
  grid: { flexDirection: 'row', gap: 8 },
  label: { fontSize: 10, fontWeight: '700', marginBottom: 4 },
  input: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1 },
  cancelText: { fontSize: 12, fontWeight: '600' }, saveBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 8 }, saveText: { fontSize: 12, fontWeight: '800' },
});
