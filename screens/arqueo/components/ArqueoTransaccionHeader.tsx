// screens/arqueo/components/ArqueoTransaccionHeader.tsx
import { useTheme } from "@/theme/useTheme";
import React from "react";
import { StyleSheet, View } from "react-native";

interface ArqueoTransaccionHeaderProps {
  tipo: "INGRESO" | "EGRESO";
}

export function ArqueoTransaccionHeader({
  tipo,
}: ArqueoTransaccionHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
      <View style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
});
