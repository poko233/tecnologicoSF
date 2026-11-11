// screens/asistencia/components/spreadsheet/SpreadsheetGrid.tsx
import { useTheme } from '@/theme/useTheme';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { calcularScoreEstudiante, getCellVisual, nextTipo, StudentScore } from '../../helpers/attendance.helpers';
import { AsistenciaTipo, EstudianteAsistencia, GrupoData, Sesion } from '../../types/asistencia.types';
import { CELL_W, SpreadsheetAttendanceCell } from './SpreadsheetAttendanceCell';
import { SpreadsheetFooter } from './SpreadsheetFooter';
import { HEADER_H, SpreadsheetSessionHeader } from './SpreadsheetSessionHeader';
import { COL_STATS_W, ROW_H, SpreadsheetStudentInfo, STICKY_TOTAL_W } from './SpreadsheetStudentInfo';

const MIN_SESSION_W = CELL_W + 4;
const MAX_SESSION_W = 90;

interface Props {
  data: GrupoData; sesiones: Sesion[]; estudiantes: EstudianteAsistencia[]; gestionCerrada: boolean; refreshing?: boolean;
  onCellPress: (sesion: Sesion, estudiante: EstudianteAsistencia, nextTipo: AsistenciaTipo) => Promise<void>;
  onSessionPress: (sesion: Sesion) => void; containerHeight: number;
}

function isToday(iso: string): boolean {
  const now = new Date();
  const y = now.getFullYear(); const m = String(now.getMonth() + 1).padStart(2, '0'); const d = String(now.getDate()).padStart(2, '0');
  return iso === `${y}-${m}-${d}`;
}

