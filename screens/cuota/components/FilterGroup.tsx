// screens/cuota/components/FilterGroup.tsx
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { FilterChip } from "./FilterChip";

interface FilterGroupProps {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  const { theme } = useTheme();

  return (
    <View>
      <Text
        style={{
          fontSize: 12,
          marginBottom: 6,
          fontWeight: "500",
          color: theme.colors.textSecondary,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: 6,
          padding: 4,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignSelf: "flex-start",
        }}
      >
        {options.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={value === opt.value}
            onPress={() => onChange(opt.value)}
          />
        ))}
      </View>
    </View>
  );
};
