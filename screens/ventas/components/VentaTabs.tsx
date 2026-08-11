import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Colors } from "../../../theme/types";
import { TabVenta } from "../types/venta.types";

interface VentaTabsProps {
  value: TabVenta;
  onChange: (tab: TabVenta) => void;
  colors: Colors;
}

export const VentaTabs: React.FC<VentaTabsProps> = ({ value, onChange, colors }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const tabs: Array<{ key: TabVenta; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { key: "nueva", label: "Nueva Venta", icon: "add-circle-outline" },
    { key: "listado", label: "Listado de Ventas", icon: "list-outline" },
  ];

  return (
    <View
      style={{
        flexDirection: isMobile ? "column" : "row",
        backgroundColor: colors.backgroundSecondary || colors.card,
        borderRadius: 16,
        padding: 4,
        gap: 4,
      }}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.key;

        return (
          <Pressable
            key={tab.key}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 12,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: isActive ? colors.card : "transparent",
              borderWidth: isActive ? 1 : 0,
              borderColor: isActive ? colors.border : "transparent",
            }}
            onPress={() => onChange(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={isActive ? colors.primary : colors.textMuted}
            />
            <ThemedText
              style={{
                fontSize: 14,
                fontWeight: isActive ? "900" : "600",
                color: isActive ? colors.text : colors.textMuted,
              }}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
};
