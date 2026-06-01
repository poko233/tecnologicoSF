// screens/asistencia/components/HorarioSelector.tsx
import { useTheme } from "@/theme/useTheme";
import { MotiView } from "moti";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Horario } from "../types/asistencia.types";

interface Props {
  horarios: Horario[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function HorarioSelector({ horarios, selectedId, onSelect }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  if (horarios.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      <TouchableOpacity
        onPress={() => onSelect(null)}
        style={[
          styles.chip,
          {
            backgroundColor: selectedId === null ? c.primary : c.input,
            borderColor: c.border,
          },
        ]}
      >
        <Text
          style={{ color: selectedId === null ? c.primaryForeground : c.text }}
        >
          Sin horario
        </Text>
      </TouchableOpacity>
      {horarios.map((h) => {
        const isSelected = selectedId === h.idHorario;
        return (
          <MotiView
            key={h.idHorario}
            animate={{ scale: isSelected ? 1.05 : 1 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <TouchableOpacity
              onPress={() => onSelect(h.idHorario)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? c.primary : c.input,
                  borderColor: isSelected ? c.primary : c.border,
                },
              ]}
            >
              <Text
                style={{
                  color: isSelected ? c.primaryForeground : c.text,
                  fontWeight: "600",
                }}
              >
                {h.horaInicio.slice(0, 5)} - {h.horaFin.slice(0, 5)}
              </Text>
            </TouchableOpacity>
          </MotiView>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
});
