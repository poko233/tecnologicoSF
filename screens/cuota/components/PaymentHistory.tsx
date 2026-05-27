// screens/cuota/components/PaymentHistory.tsx
import { MotiView } from "moti";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { Pago } from "../types/pago.types";
import { PaymentCard } from "./PaymentCard";

interface Props {
  pagos: Pago[];
  loading: boolean;
  onViewReceipt: (pago: Pago) => void;
}

export const PaymentHistory: React.FC<Props> = ({
  pagos,
  loading,
  onViewReceipt,
}) => {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View className="py-20 items-center">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (pagos.length === 0) {
    return (
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-20 items-center px-6"
      >
        <View
          className="w-24 h-24 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: theme.colors.backgroundSecondary }}
        >
          <Text className="text-4xl">🧾</Text>
        </View>
        <Text
          className="text-xl font-bold text-center mb-2"
          style={{ color: theme.colors.text }}
        >
          Sin pagos registrados
        </Text>
        <Text
          className="text-sm text-center"
          style={{ color: theme.colors.textSecondary }}
        >
          Los pagos que realices aparecerán aquí.
        </Text>
      </MotiView>
    );
  }

  return (
    <View className="pt-4">
      {pagos.map((pago, index) => (
        <PaymentCard
          key={pago.idPago}
          pago={pago}
          index={index}
          onPressReceipt={onViewReceipt}
        />
      ))}
    </View>
  );
};
