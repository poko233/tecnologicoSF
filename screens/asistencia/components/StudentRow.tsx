// screens/asistencia/components/StudentRow.tsx
import { useTheme } from '@/theme/useTheme';
import { MotiView } from 'moti';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AsistenciaTipo, EstudianteAsistencia } from '../types/asistencia.types';
import { ObservationInput } from './ObservationInput';
import { StatusButtonGroup } from './StatusButtonGroup';

interface Props { estudiante: EstudianteAsistencia; currentStatus: AsistenciaTipo | null; currentObservacion: string; onStatusChange: (tipo: AsistenciaTipo) => void; onObservacionChange: (text: string) => void; index: number; }

export function StudentRow({ estudiante, currentStatus, currentObservacion, onStatusChange, onObservacionChange, index }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const initials = useMemo(() => (estudiante.nombres.charAt(0) + estudiante.apellidoPaterno.charAt(0)).toUpperCase(), [estudiante.nombres, estudiante.apellidoPaterno]);
  const displayName = useMemo(() => `${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno} ${estudiante.nombres}`.trim(), [estudiante.apellidoPaterno, estudiante.apellidoMaterno, estudiante.nombres]);
  return (
    <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 320, delay: index * 30 }} style={[styles.row, { borderBottomColor: c.divider }]}>
      <View style={styles.studentColumn}>
        <View style={[styles.avatar, { backgroundColor: c.secondary }]}><Text style={[styles.avatarText, { color: c.secondaryForeground }]}>{initials}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>{displayName}{estudiante.carrera ? ` (${estudiante.carrera})` : ''}</Text>
          <Text style={[styles.ci, { color: c.textSecondary }]} numberOfLines={1}>C.I. {estudiante.ci}</Text>
        </View>
      </View>
      <View style={styles.statusColumn}><StatusButtonGroup selectedTipo={currentStatus} onSelect={onStatusChange} /></View>
      <View style={styles.obsColumn}><ObservationInput value={currentObservacion} onChangeText={onObservacionChange} /></View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, overflow: 'visible', zIndex: 1 },
  studentColumn: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '700', fontSize: 14 },
  name: { fontSize: 14, fontWeight: '600' },
  ci: { fontSize: 11, marginTop: 1 },
  statusColumn: { flex: 2, alignItems: 'center', justifyContent: 'center', zIndex: 999, overflow: 'visible' },
  obsColumn: { flex: 3, justifyContent: 'center' },
});
