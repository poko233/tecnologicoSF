import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { createIngresoProductosStyles } from "../styles/ingresoProductos.styles";
import { TabIngresoProducto } from "../types/ingresoProductos.types";

type Props = {
  value: TabIngresoProducto;
  styles: ReturnType<typeof createIngresoProductosStyles>;
  colors: any;
  onChange: (value: TabIngresoProducto) => void;
};

export default function IngresoProductosTabs({
  value,
  styles,
  colors,
  onChange,
}: Props) {
  const tabs: Array<{
    key: TabIngresoProducto;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }> = [
    { key: "realizar", label: "Realizar Ingreso", icon: "add-circle-outline" },
    { key: "historial", label: "Historial", icon: "list-outline" },
  ];

  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const active = value === tab.key;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Ionicons
              name={tab.icon}
              size={19}
              color={
                active
                  ? colors.success || colors.primary
                  : colors.textMuted || colors.textSecondary
              }
            />
            <ThemedText
              style={[styles.tabText, active && styles.tabTextActive]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
