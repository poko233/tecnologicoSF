// screens/convalidacion/components/ConvalidacionHeader.tsx
import { useTheme } from '@theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ConvalidacionHeaderProps {
  codigoSolicitud: string;
}

export function ConvalidacionHeader({
  codigoSolicitud,
}: ConvalidacionHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.text, fontWeight: 'bold' },
          ]}
        >
          Solicitud de convalidación
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Gestión académica · Universidad Cochabamba
        </Text>
      </View>
      {codigoSolicitud && (
        <View
          style={[styles.badge, { backgroundColor: theme.colors.info }]}
        >
          <Text style={styles.badgeText}>{codigoSolicitud}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
