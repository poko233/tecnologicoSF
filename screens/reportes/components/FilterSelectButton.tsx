import { useTheme } from "@/theme/useTheme";
import * as Haptics from "expo-haptics";
import { ChevronDown } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface FilterSelectButtonProps {
  label: string;
  selectedText: string;
  onPress: () => void;
  isActive?: boolean;
}

export function FilterSelectButton({
  label,
  selectedText,
  onPress,
  isActive = false,
}: FilterSelectButtonProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <MotiPressable
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
        style={[
          styles.button,
          {
            backgroundColor: isActive ? c.primarySubtle : c.backgroundSecondary,
            borderColor: isActive ? c.primary : c.border,
          },
        ]}
        animate={({ pressed }) => ({
          scale: pressed ? 0.98 : 1,
        })}
        transition={{ type: "timing", duration: 100 }}
      >
        <Text
          style={[styles.buttonText, { color: isActive ? c.primary : c.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedText}
        </Text>
        <ChevronDown size={16} color={isActive ? c.primary : c.textSecondary} />
      </MotiPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  buttonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
});
