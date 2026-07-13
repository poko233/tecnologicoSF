import { useTheme } from "@/theme/useTheme";
import * as Haptics from "expo-haptics";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { StyleSheet, Text } from "react-native";

interface FilterChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  multiSelect?: boolean;
  color?: string;
}

export function FilterChip({
  label,
  selected,
  onToggle,
  multiSelect = false,
  color,
}: FilterChipProps) {
  const { theme } = useTheme();
  const c = theme.colors;
  const accentColor = color || c.primary;

  return (
    <MotiPressable
      onPress={() => {
        Haptics.selectionAsync();
        onToggle();
      }}
      style={[
        styles.chip,
        {
          borderColor: selected ? accentColor : c.border,
          backgroundColor: selected ? accentColor + "18" : "transparent",
        },
      ]}
      animate={({ pressed }) => ({
        scale: pressed ? 0.95 : 1,
      })}
      transition={{ type: "timing", duration: 100 }}
    >
      <Text
        style={[
          styles.text,
          {
            color: selected ? accentColor : c.text,
            fontWeight: selected ? "700" : "500",
          },
        ]}
      >
        {label}
      </Text>
    </MotiPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
});
