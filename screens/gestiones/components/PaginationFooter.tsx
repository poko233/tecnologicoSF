// screens/gestiones/components/PaginationFooter.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { StyleSheet, View } from "react-native";

interface PaginationFooterProps {
  meta: { total: number; page: number; per_page: number };
  onPageChange: (page: number) => void;
}

export function PaginationFooter({
  meta,
  onPageChange,
}: PaginationFooterProps) {
  const { theme } = useTheme();
  const totalPages = Math.ceil(meta.total / meta.per_page);
  const from = (meta.page - 1) * meta.per_page + 1;
  const to = Math.min(meta.page * meta.per_page, meta.total);

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    const start = Math.max(1, Math.min(meta.page - 2, totalPages - 4));
    return start + i;
  });

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
        Mostrando {from}-{to} de {meta.total} gestiones
      </ThemedText>
      <View style={styles.buttons}>
        <MotiPressable
          onPress={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1}
          animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
          style={[styles.pageBtn, { opacity: meta.page <= 1 ? 0.4 : 1 }]}
        >
          <ChevronLeft size={18} color={theme.colors.textSecondary} />
        </MotiPressable>
        {pages.map((p) => (
          <MotiPressable
            key={p}
            onPress={() => onPageChange(p)}
            animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
            style={[
              styles.pageNum,
              {
                backgroundColor:
                  p === meta.page ? theme.colors.primary : "transparent",
              },
            ]}
          >
            <ThemedText
              style={{
                color:
                  p === meta.page
                    ? theme.colors.primaryForeground
                    : theme.colors.textSecondary,
                fontWeight: "600",
                fontSize: 13,
              }}
            >
              {p}
            </ThemedText>
          </MotiPressable>
        ))}
        <MotiPressable
          onPress={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= totalPages}
          animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
          style={[
            styles.pageBtn,
            { opacity: meta.page >= totalPages ? 0.4 : 1 },
          ]}
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
    gap: 4,
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
