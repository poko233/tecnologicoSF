import { useTheme } from '@theme'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Area } from './area.types'

interface Props {
  initialData: Area | null
  onSave: (data: Partial<Area>) => Promise<void>
  onCancel: () => void
}

export function AreaForm({ initialData, onSave, onCancel }: Props) {
  const { theme } = useTheme()
  const [nombre, setNombre] = useState('')
  const [descripccion, setDescripccion] = useState('')
  const [activo, setActivo] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre ?? '')
      setDescripccion(initialData.descripccion ?? '')
      setActivo(initialData.estado === 'activo')
    } else {
      setNombre('')
      setDescripccion('')
      setActivo(true)
    }
  }, [initialData])

  const handleSave = async () => {
    setSaving(true)
    await onSave({ nombre, descripccion, estado: activo ? 'activo' : 'inactivo' })
    setSaving(false)
  }

  const inputStyle = [styles.input, {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.inputBorder,
    color: theme.colors.text,
  }]

  return (
    <View>
      <Text style={[styles.label, { color: theme.colors.text }]}>Nombre *</Text>
      <TextInput style={inputStyle} value={nombre} onChangeText={setNombre} placeholder="Nombre del área" placeholderTextColor={theme.colors.textMuted} />

      <Text style={[styles.label, { color: theme.colors.text }]}>Descripción</Text>
      <TextInput style={[...inputStyle, styles.multiline]} value={descripccion} onChangeText={setDescripccion} placeholder="Descripción opcional" placeholderTextColor={theme.colors.textMuted} multiline numberOfLines={3} />

      <View style={styles.switchRow}>
        <Text style={[styles.label, { color: theme.colors.text, marginBottom: 0 }]}>Estado activo</Text>
        <Switch value={activo} onValueChange={setActivo} thumbColor={activo ? theme.colors.primary : '#ccc'} trackColor={{ false: '#ddd', true: theme.colors.primary + '60' }} />
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
  multiline: { height: 80, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  btns: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 9, alignItems: 'center' },
  btnOutline: { borderWidth: 1, backgroundColor: 'transparent' },
  btnText: { fontWeight: '700', fontSize: 15 },
})
