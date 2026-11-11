// screens/asistencia/AsistenciaScreen.tsx
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/theme/useTheme';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { GroupSelector } from './components/GroupSelector';
import { SpreadsheetScreen } from './components/spreadsheet/SpreadsheetScreen';
import { useAsistencia } from './hooks/useAsistencia';

type Step = 'groups' | 'spreadsheet';

export function AsistenciaScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { isMobile } = useResponsive();
  const { grupos, loadingGrupos, errorGrupos, grupoData, loadingData, errorData, fetchGrupoData, refresh, saveSesion, updateSesionEstado, reopenSesionById, cleanSesionById, saveMateriaFechas, resetToGroupSelection } = useAsistencia();
  const [step, setStep] = useState<Step>('groups');
  const handleSelectGroup = (id: number) => { fetchGrupoData(id); setStep('spreadsheet'); };
  const handleBack = () => { resetToGroupSelection(); setStep('groups'); };
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      {step === 'groups' && (
        <View style={{ flex: 1 }}>
          <View style={[styles.header, { borderBottomColor: c.border, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: c.text }]}>Registro de Asistencia</Text>
              <Text style={[styles.subtitle, { color: c.textSecondary }]}>Selecciona un grupo para abrir la sábana de asistencia.</Text>
            </View>
          </View>
          {loadingGrupos ? <View style={styles.center}><ActivityIndicator size="large" color={c.primary} /></View>
            : errorGrupos ? <View style={styles.center}><Text style={{ color: c.destructive }}>{errorGrupos}</Text></View>
            : <GroupSelector grupos={grupos} onSelect={handleSelectGroup} />}
        </View>
      )}
      {step === 'spreadsheet' && (
        <SpreadsheetScreen grupoData={grupoData} loading={loadingData} error={errorData} onBack={handleBack} onRefresh={refresh}
          onSaveSesion={async (id, asist) => { await saveSesion(id, asist); await refresh(); }}
          onSaveSesionSilent={async (id, asist) => { await saveSesion(id, asist); }} onUpdateEstado={async (id, estado, motivo) => { await updateSesionEstado(id, { estado, motivo }); }}
          onReabrir={async (id) => { await reopenSesionById(id); }} onLimpiar={async (id) => { await cleanSesionById(id); }} onSaveMateriaFechas={async (fi, ff) => { await saveMateriaFechas(fi, ff); }} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 20, borderBottomWidth: 1, gap: 12 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
