import { useTheme } from '@theme'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { Grupo, Horario } from './grupo.types'

interface Props {
  initialData: Grupo | null
  onSave: (data: Partial<Grupo>) => Promise<void>
  onCancel: () => void
}

const TURNOS = ['Mañana', 'Tarde', 'Noche']
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function GrupoForm({ initialData, onSave, onCancel }: Props) {
  const { theme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nombre: '', codigo: '', paralelo: '', turno: 'Mañana',
    gestion: '', cupos: '', activo: true,
  })
  const [horarios, setHorarios] = useState<Horario[]>([])

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre ?? '',
        codigo: initialData.codigo ?? '',
        paralelo: initialData.paralelo ?? '',
        turno: initialData.turno ?? 'Mañana',
        gestion: initialData.gestion ?? '',
        cupos: String(initialData.cupos ?? ''),
        activo: initialData.estado === 'activo',
      })
      setHorarios(
        (initialData.horarios ?? []).map(h => ({
          idHorario: h.idHorario,
          dia: h.dia,
          horaInicio: h.horaInicio?.slice(0, 5) ?? '',
          horaFin: h.horaFin?.slice(0, 5) ?? '',
        }))
      )
    } else {
      setForm({ nombre: '', codigo: '', paralelo: '', turno: 'Mañana', gestion: '', cupos: '', activo: true })
      setHorarios([])
    }
  }, [initialData])

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }))
  const inp = [styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.inputBorder, color: theme.colors.text }]
  const lbl = [styles.label, { color: theme.colors.text }]

  // — Horarios helpers —
  const addHorario = () =>
    setHorarios(h => [...h, { dia: 'Lunes', horaInicio: '08:00', horaFin: '10:00' }])

  const removeHorario = (i: number) =>
    setHorarios(h => h.filter((_, idx) => idx !== i))

  const setHorario = (i: number, key: keyof Horario, val: string) =>
    setHorarios(h => h.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  const [cuposError, setCuposError] = useState('')
  const handleSave = async () => {
  // Validar cupos
  if (!form.cupos || isNaN(Number(form.cupos)) || Number(form.cupos) <= 0) {
    setCuposError('Los cupos son requeridos y deben ser un número válido.')
    return
  }
  setCuposError('')
  setSaving(true)
    await onSave({
      nombre: form.nombre,
      codigo: form.codigo,
      turno: form.turno,
      gestion: form.gestion,
      cupos: Number(form.cupos),
      estado: form.activo ? 'activo' : 'inactivo',
      tipo: 'Curso',         
      horarios: horarios.map(({ dia, horaInicio, horaFin }) => ({ dia, horaInicio, horaFin })),
      ...(form.paralelo.trim() && { paralelo: form.paralelo }),
    })
    setSaving(false)
  }

  return (
    <View>
      {/* ── campos existentes (igual que antes) ── */}
      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Nombre *</Text>
          <TextInput style={inp} value={form.nombre} onChangeText={set('nombre')} placeholder="Grupo A" placeholderTextColor={theme.colors.textMuted} />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Código *</Text>
          <TextInput style={inp} value={form.codigo} onChangeText={set('codigo')} placeholder="GRP-001" placeholderTextColor={theme.colors.textMuted} />
        </View>
      </View>

      <Text style={lbl}>Paralelo</Text>
      <TextInput style={inp} value={form.paralelo} onChangeText={set('paralelo')} placeholder="A" placeholderTextColor={theme.colors.textMuted} />

      <Text style={lbl}>Turno</Text>
      <View style={styles.chipRow}>
        {TURNOS.map(t => (
          <Pressable key={t} onPress={() => setForm(f => ({ ...f, turno: t }))}
            style={[styles.chip, { backgroundColor: form.turno === t ? theme.colors.primary : theme.colors.secondary, borderColor: theme.colors.border }]}>
            <Text style={{ color: form.turno === t ? theme.colors.primaryForeground : theme.colors.text, fontSize: 13 }}>{t}</Text>
          </Pressable>
        ))}
      </View>

      {/* Gestión + Cupos */}
      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Gestión</Text>
          <TextInput style={inp} value={form.gestion} onChangeText={set('gestion')} placeholder="2024-I" placeholderTextColor={theme.colors.textMuted} />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Cupos *</Text>
          <TextInput
            style={[inp, cuposError ? { borderColor: theme.colors.destructive } : {}]}
            value={form.cupos}
            onChangeText={v => { set('cupos')(v); setCuposError('') }}
            keyboardType="numeric"
            placeholder="30"
            placeholderTextColor={theme.colors.textMuted}
          />
          {cuposError ? <Text style={{ color: theme.colors.destructive, fontSize: 11, marginTop: 3 }}>{cuposError}</Text> : null}
        </View>
      </View>

      {/* ── SECCIÓN HORARIOS ── */}
      <View style={[styles.horarioSection, { borderColor: theme.colors.border }]}>
        <View style={styles.horarioHeader}>
          <Text style={[styles.horarioTitle, { color: theme.colors.primary }]}>🕐 Horarios de Clase</Text>
          <Pressable onPress={addHorario} style={styles.addBtn}>
            <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600' }}>⊕ Agregar Horario</Text>
          </Pressable>
        </View>

        {horarios.length === 0 && (
          <Text style={{ color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 10 }}>
            Sin horarios. Toca "Agregar Horario".
          </Text>
        )}

        {horarios.map((h, i) => (
          <View key={i} style={[styles.horarioRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.backgroundSecondary }]}>
            {/* Día — selector con chips compactos */}
            <View style={{ flex: 2 }}>
              <Text style={[styles.horarioLabel, { color: theme.colors.textMuted }]}>Día</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {DIAS.map(d => (
                    <Pressable key={d} onPress={() => setHorario(i, 'dia', d)}
                      style={[styles.diaChip, {
                        backgroundColor: h.dia === d ? theme.colors.primary : theme.colors.secondary,
                        borderColor: theme.colors.border,
                      }]}>
                      <Text style={{ fontSize: 11, color: h.dia === d ? theme.colors.primaryForeground : theme.colors.text }}>
                        {d.slice(0, 3)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Inicio / Fin */}
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.horarioLabel, { color: theme.colors.textMuted }]}>Inicio</Text>
              <TextInput
                style={[styles.timeInput, { borderColor: theme.colors.inputBorder, color: theme.colors.text, backgroundColor: theme.colors.background }]}
                value={h.horaInicio} onChangeText={v => setHorario(i, 'horaInicio', v)}
                placeholder="08:00" placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={[styles.horarioLabel, { color: theme.colors.textMuted }]}>Fin</Text>
              <TextInput
                style={[styles.timeInput, { borderColor: theme.colors.inputBorder, color: theme.colors.text, backgroundColor: theme.colors.background }]}
                value={h.horaFin} onChangeText={v => setHorario(i, 'horaFin', v)}
                placeholder="10:00" placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            {/* Eliminar */}
            <Pressable onPress={() => removeHorario(i)} style={styles.removeBtn}>
              <Text style={{ color: theme.colors.destructive, fontSize: 18 }}>✕</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.switchRow}>
        <Text style={[lbl, { marginBottom: 0, marginTop: 0 }]}>Estado activo</Text>
        <Switch value={form.activo} onValueChange={v => setForm(f => ({ ...f, activo: v }))} thumbColor={form.activo ? theme.colors.primary : '#ccc'} trackColor={{ false: '#ddd', true: theme.colors.primary + '60' }} />
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
  row2: { flexDirection: 'row' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  btns: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 9, alignItems: 'center' },
  btnOutline: { borderWidth: 1, backgroundColor: 'transparent' },
  btnText: { fontWeight: '700', fontSize: 15 },
  // horarios
  horarioSection: { marginTop: 18, borderWidth: 1, borderRadius: 10, padding: 12 },
  horarioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  horarioTitle: { fontSize: 13, fontWeight: '700' },
  addBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  horarioRow: { flexDirection: 'row', alignItems: 'flex-end', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 },
  horarioLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  diaChip: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  timeInput: { borderWidth: 1, borderRadius: 7, padding: 8, fontSize: 13, textAlign: 'center' },
  removeBtn: { marginLeft: 8, marginBottom: 2, padding: 4 },
})