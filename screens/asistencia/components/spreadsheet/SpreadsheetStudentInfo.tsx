// screens/asistencia/components/spreadsheet/SpreadsheetStudentInfo.tsx
import { useTheme } from '@/theme/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatFullName, StudentScore } from '../../helpers/attendance.helpers';
import { EstudianteAsistencia } from '../../types/asistencia.types';

export const ROW_H = 34;
export const COL_NUM_W = 30;
export const COL_NAME_W = 220;
export const COL_CI_W = 88;
export const COL_STATS_W = 104;
export const STICKY_TOTAL_W = COL_NUM_W + COL_NAME_W + COL_CI_W + COL_STATS_W;

interface Props { index: number; estudiante: EstudianteAsistencia; score: StudentScore; onPress: () => void; }

function scoreBadge(score: StudentScore, c: any) {
  if (score.pts >= 8.5) return { bg: c.success + '22', fg: c.success };
  if (score.pts >= 7) return { bg: c.warning + '22', fg: c.warning };
  return { bg: c.destructive + '22', fg: c.destructive };
}

export function SpreadsheetStudentInfo({ index, estudiante, score, onPress }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const badge = scoreBadge(score, c);
  return (
    <View style={[styles.row, { borderBottomColor: c.divider, backgroundColor: c.card }]}>
      <View style={[styles.num, { borderRightColor: c.divider }]}>
        <Text style={[styles.numText, { color: c.textMuted }]}>{index + 1}</Text>
      </View>
      <View style={[styles.name, { borderRightColor: c.divider }]} onTouchEnd={onPress}>
        <Text numberOfLines={1} style={[styles.nameText, { color: c.text }]}>{formatFullName(estudiante)}</Text>
        {estudiante.carrera ? <Text numberOfLines={1} style={[styles.carreraText, { color: c.textMuted }]}>{estudiante.carrera}</Text> : null}
      </View>
      <View style={[styles.ci, { borderRightColor: c.divider }]}>
        <Text numberOfLines={1} style={[styles.ciText, { color: c.textSecondary }]}>{estudiante.ci}</Text>
      </View>
      <View style={[styles.stats, { borderRightColor: c.border }]}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.fg }]}>{score.pts.toFixed(1)}</Text>
          <Text style={[styles.badgePct, { color: badge.fg }]}>{score.pct.toFixed(0)}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', height: ROW_H, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'stretch' },
  num: { width: COL_NUM_W, alignItems: 'center', justifyContent: 'center', borderRightWidth: StyleSheet.hairlineWidth },
  numText: { fontSize: 10, fontWeight: '600' },
  name: { width: COL_NAME_W, justifyContent: 'center', paddingHorizontal: 8, borderRightWidth: StyleSheet.hairlineWidth },
  nameText: { fontSize: 10, fontWeight: '700' },
  carreraText: { fontSize: 8, fontWeight: '500', marginTop: 1 },
  ci: { width: COL_CI_W, alignItems: 'center', justifyContent: 'center', borderRightWidth: StyleSheet.hairlineWidth },
  ciText: { fontSize: 10, fontWeight: '500' },
  stats: { width: COL_STATS_W, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  badgePct: { fontSize: 9, fontWeight: '700' },
});
