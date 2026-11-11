// screens/asistencia/components/spreadsheet/SpreadsheetToolbar.tsx
import { useTheme } from '@/theme/useTheme';
import { ArrowLeft, CalendarRange, FileText, RefreshCw, Search, Table } from 'lucide-react-native';
import { MotiPressable } from 'moti/interactions';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { GrupoData } from '../../types/asistencia.types';
import { SpreadsheetLegend } from './SpreadsheetLegend';

interface Props {
  data: GrupoData; query: string; onQueryChange: (q: string) => void; onBack: () => void; onRefresh: () => void;
  onConfigurarFechas: () => void; onExportExcel: () => void; onExportPdf: () => void; showConfigurarFechas: boolean;
  gestionCerrada: boolean; sesionesTomadas: number; sesionesTotales: number; asistenciaGlobal: number; refreshing: boolean;
  hasChanges?: boolean; pendingCount?: number; savingAll?: boolean; onSaveAll?: () => void; onDiscard?: () => void;
}

export function SpreadsheetToolbar({ data, query, onQueryChange, onBack, onRefresh, onConfigurarFechas, onExportExcel, onExportPdf, showConfigurarFechas, gestionCerrada, sesionesTomadas, sesionesTotales, asistenciaGlobal, refreshing, hasChanges, pendingCount, savingAll, onSaveAll, onDiscard }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const gmd = data.grupo_materia_docente;
  return (
    <View style={[styles.wrap, { backgroundColor: c.card, borderBottomColor: c.border }]}>
      <View style={styles.row}>
        <MotiPressable onPress={onBack} animate={({ pressed }) => { 'worklet'; return { scale: pressed ? 0.94 : 1 }; }}>
          <View style={[styles.iconBtn, { backgroundColor: c.backgroundSecondary }]}><ArrowLeft size={18} color={c.primary} /></View>
        </MotiPressable>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[styles.title, { color: c.text }]}>{gmd.grupo}</Text>
          <Text numberOfLines={1} style={[styles.subtitle, { color: c.textSecondary }]}>{gmd.materia} · Turno {gmd.turno}{gmd.carrera ? ` · ${gmd.carrera}` : ''}</Text>
        </View>
        <View style={[styles.kpi, { borderColor: c.border, backgroundColor: c.backgroundSecondary }]}>
          <View style={styles.kpiCol}><Text style={[styles.kpiLabel, { color: c.textMuted }]}>TOMADAS</Text><Text style={[styles.kpiValue, { color: c.text }]}>{sesionesTomadas}/{sesionesTotales}</Text></View>
          <View style={[styles.kpiDivider, { backgroundColor: c.border }]} />
          <View style={styles.kpiCol}><Text style={[styles.kpiLabel, { color: c.textMuted }]}>GLOBAL</Text><Text style={[styles.kpiValue, { color: c.success }]}>{asistenciaGlobal.toFixed(1)}%</Text></View>
        </View>
      </View>
      <View style={styles.row2}>
        <View style={[styles.searchBox, { backgroundColor: c.input, borderColor: c.inputBorder }]}>
          <Search size={14} color={c.textSecondary} />
          <TextInput placeholder="Buscar estudiante o C.I..." placeholderTextColor={c.textMuted} value={query} onChangeText={onQueryChange} style={[styles.searchInput, { color: c.text }]} />
        </View>
        <SpreadsheetLegend />
        <View style={styles.actions}>
          {showConfigurarFechas && (
            <MotiPressable onPress={onConfigurarFechas} disabled={gestionCerrada} animate={({ pressed }) => { 'worklet'; return { scale: pressed ? 0.96 : 1 }; }}>
              <View style={[styles.actionBtn, { backgroundColor: c.backgroundSecondary, borderColor: c.border, opacity: gestionCerrada ? 0.5 : 1 }]}>
                <CalendarRange size={14} color={c.primary} />
                <Text style={[styles.actionText, { color: c.text }]}>Configurar Fechas</Text>
              </View>
            </MotiPressable>
          )}
          <MotiPressable onPress={onExportExcel} animate={({ pressed }) => { 'worklet'; return { scale: pressed ? 0.96 : 1 }; }}>
            <View style={[styles.actionBtn, { backgroundColor: c.success + '15', borderColor: c.success + '55' }]}><Table size={14} color={c.success} /><Text style={[styles.actionText, { color: c.success }]}>Excel</Text></View>
          </MotiPressable>
          <MotiPressable onPress={onExportPdf} animate={({ pressed }) => { 'worklet'; return { scale: pressed ? 0.96 : 1 }; }}>
            <View style={[styles.actionBtn, { backgroundColor: c.destructive + '15', borderColor: c.destructive + '55' }]}><FileText size={14} color={c.destructive} /><Text style={[styles.actionText, { color: c.destructive }]}>PDF</Text></View>
          </MotiPressable>
          {hasChanges && (
            <>
              <MotiPressable onPress={onDiscard} animate={({ pressed }) => { 'worklet'; return { scale: pressed ? 0.96 : 1 }; }}>
                <View style={[styles.actionBtn, { backgroundColor: c.backgroundSecondary, borderColor: c.border }]}>
                  <Text style={[styles.actionText, { color: c.textSecondary }]}>Descartar</Text>
                </View>
              </MotiPressable>
              <MotiPressable onPress={onSaveAll} disabled={savingAll} animate={({ pressed }) => { 'worklet'; return { scale: pressed ? 0.96 : 1 }; }}>
                <View style={[styles.actionBtn, { backgroundColor: c.primary, borderColor: c.primary, opacity: savingAll ? 0.6 : 1 }]}>
                  {savingAll ? <ActivityIndicator size="small" color={c.primaryForeground} /> : null}
                  <Text style={[styles.actionText, { color: c.primaryForeground }]}>Guardar{pendingCount ? ` (${pendingCount})` : ""}</Text>
                </View>
              </MotiPressable>
            </>
          )}

          <MotiPressable onPress={onRefresh} animate={({ pressed }) => { 'worklet'; return { scale: pressed ? 0.96 : 1 }; }}>
            <View style={[styles.iconBtn, { backgroundColor: c.backgroundSecondary }]}>{refreshing ? <ActivityIndicator size="small" color={c.text} /> : <RefreshCw size={14} color={c.text} />}</View>
          </MotiPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  row2: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  iconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '800' },
  subtitle: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  kpi: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, gap: 6 },
  kpiCol: { alignItems: 'flex-end' },
  kpiLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 0.4 },
  kpiValue: { fontSize: 12, fontWeight: '800' },
  kpiDivider: { width: 1, height: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, height: 30, minWidth: 220, maxWidth: 320, flex: 1 },
  searchInput: { flex: 1, fontSize: 12, padding: 0 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  actionText: { fontSize: 11, fontWeight: '700' },
});
