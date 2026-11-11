// screens/asistencia/components/sessions/SessionsFlowModal.tsx
import { useTheme } from '@/theme/useTheme';
import { Save, X } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { AsistenciaTipo, EstudianteAsistencia, LocalAttendanceState, Sesion } from '../../types/asistencia.types';
import { ListModeView } from '../ListModeView';
import { ModeSwitcher } from '../ModeSwitcher';
import { QuickModeView } from '../QuickModeView';

type ViewMode = 'list' | 'quick';

interface Props { visible: boolean; sesion: Sesion | null; estudiantes: EstudianteAsistencia[]; gestionCerrada: boolean; onClose: () => void; onSave: (idSesion: number, asistencias: { id_inscripcion: number; tipo: AsistenciaTipo; observacion?: string | null }[]) => Promise<void>; }

export function SessionsFlowModal({ visible, sesion, estudiantes, gestionCerrada, onClose, onSave }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [mode, setMode] = useState<ViewMode>('list');
  const [localChanges, setLocalChanges] = useState<LocalAttendanceState>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !sesion) return;
    setMode('list');
    const init: LocalAttendanceState = {};
    for (const e of estudiantes) {
      const reg = e.asistencias[String(sesion.id)];
      init[e.id_inscripcion] = { tipo: reg?.tipo ?? null, observacion: reg?.observacion ?? '' };
    }
    setLocalChanges(init);
  }, [visible, sesion, estudiantes]);

  const updateLocal = (idInscripcion: number, tipo: AsistenciaTipo | null, observacion?: string) => {
    setLocalChanges((prev) => ({ ...prev, [idInscripcion]: { tipo: tipo ?? prev[idInscripcion]?.tipo ?? null, observacion: observacion ?? prev[idInscripcion]?.observacion ?? '' } }));
  };

  const handleSave = async () => {
    if (!sesion) return;
    const asistencias = Object.entries(localChanges).filter(([, v]) => v.tipo !== null).map(([id, v]) => ({ id_inscripcion: Number(id), tipo: v.tipo as AsistenciaTipo, observacion: v.observacion || null }));
    setSaving(true);
    try { await onSave(sesion.id, asistencias); Toast.show({ type: 'success', text1: 'Asistencia registrada' }); onClose(); }
    catch (err: any) { Toast.show({ type: 'error', text1: 'Error', text2: err?.message }); }
    finally { setSaving(false); }
  };

  if (!visible || !sesion) return null;
  return (
    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'timing', duration: 150 }}
      style={[StyleSheet.absoluteFill, { backgroundColor: c.background, zIndex: 100 }]}>
      <View style={[styles.header, { borderBottomColor: c.border, backgroundColor: c.card }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: c.text }]}>Tomar Asistencia · Sesión #{sesion.id}</Text>
          <Text style={[styles.sub, { color: c.textSecondary }]}>{sesion.fecha} · {sesion.dia ?? '—'} · {sesion.horaInicio?.slice(0, 5)}-{sesion.horaFin?.slice(0, 5)}</Text>
        </View>
        <ModeSwitcher currentMode={mode} onModeChange={setMode} />
        <MotiPressable onPress={onClose}><View style={[styles.closeBtn, { backgroundColor: c.backgroundSecondary }]}><X size={16} color={c.textSecondary} /></View></MotiPressable>
      </View>
      <View style={{ flex: 1 }}>
        <AnimatePresence>
          {mode === 'list' ? (
            <MotiView key="list" from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} exit={{ opacity: 0, translateX: 20 }} transition={{ type: 'timing', duration: 200 }} style={StyleSheet.absoluteFill}>
              <ListModeView estudiantes={estudiantes} sesion={sesion} localState={localChanges} onUpdateLocal={updateLocal} searchQuery="" sortOrder="asc" onSortToggle={() => {}} />
            </MotiView>
          ) : (
            <MotiView key="quick" from={{ opacity: 0, translateX: 20 }} animate={{ opacity: 1, translateX: 0 }} exit={{ opacity: 0, translateX: -20 }} transition={{ type: 'timing', duration: 200 }} style={StyleSheet.absoluteFill}>
              <QuickModeView estudiantes={estudiantes} sesion={sesion} localState={localChanges} onUpdateLocal={updateLocal} onFinish={() => setMode('list')} />
            </MotiView>
          )}
        </AnimatePresence>
      </View>
      <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.card }]}>
        <Pressable onPress={onClose}><Text style={[styles.cancelText, { color: c.textSecondary }]}>Cancelar</Text></Pressable>
        <MotiPressable onPress={handleSave} disabled={saving}>
          <View style={[styles.saveBtn, { backgroundColor: c.primary, opacity: gestionCerrada ? 0.5 : 1 }]}>
            {saving ? <ActivityIndicator color={c.primaryForeground} /> : <><Save size={14} color={c.primaryForeground} /><Text style={[styles.saveText, { color: c.primaryForeground }]}>Guardar Asistencia</Text></>}
          </View>
        </MotiPressable>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 1 },
  title: { fontSize: 14, fontWeight: '800' }, sub: { fontSize: 11, marginTop: 2 },
  closeBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderTopWidth: 1 },
  cancelText: { fontSize: 12, fontWeight: '600' }, saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }, saveText: { fontSize: 12, fontWeight: '800' },
});