export function SpreadsheetGrid({ data, sesiones, estudiantes, gestionCerrada, refreshing, onCellPress, onSessionPress, containerHeight }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const leftListRef = useRef<FlatList<EstudianteAsistencia>>(null);
  const [rightWidth, setRightWidth] = useState(0);

  const handleRightScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    leftListRef.current?.scrollToOffset({ offset: y, animated: false });
  }, []);

  const sessionWidth = rightWidth > 0 && sesiones.length > 0
    ? Math.min(MAX_SESSION_W, Math.max(MIN_SESSION_W, Math.floor(rightWidth / sesiones.length)))
    : MIN_SESSION_W;

  const scores: Record<number, StudentScore> = React.useMemo(() => {
    const map: Record<number, StudentScore> = {};
    for (const e of estudiantes) map[e.id_inscripcion] = calcularScoreEstudiante(e, data.sesiones);
    return map;
  }, [estudiantes, data.sesiones]);
  const promedioPts = estudiantes.length === 0 ? 0 : estudiantes.reduce((acc, e) => acc + (scores[e.id_inscripcion]?.pts ?? 0), 0) / estudiantes.length;

  const handleCell = useCallback(async (sesion: Sesion, est: EstudianteAsistencia) => {
    if (sesion.estado === 'programada') {
      Toast.show({ type: 'info', text1: gestionCerrada ? 'Gestión cerrada' : 'Sesión sin tomar', text2: gestionCerrada ? 'No puedes tomar asistencia en una gestión cerrada.' : 'Primero debes tomar la sesión desde la cabecera.' });
      return;
    }
    if (sesion.estado === 'cancelada' || sesion.estado === 'feriado') {
      Toast.show({ type: 'info', text1: sesion.estado === 'feriado' ? 'Feriado' : 'Cancelada', text2: sesion.observacion ?? 'Esta sesión no admite cambios.' });
      return;
    }
    const current = est.asistencias[String(sesion.id)]?.tipo ?? null;
    const next = nextTipo(current);
    try { Haptics.selectionAsync(); await onCellPress(sesion, est, next); }
    catch (err: any) { Toast.show({ type: 'error', text1: 'No se pudo actualizar', text2: err?.message ?? 'Intenta de nuevo.' }); }
  }, [gestionCerrada, onCellPress]);

  const bodyHeight = Math.max(containerHeight - HEADER_H - ROW_H, 0);
  return (
    <View style={[styles.wrap, { height: containerHeight }]}>
      <View style={{ width: STICKY_TOTAL_W }}>
        <View style={[styles.leftHeader, { height: HEADER_H, backgroundColor: c.backgroundSecondary, borderBottomColor: c.border, borderRightColor: c.border }]}>
          <Text style={[styles.headerTitle, { color: c.textMuted }]}>ESTUDIANTES</Text>
          <View style={styles.leftHeaderCols}>
            <Text style={[styles.colHeader, { width: 30, color: c.textMuted }]}>#</Text>
            <Text style={[styles.colHeader, { width: 220, color: c.textMuted, textAlign: 'left', paddingLeft: 8 }]}>Estudiante</Text>
            <Text style={[styles.colHeader, { width: 88, color: c.textMuted }]}>C.I.</Text>
            <Text style={[styles.colHeader, { width: 104, color: c.textMuted }]}>Pts</Text>
          </View>
        </View>
        <FlatList ref={leftListRef} data={estudiantes} keyExtractor={(e) => `info-${e.id_inscripcion}`}
          renderItem={({ item, index }) => <SpreadsheetStudentInfo index={index} estudiante={item} score={scores[item.id_inscripcion] ?? { pts: 0, pct: 0, attended: 0, total: 0 }} onPress={() => {}} />}
          getItemLayout={(_, index) => ({ length: ROW_H, offset: ROW_H * index, index })}
          scrollEnabled={false} showsVerticalScrollIndicator={false} style={{ height: bodyHeight }} initialNumToRender={20} windowSize={10} removeClippedSubviews={false} />
        <View style={[styles.footerLeft, { backgroundColor: c.backgroundSecondary, borderTopColor: c.border }]}>
          <View style={[styles.footerCell, { width: 30, borderRightColor: c.border }]}><Text style={[styles.footerMuted, { color: c.textMuted }]}>∑</Text></View>
          <View style={[styles.footerCell, { width: 220, borderRightColor: c.border, alignItems: 'flex-start', paddingLeft: 8 }]}><Text style={[styles.footerLabel, { color: c.text }]}>ASISTENCIA POR SESIÓN</Text></View>
          <View style={[styles.footerCell, { width: 88, borderRightColor: c.border }]}><Text style={[styles.footerMuted, { color: c.textMuted }]}>AVG</Text></View>
          <View style={[styles.footerCell, { width: 104, borderRightColor: c.border }]}><Text style={[styles.footerPts, { color: c.warning }]}>{promedioPts.toFixed(1)}/10</Text></View>
        </View>
      </View>
      <View style={{ flex: 1 }} onLayout={(e) => setRightWidth(e.nativeEvent.layout.width)}>
        <ScrollView horizontal showsHorizontalScrollIndicator bounces={false}>
          <View>
            <View style={{ flexDirection: 'row', height: HEADER_H }}>
              {sesiones.map((s, i) => <SpreadsheetSessionHeader key={s.id} sesion={s} index={i} isToday={isToday(s.fecha)} onPress={() => onSessionPress(s)} width={sessionWidth} />)}
            </View>
            <FlatList data={estudiantes} keyExtractor={(e) => `row-${e.id_inscripcion}`}
              renderItem={({ item }) => (
                <View style={[styles.row, { borderBottomColor: c.divider, backgroundColor: c.card }]}>
                  {sesiones.map((s) => {
                    const visual = getCellVisual(item, s);
                    return <View key={s.id} style={[styles.cellWrap, { width: sessionWidth, borderRightColor: c.divider }]}><SpreadsheetAttendanceCell visual={visual} onPress={() => handleCell(s, item)} /></View>;
                  })}
                </View>
              )}
              getItemLayout={(_, index) => ({ length: ROW_H, offset: ROW_H * index, index })}
              onScroll={handleRightScroll} scrollEventThrottle={16} showsVerticalScrollIndicator style={{ height: bodyHeight }} initialNumToRender={15} windowSize={8} removeClippedSubviews />
            <SpreadsheetFooter sesiones={sesiones} sessionWidth={sessionWidth} />
          </View>
        </ScrollView>
      </View>
      {refreshing && (
        <View style={styles.refreshOverlay}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={{ color: c.textSecondary, marginTop: 8, fontSize: 12 }}>Actualizando...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, flexDirection: 'row', backgroundColor: 'transparent' },
  refreshOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.08)' },
  leftHeader: { justifyContent: 'space-between', alignItems: 'stretch', borderBottomWidth: 2, borderRightWidth: 1, paddingVertical: 6 },
  headerTitle: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6, textAlign: 'center' },
  leftHeaderCols: { flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'transparent' },
  colHeader: { fontSize: 8, fontWeight: '800', letterSpacing: 0.3, textAlign: 'center' },
  row: { flexDirection: 'row', height: ROW_H, borderBottomWidth: StyleSheet.hairlineWidth },
  cellWrap: { borderRightWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  footerLeft: { flexDirection: 'row', height: 34, borderTopWidth: 2 },
  footerCell: { justifyContent: 'center', alignItems: 'center', borderRightWidth: StyleSheet.hairlineWidth },
  footerMuted: { fontSize: 10, fontWeight: '700' },
  footerLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  footerPts: { fontSize: 11, fontWeight: '800' },
});
