// screens/arqueo/components/ArqueoTable.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Arqueo } from "../types/arqueo.types";
import { ArqueoRow } from "./ArqueoRow";
import { tableStyles } from "./tableStyles";

interface ArqueoTableProps {
  arqueos: Arqueo[];
  loading: boolean;
  onDetail: (arqueo: Arqueo) => void;
}

export function ArqueoTable({ arqueos, loading, onDetail }: ArqueoTableProps) {
  const { theme } = useTheme();

  const HeaderRow = () => (
    <View
      style={[
        styles.headerRow,
        {
          backgroundColor: theme.colors.backgroundSecondary,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <View style={tableStyles.colId}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          ID
        </ThemedText>
      </View>
      <View style={tableStyles.colTurno}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          TURNO
        </ThemedText>
      </View>
      <View style={tableStyles.colApertura}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          APERTURA
        </ThemedText>
      </View>
      <View style={tableStyles.colCierre}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          CIERRE
        </ThemedText>
      </View>
      <View style={tableStyles.colTotal}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          TOTAL
        </ThemedText>
      </View>
      <View style={tableStyles.colEstado}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          ESTADO
        </ThemedText>
      </View>
      <View style={tableStyles.colUsuario}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          USUARIO
        </ThemedText>
      </View>
      <View style={tableStyles.colNombreCompleto}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          NOMBRE COMPLETO
        </ThemedText>
      </View>
      <View style={tableStyles.colAcciones}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          ACCIONES
        </ThemedText>
      </View>
    </View>
  );

  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <View
        key={i}
        style={[styles.row, { borderBottomColor: theme.colors.border }]}
      >
        <View style={tableStyles.colId}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="80%"
            height={16}
            radius={4}
          />
        </View>
        <View style={tableStyles.colTurno}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="90%"
            height={16}
            radius={4}
          />
        </View>
        <View style={tableStyles.colApertura}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="80%"
            height={16}
            radius={4}
          />
        </View>
        <View style={tableStyles.colCierre}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="80%"
            height={16}
            radius={4}
          />
        </View>
        <View style={tableStyles.colTotal}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="80%"
            height={16}
            radius={4}
          />
        </View>
        <View style={tableStyles.colEstado}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="60%"
            height={16}
            radius={4}
          />
        </View>
        <View style={tableStyles.colUsuario}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="60%"
            height={16}
            radius={4}
          />
        </View>
        <View style={tableStyles.colAcciones}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="60%"
            height={16}
            radius={4}
          />
        </View>
      </View>
    ));

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {renderSkeletonRows()}
      </View>
    );
  }

  const EmptyState = () => (
    <View style={styles.empty}>
      <ThemedText style={{ color: theme.colors.textSecondary }}>
        No se encontraron arqueos
      </ThemedText>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <FlatList
        data={arqueos}
        keyExtractor={(item) => item.id.toString()}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={HeaderRow}
        ListEmptyComponent={EmptyState}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: index * 50 }}
          >
            <ArqueoRow arqueo={item} onDetail={onDetail} />
          </MotiView>
        )}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    width: "100%",
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  headerText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  empty: {
    paddingVertical: 48,
    alignItems: "center",
    width: "100%",
  },
});
