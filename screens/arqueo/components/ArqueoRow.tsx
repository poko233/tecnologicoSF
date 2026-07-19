// screens/arqueo/components/ArqueoRow.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { formatDateTimeNatural } from "@/utils/dateHelpers"; // ✅ CAMBIO DE IMPORTACIÓN
import { Eye } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Arqueo } from "../types/arqueo.types";
import { tableStyles } from "./tableStyles";

interface ArqueoRowProps {
  arqueo: Arqueo;
  onDetail: (arqueo: Arqueo) => void;
}

export function ArqueoRow({ arqueo, onDetail }: ArqueoRowProps) {
  const { theme } = useTheme();

  // ✅ Ahora usa formatDateTimeNatural para mostrar fecha + hora
  const fechaApertura = arqueo.fecha_apertura
    ? formatDateTimeNatural(arqueo.fecha_apertura)
    : "—";
  const fechaCierre = arqueo.fecha_cierre
    ? formatDateTimeNatural(arqueo.fecha_cierre)
    : "—";

  const estadoColor = arqueo.estado === "TERMINADO" ? "#10B981" : "#F59E0B";
  const estadoBg =
    arqueo.estado === "TERMINADO"
      ? "rgba(16,185,129,0.12)"
      : "rgba(245,158,11,0.12)";

  // Determinamos qué mostrar en la columna Usuario
  const usuarioDisplay =
    typeof arqueo.usuario === "string"
      ? arqueo.usuario
      : arqueo.usuario.usuario;

  // Nombre completo (si viene como objeto)
  const nombreCompleto =
    typeof arqueo.usuario === "object"
      ? `${arqueo.usuario.nombres || ""} ${arqueo.usuario.apellidoPaterno || ""}`.trim()
      : "—";

  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      {/* ID */}
      <View style={tableStyles.colId}>
        <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
          #{arqueo.id}
        </ThemedText>
      </View>

      {/* Turno */}
      <View style={tableStyles.colTurno}>
        <ThemedText style={{ fontWeight: "600", color: theme.colors.text }}>
          {arqueo.turno}
        </ThemedText>
      </View>

      {/* Apertura */}
      <View style={tableStyles.colApertura}>
        <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
          {fechaApertura}
        </ThemedText>
      </View>

      {/* Cierre */}
      <View style={tableStyles.colCierre}>
        <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
          {fechaCierre}
        </ThemedText>
      </View>

      {/* Total General */}
      <View style={tableStyles.colTotal}>
        <ThemedText style={{ fontWeight: "600", color: theme.colors.text }}>
          {arqueo.total_general?.toFixed(2) || "—"} Bs
        </ThemedText>
      </View>

      {/* Estado */}
      <View style={tableStyles.colEstado}>
        <View
          style={[
            styles.badge,
            { backgroundColor: estadoBg, borderColor: estadoColor },
          ]}
        >
          <ThemedText
            style={{ color: estadoColor, fontSize: 10, fontWeight: "700" }}
          >
            {arqueo.estado}
          </ThemedText>
        </View>
      </View>

      {/* Usuario (username) */}
      <View style={tableStyles.colUsuario}>
        <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
          {usuarioDisplay}
        </ThemedText>
      </View>

      {/* Nombre Completo */}
      <View style={tableStyles.colNombreCompleto}>
        <ThemedText style={{ color: theme.colors.text, fontSize: 13 }}>
          {nombreCompleto}
        </ThemedText>
      </View>

      {/* Acciones */}
      <View style={tableStyles.colAcciones}>
        <MotiPressable
          onPress={() => onDetail(arqueo)}
          animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
          style={styles.actionBtn}
        >
          <Eye size={18} color={theme.colors.primary} />
        </MotiPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 12, // ✅ ¡Este es el truco mágico para separar las columnas!
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtn: {
    padding: 4,
    borderRadius: 6,
  },
});
