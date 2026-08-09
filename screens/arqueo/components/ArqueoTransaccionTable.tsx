import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Egreso, Ingreso } from "../types/arqueo.types";
import { IngresoCombinado, Transaccion } from "../types/transaccion.types";
import { ArqueoTransaccionHeader } from "./ArqueoTransaccionHeader";
import { ArqueoTransaccionRow } from "./ArqueoTransaccionRow";
import { tableStyles } from "./tableStyles";

interface ArqueoTransaccionTableProps {
  transacciones: (Transaccion | IngresoCombinado | Egreso | Ingreso)[];
  loading: boolean;
  tipo: "INGRESO" | "EGRESO";
  onUpdateEstado?: (id: number, nuevoEstado: "VALIDO" | "ANULADO") => void;
  updatingId?: number | null;
  arqueoId?: number | null;
  showReceipt?: boolean;
  onPrintReceipt?: (
    idOriginal: number,
    origen: "pago" | "ingreso" | "egreso" | "venta",
  ) => void;
  showMenu?: boolean;
}

export function ArqueoTransaccionTable({
  transacciones,
  loading,
  tipo,
  onUpdateEstado,
  updatingId = null,
  arqueoId,
  showReceipt = false,
  onPrintReceipt,
  showMenu = true, // por defecto true
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
        renderItem={({ item, index }) => {
          let origen: "pago" | "ingreso" | "egreso" | "venta" =
            (item as any).origen || (tipo === "EGRESO" ? "egreso" : "ingreso");
          if (tipo === "EGRESO") origen = "egreso";

          const showReceiptRow = showReceipt && onPrintReceipt && !!origen;
          const idOriginal = (item as any).idOriginal || item.id;

          let showMenuForItem = showMenu;
          if (
            (item as any).origen === "pago" ||
            (item as any).origen === "venta"
          ) {
            showMenuForItem = false;
          }

          return (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300, delay: index * 50 }}
            >
              <ArqueoTransaccionRow
                transaccion={item}
                index={index}
                onUpdateEstado={
                  showMenuForItem && onUpdateEstado
                    ? (nuevoEstado) =>
                        onUpdateEstado(item.id as number, nuevoEstado)
                    : undefined
                }
                isUpdating={updatingId === item.id}
                showReceipt={showReceiptRow}
                onPrintReceipt={
                  showReceiptRow
                    ? () => onPrintReceipt(idOriginal, origen)
                    : undefined
                }
                showMenu={showMenuForItem}
              />
            </MotiView>
          );
        }}
        contentContainerStyle={styles.contentContainer}
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
