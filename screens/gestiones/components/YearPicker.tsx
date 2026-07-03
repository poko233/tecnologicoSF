// screens/gestiones/components/YearPicker.tsx
import DatePickerModal, {
  DatePickerResult,
} from "@/components/DatePickerModal";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { ChevronDown, X } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface YearPickerProps {
  selected?: number;
  onSelect: (year: number | undefined) => void;
}

export function YearPicker({ selected, onSelect }: YearPickerProps) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);

  const handleApply = (result: DatePickerResult) => {
    if (result.type === "year") {
      if (result.year === selected) {
        onSelect(undefined);
      } else {
        onSelect(result.year);
      }
    }
    setVisible(false);
  };

  const handleClear = () => {
    onSelect(undefined);
  };

  return (
    <>
      {/* ✅ Convertimos todo el botón en Pressable para mejorar la experiencia de usuario */}
      <Pressable
        onPress={() => setVisible(true)}
        style={[
          styles.trigger,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.card,
          },
        ]}
      >
        <ThemedText
          style={{
            color: selected ? theme.colors.text : theme.colors.textSecondary,
            fontSize: 14,
          }}
        >
          {selected ?? "Año"}
        </ThemedText>

        {/* ✅ Contenedor de acciones a la derecha: La X va antes que la flecha */}
        <View style={styles.rightActions}>
          <View style={styles.clearWrapper}>
            {selected !== undefined && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation(); // 🛑 Evita que se abra el modal al presionar la X
                  handleClear();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color={theme.colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Flecha siempre fija en el borde derecho exterior */}
          <ChevronDown size={16} color={theme.colors.textSecondary} />
        </View>
      </Pressable>

      <DatePickerModal
        visible={visible}
        mode="year"
        onClose={() => setVisible(false)}
        onApply={handleApply}
        initialYear={selected}
      />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    // 🌟 CAMBIO: Quitamos 'space-between' para que el contenido no se vaya a los extremos
    gap: 8, // ✨ Espacio perfecto y fijo entre el texto y los íconos
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start", // 🚀 Hace que el botón solo ocupe el ancho de su contenido
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, // Espacio entre la X y la flecha cuando la X aparezca
  },
  clearWrapper: {
    // 🌟 CAMBIO: Eliminamos el 'width: 20' que causaba el hueco fantasma
    alignItems: "center",
    justifyContent: "center",
  },
});
