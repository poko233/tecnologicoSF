import React from "react";
import { Image, Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { useResponsive } from "../../../hooks/useResponsive";
import { SubmitButton } from "../../../screens/auth/components/SubmitButton";
import { useTheme } from "../../../theme/useTheme";

const logoImg = require("../../../assets/images/logo_texto.png");

export const HeroSection = ({ onCtaPress }: { onCtaPress: () => void }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { isMobile, isDesktop } = useResponsive();

  return (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        paddingVertical: isDesktop ? 80 : 40,
        paddingHorizontal: 24,
      }}
    >
      <Animated.View
        entering={FadeIn.duration(800).springify()}
        style={{ alignItems: "center" }}
      >
        <Image
          source={logoImg}
          style={{
            width: isMobile ? 220 : 320,
            height: isMobile ? 80 : 110,
            resizeMode: "contain",
          }}
        />
        <Text
          style={{
            fontSize: isMobile ? 28 : 42,
            fontWeight: "800",
            color: theme.colors.text,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          Tecnológico del Sur
        </Text>
        <Text
          style={{
            fontSize: isMobile ? 16 : 20,
            color: theme.colors.primary,
            textAlign: "center",
            marginTop: 8,
            fontWeight: "600",
          }}
        >
          Más de 24 años formando profesionales en Cochabamba
        </Text>
        <Text
          style={{
            fontSize: isMobile ? 14 : 16,
            color: theme.colors.textSecondary,
            textAlign: "center",
            marginTop: 16,
            paddingHorizontal: 20,
            lineHeight: 22,
          }}
        >
          Formamos profesionales técnicos a nivel medio y superior con educación
          de calidad, infraestructura moderna y un enfoque 100% práctico.
          ¡Invierte en tu futuro hoy!
        </Text>
      </Animated.View>

      <Animated.View
        entering={SlideInDown.delay(400).springify()}
        style={{ marginTop: 32, width: isMobile ? 200 : 240 }}
      >
        <SubmitButton
          title="Consultar por WhatsApp"
          onPress={onCtaPress}
          loading={false}
          disabled={false}
        />
      </Animated.View>
    </View>
  );
};
