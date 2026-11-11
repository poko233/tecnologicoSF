// screens/asistencia/components/spreadsheet/SpreadsheetAttendanceCell.tsx
import { useTheme } from '@/theme/useTheme';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { CellVisual, TIPO_LABEL } from '../../helpers/attendance.helpers';
import { AsistenciaTipo } from '../../types/asistencia.types';

export const CELL_W = 30;
export const CELL_H = 30;

const FERIADO_BG = '#ede9fe';
const FERIADO_TEXT = '#6d28d9';
const FERIADO_BORDER = '#c4b5fd';

interface Props {
  visual: CellVisual;
  onPress: () => void;
}

export function SpreadsheetAttendanceCell({ visual, onPress }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  if (visual.kind === 'feriado') {
    return (
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 180 }}
        style={[styles.cell, { backgroundColor: FERIADO_BG, borderColor: FERIADO_BORDER }]}>
        <Text style={[styles.text, { color: FERIADO_TEXT }]}>FER</Text>
      </MotiView>
    );
  }
  if (visual.kind === 'cancelada') {
    return (
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 180 }}
        style={[styles.cell, { backgroundColor: c.destructive + '14', borderColor: c.destructive + '55' }]}>
        <Text style={[styles.text, { color: c.destructive, textDecorationLine: 'line-through' }]}>CAN</Text>
      </MotiView>
    );
  }
  if (visual.kind === 'programada' || visual.kind === 'sin_registro') {
    return (
      <MotiView animate={{ opacity: 1 }} style={[styles.cell, { backgroundColor: c.backgroundSecondary, borderColor: c.border, borderStyle: 'dashed' }]}>
        <Text style={[styles.text, { color: c.textMuted }]}>—</Text>
      </MotiView>
    );
  }
  const solid = { Presente: c.success, Atraso: c.warning, Falta: c.destructive, Permiso: c.info }[visual.tipo];
  return (
    <MotiPressable onPress={onPress} animate={({ pressed }) => { 'worklet'; return { scale: pressed ? 0.9 : 1 }; }} transition={{ type: 'spring', damping: 15, stiffness: 300 }}>
      <MotiView style={[styles.cell, { backgroundColor: solid + '22', borderColor: solid + '88' }]}>
        <Text style={[styles.text, { color: solid }]}>{TIPO_LABEL[visual.tipo]}</Text>
      </MotiView>
    </MotiPressable>
  );
}

const styles = StyleSheet.create({
  cell: { width: CELL_W - 4, height: CELL_H - 6, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: 2, marginVertical: 3 },
  text: { fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },
});
