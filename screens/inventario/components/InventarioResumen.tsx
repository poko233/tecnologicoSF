import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { createInventarioStyles } from "../styles/inventario.styles";
import { InventarioResumen } from "../types/inventario.types";
import { formatearMoneda, formatearNumero } from "../utils/inventario.utils";

type Props = {
  resumen: InventarioResumen;
  styles: ReturnType<typeof createInventarioStyles>;
  colors: any;
};

export default function InventarioResumenCards({
  resumen,
  styles,
  colors,
}: Props) {
  const cards: Array<{
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }> = [
    {
      label: "Productos registrados",
      value: formatearNumero(resumen.totalProductos),
      icon: "cube-outline",
      color: colors.primary,
    },
    {
      label: "Productos activos",
      value: formatearNumero(resumen.productosActivos),
      icon: "checkmark-circle-outline",
      color: colors.success || "#16A34A",
    },
    {
      label: "Unidades disponibles",
      value: formatearNumero(resumen.unidadesDisponibles),
      icon: "layers-outline",
      color: colors.primary,
    },
    {
      label: "Stock bajo",
      value: formatearNumero(resumen.stockBajo),
      icon: "warning-outline",
      color: colors.warning || "#D97706",
    },
    {
      label: "Sin stock",
      value: formatearNumero(resumen.sinStock),
      icon: "close-circle-outline",
      color: colors.destructive || "#DC2626",
    },
    {
      label: "Valor del inventario",
      value: formatearMoneda(resumen.valorInventario),
      icon: "cash-outline",
      color: colors.success || "#16A34A",
    },
  ];

  return (
    <View style={styles.summaryGrid}>
      {cards.map((card) => (
        <View key={card.label} style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIcon,
              {
                backgroundColor: `${card.color}14`,
                borderColor: `${card.color}40`,
              },
            ]}
          >
            <Ionicons name={card.icon} size={21} color={card.color} />
          </View>

          <View style={styles.summaryContent}>
            <ThemedText numberOfLines={1} style={styles.summaryValue}>
              {card.value}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>{card.label}</ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}
