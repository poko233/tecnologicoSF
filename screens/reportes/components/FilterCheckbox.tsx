import { useTheme } from "@/theme/useTheme";
import * as Haptics from "expo-haptics";
import { Check } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export function FilterCheckbox({
  label,
  checked,
  onToggle,
}: FilterCheckboxProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <MotiPressable
      onPress={() => {
        Haptics.selectionAsync();
        onToggle();
      }}
      style={styles.container}
      animate={({ pressed }) => ({
        scale: pressed ? 0.97 : 1,
      })}
      transition={{ type: "timing", duration: 100 }}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? c.primary : c.border,
            backgroundColor: checked ? c.primary : "transparent",
          },
        ]}
      >
        {checked && <Check size={14} color={c.primaryForeground} />}
      </View>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
    </MotiPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
});
