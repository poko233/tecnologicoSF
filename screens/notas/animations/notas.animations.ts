// Animaciones existentes (se mantienen por si se usan en otras partes)

export const fadeSlideUp = {
  from: { opacity: 0, translateY: 20 },
  animate: { opacity: 1, translateY: 0 },
  transition: { type: "spring" as const, damping: 20, stiffness: 200 },
};

export const cardEntrance = {
  from: { opacity: 0, translateY: 20, scale: 0.98 },
  animate: { opacity: 1, translateY: 0, scale: 1 },
  transition: { type: "spring" as const, damping: 25, stiffness: 220 },
};

export const slideFromRight = {
  from: { translateX: 420, opacity: 0 },
  animate: { translateX: 0, opacity: 1 },
  exit: { translateX: 420, opacity: 0 },
  transition: { type: "spring" as const, damping: 26, stiffness: 250 },
};

export const slideFromBottom = {
  from: { translateY: 500, opacity: 0 },
  animate: { translateY: 0, opacity: 1 },
  exit: { translateY: 500, opacity: 0 },
  transition: { type: "spring" as const, damping: 26, stiffness: 250 },
};

export const modalScaleFade = {
  from: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { type: "spring" as const, damping: 20, stiffness: 200 },
};

// Animación de modales (sin rebote, 200ms)
export const modalTiming = {
  from: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { type: "timing" as const, duration: 500 },
};

// NUEVA: animación de panel lateral (sin rebote)
export const slideFromRightTiming = {
  from: { translateX: 420, opacity: 0 },
  animate: { translateX: 0, opacity: 1 },
  exit: { translateX: 420, opacity: 0 },
  transition: { type: "timing" as const, duration: 500 },
};

// NUEVA: animación de panel desde abajo (sin rebote)
export const slideFromBottomTiming = {
  from: { translateY: 500, opacity: 0 },
  animate: { translateY: 0, opacity: 1 },
  exit: { translateY: 500, opacity: 0 },
  transition: { type: "timing" as const, duration: 500 },
};

// NUEVA: animación de entrada de items (sin rebote)
export const itemEntranceTiming = {
  from: { opacity: 0, translateX: -20 },
  animate: { opacity: 1, translateX: 0 },
  transition: { type: "timing" as const, duration: 500 },
};
