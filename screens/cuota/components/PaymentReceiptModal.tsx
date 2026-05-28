// screens/cuota/components/PaymentReceiptModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { formatDisplayDate } from "../../../utils/dateHelpers";
import { Pago } from "../types/pago.types";

interface Props {
  visible: boolean;
  pago: Pago | null;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<Props> = ({
  visible,
  pago,
  onClose,
}) => {
  const { theme } = useTheme();

  if (!pago) return null;

  const getMontoPagado = (c: any) => {
    if (c.pivot && c.pivot.monto_pagado !== undefined && c.pivot.monto_pagado !== null) {
      return c.pivot.monto_pagado;
    }
    if (c.monto_pagado !== undefined && c.monto_pagado !== null) {
      return c.monto_pagado;
    }
    return c.monto || 0;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center px-5"
        style={{ backgroundColor: theme.colors.overlay }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{ backgroundColor: theme.colors.card }}
        >
          {/* Cabecera con gradiente */}
          <LinearGradient
            colors={theme.colors.gradient}
            className="px-6 py-6 items-center"
          >
            <Ionicons name="checkmark-circle" size={48} color="white" />
            <Text className="text-white text-lg font-bold mt-2">
              Comprobante de Pago
            </Text>
            <Text className="text-white text-xs opacity-80">
              #{pago.idPago} · {formatDisplayDate(pago.created_at)}
            </Text>
          </LinearGradient>

          <ScrollView className="p-6" contentContainerStyle={{ gap: 16 }}>
            <View className="flex-row justify-between">
              <Text
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                Método
              </Text>
              <Text
                className="text-sm font-semibold"
                style={{ color: theme.colors.text }}
              >
                {pago.metodo}
              </Text>
            </View>

            {pago.comprobante ? (
              <View className="flex-row justify-between">
                <Text
                  className="text-sm"
                  style={{ color: theme.colors.textSecondary }}
                >
                  N° Comprobante
                </Text>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.colors.text }}
                >
                  {pago.comprobante}
                </Text>
              </View>
            ) : null}

            {pago.observacion ? (
              <View>
                <Text
                  className="text-sm mb-1"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Observación
                </Text>
                <Text className="text-sm" style={{ color: theme.colors.text }}>
                  {pago.observacion}
                </Text>
              </View>
            ) : null}

            <View
              className="border-t pt-3"
              style={{ borderColor: theme.colors.divider }}
            >
              <Text
                className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.colors.textTertiary }}
              >
                Detalle de cuotas
              </Text>
              {pago.cuotas.map((c) => (
                <View
                  key={c.idCuota}
                  className="flex-row justify-between items-center py-2 border-b"
                  style={{ borderColor: theme.colors.divider }}
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      name={c.tipo === "MATRICULA" ? "receipt-outline" : "calendar-outline"}
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text
                      className="text-sm font-medium"
                      style={{ color: theme.colors.text }}
                    >
                      {c.tipo === "MATRICULA"
                        ? "Matrícula"
                        : `Cuota ${c.numeroCuota}`}
                    </Text>
                  </View>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: theme.colors.text }}
                  >
                    {parseFloat(getMontoPagado(c) as any).toFixed(2)} Bs.
                  </Text>
                </View>
              ))}
            </View>

            <View className="flex-row justify-between pt-2">
              <Text
                className="text-base font-bold"
                style={{ color: theme.colors.text }}
              >
                Total
              </Text>
              <Text
                className="text-xl font-extrabold"
                style={{ color: theme.colors.primary }}
              >
                {parseFloat(pago.monto as any).toFixed(2)} Bs.
              </Text>
            </View>

            {pago.registradoPor && (
              <Text
                className="text-xs mt-2 text-center"
                style={{ color: theme.colors.textMuted }}
              >
                Registrado por: {pago.registradoPor.nombres}
              </Text>
            )}
          </ScrollView>

          <View
            className="px-6 py-4 border-t"
            style={{ borderColor: theme.colors.border }}
          >
            <Pressable
              onPress={onClose}
              className="py-3 rounded-xl items-center"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Text className="text-white font-bold">Cerrar</Text>
            </Pressable>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};
