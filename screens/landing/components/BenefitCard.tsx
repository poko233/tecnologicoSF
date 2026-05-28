// screens/landing/components/BenefitCard.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiPressable } from "moti/interactions";
import React, { useMemo } from "react";
import { Platform, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import type { Benefit } from "../types/landing.types";

interface BenefitCardProps {
  benefit: Benefit;
  index: number;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ benefit }) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Animaciones de presión/hover en el hilo nativo
  const animate = useMemo(
    () =>
      ({ hovered, pressed }: { hovered: boolean; pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed ? 0.97 : hovered ? 1.02 : 1,
          opacity: pressed ? 0.9 : 1,
        };
      },
    [],
  );

  const transition = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        if (pressed) {
          return { type: "timing" as const, duration: 100 };
        }
        return { type: "spring" as const, damping: 18, stiffness: 200 };
      },
    [],
  );

  return (
    <MotiPressable
      onPress={handlePress}
      animate={animate}
      transition={transition}
      style={{ flex: 1, minWidth: 200 }}
    >
      <View
        className="flex-1 items-center p-5 rounded-2xl border"
        style={{
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <Ionicons
          name={benefit.icon as any}
          size={36}
          color={theme.colors.primary}
          className="mb-3"
        />
        <Text
          className="text-base font-bold text-center mb-1"
          style={{ color: theme.colors.text }}
        >
          {benefit.title}
        </Text>
        <Text
          className="text-sm text-center leading-tight"
          style={{ color: theme.colors.textSecondary }}
        >
          {benefit.description}
        </Text>
      </View>
    </MotiPressable>
  );
};
