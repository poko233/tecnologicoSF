// screens/gestiones/components/GestionesTable.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { staggerDelay } from "../animations/gestiones.animations";
import { Gestion } from "../types/gestiones.types";
import { GestionRow } from "./GestionRow";
import { tableStyles } from "./tableStyles"; // Asegúrate de que este archivo exista

interface GestionesTableProps {
  gestiones: Gestion[];
  loading: boolean;
  onDetail: (g: Gestion) => void;
  onEdit: (g: Gestion) => void;
  onClose: (g: Gestion) => void;
  onDelete: (g: Gestion) => void;
  onDeactivate: (g: Gestion) => void; // ← añadido
}

export function GestionesTable({
  gestiones,
  loading,
  onDetail,
  onEdit,
  onClose,
  onDelete,
  onDeactivate, // ← añadido
}: GestionesTableProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  const HeaderRow = () => (
    <View
      style={[
        styles.headerRow,
        {
          backgroundColor: c.backgroundSecondary,
          borderBottomColor: c.border,
        },
      ]}
    >
      <View style={tableStyles.colId}>
        <ThemedText style={[styles.headerText, { color: c.textSecondary }]}>
          ID
        </ThemedText>
      </View>
      <View style={tableStyles.colNombre}>
        <ThemedText style={[styles.headerText, { color: c.textSecondary }]}>
          NOMBRE
        </ThemedText>
      </View>
      <View style={tableStyles.colPeriodo}>
        <ThemedText style={[styles.headerText, { color: c.textSecondary }]}>
          PERÍODO
        </ThemedText>
      </View>
      <View style={tableStyles.colFechas}>
        <ThemedText style={[styles.headerText, { color: c.textSecondary }]}>
          FECHAS
        </ThemedText>
      </View>
      <View style={tableStyles.colEstado}>
        <ThemedText style={[styles.headerText, { color: c.textSecondary }]}>
          ESTADO
        </ThemedText>
      </View>
      <View style={tableStyles.colAcciones}>
        <ThemedText style={[styles.headerText, { color: c.textSecondary }]}>
          ACCIONES
        </ThemedText>
      </View>
    </View>
  );

  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <View key={i} style={[styles.row, { borderBottomColor: c.border }]}>
        <View style={tableStyles.colId}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="80%"
            height={16}
            radius={4}
          />
        </View>
        <View style={tableStyles.colNombre}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="90%"
            height={16}
            radius={4}
          />
        </View>
        <View style={tableStyles.colPeriodo}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="80%"
            height={16}
            radius={4}
          />
        </View>
        <View style={tableStyles.colFechas}>
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
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        {renderSkeletonRows()}
      </View>
    );
  }

  const EmptyState = () => (
    <View style={styles.empty}>
      <ThemedText style={{ color: c.textSecondary }}>
        No se encontraron gestiones
      </ThemedText>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.card, borderColor: c.border },
      ]}
    >
      <FlatList
        data={gestiones}
        keyExtractor={(item) => item.id.toString()}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={HeaderRow}
        ListEmptyComponent={EmptyState}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "timing",
              duration: 300,
              delay: staggerDelay(index),
            }}
          >
            <GestionRow
              gestion={item}
              onDetail={onDetail}
              onEdit={onEdit}
              onClose={onClose}
              onDelete={onDelete}
              onDeactivate={onDeactivate} // ← pasamos la prop
            />
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
