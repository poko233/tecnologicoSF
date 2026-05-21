import { useTheme } from '@theme'
import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { ColumnDef } from '../types/admin.types'
import { StatusBadge } from './StatusBadge'

interface Props {
  columns: ColumnDef[]
  data: any[]
  onEdit: (item: any) => void
  onDelete: (item: any) => void
}

export function AdminTable({ columns, data, onEdit, onDelete }: Props) {
  const { theme } = useTheme()

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.table, { borderColor: theme.colors.border }]}>
        {/* Header */}
        <View style={[styles.headerRow, { backgroundColor: theme.colors.secondary }]}>
          {columns.map((col) => (
            <Text
              key={col.key}
              style={[
                styles.headerCell,
                { color: theme.colors.text, borderColor: theme.colors.border },
                col.width ? { width: col.width } : { flex: col.flex ?? 1 },
              ]}
            >
              {col.header}
            </Text>
          ))}
          <Text style={[styles.headerCell, styles.actionsCell, {
            color: theme.colors.text, borderColor: theme.colors.border,
          }]}>
            Acciones
          </Text>
        </View>

        {/* Rows */}
        {data.map((item, index) => (
          <View
            key={index}
            style={[
              styles.row,
              { backgroundColor: index % 2 === 0 ? theme.colors.card : theme.colors.backgroundSecondary },
            ]}
          >
            {columns.map((col) => {
              const value = item[col.key]
              return (
                <View
                  key={col.key}
                  style={[
                    styles.cell,
                    { borderColor: theme.colors.border },
                    col.width ? { width: col.width } : { flex: col.flex ?? 1 },
                  ]}
                >
                  {col.render ? (
                    col.render(value, item) as any
                  ) : col.key === 'estado' || col.key === 'estadoCarrera' ? (
                    <StatusBadge status={value ?? 'inactivo'} />
                  ) : (
                    <Text style={[styles.cellText, { color: theme.colors.text }]} numberOfLines={2}>
                      {value != null ? String(value) : '—'}
                    </Text>
                  )}
                </View>
              )
            })}
            <View style={[styles.cell, styles.actionsCell, { borderColor: theme.colors.border }]}>
              <View style={styles.actionBtns}>
                <Pressable
                  onPress={() => onEdit(item)}
                  style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
                >
                  <Text style={[styles.actionBtnText, { color: theme.colors.primaryForeground }]}>
                    Editar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => onDelete(item)}
                  style={[styles.actionBtn, styles.actionBtnDanger, { borderColor: theme.colors.destructive }]}
                >
                  <Text style={[styles.actionBtnText, { color: theme.colors.destructive }]}>
                    Eliminar
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  table: { borderWidth: 1, borderRadius: 10, overflow: 'hidden', minWidth: '100%' },
  headerRow: { flexDirection: 'row' },
  headerCell: {
    padding: 12,
    fontWeight: '700',
    fontSize: 13,
    borderRightWidth: 1,
  },
  row: { flexDirection: 'row', borderTopWidth: 1 },
  cell: {
    padding: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
  },
  cellText: { fontSize: 13 },
  actionsCell: { width: 160 },
  actionBtns: { flexDirection: 'row', gap: 6 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  actionBtnDanger: { backgroundColor: 'transparent', borderWidth: 1 },
  actionBtnText: { fontSize: 12, fontWeight: '600' },
})
