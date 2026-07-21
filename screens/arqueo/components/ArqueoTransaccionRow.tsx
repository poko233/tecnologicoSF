// screens/arqueo/components/ArqueoTransaccionRow.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { formatDateTimeNatural } from "@/utils/dateHelpers";
import { MoreVertical } from "lucide-react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Transaccion } from "../types/transaccion.types";
import { tableStyles } from "./tableStyles";

interface ArqueoTransaccionRowProps {
  transaccion: Transaccion;
  index: number;
  onUpdateEstado: (nuevoEstado: "VALIDO" | "ANULADO") => void;
  isUpdating: boolean;
}

export function ArqueoTransaccionRow({
  transaccion,
  index,
  onUpdateEstado,
  isUpdating,
}: ArqueoTransaccionRowProps) {
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const isAnulado = transaccion.estado === "ANULADO";
  const nuevoEstado = isAnulado ? "VALIDO" : "ANULADO";
  const labelAccion = isAnulado ? "Validar" : "Anular";

  const textStyle = isAnulado
    ? {
        color: theme.colors.textSecondary,
        textDecorationLine: "line-through" as const,
      }
    : { color: theme.colors.text };

  const rowBg = isAnulado
    ? { backgroundColor: theme.colors.destructive + "15" }
    : {};

  const badgeBg = isAnulado
    ? {
        backgroundColor: theme.colors.destructive + "20",
        borderColor: theme.colors.destructive,
      }
    : {
        backgroundColor: theme.colors.backgroundSecondary,
        borderColor: theme.colors.border,
      };

  const badgeText = isAnulado
    ? { color: theme.colors.destructive }
    : { color: theme.colors.textSecondary };

  const handleMenuPress = () => {
    if (isUpdating) return;
    setShowMenu((prev) => !prev);
  };

  //  NUEVO: Acción directa sin preguntas ni Alert
  const handleActionPress = () => {
    setShowMenu(false);
    onUpdateEstado(nuevoEstado);
  };

  return (
    <View
      style={[styles.row, rowBg, { borderBottomColor: theme.colors.border }]}
    >
      {/* # */}
      <View style={tableStyles.colId}>
        <ThemedText style={[{ fontSize: 13 }, textStyle]}>
          {index + 1}
        </ThemedText>
      </View>

      {/* Fecha Registro */}
      <View style={tableStyles.colFecha}>
        <ThemedText style={[{ fontSize: 13 }, textStyle]}>
          {formatDateTimeNatural(transaccion.fecha_registro)}
        </ThemedText>
      </View>

      {/* Boleta */}
      <View style={tableStyles.colBoleta}>
        <ThemedText style={[{ fontSize: 13, fontWeight: "600" }, textStyle]}>
          {transaccion.comprobante || "—"}
        </ThemedText>
      </View>

      {/* Cajero */}
      <View style={tableStyles.colCajero}>
        <ThemedText style={[{ fontSize: 13 }, textStyle]}>
          {transaccion.usuario}
        </ThemedText>
      </View>

      {/* Concepto */}
      <View style={tableStyles.colConcepto}>
        <ThemedText
          style={[{ fontSize: 13, fontWeight: "500" }, textStyle]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {transaccion.tipo_transaccion ||
            transaccion.detalle ||
            "Sin concepto"}
        </ThemedText>
      </View>

      {/* Monto */}
      <View style={tableStyles.colMonto}>
        <ThemedText
          style={[
            { fontSize: 14, fontWeight: "600", textAlign: "right" },
            textStyle,
          ]}
        >
          {transaccion.monto.toFixed(2)} Bs
        </ThemedText>
      </View>

      {/* Glosa */}
      <View style={tableStyles.colGlosa}>
        <ThemedText
          style={[{ fontSize: 12 }, textStyle]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {transaccion.detalle || "—"}
        </ThemedText>
      </View>

      {/* Tipo Pago */}
      <View style={tableStyles.colTipoPago}>
        <ThemedText style={[{ fontSize: 13 }, textStyle]}>
          {transaccion.metodo}
        </ThemedText>
      </View>

      {/* Estado */}
      <View style={tableStyles.colEstado}>
        <View style={[styles.badge, badgeBg, { borderWidth: 1 }]}>
          <ThemedText style={[{ fontSize: 10, fontWeight: "700" }, badgeText]}>
            {transaccion.estado}
          </ThemedText>
        </View>
      </View>

      {/* Acciones */}
      <View style={tableStyles.colAcciones}>
        {/* Botón de 3 puntos */}
        <MotiPressable
          onPress={handleMenuPress}
          disabled={isUpdating}
          animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
          style={styles.menuBtn}
        >
          <MoreVertical
            size={18}
            color={
              isUpdating ? theme.colors.textMuted : theme.colors.textSecondary
            }
          />
        </MotiPressable>

        {/* Menú contextual flotante */}
        {showMenu && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "timing", duration: 150 }}
            style={[
              styles.contextMenu,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <MotiPressable
              onPress={handleActionPress}
              style={[
                styles.menuItem,
                { borderBottomColor: theme.colors.border },
              ]}
            >
              <ThemedText
                style={{
                  fontSize: 13,
                  color: isAnulado
                    ? theme.colors.primary
                    : theme.colors.destructive,
                }}
              >
                {labelAccion}
              </ThemedText>
            </MotiPressable>
          </MotiView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  menuBtn: { padding: 4, borderRadius: 6 },
  contextMenu: {
    position: "absolute",
    top: -8,
    right: 24,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 4,
    zIndex: 999,
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minWidth: 140,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0,
  },
});
