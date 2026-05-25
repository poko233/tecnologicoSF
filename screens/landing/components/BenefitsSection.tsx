import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTheme } from "../../../theme/useTheme";
import type { Benefit } from "../types/landing.types";

const benefits: Benefit[] = [
  {
    id: "1",
    icon: "business-outline",
    title: "Infraestructura PRO",
    description: "Instalaciones propias con laboratorios equipados.",
  },
  {
    id: "2",
    icon: "people-outline",
    title: "Docentes Capacitados",
    description: "Profesionales con experiencia real en el rubro.",
  },
  {
    id: "3",
    icon: "wallet-outline",
    title: "Calidad y Ahorro",
    description: "Promociones y precios inigualables durante todo el año.",
  },
  {
    id: "4",
    icon: "airplane-outline",
    title: "Vida Estudiantil",
    description: "Ferias, excursiones, bailes y actividades de integración.",
  },
];

export const BenefitsSection = () => {
  const { theme } = useTheme();
  const { isMobile, isDesktop } = useResponsive();

  return (
    <View
      style={{
        width: "100%",
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: "center",
        backgroundColor: theme.colors.backgroundSecondary,
      }}
    >
      <Text
        style={{
          fontSize: isMobile ? 24 : 32,
          fontWeight: "800",
          color: theme.colors.text,
          marginBottom: 24,
        }}
      >
        ¿Por qué elegirnos?
      </Text>
      <Animated.View
        entering={FadeIn.duration(600).springify()}
        style={{
          flexDirection: isDesktop ? "row" : "column",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {benefits.map((b) => (
          <View
            key={b.id}
            style={{
              flex: isDesktop ? 1 : undefined,
              minWidth: isDesktop ? 200 : "100%",
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              padding: 20,
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons
              name={b.icon as any}
              size={36}
              color={theme.colors.primary}
              style={{ marginBottom: 12 }}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: theme.colors.text,
                marginBottom: 6,
                textAlign: "center",
              }}
            >
              {b.title}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.textSecondary,
                textAlign: "center",
                lineHeight: 18,
              }}
            >
              {b.description}
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};
