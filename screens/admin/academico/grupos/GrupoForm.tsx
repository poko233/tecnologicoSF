import { useTheme } from '@theme'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { Grupo } from './grupo.types'

interface Props {
  initialData: Grupo | null
  onSave: (data: Partial<Grupo>) => Promise<void>
  onCancel: () => void
}

const TURNOS = ['Mañana', 'Tarde', 'Noche']

export function GrupoForm({ initialData, onSave, onCancel }: Props) {
  const { theme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nombre: '', codigo: '', paralelo: '', turno: 'Mañana',
    hora_inicio: '', hora_fin: '', gestion: '', cupos: '', tipo: '', activo: true,
  })

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre ?? '',
        codigo: initialData.codigo ?? '',
        paralelo: initialData.paralelo ?? '',
        turno: initialData.turno ?? 'Mañana',
        hora_inicio: initialData.hora_inicio ?? '',
        hora_fin: initialData.hora_fin ?? '',
        gestion: initialData.gestion ?? '',
        cupos: String(initialData.cupos ?? ''),
        tipo: initialData.tipo ?? '',
        activo: initialData.estado === 'activo',
      })
    }
  }, [initialData])

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }))
  const inp = [styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.inputBorder, color: theme.colors.text }]
  const lbl = [styles.label, { color: theme.colors.text }]

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      nombre: form.nombre, codigo: form.codigo,
      paralelo: form.paralelo || undefined, turno: form.turno,
      hora_inicio: form.hora_inicio, hora_fin: form.hora_fin,
      gestion: form.gestion, cupos: Number(form.cupos),
      tipo: form.tipo || undefined,
      estado: form.activo ? 'activo' : 'inactivo',
    })
    setSaving(false)
  }

  return (
    <View>
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

      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Hora inicio</Text>
          <TextInput style={inp} value={form.hora_inicio} onChangeText={set('hora_inicio')} placeholder="08:00" placeholderTextColor={theme.colors.textMuted} />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Hora fin</Text>
          <TextInput style={inp} value={form.hora_fin} onChangeText={set('hora_fin')} placeholder="10:00" placeholderTextColor={theme.colors.textMuted} />
        </View>
      </View>

      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Gestión</Text>
          <TextInput style={inp} value={form.gestion} onChangeText={set('gestion')} placeholder="2024-I" placeholderTextColor={theme.colors.textMuted} />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={lbl}>Cupos</Text>
          <TextInput style={inp} value={form.cupos} onChangeText={set('cupos')} keyboardType="numeric" placeholder="30" placeholderTextColor={theme.colors.textMuted} />
        </View>
      </View>

      <Text style={lbl}>Tipo</Text>
      <TextInput style={inp} value={form.tipo} onChangeText={set('tipo')} placeholder="Ej: Regular" placeholderTextColor={theme.colors.textMuted} />

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
})
