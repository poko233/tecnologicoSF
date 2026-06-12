import { useTheme } from "@/theme/useTheme";
import * as Haptics from "expo-haptics";
import * as Icons from "lucide-react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SummaryMetric } from "../types/reportes.types";

interface Props {
  metric: SummaryMetric;
  index: number;
  onPrint: () => void;
}

export function SummaryCard({ metric, index, onPrint }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const IconComponent = (Icons as any)[metric.iconName] || Icons.Users;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: metric.backgroundColor || c.primary,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 6,
        },
      ]}
    >
      <MotiView
        from={{ opacity: 0, translateY: 24, scale: 0.96 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 180,
          delay: index * 60,
        }}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <IconComponent
            size={32}
            color={c.primaryForeground}
            style={styles.icon}
          />
          <Text style={[styles.label, { color: c.primaryForeground }]}>
            {metric.label}
          </Text>
          <Text style={[styles.value, { color: c.primaryForeground }]}>
            {metric.value}
          </Text>
          <MotiPressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPrint();
            }}
            style={styles.button}
            animate={({ pressed }) => ({
              scale: pressed ? 0.96 : 1,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Icons.Printer size={18} color={c.primaryForeground} />
            <Text style={[styles.buttonText, { color: c.primaryForeground }]}>
              Imprimir
            </Text>
          </MotiPressable>
        </View>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  content: {
    padding: 24,
    alignItems: "flex-start",
  },
  icon: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
