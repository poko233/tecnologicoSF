import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";

interface CuotasListCardProps {
  cuotas: any[];
  planPago: any;
}

export const CuotasListCard: React.FC<CuotasListCardProps> = ({
  cuotas,
  planPago,
}) => {
  const { theme } = useTheme();

  if (!cuotas || cuotas.length === 0) {
    return (
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 20,
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.colors.textSecondary }}>
          No hay cuotas registradas
        </Text>
      </View>
    );
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Pagado":
        return theme.colors.success;
      case "Debe":
        return theme.colors.destructive;
      case "Condonado":
        return theme.colors.warning;
      default:
        return theme.colors.textMuted;
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case "Pagado":
        return "PAGADO";
      case "Debe":
        return "PENDIENTE";
      case "Condonado":
        return "CONDONADO";
      default:
        return estado;
    }
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: "hidden",
        flex: 1,
      }}
    >
      <View
        style={{
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
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
          Gestión de Cuotas
        </Text>
        <Ionicons
          name="receipt-outline"
          size={20}
          color={theme.colors.primary}
        />
      </View>
      <ScrollView
        style={{ maxHeight: 300 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        {cuotas.map((cuota) => (
          <View
            key={cuota.id}
            style={{
              padding: 12,
              backgroundColor: theme.colors.backgroundSecondary,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontWeight: "500", color: theme.colors.text }}>
                {cuota.tipo === "MATRICULA"
                  ? "Matrícula"
                  : `Cuota ${cuota.numeroCuota}`}
              </Text>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  backgroundColor: getEstadoColor(cuota.estadoCuota) + "20",
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "bold",
                    color: getEstadoColor(cuota.estadoCuota),
                  }}
                >
                  {getEstadoText(cuota.estadoCuota)}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                Monto: {cuota.monto} Bs.
              </Text>
              {cuota.estadoCuota === "Debe" && (
                <Pressable
                  onPress={() =>
                    alert(`Mock: Registrar pago de ${cuota.numeroCuota}`)
                  }
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "bold",
                      color: theme.colors.primary,
                    }}
                  >
                    Registrar Pago
                  </Text>
                </Pressable>
              )}
            </View>
            {cuota.fecha_vencimiento && (
              <Text
                style={{
                  fontSize: 10,
                  color: theme.colors.textMuted,
                  marginTop: 4,
                }}
              >
                Vence: {new Date(cuota.fecha_vencimiento).toLocaleDateString()}
              </Text>
            )}
          </View>
        ))}
        <Pressable
          style={({ pressed }) => ({
            marginTop: 8,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            borderRadius: 12,
            alignItems: "center",
            opacity: pressed ? 0.7 : 1,
          })}
          onPress={() => alert("Mock: Ver historial completo de cuotas")}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: theme.colors.primary,
            }}
          >
            Ver historial completo
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};
