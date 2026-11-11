// screens/asistencia/components/spreadsheet/SpreadsheetEmptyState.tsx
import { useTheme } from '@/theme/useTheme';
import { AlertTriangle, ArrowLeft, CalendarRange, Clock } from 'lucide-react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RequiresConfiguracion } from '../../types/asistencia.types';

interface Props { kind: RequiresConfiguracion; onBack: () => void; onConfigurarFechas?: () => void; }

export function SpreadsheetEmptyState({ kind, onBack, onConfigurarFechas }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const config = kind === 'fechas'
    ? { icon: CalendarRange, title: 'Fechas de la materia no configuradas', message: 'Debes registrar un rango de fechas para que el sistema genere las sesiones de este grupo.', cta: 'Configurar fechas', onCta: onConfigurarFechas }
    : { icon: Clock, title: 'Este grupo no tiene horarios', message: 'Necesitas que un administrador asigne horarios al grupo antes de poder tomar asistencia.', cta: null, onCta: null };
  const Icon = config.icon;
  return (
    <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 320 }}
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border, shadowColor: c.shadow }]}>
      <View style={[styles.iconCircle, { backgroundColor: c.warning + '15' }]}><AlertTriangle size={28} color={c.warning} /></View>
      <Text style={[styles.title, { color: c.text }]}>{config.title}</Text>
      <Text style={[styles.message, { color: c.textSecondary }]}>{config.message}</Text>
      <View style={styles.actions}>
        <MotiPressable onPress={onBack}><View style={[styles.btn, { backgroundColor: c.backgroundSecondary, borderColor: c.border }]}><ArrowLeft size={14} color={c.text} /><Text style={[styles.btnText, { color: c.text }]}>Volver a grupos</Text></View></MotiPressable>
        {config.cta && config.onCta && (
          <MotiPressable onPress={config.onCta}><View style={[styles.btn, { backgroundColor: c.primary, borderColor: c.primary }]}><Icon size={14} color={c.primaryForeground} /><Text style={[styles.btnText, { color: c.primaryForeground }]}>{config.cta}</Text></View></MotiPressable>
        )}
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: { margin: 24, padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 12, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  message: { fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 420 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  btnText: { fontSize: 12, fontWeight: '700' },
});
