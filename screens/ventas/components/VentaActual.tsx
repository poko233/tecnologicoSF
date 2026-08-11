import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Colors } from "../../../theme/types";
import { CarritoItem, MetodoPago, VentaResumen } from "../types/venta.types";

interface VentaActualProps {
  carrito: CarritoItem[];
  resumen: VentaResumen;
  metodoPago: MetodoPago;
  setMetodoPago: (value: MetodoPago) => void;
  observacion: string;
  setObservacion: (value: string) => void;
  onActualizarCantidad: (idProducto: number, cantidad: number) => void;
  onEliminarProducto: (idProducto: number) => void;
  onFinalizarVenta: () => void;
  guardando: boolean;
  styles: any;
  colors: Colors;
}

export const VentaActual: React.FC<VentaActualProps> = ({
  carrito,
  resumen,
  metodoPago,
  setMetodoPago,
  observacion,
  setObservacion,
  onActualizarCantidad,
  onEliminarProducto,
  onFinalizarVenta,
  guardando,
  styles,
  colors,
}) => {
  const metodosPago: Array<{ value: MetodoPago; label: string; icon: string }> = [
    { value: "EFECTIVO", label: "Efectivo", icon: "cash-outline" },
    { value: "TARJETA", label: "Tarjeta", icon: "card-outline" },
    { value: "QR", label: "QR", icon: "qr-code-outline" },
    { value: "TRANSFERENCIA", label: "Transfer", icon: "swap-horizontal-outline" },
  ];

  return (
    <View style={styles.ventaColumn}>
      {/* Header compacto */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: colors.backgroundSecondary,
        }}
      >
        <ThemedText
          style={{
            fontSize: 13,
            fontWeight: "900",
            textTransform: "uppercase",
            color: colors.textMuted,
          }}
        >
          Venta Actual
        </ThemedText>
        <View
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 12,
          }}
        >
          <ThemedText style={{ fontSize: 11, fontWeight: "700", color: colors.primaryForeground }}>
            {carrito.length}
          </ThemedText>
        </View>
      </View>

      {/* Lista del carrito con SCROLL PROPIO */}
      <ScrollView
        style={{
          flex: 1,
          maxHeight: 300, // Altura máxima fija para el scroll
        }}
        showsVerticalScrollIndicator={true}
      >
        {carrito.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              minHeight: 150,
            }}
          >
            <Ionicons name="cart-outline" size={40} color={colors.textMuted} />
            <ThemedText style={{ marginTop: 8, fontSize: 12, color: colors.textMuted }}>
              Carrito vacío
            </ThemedText>
          </View>
        ) : (
          carrito.map((item) => (
            <View
              key={item.idProducto}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 8,
                borderBottomWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                gap: 8,
              }}
            >
              {/* Imagen compacta */}
              {item.imagenUrl ? (
                <Image
                  source={{ uri: item.imagenUrl }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    backgroundColor: colors.backgroundSecondary,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    backgroundColor: colors.backgroundSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="image-outline" size={16} color={colors.textMuted} />
                </View>
              )}

              {/* Info del producto */}
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 11, fontWeight: "700" }} numberOfLines={1}>
                  {item.nombre}
                </ThemedText>
                <ThemedText style={{ fontSize: 10, color: colors.textMuted }}>
                  Bs {item.precioUnitario.toFixed(2)} × {item.cantidad}
                </ThemedText>
                <ThemedText
                  style={{ fontSize: 11, fontWeight: "900", color: colors.primary, marginTop: 2 }}
                >
                  Bs {item.subTotal.toFixed(2)}
                </ThemedText>
              </View>

              {/* Controles de cantidad compactos */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.backgroundSecondary,
                  borderRadius: 6,
                  padding: 2,
                }}
              >
                <Pressable
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => onActualizarCantidad(item.idProducto, item.cantidad - 1)}
                >
                  <Ionicons name="remove" size={14} color={colors.text} />
                </Pressable>
                <ThemedText style={{ fontSize: 11, fontWeight: "700", minWidth: 20, textAlign: "center" }}>
                  {item.cantidad}
                </ThemedText>
                <Pressable
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => onActualizarCantidad(item.idProducto, item.cantidad + 1)}
                >
                  <Ionicons name="add" size={14} color={colors.text} />
                </Pressable>
              </View>

              {/* Botón eliminar */}
              <Pressable
                style={{
                  width: 28,
                  height: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: `${colors.destructive}15`,
                  borderRadius: 6,
                }}
                onPress={() => onEliminarProducto(item.idProducto)}
              >
                <Ionicons name="trash-outline" size={16} color={colors.destructive} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      {/* Sección SIEMPRE VISIBLE: Total, Método de Pago, Observación, Finalizar */}
      {carrito.length > 0 && (
        <View
          style={{
            padding: 12,
            borderTopWidth: 2,
            borderColor: colors.border,
            backgroundColor: colors.card,
            gap: 10,
          }}
        >
          {/* Total */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: `${colors.primary}10`,
              borderRadius: 8,
            }}
          >
            <ThemedText style={{ fontSize: 12, fontWeight: "700", color: colors.textMuted }}>
              TOTAL A PAGAR:
            </ThemedText>
            <ThemedText style={{ fontSize: 18, fontWeight: "900", color: colors.primary }}>
              Bs {resumen.total.toFixed(2)}
            </ThemedText>
          </View>

          {/* Métodos de pago compactos */}
          <View>
            <ThemedText
              style={{ fontSize: 10, fontWeight: "700", color: colors.textMuted, marginBottom: 6 }}
            >
              MÉTODO DE PAGO
            </ThemedText>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {metodosPago.map((metodo) => (
                <Pressable
                  key={metodo.value}
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 8,
                    paddingHorizontal: 4,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor:
                      metodoPago === metodo.value ? colors.primary : colors.border,
                    backgroundColor:
                      metodoPago === metodo.value
                        ? colors.primary
                        : colors.backgroundSecondary,
                  }}
                  onPress={() => setMetodoPago(metodo.value)}
                >
                  <Ionicons
                    name={metodo.icon as any}
                    size={18}
                    color={
                      metodoPago === metodo.value
                        ? colors.primaryForeground
                        : colors.text
                    }
                  />
                  <ThemedText
                    style={{
                      fontSize: 9,
                      fontWeight: "700",
                      marginTop: 2,
                      color:
                        metodoPago === metodo.value
                          ? colors.primaryForeground
                          : colors.text,
                    }}
                  >
                    {metodo.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Observación compacta */}
          <TextInput
            style={{
              backgroundColor: colors.input,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 8,
              fontSize: 11,
              color: colors.text,
              minHeight: 40,
            }}
            placeholder="Observación (opcional)"
            placeholderTextColor={colors.textMuted}
            value={observacion}
            onChangeText={setObservacion}
            multiline
            numberOfLines={2}
          />

          {/* Botón finalizar compacto */}
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: guardando ? colors.backgroundSecondary : colors.success,
              paddingVertical: 12,
              borderRadius: 10,
              gap: 8,
            }}
            onPress={onFinalizarVenta}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <ThemedText style={{ fontSize: 13, fontWeight: "900", color: "#fff" }}>
                  Finalizar Venta
                </ThemedText>
              </>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
};
