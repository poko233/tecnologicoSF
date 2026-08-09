import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Colors } from "../../../theme/types";

interface BajaReporteModalProps {
  visible: boolean;
  onClose: () => void;
  baja: {
    concepto: string;
    observacion?: string;
    productos: Array<{
      nombre: string;
      sku: string;
      cantidad: number;
      precioVenta: number;
      subTotal: number;
    }>;
    fecha: string;
    total: number;
  } | null;
  colors: Colors;
}

export default function BajaReporteModal({
  visible,
  onClose,
  baja,
  colors,
}: BajaReporteModalProps) {
  if (!baja) return null;

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const conceptoLabels: Record<string, string> = {
    DAÑADO: "Producto dañado",
    VENCIDO: "Producto vencido",
    PERDIDA: "Pérdida",
    AJUSTE: "Ajuste de inventario",
  };

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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: `${colors.success}20`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={28}
                  color={colors.success}
                />
              </View>
              <View>
                <ThemedText
                  style={{
                    fontSize: 20,
                    fontWeight: "900",
                    color: colors.text,
                  }}
                >
                  Baja Registrada
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.textMuted,
                    marginTop: 2,
                  }}
                >
                  {formatearFecha(baja.fecha)}
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
            <View style={{ gap: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: colors.textMuted,
                  }}
                >
                  CONCEPTO
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 14,
                    fontWeight: "900",
                    color: colors.destructive,
                  }}
                >
                  {conceptoLabels[baja.concepto] || baja.concepto}
                </ThemedText>
              </View>

              {baja.observacion && (
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
                    {baja.observacion}
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={{ gap: 8 }}>
              <ThemedText
                style={{
                  fontSize: 13,
                  fontWeight: "900",
                  color: colors.textMuted,
                  textTransform: "uppercase",
                }}
              >
                Productos dados de baja
              </ThemedText>

              {baja.productos.map((producto, index) => (
                <View
                  key={index}
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
                        {producto.nombre}
                      </ThemedText>
                      <ThemedText
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: colors.textMuted,
                          marginTop: 2,
                        }}
                      >
                        {producto.sku}
                      </ThemedText>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <ThemedText
                        style={{
                          fontSize: 16,
                          fontWeight: "900",
                          color: colors.destructive,
                        }}
                      >
                        Bs {producto.subTotal.toFixed(2)}
                      </ThemedText>
                    </View>
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
                      Cantidad: {producto.cantidad}
                    </ThemedText>
                    <ThemedText
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: colors.textSecondary,
                      }}
                    >
                      Precio unitario: Bs {producto.precioVenta.toFixed(2)}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>

            <View
              style={{
                backgroundColor: `${colors.destructive}10`,
                padding: 20,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: `${colors.destructive}30`,
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
                  TOTAL BAJA
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 28,
                    fontWeight: "900",
                    color: colors.destructive,
                  }}
                >
                  Bs {baja.total.toFixed(2)}
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
                {baja.productos.reduce((sum, p) => sum + p.cantidad, 0)} items dados de baja
              </ThemedText>
            </View>
          </ScrollView>

          <View
            style={{
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              gap: 10,
            }}
          >
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: colors.primary,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons name="checkmark" size={20} color={colors.primaryForeground} />
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
