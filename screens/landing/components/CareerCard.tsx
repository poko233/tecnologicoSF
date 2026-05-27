// screens/landing/components/CareerCard.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiPressable } from "moti/interactions";
import React, { useMemo } from "react";
import { Platform, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import type { Career } from "../types/landing.types";

interface CareerCardProps {
  career: Career;
  width: number; // ancho calculado por la grid
}

export const CareerCard: React.FC<CareerCardProps> = ({ career, width }) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const animate = useMemo(
    () =>
      ({ hovered, pressed }: { hovered: boolean; pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed ? 0.97 : hovered ? 1.03 : 1,
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
      style={{ width }}
    >
      <View
        className="p-4 rounded-2xl border mb-3"
        style={{
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Ionicons
          name={career.icon as any}
          size={32}
          color={theme.colors.primary}
          className="mb-2"
        />
        <Text
          className="text-base font-bold mb-1"
          style={{ color: theme.colors.text }}
        >
          {career.title}
        </Text>
        <Text
          className="text-sm leading-tight"
          style={{ color: theme.colors.textSecondary }}
        >
          {career.description}
        </Text>
      </View>
    </MotiPressable>
  );
};
