import { useTheme } from '@theme'
import React from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'

interface Props {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChangeText, placeholder = 'Buscar...' }: Props) {
  const { theme } = useTheme()

  return (
    <View style={[styles.container, {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    }]}>
      {/* Lupa */}
      <View style={styles.icon}>
        <View style={[styles.lupa, { borderColor: theme.colors.text }]} />
        <View style={[styles.lupaMango, { backgroundColor: theme.colors.text }]} />
      </View>

      <TextInput
        style={[styles.input, { color: theme.colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
      />

      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} style={styles.clearBtn}>
          <View style={[styles.clearIcon, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.xLine1, { backgroundColor: theme.colors.card }]} />
            <View style={[styles.xLine2, { backgroundColor: theme.colors.card }]} />
          </View>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  icon: { marginRight: 8, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  lupa: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, position: 'absolute', top: 0, left: 0 },
  lupaMango: { width: 2, height: 6, position: 'absolute', bottom: 0, right: 2, transform: [{ rotate: '-45deg' }] },
  input: { flex: 1, fontSize: 14 },
  clearBtn: { padding: 4 },
  clearIcon: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  xLine1: { width: 10, height: 2, position: 'absolute', transform: [{ rotate: '45deg' }] },
  xLine2: { width: 10, height: 2, position: 'absolute', transform: [{ rotate: '-45deg' }] },
})
