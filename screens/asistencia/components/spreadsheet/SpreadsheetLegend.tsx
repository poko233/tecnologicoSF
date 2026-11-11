// screens/asistencia/components/spreadsheet/SpreadsheetLegend.tsx
import { useTheme } from '@/theme/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const FERIADO_BG = '#ede9fe';
const FERIADO_TEXT = '#6d28d9';

export function SpreadsheetLegend() {
  const { theme } = useTheme();
  const c = theme.colors;
  const items = [
    { label: 'P', bg: c.success + '22', fg: c.success, caption: 'Presente' },
    { label: 'A', bg: c.warning + '22', fg: c.warning, caption: 'Atraso' },
    { label: 'F', bg: c.destructive + '22', fg: c.destructive, caption: 'Falta' },
    { label: 'L', bg: c.info + '22', fg: c.info, caption: 'Permiso' },
    { label: 'FER', bg: FERIADO_BG, fg: FERIADO_TEXT, caption: 'Feriado' },
    { label: 'CAN', bg: c.destructive + '14', fg: c.destructive, caption: 'Cancelada' },
  ];
  return (
    <View style={styles.wrap}>
      {items.map((it) => (
        <View key={it.label} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: it.bg, borderColor: it.fg + '55' }]}><Text style={[styles.dotText, { color: it.fg }]}>{it.label}</Text></View>
          <Text style={[styles.caption, { color: c.textMuted }]}>{it.caption}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot: { minWidth: 20, height: 16, paddingHorizontal: 3, borderRadius: 3, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dotText: { fontSize: 8, fontWeight: '800' },
  caption: { fontSize: 9, fontWeight: '600' },
});
