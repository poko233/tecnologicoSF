// app/403.tsx
import React from "react";
import { View } from "react-native";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../theme/useTheme";

export default function UnauthorizedScreen() {
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
        style={{ fontSize: 48, fontWeight: "800", color: theme.colors.text }}
      >
        403
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 18,
          color: theme.colors.textSecondary,
          marginTop: 8,
          textAlign: "center",
        }}
      >
        No tienes permiso para acceder a esta página.
      </ThemedText>
    </View>
  );
}
