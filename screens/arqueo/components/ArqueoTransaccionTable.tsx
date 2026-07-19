// screens/arqueo/components/ArqueoTransaccionTable.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Transaccion } from "../types/transaccion.types";
import { ArqueoTransaccionHeader } from "./ArqueoTransaccionHeader";
import { ArqueoTransaccionRow } from "./ArqueoTransaccionRow";
import { tableStyles } from "./tableStyles";

interface ArqueoTransaccionTableProps {
  transacciones: Transaccion[];
  loading: boolean;
  tipo: "INGRESO" | "EGRESO";
  onUpdateEstado: (id: number, nuevoEstado: "VALIDO" | "ANULADO") => void;
  updatingId: number | null;
  arqueoId: number | null; //  Nueva prop para saber si hay arqueo
}

export function ArqueoTransaccionTable({
  transacciones,
  loading,
  tipo,
  onUpdateEstado,
  updatingId,
  arqueoId,
}: ArqueoTransaccionTableProps) {
  const { theme } = useTheme();
  const safeTransacciones = transacciones || [];

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
          #
        </ThemedText>
      </View>
      <View style={tableStyles.colFecha}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          FECHA
        </ThemedText>
      </View>
      <View style={tableStyles.colBoleta}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          BOLETA
        </ThemedText>
      </View>
      <View style={tableStyles.colCajero}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          CAJERO
        </ThemedText>
      </View>
      <View style={tableStyles.colConcepto}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          CONCEPTO
        </ThemedText>
      </View>
      <View style={tableStyles.colMonto}>
        <ThemedText
          style={[
            styles.headerText,
            { color: theme.colors.textSecondary, textAlign: "right" },
          ]}
        >
          MONTO
        </ThemedText>
      </View>
      <View style={tableStyles.colGlosa}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          GLOSA
        </ThemedText>
      </View>
      <View style={tableStyles.colTipoPago}>
        <ThemedText
          style={[styles.headerText, { color: theme.colors.textSecondary }]}
        >
          TIPO PAGO
        </ThemedText>
      </View>
      <View style={tableStyles.colEstado}>
        <ThemedText
          style={[
            styles.headerText,
            { color: theme.colors.textSecondary, textAlign: "center" },
          ]}
        >
          ESTADO
        </ThemedText>
      </View>
      <View style={tableStyles.colAcciones}>
        <ThemedText
          style={[
            styles.headerText,
            { color: theme.colors.textSecondary, textAlign: "right" },
          ]}
        >
          ACCIÓN
        </ThemedText>
      </View>
    </View>
  );

  //  Renderizado de skeletons cuando no hay datos
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
            height={14}
            radius={4}
          />
        </View>
        <View style={tableStyles.colFecha}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="80%"
            height={14}
            radius={4}
          />
        </View>
        <View style={tableStyles.colBoleta}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="70%"
            height={14}
            radius={4}
          />
        </View>
        <View style={tableStyles.colCajero}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="60%"
            height={14}
            radius={4}
          />
        </View>
        <View style={tableStyles.colConcepto}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="80%"
            height={14}
            radius={4}
          />
        </View>
        <View style={tableStyles.colMonto}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="70%"
            height={14}
            radius={4}
          />
        </View>
        <View style={tableStyles.colGlosa}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="70%"
            height={14}
            radius={4}
          />
        </View>
        <View style={tableStyles.colTipoPago}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="60%"
            height={14}
            radius={4}
          />
        </View>
        <View style={tableStyles.colEstado}>
          <Skeleton
            colorMode={theme.dark ? "dark" : "light"}
            width="70%"
            height={14}
            radius={4}
          />
        </View>
      </View>
    ));

  //  Fila de carga al final de la lista (con las mismas columnas)
  const ListFooter = () => {
    if (loading && safeTransacciones.length > 0) {
      return (
        <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
          <View style={tableStyles.colId}>
            <Skeleton
              colorMode={theme.dark ? "dark" : "light"}
              width="80%"
              height={14}
              radius={4}
            />
          </View>
          <View style={tableStyles.colFecha}>
            <Skeleton
              colorMode={theme.dark ? "dark" : "light"}
              width="80%"
              height={14}
              radius={4}
            />
          </View>
          <View style={tableStyles.colBoleta}>
            <Skeleton
              colorMode={theme.dark ? "dark" : "light"}
              width="70%"
              height={14}
              radius={4}
            />
          </View>
          <View style={tableStyles.colCajero}>
            <Skeleton
              colorMode={theme.dark ? "dark" : "light"}
              width="60%"
              height={14}
              radius={4}
            />
          </View>
          <View style={tableStyles.colConcepto}>
            <Skeleton
              colorMode={theme.dark ? "dark" : "light"}
              width="80%"
              height={14}
              radius={4}
            />
          </View>
          <View style={tableStyles.colMonto}>
            <Skeleton
              colorMode={theme.dark ? "dark" : "light"}
              width="70%"
              height={14}
              radius={4}
            />
          </View>
          <View style={tableStyles.colGlosa}>
            <Skeleton
              colorMode={theme.dark ? "dark" : "light"}
              width="70%"
              height={14}
              radius={4}
            />
          </View>
          <View style={tableStyles.colTipoPago}>
            <Skeleton
              colorMode={theme.dark ? "dark" : "light"}
              width="60%"
              height={14}
              radius={4}
            />
          </View>
          <View style={tableStyles.colEstado}>
            <Skeleton
              colorMode={theme.dark ? "dark" : "light"}
              width="70%"
              height={14}
              radius={4}
            />
          </View>
        </View>
      );
    }
    return null;
  };

  if (loading && safeTransacciones.length === 0) {
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
      <ArqueoTransaccionHeader tipo={tipo} />
      <FlatList
        data={safeTransacciones}
        keyExtractor={(item) => item.id.toString()}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={HeaderRow}
        ListFooterComponent={ListFooter}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: index * 50 }}
          >
            <ArqueoTransaccionRow
              transaccion={item}
              index={index}
              onUpdateEstado={(nuevoEstado) => {
                onUpdateEstado(item.id, nuevoEstado);
              }}
              isUpdating={updatingId === item.id}
            />
          </MotiView>
        )}
        contentContainerStyle={styles.contentContainer}
        //  Mensaje condicional según si hay arqueo activo o no
        ListEmptyComponent={
          !loading && safeTransacciones.length === 0 ? (
            <View style={styles.empty}>
              <ThemedText style={{ color: theme.colors.textSecondary }}>
                {arqueoId
                  ? "No hay transacciones registradas en este turno."
                  : "Primero debe abrir un turno de caja para registrar transacciones."}
              </ThemedText>
            </View>
          ) : null
        }
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
    width: "100%",
    flex: 1,
  },
  contentContainer: { paddingBottom: 8 },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
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
    gap: 8,
  },
  empty: { paddingVertical: 40, alignItems: "center" },
});
