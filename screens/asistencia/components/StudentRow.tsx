// screens/asistencia/components/StudentRow.tsx
import { useTheme } from "@/theme/useTheme";
import { MotiView } from "moti";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  AsistenciaTipo,
  EstudianteAsistencia,
} from "../types/asistencia.types";
import { ObservationInput } from "./ObservationInput";
import { StatusButtonGroup } from "./StatusButtonGroup";

interface Props {
  estudiante: EstudianteAsistencia;
  selectedHorarioId: number | null;
  currentStatus: AsistenciaTipo | null;
  currentObservacion: string;
  onStatusChange: (tipo: AsistenciaTipo) => void;
  onObservacionChange: (text: string) => void;
  index: number;
}

// Formatea "Nombres Apellidos" → "Apellido Nombres" (última palabra como apellido)
const formatNombreApellido = (nombreCompleto: string): string => {
  const partes = nombreCompleto.trim().split(/\s+/);
  if (partes.length <= 1) return nombreCompleto;
  const apellido = partes[partes.length - 1];
  const nombres = partes.slice(0, -1).join(" ");
  return `${apellido} ${nombres}`;
};

export function StudentRow({
  estudiante,
  currentStatus,
  currentObservacion,
  onStatusChange,
  onObservacionChange,
  index,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const initials = useMemo(
    () =>
      estudiante.nombre_completo
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [estudiante.nombre_completo],
  );

  const displayName = useMemo(
    () => formatNombreApellido(estudiante.nombre_completo),
    [estudiante.nombre_completo],
  );

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 350, delay: index * 40 }}
      style={[styles.row, { borderBottomColor: c.divider }]}
    >
      {/* Columna Estudiante */}
      <View style={styles.studentColumn}>
        <View style={[styles.avatar, { backgroundColor: c.secondary }]}>
          <Text style={[styles.avatarText, { color: c.secondaryForeground }]}>
            {initials}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {displayName}
          </Text>
          <Text
            style={[styles.carrera, { color: c.textSecondary }]}
            numberOfLines={1}
          >
            {estudiante.carrera}
          </Text>
        </View>
      </View>

      {/* Columna Estado (botones centrados) */}
      <View style={styles.statusColumn}>
        <StatusButtonGroup
          selectedTipo={currentStatus}
          onSelect={onStatusChange}
        />
      </View>

      {/* Columna Observación */}
      <View style={styles.obsColumn}>
        <ObservationInput
          value={currentObservacion}
          onChangeText={onObservacionChange}
        />
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  studentColumn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "700",
    fontSize: 14,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
  carrera: {
    fontSize: 12,
  },
  statusColumn: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  obsColumn: {
    flex: 3,
    justifyContent: "center",
  },
});
