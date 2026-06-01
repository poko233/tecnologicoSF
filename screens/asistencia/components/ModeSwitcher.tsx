// screens/asistencia/components/ModeSwitcher.tsx
import { useTheme } from "@/theme/useTheme";
import { ArrowLeftRight, List } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface Props {
  currentMode: "list" | "quick";
  onModeChange: (mode: "list" | "quick") => void;
}

export function ModeSwitcher({ currentMode, onModeChange }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: c.backgroundSecondary,
          borderColor: c.border,
          shadowColor: "#000",
          width: isMobile ? "100%" : undefined,
          alignSelf: isMobile ? undefined : "flex-start",
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => onModeChange("list")}
        activeOpacity={0.7}
        style={[
          styles.button,
          currentMode === "list"
            ? {
                backgroundColor: c.card,
                ...styles.activeShadow,
              }
            : undefined,
          isMobile ? { flex: 1 } : { flex: undefined },
        ]}
      >
        <List
          size={20}
          color={currentMode === "list" ? c.primary : c.textSecondary}
        />
        <Text
          style={[
            styles.label,
            {
              color: currentMode === "list" ? c.primary : c.textSecondary,
              fontWeight: currentMode === "list" ? "600" : "500",
            },
          ]}
        >
          Modo Lista
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onModeChange("quick")}
        activeOpacity={0.7}
        style={[
          styles.button,
          currentMode === "quick"
            ? {
                backgroundColor: c.card,
                ...styles.activeShadow,
              }
            : undefined,
          isMobile ? { flex: 1 } : { flex: undefined },
        ]}
      >
        <ArrowLeftRight
          size={20}
          color={currentMode === "quick" ? c.primary : c.textSecondary}
        />
        <Text
          style={[
            styles.label,
            {
              color: currentMode === "quick" ? c.primary : c.textSecondary,
              fontWeight: currentMode === "quick" ? "600" : "500",
            },
          ]}
        >
          Modo Rápido
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
  },
});
