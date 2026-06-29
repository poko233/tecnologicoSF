import { useTheme } from '@theme'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { Carrera } from '../carreras/carrera.types'
import { carreraService } from '../carreras/carreraService'
import { Materia } from './materia.types'
import { materiaService } from './materiaService'

interface Props {
  initialData: Materia | null
  onSave: (data: any) => Promise<void>
  onCancel: () => void
}

export function MateriaForm({ initialData, onSave, onCancel }: Props) {
  const { theme } = useTheme()
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [saving, setSaving] = useState(false)
  const [showPrereqs, setShowPrereqs] = useState(false)
  const [form, setForm] = useState({
    nombreMateria: '', codigo: '', semestre: '1',
    idPrerequisito: '', idCarrera: '', activo: true,
  })

  useEffect(() => {
    carreraService.getAll().then(setCarreras).catch(() => {})
    materiaService.getAll().then(setMaterias).catch(() => {})
  }, [])

  useEffect(() => {
    if (initialData) {
      setForm({
        nombreMateria: initialData.nombreMateria ?? '',
        codigo: initialData.codigo ?? '',
        semestre: String(initialData.semestre ?? 1),
        idPrerequisito: String(initialData.idPrerequisito ?? ''),
        idCarrera: '',
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
      nombreMateria: form.nombreMateria,
      codigo: form.codigo,
      semestre: Number(form.semestre),
      estado: form.activo ? 'activo' : 'inactivo',
      idPrerequisito: form.idPrerequisito ? Number(form.idPrerequisito) : undefined,
      idCarrera: form.idCarrera ? Number(form.idCarrera) : undefined,
    })
    setSaving(false)
  }

  return (
    <View>
      <Text style={lbl}>Nombre *</Text>
      <TextInput style={inp} value={form.nombreMateria} onChangeText={set('nombreMateria')} placeholder="Nombre de la materia" placeholderTextColor={theme.colors.textMuted} />

      <Text style={lbl}>Código *</Text>
      <TextInput style={inp} value={form.codigo} onChangeText={set('codigo')} placeholder="PRG-001" placeholderTextColor={theme.colors.textMuted} />

      <Text style={lbl}>Semestre * (1-12)</Text>
      <TextInput style={inp} value={form.semestre} onChangeText={set('semestre')} keyboardType="numeric" placeholder="1" placeholderTextColor={theme.colors.textMuted} />

      <Text style={lbl}>Carrera</Text>
      <View style={styles.chipRow}>
        {carreras.map(c => (
          <Pressable key={c.idCarrera} onPress={() => setForm(f => ({ ...f, idCarrera: String(c.idCarrera) }))}
            style={[styles.chip, { backgroundColor: form.idCarrera === String(c.idCarrera) ? theme.colors.primary : theme.colors.secondary, borderColor: theme.colors.border }]}>
            <Text style={{ color: form.idCarrera === String(c.idCarrera) ? theme.colors.primaryForeground : theme.colors.text, fontSize: 12 }}>{c.nombreCarrera}</Text>
          </Pressable>
        ))}
      </View>

      {/* Prerrequisito - acordeón */}
      <Pressable
        onPress={() => setShowPrereqs(v => !v)}
        style={{
          marginTop: 14,
          marginBottom: 6,
          backgroundColor: theme.colors.secondary,
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 13 }}>
            Prerrequisito
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 16 }}>
            {showPrereqs ? '▲' : '▼'}
          </Text>
        </View>
        <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 4 }}>
          Materia que el estudiante debe aprobar antes de inscribirse en esta.
        </Text>
        <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600', marginTop: 6 }}>
          {form.idPrerequisito
            ? `✓ ${materias.find(m => String(m.idMateria) === form.idPrerequisito)?.nombreMateria ?? '—'}`
            : 'Ninguno (opcional)'}
        </Text>
      </Pressable>

      {showPrereqs && (
        <View style={styles.chipRow}>
          <Pressable
            onPress={() => { setForm(f => ({ ...f, idPrerequisito: '' })); setShowPrereqs(false) }}
            style={[styles.chip, {
              backgroundColor: !form.idPrerequisito ? theme.colors.primary : theme.colors.secondary,
              borderColor: theme.colors.border,
            }]}
          >
            <Text style={{ color: !form.idPrerequisito ? theme.colors.primaryForeground : theme.colors.text, fontSize: 12 }}>
              Sin prerrequisito
            </Text>
          </Pressable>
          {materias.filter(m => m.idMateria !== initialData?.idMateria).map(m => (
            <Pressable
              key={m.idMateria}
              onPress={() => { setForm(f => ({ ...f, idPrerequisito: String(m.idMateria) })); setShowPrereqs(false) }}
              style={[styles.chip, {
                backgroundColor: form.idPrerequisito === String(m.idMateria) ? theme.colors.primary : theme.colors.secondary,
                borderColor: theme.colors.border,
              }]}
            >
              <Text style={{ color: form.idPrerequisito === String(m.idMateria) ? theme.colors.primaryForeground : theme.colors.text, fontSize: 12 }}>
                {m.nombreMateria}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  btns: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 9, alignItems: 'center' },
  btnOutline: { borderWidth: 1, backgroundColor: 'transparent' },
  btnText: { fontWeight: '700', fontSize: 15 },
})
