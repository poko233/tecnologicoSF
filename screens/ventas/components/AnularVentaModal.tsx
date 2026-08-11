import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Colors } from "../../../theme/types";
import { InventarioVenta } from "../types/venta.types";

interface AnularVentaModalProps {
  visible: boolean;
  venta: InventarioVenta | null;
  onClose: () => void;
  onConfirm: (motivo: string, observacion?: string) => Promise<void>;
  colors: Colors;
  anulando?: boolean;
}

export const AnularVentaModal: React.FC<AnularVentaModalProps> = ({
  visible,
  venta,
  onClose,
  onConfirm,
  colors,
  anulando = false,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const [motivo, setMotivo] = useState("");
  const [observacion, setObservacion] = useState("");
  const [error, setError] = useState("");

  const handleConfirmar = async () => {
    if (!motivo.trim()) {
      setError("El motivo es obligatorio");
      return;
    }

    setError("");
    await onConfirm(motivo.trim(), observacion.trim() || undefined);

    // Limpiar formulario
    setMotivo("");
    setObservacion("");
  };

  const handleCancelar = () => {
    setMotivo("");
    setObservacion("");
    setError("");
    onClose();
  };

  if (!venta) return null;

  const fechaVenta = venta.fechaVenta
    ? new Date(venta.fechaVenta).toLocaleString("es-BO")
    : "N/A";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancelar}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: isMobile ? "100%" : 500,
            maxHeight: "90%",
            backgroundColor: colors.card,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 20,
              borderBottomWidth: 1,
              borderColor: colors.border,
              backgroundColor: `${colors.destructive}10`,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${colors.destructive}20`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="warning" size={24} color={colors.destructive} />
              </View>
              <View>
                <ThemedText style={{ fontSize: 18, fontWeight: "900" }}>
                  Anular Venta
                </ThemedText>
                <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>
                  Venta #{venta.idVenta}
                </ThemedText>
              </View>
            </View>

            <Pressable
              onPress={handleCancelar}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: colors.backgroundSecondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 500 }}
            contentContainerStyle={{ padding: 20, gap: 20 }}
          >
            {/* Información de la venta */}
            <View
              style={{
                padding: 16,
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 12,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <ThemedText style={{ fontSize: 13, color: colors.textMuted }}>
                  Fecha:
                </ThemedText>
                <ThemedText style={{ fontSize: 13, fontWeight: "700" }}>
                  {fechaVenta}
                </ThemedText>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <ThemedText style={{ fontSize: 13, color: colors.textMuted }}>
                  Total:
                </ThemedText>
                <ThemedText
                  style={{ fontSize: 16, fontWeight: "900", color: colors.primary }}
                >
                  Bs {Number(venta.total).toFixed(2)}
                </ThemedText>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <ThemedText style={{ fontSize: 13, color: colors.textMuted }}>
                  Método de pago:
                </ThemedText>
                <ThemedText style={{ fontSize: 13, fontWeight: "700" }}>
                  {venta.metodo_pago}
                </ThemedText>
              </View>

              {venta.arqueo && (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <ThemedText style={{ fontSize: 13, color: colors.textMuted }}>
                    Turno:
                  </ThemedText>
                  <ThemedText style={{ fontSize: 13, fontWeight: "700" }}>
                    {venta.arqueo.turno}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Advertencia */}
            <View
              style={{
                padding: 12,
                backgroundColor: `${colors.destructive}15`,
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: colors.destructive,
              }}
            >
              <ThemedText
                style={{ fontSize: 12, fontWeight: "700", color: colors.destructive }}
              >
                 Esta acción no se puede deshacer
              </ThemedText>
              <ThemedText
                style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}
              >
                Al anular esta venta, se restaurará el inventario automáticamente y se
                actualizarán los totales del arqueo.
              </ThemedText>
            </View>

            {/* Motivo */}
            <View>
              <ThemedText
                style={{
                  fontSize: 12,
                  fontWeight: "900",
                  color: colors.textMuted,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Motivo de anulación *
              </ThemedText>
              <TextInput
                style={{
                  backgroundColor: colors.input,
                  borderWidth: 1,
                  borderColor: error ? colors.destructive : colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  minHeight: 46,
                }}
                placeholder="Ej: Error en el registro de productos"
                placeholderTextColor={colors.textMuted}
                value={motivo}
                onChangeText={(text) => {
                  setMotivo(text);
                  setError("");
                }}
                maxLength={255}
              />
              {error && (
                <ThemedText
                  style={{
                    fontSize: 11,
                    color: colors.destructive,
                    marginTop: 4,
                  }}
                >
                  {error}
                </ThemedText>
              )}
            </View>

            {/* Observación */}
            <View>
              <ThemedText
                style={{
                  fontSize: 12,
                  fontWeight: "900",
                  color: colors.textMuted,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Observación (opcional)
              </ThemedText>
              <TextInput
                style={{
                  backgroundColor: colors.input,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
                placeholder="Detalles adicionales (opcional)"
                placeholderTextColor={colors.textMuted}
                value={observacion}
                onChangeText={setObservacion}
                multiline
                numberOfLines={4}
                maxLength={1000}
              />
            </View>
          </ScrollView>

          {/* Footer con botones */}
          <View
            style={{
              flexDirection: isMobile ? "column" : "row",
              gap: 12,
              padding: 20,
              borderTopWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.backgroundSecondary,
            }}
          >
            <Pressable
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 12,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={handleCancelar}
              disabled={anulando}
            >
              <ThemedText style={{ fontSize: 14, fontWeight: "900", color: colors.text }}>
                Cancelar
              </ThemedText>
            </Pressable>

            <Pressable
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 12,
                backgroundColor: anulando
                  ? colors.backgroundSecondary
                  : colors.destructive,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
              }}
              onPress={handleConfirmar}
              disabled={anulando}
            >
              {anulando ? (
                <>
                  <ActivityIndicator size="small" color={colors.primaryForeground} />
                  <ThemedText
                    style={{
                      fontSize: 14,
                      fontWeight: "900",
                      color: colors.textMuted,
                    }}
                  >
                    Anulando...
                  </ThemedText>
                </>
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color={colors.primaryForeground} />
                  <ThemedText
                    style={{
                      fontSize: 14,
                      fontWeight: "900",
                      color: colors.primaryForeground,
                    }}
                  >
                    Confirmar Anulación
                  </ThemedText>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
