// Configuraciones de movimiento compartidas para el módulo de reportes
export const ANIMATION_CONFIG = {
  // Spring para entradas de tarjetas – suave, sin rebote (damping alto)
  cardEntrance: {
    damping: 28,
    stiffness: 170,
    mass: 1,
  },
  // Spring para modales – más rígido para sensación de precisión
  modalEntrance: {
    damping: 32,
    stiffness: 260,
    mass: 1,
  },
  // Stagger base en milisegundos
  staggerDelay: 60,
  // Timing para salidas rápidas
  exitDuration: 150,
} as const;
