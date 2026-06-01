// screens/asistencia/components/QuickControls.tsx
import { useTheme } from "@/theme/useTheme";
import { Check, Clock, ShieldAlert, X } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface Props {
  onAction: (direccion: "right" | "left" | "up" | "down") => void;
}

type Direction = "right" | "left" | "up" | "down";

const BUTTONS: {
  direction: Direction;
  icon: React.ElementType;
  label: string;
  colorKey: string;
  size: "large" | "small";
}[] = [
  {
    direction: "left",
    icon: X,
    label: "Falta",
    colorKey: "destructive",
    size: "large",
  },
  {
    direction: "up",
    icon: Clock,
    label: "Atraso",
    colorKey: "warning",
    size: "small",
  },
  {
    direction: "down",
    icon: ShieldAlert,
    label: "Permiso",
    colorKey: "info",
    size: "small",
  },
  {
    direction: "right",
    icon: Check,
    label: "Presente",
    colorKey: "success",
    size: "large",
  },
];

export function QuickControls({ onAction }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [hoveredDir, setHoveredDir] = useState<Direction | null>(null);

  const getColor = (colorKey: string) => {
    const raw = c[colorKey as keyof typeof c] ?? c.primary;
    return Array.isArray(raw) ? raw[0] : raw;
  };

  return (
    <View style={styles.container}>
      {BUTTONS.map((btn) => {
        const color = getColor(btn.colorKey);
        const isHovered = hoveredDir === btn.direction;

        const hoverHandlers =
          Platform.OS === "web"
            ? {
                onMouseEnter: () => setHoveredDir(btn.direction),
                onMouseLeave: () => setHoveredDir(null),
              }
            : {};
        const longPressHandlers =
          Platform.OS !== "web"
            ? {
                onLongPress: () => setHoveredDir(btn.direction),
                onPressOut: () => setHoveredDir(null),
              }
            : {};

        const btnStyle = {
          backgroundColor: color + "20",
          borderRadius: 30,
          justifyContent: "center" as const,
          alignItems: "center" as const,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
          width: btn.size === "large" ? 56 : 48,
          height: btn.size === "large" ? 56 : 48,
        };

        return (
          <Pressable
            key={btn.direction}
            onPress={() => onAction(btn.direction)}
            {...(hoverHandlers as any)}
            {...(longPressHandlers as any)}
            style={{ position: "relative" }}
          >
            {isHovered && (
              <Animated.View
                entering={FadeIn.duration(150)}
                exiting={FadeOut.duration(100)}
                pointerEvents="none"
                style={[styles.tooltip, { backgroundColor: color }]}
              >
                <Text style={styles.tooltipText}>{btn.label}</Text>
              </Animated.View>
            )}

            <View style={[btnStyle]}>
              <btn.icon size={btn.size === "large" ? 24 : 20} color={color} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingVertical: 20,
  },
  tooltip: {
    position: "absolute",
    bottom: "100%",
    marginBottom: 8,
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    zIndex: 999,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
});
