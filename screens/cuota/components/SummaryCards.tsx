// screens/cuota/components/SummaryCards.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { formatDisplayDate } from "../../../utils/dateHelpers";

interface SummaryCardsProps {
  totalPagado: number;
  totalDebe: number;
  proximaVencimiento?: string | null;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalPagado,
  totalDebe,
  proximaVencimiento,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 24 }}
    >
      {/* Tarjeta Total Pagado */}
      <View
        style={{
          flex: 1,
          minWidth: 250,
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.success + "20",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="wallet-outline"
            size={24}
            color={theme.colors.success}
          />
        </View>
        <View>
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.textSecondary,
              textTransform: "uppercase",
              fontWeight: "500",
              marginBottom: 2,
            }}
          >
            Total Pagado Semestre
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: theme.colors.text,
            }}
          >
            {totalPagado.toFixed(2)}{" "}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "400",
                color: theme.colors.textSecondary,
              }}
            >
              Bs.
            </Text>
          </Text>
        </View>
      </View>

      {/* Tarjeta Saldo Vencido */}
      <View
        style={{
          flex: 1,
          minWidth: 250,
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.destructive + "30",
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          position: "relative",
          overflow: "hidden",
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 8,
            backgroundColor: theme.colors.destructive,
          }}
        />
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.destructive + "20",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="cash-outline"
            size={24}
            color={theme.colors.destructive}
          />
        </View>
        <View>
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.destructive,
              textTransform: "uppercase",
              fontWeight: "bold",
              marginBottom: 2,
            }}
          >
            Saldo Vencido
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: theme.colors.destructive,
            }}
          >
            {totalDebe.toFixed(2)}{" "}
            <Text style={{ fontSize: 14, fontWeight: "400" }}>Bs.</Text>
          </Text>
        </View>
      </View>

      {/* Tarjeta Próximo Vencimiento */}
      <View
        style={{
          flex: 1,
          minWidth: 250,
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.backgroundTertiary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={24}
            color={theme.colors.textSecondary}
          />
        </View>
        <View>
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.textSecondary,
              textTransform: "uppercase",
              fontWeight: "500",
              marginBottom: 2,
            }}
          >
            Próximo Vencimiento
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.colors.text,
            }}
          >
            {proximaVencimiento ? formatDisplayDate(proximaVencimiento) : "—"}
          </Text>
        </View>
      </View>
    </View>
  );
};
