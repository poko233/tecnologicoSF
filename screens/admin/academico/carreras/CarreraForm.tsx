import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet,
  Switch, Text, TextInput, View,
} from 'react-native'
import { useTheme } from '@theme'
import { Area } from '../areas/area.types'
import { areaService } from '../areas/areaService'
import { Carrera } from './carrera.types'

interface Props {
  initialData: Carrera | null
  onSave: (data: Partial<Carrera>) => Promise<void>
  onCancel: () => void
}

const REGIMEN_OPTS = ['Anual', 'Semestral', 'Mensual', 'Otro'] as const

export function CarreraForm({ initialData, onSave, onCancel }: Props) {
  const { theme } = useTheme()
  const [areas, setAreas] = useState<Area[]>([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    nombreCarrera: '',
    codigo: '',
    tipo: '',
    regimen: 'Semestral' as string,
    duracion: '',
    duracion_meses: '',
    cargaHoraria: '',
    costo_matricula: '',
    cuota_mensual: '',
    cuotas_por_anio: '',
    denominacionTitutloProfesional: '',
    idArea: '',
    estadoCarrera: true,
  })

  useEffect(() => {
    areaService.getAll().then(setAreas).catch(() => {})
  }, [])

  useEffect(() => {
    if (initialData) {
      setForm({
        nombreCarrera: initialData.nombreCarrera ?? '',
        codigo: initialData.codigo ?? '',
        tipo: initialData.tipo ?? '',
        regimen: initialData.regimen ?? 'Semestral',
        duracion: String(initialData.duracion ?? ''),
        duracion_meses: String(initialData.duracion_meses ?? ''),
        cargaHoraria: initialData.cargaHoraria ?? '',
        costo_matricula: String(initialData.costo_matricula ?? ''),
        cuota_mensual: String(initialData.cuota_mensual ?? ''),
        cuotas_por_anio: String(initialData.cuotas_por_anio ?? ''),
        denominacionTitutloProfesional: initialData.denominacionTitutloProfesional ?? '',
        idArea: String(initialData.idArea ?? ''),
        estadoCarrera: initialData.estadoCarrera === 'activo',
      })
    }
  }, [initialData])

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      nombreCarrera: form.nombreCarrera,
      codigo: form.codigo,
      tipo: form.tipo || undefined,
      regimen: form.regimen as any,
      duracion: form.duracion ? Number(form.duracion) : undefined,
      duracion_meses: form.duracion_meses ? Number(form.duracion_meses) : undefined,
      cargaHoraria: form.cargaHoraria,
      costo_matricula: form.costo_matricula ? Number(form.costo_matricula) : undefined,
      cuota_mensual: form.cuota_mensual ? Number(form.cuota_mensual) : undefined,
      cuotas_por_anio: form.cuotas_por_anio ? Number(form.cuotas_por_anio) : undefined,
      denominacionTitutloProfesional: form.denominacionTitutloProfesional,
      idArea: Number(form.idArea),
      estadoCarrera: form.estadoCarrera ? 'activo' : 'inactivo',
    })
    setSaving(false)
  }

  const inp = [styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.inputBorder, color: theme.colors.text }]
  const lbl = [styles.label, { color: theme.colors.text }]

  return (
    <View>
      <Text style={lbl}>Nombre *</Text>
      <TextInput style={inp} value={form.nombreCarrera} onChangeText={set('nombreCarrera')} placeholder="Nombre de la carrera" placeholderTextColor={theme.colors.textMuted} />

      <Text style={lbl}>Código *</Text>
      <TextInput style={inp} value={form.codigo} onChangeText={set('codigo')} placeholder="ISC-001" placeholderTextColor={theme.colors.textMuted} />

      <Text style={lbl}>Tipo</Text>
      <TextInput style={inp} value={form.tipo} onChangeText={set('tipo')} placeholder="Ej: Licenciatura" placeholderTextColor={theme.colors.textMuted} />

      <Text style={lbl}>Régimen</Text>
      <View style={styles.chipRow}>
        {REGIMEN_OPTS.map(r => (
          <Pressable key={r} onPress={() => setForm(f => ({ ...f, regimen: r }))}
            style={[styles.chip, { backgroundColor: form.regimen === r ? theme.colors.primary : theme.colors.secondary, borderColor: theme.colors.border }]}>
            <Text style={{ color: form.regimen === r ? theme.colors.primaryForeground : theme.colors.text, fontSize: 13 }}>{r}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Duración (años)</Text>
          <TextInput style={inp} value={form.duracion} onChangeText={set('duracion')} keyboardType="numeric" placeholder="5" placeholderTextColor={theme.colors.textMuted} />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Duración (meses)</Text>
          <TextInput style={inp} value={form.duracion_meses} onChangeText={set('duracion_meses')} keyboardType="numeric" placeholder="60" placeholderTextColor={theme.colors.textMuted} />
        </View>
      </View>

      <Text style={lbl}>Carga Horaria *</Text>
      <TextInput style={inp} value={form.cargaHoraria} onChangeText={set('cargaHoraria')} placeholder="40 horas semanales" placeholderTextColor={theme.colors.textMuted} />

      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Costo matrícula (Bs.)</Text>
          <TextInput style={inp} value={form.costo_matricula} onChangeText={set('costo_matricula')} keyboardType="numeric" placeholder="500" placeholderTextColor={theme.colors.textMuted} />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Cuota mensual (Bs.)</Text>
          <TextInput style={inp} value={form.cuota_mensual} onChangeText={set('cuota_mensual')} keyboardType="numeric" placeholder="350" placeholderTextColor={theme.colors.textMuted} />
        </View>
      </View>

      <Text style={lbl}>Cuotas por año</Text>
      <TextInput style={inp} value={form.cuotas_por_anio} onChangeText={set('cuotas_por_anio')} keyboardType="numeric" placeholder="12" placeholderTextColor={theme.colors.textMuted} />

      {initialData?.costo != null && (
        <View style={[styles.costoBox, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
            Costo total estimado: Bs. {initialData.costo.toLocaleString()}
          </Text>
          <Text style={{ color: theme.colors.border, fontSize: 12 }}>Calculado automáticamente por el sistema</Text>
        </View>
      )}

      <Text style={lbl}>Denominación del título *</Text>
      <TextInput style={[...inp, styles.multiline]} value={form.denominacionTitutloProfesional} onChangeText={set('denominacionTitutloProfesional')} placeholder="Licenciado en..." placeholderTextColor={theme.colors.textMuted} multiline numberOfLines={2} />

      <Text style={lbl}>Área *</Text>
      <View style={styles.chipRow}>
        {areas.map(a => (
          <Pressable key={a.idArea} onPress={() => setForm(f => ({ ...f, idArea: String(a.idArea) }))}
            style={[styles.chip, { backgroundColor: form.idArea === String(a.idArea) ? theme.colors.primary : theme.colors.secondary, borderColor: theme.colors.border }]}>
            <Text style={{ color: form.idArea === String(a.idArea) ? theme.colors.primaryForeground : theme.colors.text, fontSize: 13 }}>{a.nombre}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.switchRow}>
        <Text style={[lbl, { marginBottom: 0, marginTop: 0 }]}>Estado activo</Text>
        <Switch value={form.estadoCarrera} onValueChange={v => setForm(f => ({ ...f, estadoCarrera: v }))} thumbColor={form.estadoCarrera ? theme.colors.primary : '#ccc'} trackColor={{ false: '#ddd', true: theme.colors.primary + '60' }} />
      </View>

      <View style={styles.btns}>
        <Pressable onPress={onCancel} style={[styles.btn, styles.btnOutline, { borderColor: theme.colors.border }]}>
          <Text style={[styles.btnText, { color: theme.colors.text }]}>Cancelar</Text>
        </Pressable>
        <Pressable onPress={handleSave} disabled={saving} style={[styles.btn, { backgroundColor: theme.colors.primary, opacity: saving ? 0.7 : 1 }]}>
          {saving ? <ActivityIndicator size="small" color={theme.colors.primaryForeground} /> : <Text style={[styles.btnText, { color: theme.colors.primaryForeground }]}>Guardar</Text>}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderRadius: 8, padding: 11, fontSize: 14 },
  multiline: { height: 70, textAlignVertical: 'top' },
  row2: { flexDirection: 'row', marginTop: 0 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  costoBox: { borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 12, gap: 4 },
  btns: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 9, alignItems: 'center' },
  btnOutline: { borderWidth: 1, backgroundColor: 'transparent' },
  btnText: { fontWeight: '700', fontSize: 15 },
})
