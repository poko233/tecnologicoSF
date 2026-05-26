import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTheme } from "../../../theme/useTheme";
import type { Career } from "../types/landing.types";

const careersList: Career[] = [
  {
    id: "1",
    title: "Contaduría General",
    icon: "calculator-outline",
    description: "Aprende a gestionar finanzas y contabilidad empresarial.",
  },
  {
    id: "2",
    title: "Enfermería",
    icon: "medkit-outline",
    description:
      "Fórmate como profesional de la salud con alta demanda laboral.",
  },
  {
    id: "3",
    title: "Mantenimiento y Reparación de Computadoras",
    icon: "desktop-outline",
    description: "Especialízate en hardware y redes.",
  },
  {
    id: "4",
    title: "Parvulario",
    icon: "happy-outline",
    description: "Conviértete en educadora infantil con vocación.",
  },
  {
    id: "5",
    title: "Laboratorio Clínico",
    icon: "flask-outline",
    description: "Realiza análisis clínicos con tecnología de punta.",
  },
  {
    id: "6",
    title: "Manejo de AutoCAD",
    icon: "shapes-outline",
    description: "Diseña planos y proyectos en 2D/3D.",
  },
  {
    id: "7",
    title: "Sistemas Informáticos",
    icon: "code-slash-outline",
    description: "Desarrolla software y administra sistemas.",
  },
  {
    id: "8",
    title: "Laboratorio Dental",
    icon: "eyedrop-outline",
    description: "Fabrica prótesis y aparatos dentales.",
  },
  {
    id: "9",
    title: "Diseño Gráfico",
    icon: "brush-outline",
    description: "Crea contenido visual para medios digitales e impresos.",
  },
];

export const CareersSection = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { isMobile, isDesktop } = useResponsive();

  const cols = isDesktop ? 3 : 2;
  const gap = 12;

  return (
    <View
      style={{
        width: "100%",
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: "center",
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
        Nuestras Carreras
      </Text>
      <Animated.View
        entering={FadeIn.duration(600).springify()}
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap,
        }}
      >
        {careersList.map((career, index) => {
          const cardWidth = (width - 40 - gap * (cols - 1)) / cols - 10;
          return (
            <Animated.View
              key={career.id}
              entering={SlideInDown.delay(index * 80).springify()}
              style={{
                width: cardWidth,
                backgroundColor: theme.colors.card,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
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
                style={{ marginBottom: 8 }}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: theme.colors.text,
                  marginBottom: 4,
                }}
              >
                {career.title}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  lineHeight: 18,
                }}
              >
                {career.description}
              </Text>
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
};
