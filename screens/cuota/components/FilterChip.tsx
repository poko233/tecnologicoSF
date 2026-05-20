// screens/cuota/components/FilterChip.tsx
import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "../../../theme/useTheme";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 4,
        backgroundColor: active ? theme.colors.card : "transparent",
      }}
    >
      <Text
        style={{
          color: active ? theme.colors.primary : theme.colors.textSecondary,
          fontSize: 14,
          fontWeight: active ? "500" : "400",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
};
