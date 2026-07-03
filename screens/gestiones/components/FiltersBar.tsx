// screens/gestiones/components/FiltersBar.tsx
import { useTheme } from "@/theme/useTheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { EstadoGestion, Periodo } from "../types/gestiones.types";
import { PeriodTabs } from "./PeriodTabs";
import { StatusDropdown } from "./StatusDropdown";
import { YearPicker } from "./YearPicker";

interface FiltersBarProps {
  selectedPeriod?: Periodo;
  selectedYear?: number;
  selectedStatus?: EstadoGestion;
  onPeriodChange: (p: Periodo | undefined) => void;
  onYearChange: (y: number | undefined) => void;
  onStatusChange: (s: EstadoGestion | undefined) => void;
}

export function FiltersBar({
  selectedPeriod,
  selectedYear,
  selectedStatus,
  onPeriodChange,
  onYearChange,
  onStatusChange,
}: FiltersBarProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <PeriodTabs selected={selectedPeriod} onSelect={onPeriodChange} />
      <View style={styles.dropdowns}>
        <YearPicker selected={selectedYear} onSelect={onYearChange} />
        <StatusDropdown selected={selectedStatus} onSelect={onStatusChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    marginBottom: 24,
    gap: 12,
    flexWrap: "wrap",
  },
  dropdowns: {
    flexDirection: "row",
    gap: 8,
    flexShrink: 0,
  },
});
