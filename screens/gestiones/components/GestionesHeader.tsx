// screens/gestiones/components/GestionesHeader.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { Plus } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface GestionesHeaderProps {
  onNew: () => void;
}

export function GestionesHeader({ onNew }: GestionesHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <ThemedText style={[styles.title, { color: theme.colors.text }]}>
          Gestión de Períodos Académicos
        </ThemedText>
        <ThemedText
          style={{
            color: theme.colors.textSecondary,
            fontSize: 14,
            marginTop: 4,
          }}
        >
          Administra los ciclos lectivos, aperturas y cierres de gestión.
        </ThemedText>
      </View>
      <MotiPressable
        onPress={onNew}
        animate={useMemo(
          () =>
            ({ pressed }) => {
              "worklet";
              return { scale: pressed ? 0.96 : 1 };
            },
          [],
        )}
        style={[styles.newButton, { backgroundColor: theme.colors.primary }]}
      >
        <Plus size={18} color={theme.colors.primaryForeground} />
        <ThemedText
          style={{
            color: theme.colors.primaryForeground,
            marginLeft: 8,
            fontWeight: "600",
          }}
        >
          Abrir Nueva Gestión
        </ThemedText>
      </MotiPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
