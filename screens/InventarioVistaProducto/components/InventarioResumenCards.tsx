import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
    useWindowDimensions,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

import {
    InventarioVistaResumenFiltrado,
    InventarioVistaResumenGeneral,
} from "../types/inventarioVistaProducto.types";

import { createInventarioVistaProductoStyles } from "../styles/inventarioVistaProducto.styles";

import { formatearNumero } from "../utils/inventarioVistaProducto.utils";

type Props = {
  resumenGeneral: InventarioVistaResumenGeneral;

  resumenFiltrado: InventarioVistaResumenFiltrado;
};

export default function InventarioResumenCards({
  resumenGeneral,
  resumenFiltrado,
}: Props) {
  const { theme } = useTheme();

  const { width } =
    useWindowDimensions();

  const isMobile = width < 760;

  const isCompact = width < 1120;

  const styles = useMemo(
    () =>
      createInventarioVistaProductoStyles(
        theme.colors,
        isMobile,
        isCompact,
      ),
    [
      theme.colors,
      isMobile,
      isCompact,
    ],
  );

  return (
    <View
      style={styles.summaryGrid}
    >
      <SummaryCard
        icon="cube-outline"
        label="Productos registrados"
        value={formatearNumero(
          resumenGeneral.totalProductos,
        )}
        color={theme.colors.primary}
        styles={styles}
      />

      <SummaryCard
        icon="layers-outline"
        label="Unidades en inventario"
        value={formatearNumero(
          resumenGeneral.unidadesDisponibles,
        )}
        color="#2563EB"
        styles={styles}
      />

      <SummaryCard
        icon="funnel-outline"
        label="Productos encontrados"
        value={formatearNumero(
          resumenFiltrado.totalProductos,
        )}
        color="#7C3AED"
        styles={styles}
      />

      <SummaryCard
        icon="file-tray-stacked-outline"
        label="Unidades encontradas"
        value={formatearNumero(
          resumenFiltrado.unidadesDisponibles,
        )}
        color="#0891B2"
        styles={styles}
      />
    </View>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
  styles,
}: {
  icon: keyof typeof Ionicons.glyphMap;

  label: string;

  value: string;

  color: string;

  styles: ReturnType<
    typeof createInventarioVistaProductoStyles
  >;
}) {
  return (
    <View
      style={styles.summaryCard}
    >
      <View
        style={[
          styles.summaryIcon,

          {
            backgroundColor:
              `${color}15`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={23}
          color={color}
        />
      </View>

      <View
        style={styles.summaryInfo}
      >
        <ThemedText
          style={styles.summaryLabel}
        >
          {label}
        </ThemedText>

        <ThemedText
          style={styles.summaryValue}
        >
          {value}
        </ThemedText>
      </View>
    </View>
  );
}