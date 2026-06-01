import { useTheme } from "@/theme/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { LocalAttendanceState } from "../hooks/useAsistencia";
import { AsistenciaTipo, EstudiantesResponse } from "../types/asistencia.types";
import { QuickControls } from "./QuickControls";
import SwipeCard, { CardEntranceWrapper } from "./SwipeCard";

interface Props {
  estudiantesData: EstudiantesResponse;
  selectedHorarioId: number | null;
  localState: LocalAttendanceState;
  onUpdateLocal: (
    idInscripcion: number,
    tipo: AsistenciaTipo | null,
    observacion?: string,
  ) => void;
}

export function QuickModeView({
  estudiantesData,
  localState,
  onUpdateLocal,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatingIds, setAnimatingIds] = useState<Set<number>>(new Set());
  const [triggerMap, setTriggerMap] = useState<Record<number, string>>({});

  const currentSwipeDirection = useSharedValue<
    "right" | "left" | "up" | "down" | null
  >(null);

  const handleAction = useCallback(
    (direction: "right" | "left" | "up" | "down", isManual: boolean) => {
      const estudiante = estudiantesData.estudiantes[activeIndex];
      if (!estudiante) return;

      let tipo: AsistenciaTipo;
      switch (direction) {
        case "right":
          tipo = "Presente";
          break;
        case "left":
          tipo = "Falta";
          break;
        case "up":
          tipo = "Atraso";
          break;
        case "down":
          tipo = "Permiso";
          break;
      }

      const obs = localState[estudiante.id_inscripcion]?.observacion ?? "";
      onUpdateLocal(estudiante.id_inscripcion, tipo, obs);

      setAnimatingIds((prev) => {
        const next = new Set(prev);
        next.add(estudiante.id_inscripcion);
        return next;
      });

      if (isManual) {
        setTriggerMap((prev) => ({
          ...prev,
          [estudiante.id_inscripcion]: direction,
        }));
      }

      setActiveIndex((prev) => prev + 1);
    },
    [activeIndex, estudiantesData.estudiantes, localState, onUpdateLocal],
  );

  const handleAnimationEnd = useCallback((id: number) => {
    setAnimatingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isFinished =
    activeIndex >= estudiantesData.estudiantes.length &&
    animatingIds.size === 0;

  // 👇 Configuración de los semicírculos (deslizan desde fuera de la pantalla 140px hacia adentro)
  const config = { duration: 250 };
  const gradRightStyle = useAnimatedStyle(() => ({
    opacity: withTiming(
      currentSwipeDirection.value === "right" ? 1 : 0,
      config,
    ),
    transform: [
      {
        translateX: withTiming(
          currentSwipeDirection.value === "right" ? 0 : 140,
          config,
        ),
      },
    ],
  }));
  const gradLeftStyle = useAnimatedStyle(() => ({
    opacity: withTiming(currentSwipeDirection.value === "left" ? 1 : 0, config),
    transform: [
      {
        translateX: withTiming(
          currentSwipeDirection.value === "left" ? 0 : -140,
          config,
        ),
      },
    ],
  }));
  const gradUpStyle = useAnimatedStyle(() => ({
    opacity: withTiming(currentSwipeDirection.value === "up" ? 1 : 0, config),
    transform: [
      {
        translateY: withTiming(
          currentSwipeDirection.value === "up" ? 0 : -140,
          config,
        ),
      },
    ],
  }));
  const gradDownStyle = useAnimatedStyle(() => ({
    opacity: withTiming(currentSwipeDirection.value === "down" ? 1 : 0, config),
    transform: [
      {
        translateY: withTiming(
          currentSwipeDirection.value === "down" ? 0 : 140,
          config,
        ),
      },
    ],
  }));

  if (isFinished) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: c.textSecondary, fontSize: 16 }}>
          No hay estudiantes para mostrar.
        </Text>
      </View>
    );
  }

  const cardsToRender = [...estudiantesData.estudiantes]
    .reverse()
    .map((estudiante) => {
      const originalIndex = estudiantesData.estudiantes.findIndex(
        (e) => e.id_inscripcion === estudiante.id_inscripcion,
      );
      const isAnimating = animatingIds.has(estudiante.id_inscripcion);
      const isActive = originalIndex === activeIndex;
      const isNext = originalIndex === activeIndex + 1;

      if (!isActive && !isNext && !isAnimating) return null;

      return (
        <CardEntranceWrapper
          key={estudiante.id_inscripcion}
          isNext={isNext}
          isActive={isActive}
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              { zIndex: isActive || isAnimating ? 10 : 1 },
            ]}
            pointerEvents={isActive ? "auto" : "none"}
          >
            <SwipeCard
              estudiante={estudiante}
              observacion={
                localState[estudiante.id_inscripcion]?.observacion ?? ""
              }
              onObservacionChange={(txt) =>
                onUpdateLocal(estudiante.id_inscripcion, null, txt)
              }
              onSwipeStart={(dir) => {
                if (isActive) handleAction(dir, false);
              }}
              onSwipeEnd={() => handleAnimationEnd(estudiante.id_inscripcion)}
              triggerSwipeOut={triggerMap[estudiante.id_inscripcion]}
              enabled={isActive}
              swipeDirectionRef={isActive ? currentSwipeDirection : undefined}
            />
          </View>
        </CardEntranceWrapper>
      );
    });

  return (
    <View style={styles.container}>
      <View style={styles.cardArea}>
        <View
          style={[
            styles.backgroundCard,
            { backgroundColor: c.backgroundSecondary, borderColor: c.border },
          ]}
        />
        {cardsToRender}
      </View>

      <View style={styles.counter}>
        <Text style={{ color: c.textSecondary }}>
          {Math.min(activeIndex + 1, estudiantesData.estudiantes.length)} /{" "}
          {estudiantesData.estudiantes.length}
        </Text>
      </View>

      <QuickControls onAction={(dir) => handleAction(dir, true)} />

      {/* 👇 GRANDES SEMICÍRCULOS INDICADORES EN LOS BORDES DEL CONTENEDOR 👇 */}

      {/* DERECHA (PRESENTE) */}
      <Animated.View
        style={[styles.indicatorRight, gradRightStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={["transparent", "rgba(34, 197, 94, 0.9)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
        <Text
          style={[
            styles.glowText,
            {
              transform: [{ rotate: "-90deg" }],
              width: 200,
              textAlign: "center",
            },
          ]}
        >
          PRESENTE
        </Text>
      </Animated.View>

      {/* IZQUIERDA (FALTA) */}
      <Animated.View
        style={[styles.indicatorLeft, gradLeftStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={["rgba(239, 68, 68, 0.9)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
        <Text
          style={[
            styles.glowText,
            {
              transform: [{ rotate: "90deg" }],
              width: 200,
              textAlign: "center",
            },
          ]}
        >
          FALTA
        </Text>
      </Animated.View>

      {/* ARRIBA (ATRASO) */}
      <Animated.View
        style={[styles.indicatorUp, gradUpStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={["rgba(249, 115, 22, 0.9)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.glowText}>ATRASO</Text>
      </Animated.View>

      {/* ABAJO (PERMISO) */}
      <Animated.View
        style={[styles.indicatorDown, gradDownStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={["transparent", "rgba(59, 130, 246, 0.9)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.glowText}>PERMISO</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    overflow: "hidden", // Para que no sobresalgan los indicadores al ocultarse
  },
  cardArea: {
    width: "100%",
    maxWidth: 340,
    height: 360,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backgroundCard: {
    ...StyleSheet.absoluteFillObject,
    top: 10,
    left: 10,
    right: 10,
    bottom: -10,
    borderRadius: 24,
    borderWidth: 1,
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
    zIndex: -10,
  },
  counter: { marginTop: 10 },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  // 👇 ESTILOS PARA LA FORMA DE LOS SEMICÍRCULOS
  indicatorRight: {
    position: "absolute",
    right: 0,
    top: "50%",
    marginTop: -140, // la mitad del height
    width: 140,
    height: 280,
    borderTopLeftRadius: 280,
    borderBottomLeftRadius: 280,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    paddingLeft: 20, // Empuja el texto hacia el borde
  },
  indicatorLeft: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -140,
    width: 140,
    height: 280,
    borderTopRightRadius: 280,
    borderBottomRightRadius: 280,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    paddingRight: 20,
  },
  indicatorUp: {
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: -140, // la mitad del width
    width: 280,
    height: 140,
    borderBottomLeftRadius: 280,
    borderBottomRightRadius: 280,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    paddingBottom: 20,
  },
  indicatorDown: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    marginLeft: -140,
    width: 280,
    height: 140,
    borderTopLeftRadius: 280,
    borderTopRightRadius: 280,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    paddingTop: 20,
  },
  glowText: {
    color: "white",
    fontWeight: "900",
    fontSize: 22,
    letterSpacing: 4,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
