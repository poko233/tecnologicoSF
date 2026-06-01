// screens/asistencia/components/StatusButton.tsx
import { useTheme } from "@/theme/useTheme";
import { MotiPressable } from "moti/interactions";
import React, { useCallback, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { AsistenciaTipo } from "../types/asistencia.types";

interface Props {
  tipo: AsistenciaTipo;
  Icon: React.ElementType;
  tokenKey: string;
  label: string;
  isSelected: boolean;
  onSelect: (tipo: AsistenciaTipo) => void;
}

export function StatusButton({
  tipo,
  Icon,
  tokenKey,
  label,
  isSelected,
  onSelect,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [hovered, setHovered] = useState(false);

  const rawColor = c[tokenKey as keyof typeof c] ?? c.primary;
  const solidColor = Array.isArray(rawColor) ? rawColor[0] : rawColor;
  const inactiveBg = solidColor + "1A";
  const bg = isSelected ? solidColor : inactiveBg;
  const iconColor = isSelected ? "#FFFFFF" : solidColor;

  const containerStyle = {
    ...styles.button,
    backgroundColor: bg,
  };

  const handleHoverIn = useCallback(() => setHovered(true), []);
  const handleHoverOut = useCallback(() => setHovered(false), []);

  const hoverHandlers =
    Platform.OS === "web"
      ? {
          onMouseEnter: handleHoverIn,
          onMouseLeave: handleHoverOut,
        }
      : {};
  const longPressHandlers =
    Platform.OS !== "web"
      ? {
          onLongPress: handleHoverIn,
          onPressOut: handleHoverOut,
        }
      : {};

  return (
    <View
      style={[styles.wrapper, { zIndex: hovered ? 99999 : 1 }]}
      {...hoverHandlers}
      {...longPressHandlers}
    >
      {hovered && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
          pointerEvents="none"
          style={[styles.tooltip, { backgroundColor: solidColor }]}
        >
          <Animated.Text style={styles.tooltipText}>{label}</Animated.Text>
        </Animated.View>
      )}
      <MotiPressable
        onPress={() => onSelect(tipo)}
        containerStyle={containerStyle}
        animate={({ pressed }) => {
          "worklet";
          return { scale: pressed ? 0.9 : 1 };
        }}
      >
        <Icon size={18} color={iconColor} />
      </MotiPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    overflow: "visible", // CLAVE 2: No cortar nada
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  tooltip: {
    position: "absolute",
    bottom: "100%",
    marginBottom: 6,
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    zIndex: 999999, // CLAVE 3: Z-Index extremo
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minWidth: 60,
    alignItems: "center",
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
});
