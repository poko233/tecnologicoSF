import type { MotiPressableInteractionProp } from "moti/interactions";
import { useMemo } from "react";

export const SCAN_LINE_DURATION = 2500;
export const AUTO_DISMISS_SECONDS = 9;
export const springConfig = {
  damping: 18,
  stiffness: 200,
  mass: 0.8,
};

export const alertSpring = {
  damping: 20,
  stiffness: 180,
};

export const tabPressAnimation: MotiPressableInteractionProp = () => {
  "worklet";
  return {
    scale: 0.95,
    opacity: 0.8,
  };
};

export const useTabTransition = () =>
  useMemo(() => {
    "worklet";
    return {
      type: "spring",
      damping: 20,
      stiffness: 250,
    } as const;
  }, []);

export const alertColors: Record<string, string[]> = {
  verde: ["#10B981", "#059669"],
  amarillo: ["#F59E0B", "#D97706"],
  naranja: ["#F97316", "#EA580C"],
  rojo: ["#EF4444", "#DC2626"],
};
