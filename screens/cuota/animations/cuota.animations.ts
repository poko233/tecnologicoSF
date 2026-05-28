// screens/cuota/animations/cuota.animations.ts

export const SPRING_CONFIG = {
  damping: 18,
  stiffness: 200,
  mass: 0.8,
};

export const CARD_STAGGER_DELAY = 80;

export const CARD_ANIMATION = {
  from: { opacity: 0, translateY: 12, scale: 0.98 },
  animate: { opacity: 1, translateY: 0, scale: 1 },
  transition: { type: "spring" as const, ...SPRING_CONFIG },
};
