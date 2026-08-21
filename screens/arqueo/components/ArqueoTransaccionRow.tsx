import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { formatDateTimeNatural } from "@/utils/dateHelpers";
import { MoreVertical, Receipt } from "lucide-react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Egreso, Ingreso } from "../types/arqueo.types";
import { IngresoCombinado, Transaccion } from "../types/transaccion.types";
import { tableStyles } from "./tableStyles";

interface ArqueoTransaccionRowProps {
  transaccion: Transaccion | IngresoCombinado | Egreso | Ingreso;
  index: number;
  onUpdateEstado?: (nuevoEstado: "VALIDO" | "ANULADO") => void;
  isUpdating?: boolean;
  showReceipt?: boolean;
  onPrintReceipt?: () => void;
  showMenu?: boolean;
}

const getStringValue = (value: any, fallback: string = "—"): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    return (
      value.nombre ||
      value.usuario ||
      value.transaccion ||
      value.codigo ||
      value.detalle ||
      fallback
    );
  }
  return fallback;
};

export function ArqueoTransaccionRow({
  transaccion,
  index,
  onUpdateEstado,
  isUpdating = false,
  showReceipt = false,
  onPrintReceipt,
  showMenu = true,
}: ArqueoTransaccionRowProps) {
  const { theme } = useTheme();
  const [showContextMenu, setShowContextMenu] = useState(false);

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

  const fecha = transaccion.fecha_registro;
  const comprobante = getStringValue(transaccion.comprobante);
  const usuario = getStringValue(transaccion.usuario);
  const concepto = transaccion.tipo_transaccion
    ? typeof transaccion.tipo_transaccion === "string"
      ? transaccion.tipo_transaccion
      : transaccion.tipo_transaccion.transaccion ||
        transaccion.tipo_transaccion.codigo ||
        transaccion.detalle ||
        "Sin concepto"
    : transaccion.detalle || "Sin concepto";

  const handleMenuPress = () => {
    if (isUpdating) return;
    setShowContextMenu((prev) => !prev);
  };

  const handleActionPress = () => {
    setShowContextMenu(false);
    if (onUpdateEstado) onUpdateEstado(nuevoEstado);
  };

  return (
    <View
      style={[styles.row, rowBg, { borderBottomColor: theme.colors.border }]}
    >
      <View style={tableStyles.colId}>
        <ThemedText style={[{ fontSize: 13 }, textStyle]}>
          {index + 1}
        </ThemedText>
      </View>

      <View style={tableStyles.colFecha}>
        <ThemedText style={[{ fontSize: 13 }, textStyle]}>
          {formatDateTimeNatural(fecha)}
        </ThemedText>
      </View>

      <View style={[tableStyles.colBoleta, { flexWrap: "wrap" }]}>
        <ThemedText
          style={[
            { fontSize: 13, fontWeight: "600" },
            textStyle,
            {
              flexWrap: "wrap",
              ...(Platform.OS === "web" && { wordBreak: "break-word" }),
            },
          ]}
        >
          {comprobante}
        </ThemedText>
      </View>

      <View style={tableStyles.colCajero}>
        <ThemedText style={[{ fontSize: 13 }, textStyle]}>{usuario}</ThemedText>
      </View>

      <View style={[tableStyles.colConcepto, { flexWrap: "wrap" }]}>
        <ThemedText
          style={[
            { fontSize: 13, fontWeight: "500" },
            textStyle,
            {
              flexWrap: "wrap",
              ...(Platform.OS === "web" && { wordBreak: "break-word" }),
            },
          ]}
        >
          {concepto}
        </ThemedText>
      </View>

      <View style={tableStyles.colMonto}>
        <ThemedText
          style={[
            { fontSize: 14, fontWeight: "600", textAlign: "right" },
            textStyle,
          ]}
        >
          {Number(transaccion.monto || 0).toFixed(2)} Bs
        </ThemedText>
      </View>

      <View style={[tableStyles.colGlosa, { flexWrap: "wrap" }]}>
        <ThemedText
          style={[
            { fontSize: 12 },
            textStyle,
            {
              flexWrap: "wrap",
              ...(Platform.OS === "web" && { wordBreak: "break-word" }),
            },
          ]}
        >
          {getStringValue(transaccion.detalle)}
        </ThemedText>
      </View>

      <View style={[tableStyles.colTipoPago, { flexWrap: "wrap" }]}>
        <ThemedText
          style={[
            { fontSize: 13 },
            textStyle,
            {
              flexWrap: "wrap",
              ...(Platform.OS === "web" && { wordBreak: "break-word" }),
            },
          ]}
        >
          {getStringValue(transaccion.metodo)}
        </ThemedText>
      </View>

      <View style={tableStyles.colEstado}>
        <View style={[styles.badge, badgeBg, { borderWidth: 1 }]}>
          <ThemedText style={[{ fontSize: 10, fontWeight: "700" }, badgeText]}>
            {transaccion.estado}
          </ThemedText>
        </View>
      </View>

      <View style={tableStyles.colAcciones}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          {showReceipt && onPrintReceipt && (
            <MotiPressable
              onPress={onPrintReceipt}
              animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
            >
              <Receipt size={18} color={theme.colors.primary} />
            </MotiPressable>
          )}

          {showMenu && (
            <>
              <MotiPressable
                onPress={handleMenuPress}
                disabled={isUpdating}
                animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
                style={styles.menuBtn}
              >
                <MoreVertical
                  size={18}
                  color={
                    isUpdating
                      ? theme.colors.textMuted
                      : theme.colors.textSecondary
                  }
                />
              </MotiPressable>

              {showContextMenu && (
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
            </>
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
