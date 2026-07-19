// components/Tooltip.tsx
import { useTheme } from "@/theme/useTheme";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export type TooltipPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface TooltipProps {
  message: string;
  icon?: React.ReactNode;
  position?: TooltipPosition;
  children?: React.ReactNode;
  onPress?: () => void; //  Nueva prop para manejar el clic desde fuera
}

/**
 * @description
 * Componente interactivo que despliega un cuadro de información contextual (Tooltip) flotante.
 * Renderiza un icono (o un "?" por defecto) que, al ser presionado o recibir hover, revela el texto.
 */
export function Tooltip({
  message,
  icon,
  position = "top",
  children,
  onPress,
}: TooltipProps) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [visible, setVisible] = useState(false);

  const getPositionStyles = (): ViewStyle => {
    switch (position) {
      case "top":
        return { bottom: "100%", marginBottom: 8, alignSelf: "center" };
      case "top-left":
        return { bottom: "100%", marginBottom: 8, alignSelf: "flex-end" };
      case "top-right":
        return { bottom: "100%", marginBottom: 8, alignSelf: "flex-start" };
      case "bottom":
        return { top: "100%", marginTop: 8, alignSelf: "center" };
      case "bottom-left":
        return { top: "100%", marginTop: 8, alignSelf: "flex-end" };
      case "bottom-right":
        return { top: "100%", marginTop: 8, alignSelf: "flex-start" };
      case "left":
        return { right: "100%", marginRight: 8, alignSelf: "center" };
      case "right":
        return { left: "100%", marginLeft: 8, alignSelf: "center" };
      default:
        return { bottom: "100%", marginBottom: 8, alignSelf: "center" };
    }
  };

  //  Estilos del wrapper: si hay children, no forzamos tamaño; si no, usamos el estilo por defecto
  const wrapperStyle = children
    ? styles.iconWrapperNatural
    : styles.iconWrapperDefault;

  return (
    <View
      style={[
        styles.container,
        {
          zIndex: visible ? 9999 : 1,
          elevation: visible ? 10 : 0,
        },
      ]}
    >
      {/*  Un único Pressable que maneja hover Y clic */}
      <Pressable
        onHoverIn={() => setVisible(true)}
        onHoverOut={() => setVisible(false)}
        onPress={() => {
          // Si se pasa onPress, lo ejecutamos; sino, toggle del tooltip
          if (onPress) {
            onPress();
          } else {
            setVisible(!visible);
          }
        }}
        style={[
          wrapperStyle,
          !icon && !children && { backgroundColor: c.primarySubtle },
        ]}
      >
        {children ? (
          children
        ) : icon ? (
          icon
        ) : (
          <Text style={[styles.iconText, { color: c.primary }]}>?</Text>
        )}
      </Pressable>

      {visible && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
          pointerEvents="none"
          style={[
            styles.tooltip,
            getPositionStyles(),
            {
              backgroundColor: c.popover,
              borderColor: c.border,
              borderWidth: 1,
              shadowColor: c.shadow,
            },
          ]}
        >
          <Text style={[styles.tooltipText, { color: c.text }]}>{message}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  //  Estilo por defecto (cuando no hay children)
  iconWrapperDefault: {
    minWidth: 20,
    minHeight: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  //  Estilo natural (cuando se pasan children) – sin tamaño forzado
  iconWrapperNatural: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 13,
    fontWeight: "800",
  },
  tooltip: {
    position: "absolute",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 220,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
  },
});
