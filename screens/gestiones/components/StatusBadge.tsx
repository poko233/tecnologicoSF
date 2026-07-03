// screens/gestiones/components/StatusBadge.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { EstadoGestion } from "../types/gestiones.types";

interface StatusBadgeProps {
  estado: EstadoGestion;
}

export function StatusBadge({ estado }: StatusBadgeProps) {
  const { theme } = useTheme();

  const config = {
    activo: {
      bg: theme.colors.primarySubtle,
      text: theme.colors.primary,
      dot: theme.colors.primary,
      label: "Activo",
    },
    inactivo: {
      bg: theme.colors.backgroundSecondary,
      text: theme.colors.textSecondary,
      dot: theme.colors.borderHover,
      label: "Inactivo",
    },
    cerrado: {
      bg: theme.colors.destructive + "18",
      text: theme.colors.destructive,
      dot: theme.colors.destructive,
      label: "Cerrado",
    },
  };

  const { bg, text, dot, label } = config[estado];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <ThemedText style={{ color: text, fontSize: 12, fontWeight: "600" }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 50,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
