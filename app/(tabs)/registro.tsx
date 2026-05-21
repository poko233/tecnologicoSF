// app/(tabs)/notas.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import React from "react";
import { View } from "react-native";

export default function NotasScreen() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
        padding: 24,
      }}
    >
      <ThemedText
        style={{ fontSize: 28, fontWeight: "800", color: theme.colors.text }}
      >
        Registro
      </ThemedText>
      <ThemedText
        style={{
          marginTop: 12,
          fontSize: 16,
          color: theme.colors.textSecondary,
        }}
      >
        Registro.
      </ThemedText>
    </View>
  );
}
