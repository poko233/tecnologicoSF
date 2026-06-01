// screens/asistencia/animations/asistencia.animations.ts

// Animación base: fade + slide up suave (timing, sin rebote)
export const fadeSlideUp = {
  from: { opacity: 0, translateY: 30 },
  animate: { opacity: 1, translateY: 0 },
  transition: { type: "timing" as const, duration: 350 },
};

// Animación base con delay personalizado (para stagger)
export const fadeSlideUpWithDelay = (delay: number) => ({
  from: fadeSlideUp.from,
  animate: fadeSlideUp.animate,
  transition: { ...fadeSlideUp.transition, delay },
});

// Entrada de tarjetas de grupo (stagger se aplica en GroupCard)
export const cardEntrance = fadeSlideUp;

// Entrada de tarjetas de horario (similar, pero podemos darle un delay propio)
export const scheduleCardEntrance = (index: number) =>
  fadeSlideUpWithDelay(index * 60);

// Salida para swipe (sin cambios)
export const cardExit = (direction: string) => ({
  opacity: 0,
  translateX: direction === "right" ? 100 : direction === "left" ? -100 : 0,
  translateY: direction === "up" ? -100 : direction === "down" ? 100 : 0,
  rotate:
    direction === "right" ? "10deg" : direction === "left" ? "-10deg" : "0deg",
  transition: { type: "timing" as const, duration: 200 },
});
