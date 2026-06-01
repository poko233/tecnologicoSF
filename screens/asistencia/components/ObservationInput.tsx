// screens/asistencia/components/ObservationInput.tsx
import { useTheme } from "@/theme/useTheme";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function ObservationInput({
  value,
  onChangeText,
  placeholder = "Añadir nota...",
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={[styles.wrapper, { borderColor: c.border }]}>
      <TextInput
        style={[styles.input, { color: c.text }]}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 4,
  },
  input: {
    fontSize: 13,
    padding: 0,
  },
});
