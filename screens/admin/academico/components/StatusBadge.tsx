import { useTheme } from '@theme'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface Props {
  status: 'activo' | 'inactivo' | string
}

export function StatusBadge({ status }: Props) {
  const { theme } = useTheme()
  const isActive = status === 'activo'

  return (
    <View style={[
      styles.badge,
      { backgroundColor: isActive ? '#D4EDDA' : '#F8D7DA' }
    ]}>
      <Text style={[
        styles.text,
        { color: isActive ? '#155724' : '#721C24' }
      ]}>
        {isActive ? 'Activo' : 'Inactivo'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
})
