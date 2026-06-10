import { useTheme } from "@/theme/useTheme";
import * as Haptics from "expo-haptics";
import * as Icons from "lucide-react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ReportCardItem } from "../types/reportes.types";

interface Props {
  item: ReportCardItem;
  index: number;
  itemWidth: number;
  onPrint: (id: string) => void;
}

function getAccentColorKey(
  accent: ReportCardItem["accentColor"],
  colors: ReturnType<typeof useTheme>["theme"]["colors"],
) {
  if (!accent || accent === "primary") return colors.primary;
  if (accent === "secondary") return colors.secondary;
  if (accent === "destructive") return colors.destructive;
  if (accent === "info") return colors.info;
  return colors.primary;
}

export function ReportCard({ item, index, itemWidth, onPrint }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const accent = getAccentColorKey(item.accentColor, c);

  const IconComponent = (Icons as any)[item.iconName] || Icons.FileText;

  // Worklet para animar el botón de impresión
  const printAnim = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed ? 0.96 : 1,
          backgroundColor: pressed ? accent + "E6" : accent,
        };
      },
    [accent],
  );

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "spring",
        damping: 18,
        delay: index * 50,
      }}
      style={[
        styles.card,
        {
          width: itemWidth,
          backgroundColor: c.card,
          borderColor: c.border,
          borderLeftColor: accent,
          borderLeftWidth: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 3,
        },
      ]}
    >
      <MotiPressable
        onPress={() => {}}
        style={styles.pressable}
        animate={({ pressed }) => {
          "worklet";
          return { scale: pressed ? 0.98 : 1 };
        }}
      >
        <View style={styles.iconContainer}>
          <IconComponent size={28} color={accent} />
        </View>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text
          style={[styles.description, { color: c.textSecondary }]}
          numberOfLines={3}
        >
          {item.description}
        </Text>

        {/* Botón Imprimir corregido */}
        <MotiPressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPrint(item.id);
          }}
          style={styles.printButton}
          animate={printAnim}
        >
          <Icons.Printer size={16} color={c.primaryForeground} />
          <Text
            style={[styles.printButtonText, { color: c.primaryForeground }]}
          >
            Imprimir
          </Text>
        </MotiPressable>
      </MotiPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  pressable: {
    padding: 20,
    flex: 1,
    justifyContent: "space-between",
  },
  iconContainer: {
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    marginBottom: 16,
  },
  printButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    // backgroundColor se asigna dinámicamente en animate
  },
  printButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
