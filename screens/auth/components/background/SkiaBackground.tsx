// screens/auth/components/background/SkiaBackground.tsx
import {
  Blur,
  Canvas,
  Circle,
  Fill,
  RadialGradient,
  vec,
} from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useResponsive } from "../../../../hooks/useResponsive";
import { useTheme } from "../../../../theme/useTheme";

export const SkiaBackground: React.FC = () => {
  const { theme } = useTheme();
  const { width, height } = useResponsive();

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 25000 }), -1, true);
  }, [progress]);

  const cx1 = useDerivedValue(
    () => width * 0.2 + Math.sin(progress.value * Math.PI * 2) * 60,
  );
  const cy1 = useDerivedValue(
    () => height * 0.3 + Math.cos(progress.value * Math.PI * 2) * 60,
  );
  const cx2 = useDerivedValue(
    () => width * 0.8 + Math.sin(progress.value * Math.PI * 2 + 2) * 70,
  );
  const cy2 = useDerivedValue(
    () => height * 0.7 + Math.cos(progress.value * Math.PI * 2 + 2) * 70,
  );

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Fill color={theme.colors.background} />
      <Circle cx={cx1} cy={cy1} r={200}>
        <RadialGradient
          c={vec(0, 0)}
          r={200}
          colors={[theme.colors.primary + "30", theme.colors.primary + "05"]}
        />
        <Blur blur={40} />
      </Circle>
      <Circle cx={cx2} cy={cy2} r={250}>
        <RadialGradient
          c={vec(0, 0)}
          r={250}
          colors={[
            theme.colors.secondary + "20",
            theme.colors.secondary + "05",
          ]}
        />
        <Blur blur={50} />
      </Circle>
    </Canvas>
  );
};
