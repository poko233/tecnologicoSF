import { useTheme } from '@theme'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ColumnDef } from '../types/admin.types'
import { StatusBadge } from './StatusBadge'

interface Props {
  item: any
  columns: ColumnDef[]
  onEdit: (item: any) => void
  onDelete: (item: any) => void
}

export function AdminCard({ item, columns, onEdit, onDelete }: Props) {
  const { theme } = useTheme()

  return (
    <View style={[styles.card, {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    }]}>
      {columns.map((col) => {
        const value = item[col.key]
        if (value == null || value === '') return null
        return (
          <View key={col.key} style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>
              {col.header}
            </Text>
            {col.render ? (
              <View>{col.render(value, item) as any}</View>
            ) : col.key === 'estado' || col.key === 'estadoCarrera' ? (
              <StatusBadge status={value} />
            ) : (
              <Text style={[styles.value, { color: theme.colors.text }]} numberOfLines={2}>
                {String(value)}
              </Text>
            )}
          </View>
        )
      })}

      <View style={styles.actions}>
        <Pressable
          onPress={() => onEdit(item)}
          style={[styles.btn, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={[styles.btnText, { color: theme.colors.primaryForeground }]}>
            Editar
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onDelete(item)}
          style={[styles.btn, styles.btnOutline, { borderColor: theme.colors.destructive }]}
        >
          <Text style={[styles.btnText, { color: theme.colors.destructive }]}>
            Eliminar
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '500', flex: 1 },
  value: { fontSize: 14, flex: 2, textAlign: 'right' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  btn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8 },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1 },
  btnText: { fontSize: 13, fontWeight: '600' },
})
