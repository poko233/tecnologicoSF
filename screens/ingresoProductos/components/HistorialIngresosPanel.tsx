import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    View,
    useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { createIngresoProductosStyles } from "../styles/ingresoProductos.styles";
import { IngresoProducto } from "../types/ingresoProductos.types";
import {
    formatearFechaIngreso,
    formatearNumero,
    nombreUsuarioIngreso,
} from "../utils/ingresoProductos.utils";

type Props = {
  ingresos: IngresoProducto[];
  loading: boolean;
  previsualizandoId: number | null;
  styles: ReturnType<typeof createIngresoProductosStyles>;
  colors: any;
  onCargar: () => void;
  onPrevisualizar: (idIngresoProducto: number) => void;
};

export default function HistorialIngresosPanel({
  ingresos,
  loading,
  previsualizandoId,
  styles,
  colors,
  onCargar,
  onPrevisualizar,
}: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const accent = colors.success || colors.primary;

  useEffect(() => {
    onCargar();
  }, [onCargar]);

  const renderIngreso = ({ item }: { item: IngresoProducto }) => (
    <View style={{ gap: 12 }}>
      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          gap: 10,
          paddingHorizontal: 16,
          paddingTop: 12,
          borderTopWidth: 2,
          borderColor: colors.border,
        }}
      >
        <View style={{ flex: 1 }}>
          <ThemedText
            style={[styles.tablaCell, { fontSize: 13, fontWeight: "900" }]}
          >
            Ingreso #{String(item.idIngresoProducto).padStart(6, "0")}
          </ThemedText>
          <ThemedText
            style={[
              styles.tablaCell,
              { fontSize: 11, color: colors.textMuted, marginTop: 2 },
            ]}
          >
            Registrado por: {nombreUsuarioIngreso(item.usuario)}
          </ThemedText>
          {!!item.observacion && (
            <ThemedText
              numberOfLines={2}
              style={[
                styles.tablaCell,
                { fontSize: 11, color: colors.textMuted, marginTop: 2 },
              ]}
            >
              Observación: {item.observacion}
            </ThemedText>
          )}
        </View>

        <Pressable
          disabled={previsualizandoId === item.idIngresoProducto}
          onPress={() => onPrevisualizar(item.idIngresoProducto)}
          style={[
            styles.receiptButton,
            previsualizandoId === item.idIngresoProducto && styles.disabled,
          ]}
        >
          {previsualizandoId === item.idIngresoProducto ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <Ionicons
              name="document-text"
              size={16}
              color={colors.primaryForeground}
            />
          )}
          <ThemedText style={styles.receiptButtonText}>VER PDF</ThemedText>
        </Pressable>
      </View>

      {item.detalles.map((detalle) =>
        isMobile ? (
          <View key={detalle.idDetalleIngresoProducto} style={styles.tablaFila}>
            <ThemedText
              style={[styles.tablaCell, { fontSize: 14, fontWeight: "900" }]}
            >
              {detalle.producto?.nombre || "Producto no disponible"}
            </ThemedText>
            <ThemedText
              style={[
                styles.tablaCell,
                { fontSize: 11, color: colors.textMuted },
              ]}
            >
              {detalle.producto?.sku || "-"} ·{" "}
              {formatearFechaIngreso(item.fechaIngreso)}
            </ThemedText>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <ThemedText style={styles.tablaCell}>
                Cantidad: +{formatearNumero(detalle.cantidad)}
              </ThemedText>
              <ThemedText
                style={[styles.tablaCell, { color: accent, fontWeight: "900" }]}
              >
                {formatearNumero(detalle.stockAnterior)} →{" "}
                {formatearNumero(detalle.stockPosterior)}
              </ThemedText>
            </View>
          </View>
        ) : (
          <View key={detalle.idDetalleIngresoProducto} style={styles.tablaFila}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.tablaCell}>
                {formatearFechaIngreso(item.fechaIngreso)}
              </ThemedText>
            </View>
            <View style={{ flex: 1.7 }}>
              <ThemedText style={styles.tablaCell}>
                {detalle.producto?.sku || "-"}
              </ThemedText>
              <ThemedText
                style={[
                  styles.tablaCell,
                  { fontSize: 11, fontWeight: "600", color: colors.textMuted },
                ]}
              >
                {detalle.producto?.nombre || "-"}
              </ThemedText>
            </View>
            <View style={{ flex: 0.7, alignItems: "flex-end" }}>
              <ThemedText
                style={[styles.tablaCell, { color: accent, fontWeight: "900" }]}
              >
                +{formatearNumero(detalle.cantidad)}
              </ThemedText>
            </View>
            <View style={{ flex: 0.8, alignItems: "flex-end" }}>
              <ThemedText style={styles.tablaCell}>
                {formatearNumero(detalle.stockAnterior)}
              </ThemedText>
            </View>
            <View style={{ flex: 0.8, alignItems: "flex-end" }}>
              <ThemedText
                style={[styles.tablaCell, { fontWeight: "900", color: accent }]}
              >
                {formatearNumero(detalle.stockPosterior)}
              </ThemedText>
            </View>
            <View style={{ flex: 1.2 }}>
              <ThemedText style={[styles.tablaCell, { fontSize: 12 }]}>
                {nombreUsuarioIngreso(item.usuario)}
              </ThemedText>
            </View>
          </View>
        ),
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accent} />
        <ThemedText style={styles.emptyText}>Cargando historial...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.tablaContainer}>
      {!isMobile && (
        <View
          style={[
            styles.tablaHeader,
            { paddingHorizontal: 16, paddingTop: 16 },
          ]}
        >
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.tablaHeaderCell}>Fecha</ThemedText>
          </View>
          <View style={{ flex: 1.7 }}>
            <ThemedText style={styles.tablaHeaderCell}>Producto</ThemedText>
          </View>
          <View style={{ flex: 0.7, alignItems: "flex-end" }}>
            <ThemedText style={styles.tablaHeaderCell}>Cant.</ThemedText>
          </View>
          <View style={{ flex: 0.8, alignItems: "flex-end" }}>
            <ThemedText style={styles.tablaHeaderCell}>Stock ant.</ThemedText>
          </View>
          <View style={{ flex: 0.8, alignItems: "flex-end" }}>
            <ThemedText style={styles.tablaHeaderCell}>Stock final</ThemedText>
          </View>
          <View style={{ flex: 1.2 }}>
            <ThemedText style={styles.tablaHeaderCell}>Encargado</ThemedText>
          </View>
        </View>
      )}

      <FlatList
        data={ingresos}
        renderItem={renderIngreso}
        keyExtractor={(item) => String(item.idIngresoProducto)}
        contentContainerStyle={styles.tablaScroll}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="file-tray-outline"
              size={48}
              color={colors.textMuted}
            />
            <ThemedText style={styles.emptyText}>
              No hay ingresos registrados
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}
