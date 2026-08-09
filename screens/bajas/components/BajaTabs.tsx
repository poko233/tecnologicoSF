import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { createBajaStyles } from "../styles/baja.styles";
import { TabBaja } from "../types/baja.types";

type Props = {
  value: TabBaja;
  styles: ReturnType<typeof createBajaStyles>;
  colors: any;
  onChange: (value: TabBaja) => void;
};

export default function BajaTabs({
  value,
  styles,
  colors,
  onChange,
}: Props) {
  const tabs: Array<{
    key: TabBaja;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }> = [
    { key: "realizar", label: "Realizar Baja", icon: "remove-circle-outline" },
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
