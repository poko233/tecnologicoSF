// screens/asistencia/components/spreadsheet/SpreadsheetSessionHeader.tsx
import { useTheme } from "@/theme/useTheme";
import { Check, Clock, X } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatFechaCorta } from "../../helpers/attendance.helpers";
import { Sesion } from "../../types/asistencia.types";
import { CELL_W } from "./SpreadsheetAttendanceCell";

export const HEADER_H = 108;
const FERIADO_TEXT = "#6d28d9";
const FERIADO_SOFT = "#ede9fe";

interface Props {
  sesion: Sesion;
  index: number;
  isToday: boolean;
  onPress: () => void;
  width?: number;
}

export function SpreadsheetSessionHeader({
  sesion,
  index,
  isToday,
  onPress,
  width,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  if (!sesion) return null;

  const fechaSafe = sesion.fecha ?? "";
  const diaSafe = sesion.dia ?? "—";

  const bg =
    sesion.estado === "tomada"
      ? isToday
        ? c.success + "22"
        : c.backgroundSecondary
      : sesion.estado === "feriado"
        ? FERIADO_SOFT
        : sesion.estado === "cancelada"
          ? c.destructive + "14"
          : c.backgroundSecondary;
  const borderBottom =
    sesion.estado === "tomada"
      ? isToday
        ? c.success
        : c.border
      : sesion.estado === "feriado"
        ? FERIADO_TEXT
        : sesion.estado === "cancelada"
          ? c.destructive
          : c.border;
  const labelColor =
    sesion.estado === "tomada"
      ? isToday
        ? c.success
        : c.textSecondary
      : sesion.estado === "feriado"
        ? FERIADO_TEXT
        : sesion.estado === "cancelada"
          ? c.destructive
          : c.textMuted;
  const dateColor =
    sesion.estado === "tomada"
      ? isToday
        ? c.success
        : c.text
      : sesion.estado === "feriado"
        ? FERIADO_TEXT
        : sesion.estado === "cancelada"
          ? c.destructive
          : c.textMuted;

  return (
    <MotiPressable
      onPress={onPress}
      animate={({ pressed }) => {
        "worklet";
        return { scale: pressed ? 0.97 : 1 };
      }}
      transition={{ type: "spring", damping: 18, stiffness: 250 }}
    >
      <View
        style={[
          styles.th,
          {
            width: width ?? (CELL_W + 4),
            backgroundColor: bg,
            borderBottomColor: borderBottom,
            borderBottomWidth: 2,
          },
        ]}
      >
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: labelColor }]} />
          <Text style={[styles.label, { color: labelColor }]}>
            S.{String(index + 1).padStart(2, "0")}
          </Text>
        </View>
        <View style={styles.dateWrap}>
          <Text
            numberOfLines={1}
            style={[
              styles.date,
              {
                color: dateColor,
                textDecorationLine:
                  sesion.estado === "cancelada" ? "line-through" : "none",
              },
            ]}
          >
            {formatFechaCorta(fechaSafe)}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.dayText, { color: dateColor }]}
          >
            {diaSafe.slice(0, 3)}
          </Text>
        </View>
        <View style={styles.statusWrap}>
          {sesion.estado === "tomada" ? (
            isToday ? (
              <View style={[styles.todayBadge, { backgroundColor: c.success }]}>
                <Text
                  style={[styles.todayText, { color: c.primaryForeground }]}
                >
                  HOY
                </Text>
              </View>
            ) : (
              <Check size={11} color={c.success} strokeWidth={3} />
            )
          ) : sesion.estado === "feriado" ? (
            <Text style={[styles.tag, { color: FERIADO_TEXT }]}>FER</Text>
          ) : sesion.estado === "cancelada" ? (
            <X size={11} color={c.destructive} strokeWidth={3} />
          ) : (
            <Clock size={11} color={c.textMuted} />
          )}
        </View>
      </View>
    </MotiPressable>
  );
}

const styles = StyleSheet.create({
  th: {
    width: CELL_W + 4,
    height: HEADER_H,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  label: { fontSize: 9, fontWeight: "800" },
  dateWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    transform: [{ rotate: "-90deg" }],
    width: 60,
    height: 16,
    justifyContent: "center",
  },
  date: { fontSize: 9, fontWeight: "700" },
  dayText: { fontSize: 8, fontWeight: "500" },
  statusWrap: { height: 14, alignItems: "center", justifyContent: "center" },
  tag: { fontSize: 8, fontWeight: "800", letterSpacing: 0.3 },
  todayBadge: { paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
  todayText: { fontSize: 7, fontWeight: "800" },
});
