// screens/asistencia/components/spreadsheet/SpreadsheetFooter.tsx
import { useTheme } from '@/theme/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { calcularPctSesion } from '../../helpers/attendance.helpers';
import { Sesion } from '../../types/asistencia.types';
import { CELL_W } from './SpreadsheetAttendanceCell';

interface Props { sesiones: Sesion[]; sessionWidth?: number; }

export function SpreadsheetFooter({ sesiones, sessionWidth }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const w = sessionWidth ?? (CELL_W + 4);
  return (
    <View style={[styles.row, { backgroundColor: c.backgroundSecondary, borderTopColor: c.border }]}>
      {sesiones.map((s) => {
        const pct = calcularPctSesion(s);
        const bg = pct == null ? c.backgroundSecondary : pct >= 90 ? c.success + '15' : pct >= 75 ? c.warning + '15' : c.destructive + '15';
        const fg = pct == null ? c.textMuted : pct >= 90 ? c.success : pct >= 75 ? c.warning : c.destructive;
        return (
          <View key={s.id} style={[styles.cell, { width: w, backgroundColor: bg, borderRightColor: c.border }]}>
            <Text style={[styles.pct, { color: fg }]}>{pct == null ? '—' : `${pct}%`}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', height: 34, borderTopWidth: 2 },
  cell: { justifyContent: 'center', alignItems: 'center', borderRightWidth: StyleSheet.hairlineWidth },
  pct: { fontSize: 9, fontWeight: '800' },
});
