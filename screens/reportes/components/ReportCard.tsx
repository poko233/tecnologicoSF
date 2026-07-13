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
      from={{ opacity: 0, translateY: 16, scale: 0.97 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: "timing",
        duration: 300 + index * 30,
        easing: (t) => t * t * (3 - 2 * t),
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
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 4,
        },
      ]}
    >
      <MotiPressable
        onPress={() => {}}
        style={styles.pressable}
        animate={({ pressed }) => {
          "worklet";
          return { scale: pressed ? 0.985 : 1 };
        }}
        transition={{ type: "timing", duration: 100 }}
      >
        <View style={styles.iconContainer}>
          <IconComponent size={30} color={accent} />
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

        <MotiPressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPrint(item.id);
          }}
          style={styles.printButton}
          animate={printAnim}
          transition={{ type: "timing", duration: 100 }}
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
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  pressable: {
    padding: 22,
    flex: 1,
    justifyContent: "space-between",
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
    marginBottom: 18,
  },
  printButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 10,
    gap: 8,
  },
  printButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
