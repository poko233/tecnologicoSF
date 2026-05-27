// screens/landing/components/HeroSection.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { Image, Platform, Text, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTheme } from "../../../theme/useTheme";
import { CARD_ANIMATION } from "../animations/landing.animations";
import { BackgroundGradient } from "./BackgroundGradient";

const logoImg = require("../../../assets/images/logo_texto.png");

interface HeroSectionProps {
  onCtaPress: () => void;
  scrollY: SharedValue<number>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onCtaPress,
  scrollY,
}) => {
  const { theme } = useTheme();
  const { isMobile, isDesktop } = useResponsive();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onCtaPress();
  };

  return (
    <View className="w-full items-center justify-center relative">
      {/* Fondo animado Skia (cubre el área del hero) */}
      <BackgroundGradient scrollY={scrollY} />

      <View className="w-full items-center px-6 py-12 md:py-20 z-10">
        {/* Logo */}
        <MotiView {...CARD_ANIMATION}>
          <Image
            source={logoImg}
            className="w-48 h-16 md:w-72 md:h-24"
            resizeMode="contain"
          />
        </MotiView>

        {/* Título */}
        <MotiView
          {...CARD_ANIMATION}
          transition={{ ...CARD_ANIMATION.transition, delay: 100 }}
        >
          <Text
            className="text-2xl md:text-4xl font-extrabold text-center mt-5"
            style={{ color: theme.colors.text }}
          >
            Tecnológico del Sur
          </Text>
        </MotiView>

        {/* Subtítulo */}
        <MotiView
          {...CARD_ANIMATION}
          transition={{ ...CARD_ANIMATION.transition, delay: 200 }}
        >
          <Text
            className="text-base md:text-lg font-semibold text-center mt-2"
            style={{ color: theme.colors.primary }}
          >
            Más de 24 años formando profesionales en Cochabamba
          </Text>
        </MotiView>

        {/* Descripción */}
        <MotiView
          {...CARD_ANIMATION}
          transition={{ ...CARD_ANIMATION.transition, delay: 300 }}
          className="px-4"
        >
          <Text
            className="text-sm md:text-base text-center mt-4 leading-relaxed"
            style={{ color: theme.colors.textSecondary }}
          >
            Formamos profesionales técnicos a nivel medio y superior con
            educación de calidad, infraestructura moderna y un enfoque 100%
            práctico. ¡Invierte en tu futuro hoy!
          </Text>
        </MotiView>

        {/* Botón CTA */}
        <MotiView
          {...CARD_ANIMATION}
          transition={{ ...CARD_ANIMATION.transition, delay: 450 }}
          className="mt-8"
        >
          <MotiPressable
            onPress={handlePress}
            animate={({ pressed }) => {
              "worklet";
              return {
                scale: pressed ? 0.95 : 1,
                opacity: pressed ? 0.9 : 1,
              };
            }}
            transition={{ type: "spring", damping: 15, stiffness: 250 }}
          >
            <View
              className="flex-row items-center gap-2 px-6 py-3 rounded-full"
              style={{ backgroundColor: theme.colors.success }}
            >
              <Ionicons name="logo-whatsapp" size={20} color="white" />
              <Text
                className="text-white font-bold text-base"
                style={{ color: theme.colors.successForeground }}
              >
                Consultar por WhatsApp
              </Text>
            </View>
          </MotiPressable>
        </MotiView>
      </View>
    </View>
  );
};
