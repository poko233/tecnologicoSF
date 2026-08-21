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
        backgroundColor: theme.colors.background,
        padding: 24,
      }}
    >
    </View>
  );
}
