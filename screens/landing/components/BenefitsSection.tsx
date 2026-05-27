// screens/landing/components/BenefitsSection.tsx
import { MotiView } from "moti";
import React from "react";
import { Text, View } from "react-native";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTheme } from "../../../theme/useTheme";
import {
  CARD_ANIMATION,
  STAGGER_DELAY,
} from "../animations/landing.animations";
import type { Benefit } from "../types/landing.types";
import { BenefitCard } from "./BenefitCard";

const benefits: Benefit[] = [
  // ... (igual que antes)
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

export const BenefitsSection: React.FC = () => {
  const { theme } = useTheme();
  const { isDesktop } = useResponsive();

  return (
    <View
      className="w-full items-center py-10 px-5"
      style={{ backgroundColor: theme.colors.backgroundSecondary }}
    >
      <MotiView {...CARD_ANIMATION}>
        <Text
          className="text-2xl md:text-3xl font-extrabold mb-6"
          style={{ color: theme.colors.text }}
        >
          ¿Por qué elegirnos?
        </Text>
      </MotiView>

      <View
        className={`flex-wrap justify-center gap-4 ${
          isDesktop ? "flex-row" : "flex-col"
        }`}
      >
        {benefits.map((benefit, index) => (
          <MotiView
            key={benefit.id}
            {...CARD_ANIMATION}
            transition={{
              ...CARD_ANIMATION.transition,
              delay: index * STAGGER_DELAY,
            }}
            style={isDesktop ? { flex: 1, minWidth: 200 } : undefined}
          >
            <BenefitCard benefit={benefit} index={index} />
          </MotiView>
        ))}
      </View>
    </View>
  );
};
