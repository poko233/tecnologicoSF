import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { Cuota } from "../types/cuota.types";

interface PaymentModalProps {
  visible: boolean;
  cuota: Cuota | null;
  onClose: () => void;
  onConfirm: (
    cuotaId: number,
    metodo: string,
    comprobante: string,
    observacion: string,
  ) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  cuota,
  onClose,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const [metodo, setMetodo] = useState("EFECTIVO");
  const [comprobante, setComprobante] = useState("");
  const [observacion, setObservacion] = useState("");
  const [loading, setLoading] = useState(false);

  if (!cuota) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(cuota.idCuota, metodo, comprobante, observacion);
    setLoading(false);
    onClose();
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
            backgroundColor: theme.colors.card,
            borderRadius: 24,
            width: "100%",
            maxWidth: 500,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: theme.colors.text,
              }}
            >
              Registrar Pago
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </Pressable>
          </View>
          <View style={{ padding: 20, gap: 16 }}>
            <View
              style={{
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: 12,
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                Concepto
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                {cuota.tipo === "MATRICULA"
                  ? "Matrícula"
                  : `Cuota ${cuota.numeroCuota}`}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginTop: 8,
                }}
              >
                Monto: {cuota.monto.toFixed(2)} Bs.
              </Text>
            </View>

            <View>
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 4,
                  color: theme.colors.textSecondary,
                }}
              >
                Método de pago
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["EFECTIVO", "TRANSFERENCIA", "TARJETA", "QR"].map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setMetodo(m)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor:
                        metodo === m
                          ? theme.colors.primary
                          : theme.colors.backgroundSecondary,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          metodo === m ? "white" : theme.colors.textSecondary,
                      }}
                    >
                      {m}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <TextInput
              placeholder="N° Comprobante (opcional)"
              placeholderTextColor={theme.colors.textMuted}
              value={comprobante}
              onChangeText={setComprobante}
              style={{
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: 12,
                padding: 12,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            />
            <TextInput
              placeholder="Observaciones"
              placeholderTextColor={theme.colors.textMuted}
              value={observacion}
              onChangeText={setObservacion}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: 12,
                padding: 12,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            />
          </View>
          <View
            style={{
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <Pressable
              onPress={onClose}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: theme.colors.textSecondary }}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={loading}
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Confirmar Pago
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
