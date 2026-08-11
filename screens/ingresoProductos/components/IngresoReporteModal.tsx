import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { Colors } from "../../../theme/types";
import { IngresoProducto } from "../types/ingresoProductos.types";
import {
    formatearFechaIngreso,
    formatearNumero,
} from "../utils/ingresoProductos.utils";

type Props = {
  visible: boolean;
  onClose: () => void;
  ingreso: IngresoProducto | null;
  colors: Colors;
};

export default function IngresoReporteModal({
  visible,
  onClose,
  ingreso,
  colors,
}: Props) {
  if (!ingreso) return null;

  const accent = (colors as any).success || colors.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            maxWidth: 600,
            width: "100%",
            maxHeight: "90%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 24,
              borderBottomWidth: 2,
              borderBottomColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: `${accent}20`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="checkmark-circle" size={28} color={accent} />
              </View>
              <View>
                <ThemedText
                  style={{
                    fontSize: 20,
                    fontWeight: "900",
                    color: colors.text,
                  }}
                >
                  Ingreso Registrado
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.textMuted,
                    marginTop: 2,
                  }}
                >
                  {formatearFechaIngreso(ingreso.fechaIngreso)} · N.º{" "}
                  {String(ingreso.idIngresoProducto).padStart(6, "0")}
                </ThemedText>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: colors.backgroundSecondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 500 }}
            contentContainerStyle={{ padding: 24, gap: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {!!ingreso.observacion && (
              <View
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  padding: 12,
                  borderRadius: 10,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: colors.textMuted,
                    marginBottom: 4,
                  }}
                >
                  OBSERVACIÓN
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  {ingreso.observacion}
                </ThemedText>
              </View>
            )}

            <View style={{ gap: 8 }}>
              <ThemedText
                style={{
                  fontSize: 13,
                  fontWeight: "900",
                  color: colors.textMuted,
                  textTransform: "uppercase",
                }}
              >
                Productos ingresados
              </ThemedText>

              {ingreso.detalles.map((detalle) => (
                <View
                  key={detalle.idDetalleIngresoProducto}
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    padding: 14,
                    borderRadius: 12,
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={{
                          fontSize: 14,
                          fontWeight: "900",
                          color: colors.text,
                        }}
                      >
                        {detalle.producto?.nombre || "Producto no disponible"}
                      </ThemedText>
                      <ThemedText
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: colors.textMuted,
                          marginTop: 2,
                        }}
                      >
                        {detalle.producto?.sku || "-"}
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={{ fontSize: 16, fontWeight: "900", color: accent }}
                    >
                      +{formatearNumero(detalle.cantidad)}
                    </ThemedText>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 4,
                      paddingTop: 8,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: colors.textSecondary,
                      }}
                    >
                      Stock anterior: {formatearNumero(detalle.stockAnterior)}
                    </ThemedText>
                    <ThemedText
                      style={{ fontSize: 12, fontWeight: "900", color: accent }}
                    >
                      Stock final: {formatearNumero(detalle.stockPosterior)}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>

            <View
              style={{
                backgroundColor: `${accent}10`,
                padding: 20,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: `${accent}30`,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: "900",
                    color: colors.text,
                  }}
                >
                  TOTAL UNIDADES
                </ThemedText>
                <ThemedText
                  style={{ fontSize: 28, fontWeight: "900", color: accent }}
                >
                  +{formatearNumero(ingreso.totalItems)}
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: colors.textMuted,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {ingreso.detalles.length} producto(s) actualizado(s)
              </ThemedText>
            </View>
          </ScrollView>

          <View
            style={{
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: accent,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons
                name="checkmark"
                size={20}
                color={colors.primaryForeground}
              />
              <ThemedText
                style={{
                  fontSize: 15,
                  fontWeight: "900",
                  color: colors.primaryForeground,
                }}
              >
                Aceptar
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
