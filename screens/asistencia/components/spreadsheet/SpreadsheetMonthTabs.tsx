// screens/asistencia/components/spreadsheet/SpreadsheetMonthTabs.tsx
import { useTheme } from '@/theme/useTheme';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { MonthGroup } from '../../helpers/month.helpers';

interface Props { months: MonthGroup[]; activeKey: string; onChange: (key: string) => void; }

export function SpreadsheetMonthTabs({ months, activeKey, onChange }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  useMemo(() => months.findIndex((m) => m.key === activeKey), [months, activeKey]);
  if (months.length <= 1) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wrap}>
      {months.map((m) => {
        const isActive = m.key === activeKey;
        const tomadas = m.sesiones.filter((s) => s.estado === 'tomada').length;
        return (
          <MotiPressable key={m.key} onPress={() => onChange(m.key)} animate={({ pressed }) => { 'worklet'; return { scale: pressed ? 0.97 : 1 }; }}>
            <MotiView animate={{ backgroundColor: isActive ? c.primary : c.backgroundSecondary, borderColor: isActive ? c.primary : c.border }} transition={{ type: 'timing', duration: 200 }} style={styles.tab}>
              <Text style={[styles.label, { color: isActive ? c.primaryForeground : c.textSecondary }]}>{m.label}</Text>
              <Text style={[styles.sub, { color: isActive ? c.primaryForeground + 'CC' : c.textMuted }]}>{tomadas} tomadas · {m.sesiones.length}</Text>
            </MotiView>
          </MotiPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, paddingVertical: 6, paddingHorizontal: 2 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, minWidth: 110 },
  label: { fontSize: 12, fontWeight: '700' },
  sub: { fontSize: 9, fontWeight: '500', marginTop: 1 },
});
