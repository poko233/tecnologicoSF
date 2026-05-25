import React, { useEffect, useMemo } from "react";
import { DimensionValue, useWindowDimensions } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
    Easing,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/useTheme";

function parseDimensionValue(
  value: DimensionValue,
  parentSize: number,
): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.endsWith("%")) {
    return (parseFloat(value) / 100) * parentSize;
  }
  return 0;
}

const Particle = ({
  size,
  top,
  left,
  color,
  delayMs,
  durationMs,
  amplitudeX = 35,
  amplitudeY = 60,
  rotateAmplitude = 15,
  mouseX,
  mouseY,
}: {
  size: number;
  top: DimensionValue;
  left: DimensionValue;
  color: string;
  delayMs: number;
  durationMs: number;
  amplitudeX?: number;
  amplitudeY?: number;
  rotateAmplitude?: number;
  mouseX: SharedValue<number>;
  mouseY: SharedValue<number>;
}) => {
  const { width: ww, height: wh } = useWindowDimensions();

  const absX = useMemo(() => parseDimensionValue(left, ww), [left, ww]);
  const absY = useMemo(() => parseDimensionValue(top, wh), [top, wh]);

  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);
  const repX = useSharedValue(0);
  const repY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(0.6, { duration: 1200 }));
    translateY.value = withDelay(
      delayMs,
      withRepeat(
        withTiming(-amplitudeY, {
          duration: durationMs,
          easing: Easing.bezier(0.42, 0, 0.58, 1),
        }),
        -1,
        true,
      ),
    );
    translateX.value = withDelay(
      delayMs,
      withRepeat(
        withTiming(amplitudeX, {
          duration: durationMs * 1.3,
          easing: Easing.bezier(0.42, 0, 0.58, 1),
        }),
        -1,
        true,
      ),
    );
    scale.value = withDelay(
      delayMs,
      withRepeat(
        withTiming(1.15, {
          duration: durationMs * 0.8,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
    rotate.value = withDelay(
      delayMs,
      withRepeat(
        withTiming(rotateAmplitude, {
          duration: durationMs * 1.1,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    );
  }, []);

  useAnimatedReaction(
    () => ({ mx: mouseX.value, my: mouseY.value }),
    ({ mx, my }) => {
      if (mx <= 0 || my <= 0) {
        repX.value = withSpring(0, { damping: 12, stiffness: 100 });
        repY.value = withSpring(0, { damping: 12, stiffness: 100 });
        return;
      }
      const dx = mx - absX;
      const dy = my - absY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const threshold = 150;
      if (dist < threshold) {
        const force = (1 - dist / threshold) * 80;
        const angle = Math.atan2(dy, dx);
        repX.value = withSpring(-Math.cos(angle) * force, {
          damping: 10,
          stiffness: 90,
        });
        repY.value = withSpring(-Math.sin(angle) * force, {
          damping: 10,
          stiffness: 90,
        });
      } else {
        repX.value = withSpring(0, { damping: 10, stiffness: 90 });
        repY.value = withSpring(0, { damping: 10, stiffness: 90 });
      }
    },
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value + repY.value },
      { translateX: translateX.value + repX.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
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

export const FloatingParticles = ({
  mouseX,
  mouseY,
}: {
  mouseX: SharedValue<number>;
  mouseY: SharedValue<number>;
}) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const particles = useMemo(() => {
    const list: Array<{
      size: number;
      top: DimensionValue;
      left: DimensionValue;
      color: string;
      delayMs: number;
      durationMs: number;
      amplitudeX: number;
      amplitudeY: number;
      rotateAmplitude?: number;
    }> = [];
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };
    for (let i = 0; i < 25; i++) {
      const seed = i * 7 + 13;
      const topPercent = pseudoRandom(seed) * 100;
      const leftPercent = pseudoRandom(seed + 1) * 100;
      const size = Math.floor(pseudoRandom(seed + 2) * 70) + 20;
      const alpha = Math.floor(pseudoRandom(seed + 3) * 8 + 8) * 2;
      const color = theme.colors.primary + alpha.toString(16).padStart(2, "0");
      const delay = Math.floor(pseudoRandom(seed + 4) * 800);
      const duration = Math.floor(pseudoRandom(seed + 5) * 2000) + 2500;
      const ampX = (pseudoRandom(seed + 6) - 0.5) * 80;
      const ampY = (pseudoRandom(seed + 7) - 0.5) * 100;
      const rot = pseudoRandom(seed + 8) * 20;
      list.push({
        size,
        top: `${topPercent}%` as DimensionValue,
        left: `${leftPercent}%` as DimensionValue,
        color,
        delayMs: delay,
        durationMs: duration,
        amplitudeX: ampX,
        amplitudeY: ampY,
        rotateAmplitude: rot > 1 ? rot : undefined,
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
