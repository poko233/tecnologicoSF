// screens/gestiones/components/PeriodTabs.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Periodo } from "../types/gestiones.types";

const PERIODOS: Periodo[] = [
  "Anual",
  "Semestral",
  "Trimestral",
  "Mensual",
  "Otro",
];

interface PeriodTabsProps {
  selected?: Periodo;
  onSelect: (p: Periodo | undefined) => void;
}

export function PeriodTabs({ selected, onSelect }: PeriodTabsProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.tabs,
        { backgroundColor: theme.colors.backgroundSecondary },
      ]}
    >
      {PERIODOS.map((periodo) => {
        const isActive = selected === periodo;
        return (
          <Pressable
            key={periodo}
            onPress={() => onSelect(isActive ? undefined : periodo)}
            style={[
              styles.tab,
              isActive && {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
              },
            ]}
          >
            <ThemedText
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: isActive
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
              }}
            >
              {periodo}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
});
