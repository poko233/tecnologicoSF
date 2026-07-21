// screens/arqueo/components/ArqueoPaginationFooter.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { StyleSheet, View } from "react-native";

interface ArqueoPaginationFooterProps {
  currentPage: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

export function ArqueoPaginationFooter({
  currentPage,
  hasNextPage,
  onPageChange,
}: ArqueoPaginationFooterProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.footer,
        {
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.card,
        },
      ]}
    >
      <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
        Página {currentPage}
      </ThemedText>
      <View style={styles.buttons}>
        <MotiPressable
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
          style={[styles.pageBtn, { opacity: currentPage <= 1 ? 0.4 : 1 }]}
        >
          <ChevronLeft size={18} color={theme.colors.textSecondary} />
        </MotiPressable>

        {/* Mostramos el número de página actual */}
        <View style={styles.pageNum}>
          <ThemedText
            style={{
              color: theme.colors.text,
              fontWeight: "600",
              fontSize: 13,
            }}
          >
            {currentPage}
          </ThemedText>
        </View>

        <MotiPressable
          onPress={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
          style={[styles.pageBtn, { opacity: hasNextPage ? 1 : 0.4 }]}
        >
          <ChevronRight size={18} color={theme.colors.textSecondary} />
        </MotiPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  pageBtn: {
    padding: 4,
    borderRadius: 6,
  },
  pageNum: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
