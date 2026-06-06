import { useTheme } from "@/theme/useTheme";
import { MotiView } from "moti";
import React, { useRef } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useNotasCalculations } from "../hooks/useNotasCalculations";
import { EstudiantePlanilla } from "../types/notas.types";

interface ColumnWidths {
  student: number;
  ec: number;
  asist: number;
  final: number;
  status: number;
  obs: number;
}

interface Props {
  estudiante: EstudiantePlanilla;
  ecs: { id: number; nombre: string }[];
  onScoreChange: (
    idInscripcion: number,
    ecId: number,
    puntaje: number | null,
  ) => void;
  onObservacionChange: (idInscripcion: number, observacion: string) => void;
  initialScores: Record<number, number | null>;
  initialAsistencia: number;
  initialObservacion: string;
  columnWidths: ColumnWidths;
}

export function GradingRow({
  estudiante,
  ecs,
  onScoreChange,
  onObservacionChange,
  initialScores,
  initialAsistencia,
  initialObservacion,
  columnWidths,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const ecScores = ecs.map((ec) => initialScores[ec.id] ?? 0);
  const { notaFinal, estado } = useNotasCalculations(
    ecScores,
    initialAsistencia,
  );

  const inputRefs = useRef<{ [key: number]: TextInput | null }>({});

  const handleScoreChange = (ecId: number, text: string) => {
    const value = text.trim() === "" ? null : parseFloat(text);
    if (value !== null && (isNaN(value) || value < 0 || value > 100)) return;
    onScoreChange(estudiante.id_inscripcion, ecId, value);
  };

  const focusNextInput = (currentEcId: number) => {
    const currentIndex = ecs.findIndex((ec) => ec.id === currentEcId);
    const nextIndex = currentIndex + 1;
    if (nextIndex < ecs.length) {
      inputRefs.current[ecs[nextIndex].id]?.focus();
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 250 }}
      style={[styles.row, { borderBottomColor: c.border + "100" }]}
    >
      {/* Estudiante (Ancho estricto) */}
      <View
        style={[
          styles.studentCell,
          {
            width: columnWidths.student,
            borderRightColor: c.border + "100",
            borderRightWidth: 1,
          },
        ]}
      >
        <Text style={[styles.studentName, { color: c.text }]} numberOfLines={1}>
          {estudiante.nombre_completo}
        </Text>
      </View>

      {/* Inputs de EC */}
      {ecs.map((ec) => (
        <View
          key={ec.id}
          style={[
            styles.scoreCell,
            {
              width: columnWidths.ec,
              borderRightColor: c.border + "100",
              borderRightWidth: 1,
              // AQUÍ ES DONDE APLICAMOS EL FONDO PARA QUE LLENE TODO
              backgroundColor:
                initialScores[ec.id] !== null && initialScores[ec.id]! < 51
                  ? c.destructive + "20"
                  : "transparent",
            },
          ]}
        >
          <TextInput
            ref={(ref) => {
              inputRefs.current[ec.id] = ref;
            }}
            style={[styles.input, { color: c.text }]}
            keyboardType="decimal-pad"
            // Si el valor es null o undefined, mostramos "0"
            value={(initialScores[ec.id] ?? 0).toString()}
            onChangeText={(text) => handleScoreChange(ec.id, text)}
            onSubmitEditing={() => focusNextInput(ec.id)}
            returnKeyType="next"
            selectTextOnFocus
            maxLength={6}
          />
        </View>
      ))}

      {/* Asistencia (solo lectura) */}
      <View
        style={[
          styles.scoreCell,
          {
            width: columnWidths.asist,
            borderRightColor: c.border + "100",
            borderRightWidth: 1,
            backgroundColor: c.backgroundSecondary + "60",
          },
        ]}
      >
        <Text style={[styles.input, styles.readOnly, { color: c.primary }]}>
          {initialAsistencia.toFixed(2)}
        </Text>
      </View>

      {/* Nota Final */}
      <View
        style={[
          styles.scoreCell,
          {
            width: columnWidths.final,
            backgroundColor: c.backgroundSecondary + "60",
            borderRightColor: c.border + "100",
            borderRightWidth: 1,
          },
        ]}
      >
        <Text
          style={[
            styles.input,
            {
              color: estado === "Aprobado" ? c.success : c.destructive,
              fontWeight: "700",
            },
          ]}
        >
          {ecScores.some((s) => s !== null) ? notaFinal.toFixed(2) : "-"}
        </Text>
      </View>

      {/* Estado */}
      <View
        style={[
          styles.statusCell,
          {
            width: columnWidths.status,
            borderRightColor: c.border + "100",
            borderRightWidth: 1,
          },
        ]}
      >
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                estado === "Aprobado" ? c.success + "15" : c.destructive + "15",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: estado === "Aprobado" ? c.success : c.destructive },
            ]}
          >
            {ecScores.some((s) => s !== null) ? estado : "Pendiente"}
          </Text>
        </View>
      </View>

      {/* Observaciones */}
      <View
        style={[
          styles.scoreCell,
          {
            flex: 1, // <-- 1. AÑADE ESTO
            minWidth: columnWidths.obs, // <-- 2. CAMBIA 'width' por 'minWidth'
            borderRightColor: c.border + "100",
            borderRightWidth: 1,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: c.text,
              textAlign: "left",
              paddingHorizontal: 12,
            },
          ]}
          placeholder="Añadir observación..."
          placeholderTextColor={c.textSecondary}
          value={initialObservacion}
          onChangeText={(text) =>
            onObservacionChange(estudiante.id_inscripcion, text)
          }
          returnKeyType="done"
        />
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    minHeight: 48,
    width: "100%",
  },
  studentCell: {
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  studentName: { fontSize: 14, fontWeight: "600" },
  studentId: { fontSize: 11, marginTop: 2 },
  scoreCell: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  readOnly: { backgroundColor: "transparent" },
  statusCell: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "600" },
});
