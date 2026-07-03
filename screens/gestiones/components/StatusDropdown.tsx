// screens/gestiones/components/StatusDropdown.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { EstadoGestion } from "../types/gestiones.types";

interface StatusDropdownProps {
  selected?: EstadoGestion;
  onSelect: (s: EstadoGestion | undefined) => void;
}

const STATUS_OPTIONS: { label: string; value: EstadoGestion | undefined }[] = [
  { label: "Todos los Estados", value: undefined },
  { label: "Activo", value: "activo" },
  { label: "Inactivo", value: "inactivo" },
  { label: "Cerrado", value: "cerrado" },
];

export function StatusDropdown({ selected, onSelect }: StatusDropdownProps) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const currentLabel =
    STATUS_OPTIONS.find((o) => o.value === selected)?.label ??
    "Todos los Estados";

  const handleSelect = (value: EstadoGestion | undefined) => {
    onSelect(value);
    setVisible(false);
  };

  return (
    <>
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
          {currentLabel}
        </ThemedText>
        <ChevronDown size={16} color={theme.colors.textSecondary} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {STATUS_OPTIONS.map((opt) => (
              <Pressable
                key={opt.label}
                onPress={() => handleSelect(opt.value)}
                style={[
                  styles.option,
                  opt.value === selected && {
                    backgroundColor: theme.colors.primarySubtle,
                  },
                ]}
              >
                <ThemedText
                  style={{
                    color:
                      opt.value === selected
                        ? theme.colors.primary
                        : theme.colors.text,
                  }}
                >
                  {opt.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 140,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 40,
  },
  dropdown: {
    width: 200,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
