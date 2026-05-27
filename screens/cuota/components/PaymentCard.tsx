// screens/cuota/components/PaymentCard.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { formatDisplayDate } from "../../../utils/dateHelpers";
import { Pago } from "../types/pago.types";

interface Props {
  pago: Pago;
  index: number;
  onPressReceipt: (pago: Pago) => void;
}

const metodoIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  EFECTIVO: "cash-outline",
  TRANSFERENCIA: "swap-horizontal-outline",
  TARJETA: "card-outline",
  QR: "qr-code-outline",
};

export const PaymentCard: React.FC<Props> = ({
  pago,
  index,
  onPressReceipt,
}) => {
  const { theme } = useTheme();

  const handleReceipt = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPressReceipt(pago);
  };

  // Asegurar que monto sea número
  const montoNum =
    typeof pago.monto === "string" ? parseFloat(pago.monto) : pago.monto;

  const getMethodConfig = (method: string) => {
    switch (method) {
      case "EFECTIVO":
        return { icon: "cash-outline" as const, color: "#10B981", bg: "#10B98115" };
      case "TRANSFERENCIA":
        return { icon: "swap-horizontal-outline" as const, color: "#3B82F6", bg: "#3B82F615" };
      case "TARJETA":
        return { icon: "card-outline" as const, color: "#8B5CF6", bg: "#8B5CF615" };
      case "QR":
        return { icon: "qr-code-outline" as const, color: "#F59E0B", bg: "#F59E0B15" };
      default:
        return { icon: "wallet-outline" as const, color: theme.colors.primary, bg: theme.colors.primarySubtle };
    }
  };

  const methodConfig = getMethodConfig(pago.metodo);
  const showObservation = pago.observacion && 
    pago.observacion.toLowerCase() !== "ninguna" && 
    pago.observacion.trim() !== "" &&
    pago.observacion.toLowerCase() !== "pagos";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12, scale: 0.98 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: "spring",
        damping: 18,
        stiffness: 200,
        delay: index * 80,
      }}
      className="rounded-2xl border p-4 mb-4"
      style={{
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center gap-3">
        {/* Círculo con Icono del Método de Pago */}
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: methodConfig.bg }}
        >
          <Ionicons
            name={methodConfig.icon}
            size={22}
            color={methodConfig.color}
          />
        </View>

        {/* Información del Pago */}
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <View>
              <Text
                className="text-base font-bold"
                style={{ color: theme.colors.text }}
              >
                Transacción #{pago.idPago}
              </Text>
              <Text
                className="text-xs mt-0.5"
                style={{ color: theme.colors.textSecondary }}
              >
                {formatDisplayDate(pago.created_at)}
              </Text>
            </View>
            
            {/* Monto a la derecha */}
            <Text
              className="text-lg font-black text-right"
              style={{ color: theme.colors.success }}
            >
              +{montoNum.toFixed(2)} Bs.
            </Text>
          </View>
        </View>
      </View>

      {/* Observación si existe y no es genérica */}
      {showObservation ? (
        <View
          className="mt-3 p-2.5 rounded-xl border border-dashed"
          style={{
            backgroundColor: theme.colors.backgroundSecondary,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            className="text-xs italic"
            style={{ color: theme.colors.textSecondary }}
          >
            “{pago.observacion}”
          </Text>
        </View>
      ) : null}

      {/* Separador */}
      <View
        className="my-3 border-t"
        style={{ borderColor: theme.colors.divider }}
      />

      <View className="flex-row justify-between items-center flex-wrap gap-3">
        {/* Cuotas del pago */}
        <View className="flex-1 min-w-[200px]">
          <Text
            className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
            style={{ color: theme.colors.textTertiary }}
          >
            Abonado a:
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {pago.cuotas?.slice(0, 3).map((c) => (
              <View
                key={c.idCuota}
                className="px-2.5 py-1 rounded-full border flex-row items-center gap-1"
                style={{
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                }}
              >
                <Ionicons
                  name={c.tipo === "MATRICULA" ? "receipt-outline" : "calendar-outline"}
                  size={11}
                  color={theme.colors.textSecondary}
                />
                <Text
                  className="text-xs font-medium"
                  style={{ color: theme.colors.text }}
                >
                  {c.tipo === "MATRICULA" ? "Matrícula" : `Cuota ${c.numeroCuota}`}
                </Text>
              </View>
            ))}
            {(pago.cuotas?.length || 0) > 3 && (
              <View
                className="px-2.5 py-1 rounded-full border justify-center"
                style={{
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: theme.colors.textSecondary }}
                >
                  +{pago.cuotas!.length - 3} más
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Botón de acción */}
        <Pressable
          onPress={handleReceipt}
          className="flex-row items-center gap-1.5 px-4 py-2 rounded-xl"
          style={{ backgroundColor: theme.colors.primarySubtle }}
        >
          <Ionicons
            name="document-text-outline"
            size={15}
            color={theme.colors.primary}
          />
          <Text
            className="text-xs font-bold"
            style={{ color: theme.colors.primary }}
          >
            Ver Recibo
          </Text>
        </Pressable>
      </View>
    </MotiView>
  );
};
