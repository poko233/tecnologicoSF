// screens/gestiones/components/GestionRow.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { formatDate } from "@/utils/dateHelpers";
import { Eye, FileText, Lock, PauseCircle, Pencil } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Gestion } from "../types/gestiones.types";
import { StatusBadge } from "./StatusBadge";
import { tableStyles } from "./tableStyles"; // ← Estilos de columna compartidos

interface GestionRowProps {
  gestion: Gestion;
  onDetail: (g: Gestion) => void;
  onEdit: (g: Gestion) => void;
  onClose: (g: Gestion) => void;
  onDelete: (g: Gestion) => void;
  onDeactivate: (g: Gestion) => void; // ← Nueva prop
}

export function GestionRow({
  gestion,
  onDetail,
  onEdit,
  onClose,
  onDelete,
  onDeactivate,
}: GestionRowProps) {
  const { theme } = useTheme();
  const isClosed = gestion.estado === "cerrado";
  const isActive = gestion.estado === "activo";
  const isInactive = gestion.estado === "inactivo";

  const fechaInicio = gestion.fecha_inicio
    ? formatDate(gestion.fecha_inicio)
    : "—";
  const fechaFin = gestion.fecha_fin ? formatDate(gestion.fecha_fin) : "—";

  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      {/* --- Columna ID --- */}
      <View style={tableStyles.colId}>
        <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
          #{gestion.id}
        </ThemedText>
      </View>

      {/* --- Columna NOMBRE --- */}
      <View style={tableStyles.colNombre}>
        <ThemedText style={{ fontWeight: "600", color: theme.colors.text }}>
          {gestion.nombre}
        </ThemedText>
      </View>

      {/* --- Columna PERÍODO --- */}
      <View style={tableStyles.colPeriodo}>
        <ThemedText style={{ color: theme.colors.text }}>
          {gestion.periodo} ({gestion.anio})
        </ThemedText>
      </View>

      {/* --- Columna FECHAS --- */}
      <View style={tableStyles.colFechas}>
        <View style={styles.dateRow}>
          <ThemedText
            style={{ color: theme.colors.textSecondary, fontSize: 12 }}
          >
            {fechaInicio}
          </ThemedText>
          <ThemedText
            style={{ color: theme.colors.textSecondary, fontSize: 12 }}
          >
            {" "}
            -{" "}
          </ThemedText>
          <ThemedText
            style={{ color: theme.colors.textSecondary, fontSize: 12 }}
          >
            {fechaFin}
          </ThemedText>
        </View>
      </View>

      {/* --- Columna ESTADO --- */}
      <View style={tableStyles.colEstado}>
        <StatusBadge estado={gestion.estado} />
        {isClosed && gestion.cerrado_por && (
          <ThemedText
            style={{
              fontSize: 11,
              color: theme.colors.textTertiary,
              marginTop: 2,
            }}
          >
            Por: {gestion.cerrado_por.nombre}
          </ThemedText>
        )}
      </View>

      {/* --- Columna ACCIONES --- */}
      <View style={tableStyles.colAcciones}>
        <View style={styles.actions}>
          {isActive ? (
            <>
              <MotiPressable
                onPress={() => onDetail(gestion)}
                animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
              >
                <Eye size={18} color={theme.colors.textSecondary} />
              </MotiPressable>

              <MotiPressable
                onPress={() => onEdit(gestion)}
                animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
              >
                <Pencil size={18} color={theme.colors.textSecondary} />
              </MotiPressable>

              <MotiPressable
                onPress={() => onClose(gestion)}
                animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
              >
                <Lock size={18} color={theme.colors.warning} />
              </MotiPressable>

              <MotiPressable
                onPress={() => onDeactivate(gestion)}
                animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
              >
                <PauseCircle size={18} color={theme.colors.info} />
              </MotiPressable>
            </>
          ) : (
            <MotiPressable
              onPress={() => onDetail(gestion)}
              animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
            >
              <FileText size={18} color={theme.colors.textSecondary} />
            </MotiPressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16, // mismo que la cabecera
    alignItems: "center",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
});
