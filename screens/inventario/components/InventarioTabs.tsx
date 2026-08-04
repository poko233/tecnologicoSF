import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { createInventarioStyles } from "../styles/inventario.styles";
import { TabInventario } from "../types/inventario.types";

type Props = {
  value: TabInventario;
  styles: ReturnType<typeof createInventarioStyles>;
  colors: any;
  onChange: (value: TabInventario) => void;
};

export default function InventarioTabs({
  value,
  styles,
  colors,
  onChange,
}: Props) {
  const tabs: Array<{
    key: TabInventario;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }> = [
    { key: "productos", label: "Productos", icon: "cube-outline" },
    { key: "categorias", label: "Categorías", icon: "pricetags-outline" },
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
              color={active ? colors.primary : colors.textMuted || colors.textSecondary}
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
