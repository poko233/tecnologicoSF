// screens/gestiones/animations/gestiones.animations.ts
export const springConfig = { damping: 28, stiffness: 160, mass: 1.0 };
export const modalSpringConfig = { damping: 32, stiffness: 200 };

export const staggerDelay = (index: number) => index * 50;

export const modalFrom = { opacity: 0, scale: 0.92, translateY: 30 };
export const modalAnimate = { opacity: 1, scale: 1, translateY: 0 };
export const modalExit = { opacity: 0, scale: 0.95, translateY: -10 };

export const overlayFrom = { opacity: 0 };
export const overlayAnimate = { opacity: 1 };
export const overlayExit = { opacity: 0 };
