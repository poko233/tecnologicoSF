// screens/landing/components/CareersSection.tsx
import { MotiView } from "moti";
import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTheme } from "../../../theme/useTheme";
import {
  CARD_ANIMATION,
  STAGGER_DELAY,
} from "../animations/landing.animations";
import type { Career } from "../types/landing.types";
import { CareerCard } from "./CareerCard";

const careersList: Career[] = [
  // ... (igual que antes)
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

export const CareersSection: React.FC = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { isMobile, isDesktop } = useResponsive();

  const cols = isDesktop ? 3 : 2;
  const gap = 12;
  const cardWidth = (width - 40 - gap * (cols - 1)) / cols; // padding horizontal 20*2

  return (
    <View className="w-full items-center py-10 px-5">
      <MotiView {...CARD_ANIMATION}>
        <Text
          className="text-2xl md:text-3xl font-extrabold mb-6"
          style={{ color: theme.colors.text }}
        >
          Nuestras Carreras
        </Text>
      </MotiView>

      <View className="flex-row flex-wrap justify-center" style={{ gap }}>
        {careersList.map((career, index) => (
          <MotiView
            key={career.id}
            {...CARD_ANIMATION}
            transition={{
              ...CARD_ANIMATION.transition,
              delay: index * STAGGER_DELAY,
            }}
          >
            <CareerCard career={career} width={cardWidth} />
          </MotiView>
        ))}
      </View>
    </View>
  );
};
