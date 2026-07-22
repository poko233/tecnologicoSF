// screens/admin/academico/components/AdminTable.tsx
import { useTheme } from '@theme'
import { ChevronRight, Pencil, Trash2 } from 'lucide-react-native'
import React, { useState } from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { ColumnDef } from '../types/admin.types'
import { StatusBadge } from './StatusBadge'

interface Props {
  columns: ColumnDef[]
  data: any[]
  onEdit: (item: any) => void
  onDelete: (item: any) => void
}

const DEFAULT_FLEX_WIDTH = 140
const ACTIONS_WIDTH = 80

export function AdminTable({ columns, data, onEdit, onDelete }: Props) {
  const { theme } = useTheme()
  const [containerWidth, setContainerWidth] = useState(0)
  const [showRightHint, setShowRightHint] = useState(true)

  // Ancho "natural" que ocuparía la tabla si cada columna usa su width fijo
  const naturalWidth =
    columns.reduce((acc, col) => acc + (col.width ?? DEFAULT_FLEX_WIDTH), 0) +
    ACTIONS_WIDTH

  // Solo activamos modo "scroll fijo" si la tabla NO cabe en la pantalla
  const needsScroll = containerWidth > 0 && naturalWidth > containerWidth

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent
    const isAtEnd =
      contentOffset.x + layoutMeasurement.width >= contentSize.width - 10
    setShowRightHint(!isAtEnd)
  }

  // Ancho de cada columna: fijo si needsScroll, flex si cabe en pantalla
  const colStyle = (col: ColumnDef) =>
    needsScroll
      ? { width: col.width ?? DEFAULT_FLEX_WIDTH }
      : col.width
        ? { width: col.width }
        : { flex: col.flex ?? 1 }

  const renderHeader = () => (
    <View
      style={[
        styles.headerRow,
        {
          backgroundColor: theme.colors.secondary,
          borderBottomWidth: 1,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {columns.map((col) => (
        <Text
          key={col.key}
          style={[styles.headerCell, { color: theme.colors.text }, colStyle(col)]}
          numberOfLines={1}
        >
          {col.header}
        </Text>
      ))}
      <Text
        style={[
          styles.headerCell,
          needsScroll ? { width: ACTIONS_WIDTH } : { width: ACTIONS_WIDTH },
        ]}
      />
    </View>
  )

  const renderRows = () => (
    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator bounces>
      {data.map((item, index) => (
        <View
          key={index}
          style={[
            styles.row,
            {
              backgroundColor:
                index % 2 === 0 ? theme.colors.card : theme.colors.backgroundSecondary,
              borderBottomWidth: 1,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {columns.map((col) => {
            const value = item[col.key]
            return (
              <View key={col.key} style={[styles.cell, colStyle(col)]}>
                {col.render ? (
                  (col.render(value, item) as any)
                ) : col.key === 'estado' || col.key === 'estadoCarrera' ? (
                  <StatusBadge status={value ?? 'inactivo'} />
                ) : (
                  <Text
                    style={[styles.cellText, { color: theme.colors.text }]}
                    numberOfLines={2}
                  >
                    {value != null ? String(value) : '—'}
                  </Text>
                )}
              </View>
            )
          })}

          <View style={[styles.cell, { width: ACTIONS_WIDTH }]}>
            <View style={styles.actionBtns}>
              <Pressable
                onPress={() => onEdit(item)}
                style={[styles.iconBtn, { backgroundColor: theme.colors.primary }]}
              >
                <Pencil size={16} color={theme.colors.primaryForeground} />
              </Pressable>
              <Pressable
                onPress={() => onDelete(item)}
                style={[
                  styles.iconBtn,
                  styles.iconBtnDanger,
                  { borderColor: theme.colors.destructive },
                ]}
              >
                <Trash2 size={16} color={theme.colors.destructive} />
              </Pressable>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  )

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {needsScroll && (
        <View style={[styles.scrollHint, { backgroundColor: theme.colors.secondary }]}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
            Desliza para ver más columnas
          </Text>
          <ChevronRight size={14} color={theme.colors.textSecondary} />
        </View>
      )}

      <View style={{ flex: 1 }}>
        {needsScroll ? (
          // Tabla ANCHA (ej: Grupos) → scroll horizontal con ancho fijo
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            contentContainerStyle={{ minWidth: naturalWidth }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={{ width: naturalWidth }}>
              {renderHeader()}
              {renderRows()}
            </View>
          </ScrollView>
        ) : (
          // Tabla que CABE (ej: Carreras, Materias) → sin scroll, flex normal
          <View style={{ flex: 1 }}>
            {renderHeader()}
            {renderRows()}
          </View>
        )}

        {needsScroll && showRightHint && (
          <View
            pointerEvents="none"
            style={[styles.fadeRight, { backgroundColor: theme.colors.background }]}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  headerRow: { flexDirection: 'row' },
  headerCell: {
    padding: 16,
    fontWeight: '700',
    fontSize: 14,
  },
  row: { flexDirection: 'row' },
  cell: {
    padding: 14,
    justifyContent: 'center',
  },
  cellText: { fontSize: 14 },
  actionBtns: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.3,
  },
})