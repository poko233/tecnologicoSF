import { useTheme } from "@/theme/useTheme";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useRef } from "react";
import { Dimensions, StyleSheet, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { EstudianteAsistencia } from "../types/asistencia.types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;
const SWIPE_OUT_DURATION = 3000; // Corregido de 3000 a 300 para un deslizamiento fluido y rápido
const SWIPE_RESET_DURATION = 300;

interface Props {
  estudiante: EstudianteAsistencia;
  onSwipeStart: (direccion: "right" | "left" | "up" | "down") => void;
  onSwipeEnd: () => void;
  observacion: string;
  onObservacionChange: (text: string) => void;
  triggerSwipeOut?: string | null;
  enabled?: boolean;
  swipeDirectionRef?: SharedValue<"right" | "left" | "up" | "down" | null>;
}

const SwipeCard = ({
  estudiante,
  onSwipeStart,
  onSwipeEnd,
  observacion,
  onObservacionChange,
  triggerSwipeOut,
  enabled = true,
  swipeDirectionRef,
}: Props) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isAnimatingRef = useRef(false);

  const initials = useMemo(
    () =>
      (
        estudiante.nombres.charAt(0) + estudiante.apellidoPaterno.charAt(0)
      ).toUpperCase(),
    [estudiante.nombres, estudiante.apellidoPaterno],
  );

  const fullName =
    `${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno} ${estudiante.nombres}`.trim();

  useEffect(() => {
    if (triggerSwipeOut && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      const direction = triggerSwipeOut as "right" | "left" | "up" | "down";

      const exitX =
        direction === "right"
          ? SCREEN_WIDTH
          : direction === "left"
            ? -SCREEN_WIDTH
            : 0;
      const exitY =
        direction === "up"
          ? -SCREEN_WIDTH
          : direction === "down"
            ? SCREEN_WIDTH
            : 0;

      translateX.value = withTiming(exitX, {
        duration: SWIPE_OUT_DURATION,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(exitY, {
        duration: SWIPE_OUT_DURATION,
        easing: Easing.out(Easing.cubic),
      });
      rotate.value = withTiming(
        direction === "right" ? 15 : direction === "left" ? -15 : 0,
        { duration: SWIPE_OUT_DURATION, easing: Easing.out(Easing.cubic) },
      );

      opacity.value = withTiming(0, { duration: SWIPE_OUT_DURATION }, () => {
        isAnimatingRef.current = false;
        runOnJS(onSwipeEnd)();
        runOnJS(Haptics.notificationAsync)(
          Haptics.NotificationFeedbackType.Success,
        );
      });
    }
  }, [triggerSwipeOut]);

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      rotate.value = (e.translationX / SCREEN_WIDTH) * 15;
      opacity.value =
        1 - Math.min(Math.abs(e.translationX) / SCREEN_WIDTH, 0.5);
    })
    .onEnd((e) => {
      const dx = e.translationX;
      const dy = e.translationY;
      let direction: "right" | "left" | "up" | "down" | null = null;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > SWIPE_THRESHOLD) direction = "right";
        else if (dx < -SWIPE_THRESHOLD) direction = "left";
      } else {
        if (dy < -SWIPE_THRESHOLD) direction = "up";
        else if (dy > SWIPE_THRESHOLD) direction = "down";
      }

      if (direction) {
        isAnimatingRef.current = true;
        runOnJS(onSwipeStart)(direction);

        const exitX =
          direction === "right"
            ? SCREEN_WIDTH
            : direction === "left"
              ? -SCREEN_WIDTH
              : 0;
        const exitY =
          direction === "up"
            ? -SCREEN_WIDTH
            : direction === "down"
              ? SCREEN_WIDTH
              : 0;

        translateX.value = withTiming(exitX, {
          duration: SWIPE_OUT_DURATION,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(exitY, {
          duration: SWIPE_OUT_DURATION,
          easing: Easing.out(Easing.cubic),
        });
        rotate.value = withTiming(
          direction === "right" ? 15 : direction === "left" ? -15 : 0,
          { duration: SWIPE_OUT_DURATION, easing: Easing.out(Easing.cubic) },
        );

        opacity.value = withTiming(0, { duration: SWIPE_OUT_DURATION }, () => {
          isAnimatingRef.current = false;
          runOnJS(onSwipeEnd)();
          runOnJS(Haptics.notificationAsync)(
            Haptics.NotificationFeedbackType.Success,
          );
        });
      } else {
        translateX.value = withTiming(0, {
          duration: SWIPE_RESET_DURATION,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(0, {
          duration: SWIPE_RESET_DURATION,
          easing: Easing.out(Easing.cubic),
        });
        rotate.value = withTiming(0, {
          duration: SWIPE_RESET_DURATION,
          easing: Easing.out(Easing.cubic),
        });
        opacity.value = withTiming(1, {
          duration: SWIPE_RESET_DURATION,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const activeDirection = useDerivedValue(() => {
    const dx = translateX.value;
    const dy = translateY.value;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) return null;

    if (absX > absY) {
      if (dx > SWIPE_THRESHOLD) return "right";
      if (dx < -SWIPE_THRESHOLD) return "left";
    } else {
      if (dy < -SWIPE_THRESHOLD) return "up";
      if (dy > SWIPE_THRESHOLD) return "down";
    }
    return null;
  });

  useAnimatedReaction(
    () => activeDirection.value,
    (current) => {
      if (swipeDirectionRef) {
        swipeDirectionRef.value = current;
      }
    },
    [swipeDirectionRef],
  );

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          pointerEvents={enabled ? "auto" : "none"}
          style={[
            styles.card,
            animatedStyle,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          {estudiante.foto ? (
            <Image source={{ uri: estudiante.foto }} style={styles.photo} />
          ) : (
            <View
              style={[
                styles.photo,
                {
                  backgroundColor: c.secondary,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Text style={[styles.initials, { color: c.secondaryForeground }]}>
                {initials}
              </Text>
            </View>
          )}
          <Text style={[styles.name, { color: c.text }]} numberOfLines={3}>
            {fullName}
          </Text>
          <Text
            style={[styles.carrera, { color: c.textSecondary }]}
            numberOfLines={2}
          >
            {estudiante.carrera}
          </Text>
          <View style={[styles.obsContainer, { borderColor: c.border }]}>
            <TextInput
              style={[styles.obsInput, { color: c.text }]}
              placeholder="Observación (opcional)..."
              placeholderTextColor={c.textMuted}
              value={observacion}
              onChangeText={onObservacionChange}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

SwipeCard.displayName = "SwipeCard";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
    height: 360,
    position: "relative",
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  photo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#fff",
  },
  initials: { fontSize: 28, fontWeight: "700" },
  name: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
    lineHeight: 20,
  },
  carrera: {
    fontSize: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  obsContainer: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  obsInput: { fontSize: 14 },
});

export default SwipeCard;

export const CardEntranceWrapper = ({
  children,
  isNext,
  isActive,
}: {
  children: React.ReactNode;
  isNext: boolean;
  isActive: boolean;
}) => {
  const opacity = useSharedValue(isNext ? 0 : 1);
  const translateY = useSharedValue(isNext ? 18 : 0);
  const scale = useSharedValue(isNext ? 0.92 : 1);

  useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 350 });
      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 180,
        mass: 1,
      });
      scale.value = withSpring(1, { damping: 18, stiffness: 180, mass: 1 });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
};
