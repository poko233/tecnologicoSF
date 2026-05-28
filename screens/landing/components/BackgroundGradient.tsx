// screens/landing/components/BackgroundGradient.tsx
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";

// Solo importamos Skia si no estamos en web
const isWeb = Platform.OS === "web";
let Canvas: any, LinearGradientSkia: any, vec: any;
if (!isWeb) {
  const Skia = require("@shopify/react-native-skia");
  Canvas = Skia.Canvas;
  LinearGradientSkia = Skia.LinearGradient;
  vec = Skia.vec;
}

interface BackgroundGradientProps {
  scrollY?: any; // SharedValue<number> en móvil, no se usa en web
}

export const BackgroundGradient: React.FC<BackgroundGradientProps> = ({
  scrollY,
}) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();

  if (isWeb) {
    // Fallback para web: gradiente con expo-linear-gradient
    return (
      <View style={{ position: "absolute", top: 0, left: 0, width, height }}>
        <LinearGradient
          colors={theme.colors.gradient}
          style={{ width, height: height * 0.6 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.6 }}
        />
      </View>
    );
  }

  // Móvil: gradiente Skia animado (simplificado, sin animación por ahora)
  return (
    <Canvas style={{ position: "absolute", top: 0, left: 0, width, height }}>
      <LinearGradientSkia
        start={vec(0, 0)}
        end={vec(width, height * 0.6)}
        colors={theme.colors.gradient}
      />
    </Canvas>
  );
};
