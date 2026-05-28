// screens/landing/components/FloatingParticles.tsx
import React, { useEffect, useMemo } from "react";
import { DimensionValue } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/useTheme";

const Particle: React.FC<{
  size: number;
  top: DimensionValue;
  left: DimensionValue;
  color: string;
  delayMs: number;
  durationMs: number;
  mouseX: SharedValue<number>;
  mouseY: SharedValue<number>;
}> = ({ size, top, left, color, delayMs, durationMs, mouseX, mouseY }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(0.5, { duration: 1000 }));
    translateY.value = withDelay(
      delayMs,
      withRepeat(
        withTiming(-30, {
          duration: durationMs,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
    scale.value = withDelay(
      delayMs,
      withRepeat(
        withTiming(1.1, {
          duration: durationMs * 0.8,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
      pointerEvents="none"
    />
  );
};

export const FloatingParticles: React.FC<{
  mouseX: SharedValue<number>;
  mouseY: SharedValue<number>;
}> = ({ mouseX, mouseY }) => {
  const { theme } = useTheme();

  const particles = useMemo(() => {
    // Generación pseudoaleatoria igual que antes
    const list: any[] = [];
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };
    for (let i = 0; i < 20; i++) {
      const seed = i * 7 + 13;
      const topPercent = `${pseudoRandom(seed) * 100}%`;
      const leftPercent = `${pseudoRandom(seed + 1) * 100}%`;
      const size = Math.floor(pseudoRandom(seed + 2) * 40) + 10;
      const alpha = Math.floor(pseudoRandom(seed + 3) * 6 + 6) * 2;
      const color = theme.colors.primary + alpha.toString(16).padStart(2, "0");
      const delay = Math.floor(pseudoRandom(seed + 4) * 500);
      const duration = Math.floor(pseudoRandom(seed + 5) * 1500) + 2500;
      list.push({
        size,
        top: topPercent,
        left: leftPercent,
        color,
        delayMs: delay,
        durationMs: duration,
      });
    }
    return list;
  }, [theme.colors.primary]);

  return (
    <>
      {particles.map((p, i) => (
        <Particle key={i} {...p} mouseX={mouseX} mouseY={mouseY} />
      ))}
    </>
  );
};
