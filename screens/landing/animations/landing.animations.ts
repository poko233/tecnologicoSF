// screens/landing/animations/landing.animations.ts

/**
 * Configuraciones de animación centralizadas para la landing page.
 * Se utilizan tanto en Moti como en Reanimated para mantener consistencia.
 */

export const SPRING_CONFIG = {
  damping: 18,
  stiffness: 200,
  mass: 0.8,
};

export const PRESS_SCALE = {
  pressed: 0.96,
  hovered: 1.02,
  idle: 1,
};

export const STAGGER_DELAY = 60; // ms por ítem

export const CARD_ANIMATION = {
  from: { opacity: 0, translateY: 20, scale: 0.95 },
  animate: { opacity: 1, translateY: 0, scale: 1 },
  transition: { type: "spring" as const, ...SPRING_CONFIG },
};
