// screens/asistencia/components/ScheduleSelector.tsx
import { useTheme } from "@/theme/useTheme";
import { ArrowLeft, Calendar, ChevronRight } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { fadeSlideUpWithDelay } from "../animations/asistencia.animations";
import { Horario } from "../types/asistencia.types";

interface Props {
  groupName: string;
  horarios: Horario[];
  onBack: () => void;
  onSelect: (id: number) => void;
}

export function ScheduleSelector({
  groupName,
  horarios,
  onBack,
  onSelect,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { width } = useWindowDimensions();

  // Determinar número de columnas y ancho de tarjeta
  const numColumns = width < 768 ? 1 : 2;
  const gap = 12;
  const marginLeft = 40; // ml-10 ≈ 40px
  const maxWidth = 672; // max-w-2xl ≈ 672px
  const containerWidth = Math.min(width - 32 - marginLeft, maxWidth); // 32 = padding horizontal (16*2)
  const itemWidth = (containerWidth - gap * (numColumns - 1)) / numColumns;

  return (
    <MotiView
      style={styles.outer}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 350 }}
    >
      {/* Encabezado con botón atrás */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backBtn, { backgroundColor: "transparent" }]}
          accessibilityLabel="Volver a grupos"
        >
          <ArrowLeft size={24} color={c.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text }]}>
          Seleccione el Horario para{" "}
          <Text style={{ color: c.primary, fontWeight: "700" }}>
            {groupName}
          </Text>
        </Text>
      </View>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        Elija el bloque horario correspondiente a la clase de hoy.
      </Text>

      {/* Grid de horarios centrado */}
      <View style={[styles.gridWrapper, { marginLeft, maxWidth }]}>
        <View style={[styles.grid, { width: containerWidth }]}>
          {horarios.map((h, index) => (
            <MotiView
              key={h.idHorario}
              style={{
                width: itemWidth,
                marginRight: index % numColumns < numColumns - 1 ? gap : 0,
              }}
              {...fadeSlideUpWithDelay(index * 60)}
            >
              <TouchableOpacity
                onPress={() => onSelect(h.idHorario)}
                style={[
                  styles.card,
                  {
                    borderColor: c.border,
                    backgroundColor: c.card,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3,
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: c.primarySubtle },
                    ]}
                  >
                    <Calendar size={24} color={c.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardDay, { color: c.text }]}>
                      {h.dia || "Horario"}
                    </Text>
                    <Text
                      style={[styles.cardHours, { color: c.textSecondary }]}
                    >
                      {h.horaInicio.slice(0, 5)} - {h.horaFin.slice(0, 5)}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={c.primary} />
                </View>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 14,
    marginLeft: 40, // alineado con el grid
    marginBottom: 24,
  },
  gridWrapper: {
    alignSelf: "center", // centrar el contenedor del grid
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "flex-start", // para que el grid no se estire
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cardDay: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardHours: {
    fontSize: 14,
    marginTop: 2,
  },
});
