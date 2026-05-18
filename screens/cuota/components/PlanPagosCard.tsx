import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { PlanPago } from "../types/planPago.types";

interface PlanPagosCardProps {
  planes: PlanPago[];
  onPress: () => void;
}

export const PlanPagosCard: React.FC<PlanPagosCardProps> = ({
  planes,
  onPress,
}) => {
  const { theme } = useTheme();

  // Validación: si no es array o está vacío
  if (!Array.isArray(planes) || planes.length === 0) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: theme.colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 16,
          alignItems: "center",
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Ionicons
          name="wallet-outline"
          size={32}
          color={theme.colors.textMuted}
        />
        <Text
          style={{
            textAlign: "center",
            color: theme.colors.textSecondary,
            marginTop: 8,
          }}
        >
          No hay planes de pago registrados. Toca para crear uno.
        </Text>
      </Pressable>
    );
  }

  // Buscar el plan activo (el primero de la lista, o el que tenga estado 'activo')
  const planActivo = planes.find((p) => p.estado === "activo") || planes[0];
  const total = planActivo?.resumen?.monto_total || 0;
  const pagado = planActivo?.resumen?.monto_pagado || 0;
  const saldo = total - pagado;
  const cuotasPagadas = planActivo?.resumen?.cuotas_pagadas || 0;
  const totalCuotas = planActivo?.resumen?.total_cuotas || 0;
  const progress = total > 0 ? (pagado / total) * 100 : 0;

  // Obtener próxima cuota (la primera con estado 'Debe')
  const proximaCuota = planActivo?.cuotas?.find(
    (c) => c.estadoCuota === "Debe",
  );
  const proximaFecha = proximaCuota?.fecha_vencimiento
    ? new Date(proximaCuota.fecha_vencimiento).toLocaleDateString()
    : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 16,
        gap: 12,
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 1,
            color: theme.colors.textSecondary,
          }}
        >
          Plan de Pagos
        </Text>
        <Ionicons
          name="wallet-outline"
          size={20}
          color={theme.colors.secondary}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 8,
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: 12,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              color: theme.colors.textSecondary,
            }}
          >
            Total colegiatura
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: theme.colors.text,
            }}
          >
            {total.toFixed(2)} Bs.
          </Text>
        </View>
        <Ionicons
          name="cash-outline"
          size={32}
          color={theme.colors.textTertiary}
        />
      </View>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: theme.colors.textSecondary }}>
            Cuotas pagadas
          </Text>
          <Text style={{ fontWeight: "bold", color: theme.colors.primary }}>
            {cuotasPagadas} / {totalCuotas}
          </Text>
        </View>
        <View
          style={{
            height: 6,
            backgroundColor: theme.colors.backgroundTertiary,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: 6,
              backgroundColor: theme.colors.primary,
              borderRadius: 3,
            }}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>
            Pagado: {pagado.toFixed(2)} Bs.
          </Text>
          <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>
            Restante: {saldo.toFixed(2)} Bs.
          </Text>
        </View>
      </View>

      {proximaFecha && (
        <View
          style={{
            padding: 12,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.destructive,
            backgroundColor: `${theme.colors.destructive}20`,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "bold",
              textTransform: "uppercase",
              color: theme.colors.destructive,
            }}
          >
            Próximo vencimiento
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: theme.colors.text,
            }}
          >
            {proximaFecha}
          </Text>
        </View>
      )}
    </Pressable>
  );
};
