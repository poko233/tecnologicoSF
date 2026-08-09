import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Linking, Pressable, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { BASE_URL } from "../../../http/httpClient";
import { getToken } from "../../../storage/secureStorage";
import { createBajaStyles } from "../styles/baja.styles";
import { InventarioBaja } from "../types/baja.types";

type Props = {
  bajas: InventarioBaja[];
  loading: boolean;
  styles: ReturnType<typeof createBajaStyles>;
  colors: any;
  onCargar: () => void;
};

export default function HistorialBajasPanel({
  bajas,
  loading,
  styles,
  colors,
  onCargar,
}: Props) {
  useEffect(() => {
    onCargar();
  }, [onCargar]);

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const abrirPDF = async (idBaja: number) => {
    try {
      const token = await getToken();
      const url = `${BASE_URL}/api/inventario/bajas/${idBaja}/pdf?token=${token}`;
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error al abrir PDF:", error);
    }
  };

  const renderBaja = ({ item }: { item: InventarioBaja }) => {
    return (
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 2, borderColor: colors.border }}>
          <View>
            <ThemedText style={[styles.tablaCell, { fontSize: 13, fontWeight: "900" }]}>
              Baja #{item.idBaja.toString().padStart(6, "0")}
            </ThemedText>
            <ThemedText style={[styles.tablaCell, { fontSize: 11, color: colors.textMuted }]}>
              Registrado por: {item.encargado
                ? `${item.encargado.nombres} ${item.encargado.apellidoPaterno}`
                : "No especificado"}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => abrirPDF(item.idBaja)}
            style={{
              backgroundColor: colors.destructive,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: "row",
              gap: 6,
              alignItems: "center",
            }}
          >
            <Ionicons name="document-text" size={16} color={colors.primaryForeground} />
            <ThemedText style={{ fontSize: 11, fontWeight: "900", color: colors.primaryForeground }}>
              VER PDF
            </ThemedText>
          </Pressable>
        </View>
        {item.detalles.map((detalle, index) => (
          <View key={`${item.idBaja}-${index}`} style={styles.tablaFila}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.tablaCell}>
                {formatearFecha(item.fechaBaja)}
              </ThemedText>
            </View>
            <View style={{ flex: 1.5 }}>
              <ThemedText style={styles.tablaCell}>
                {detalle.producto?.sku || "-"}
              </ThemedText>
              <ThemedText style={[styles.tablaCell, { fontSize: 11, fontWeight: "600", color: colors.textMuted }]}>
                {detalle.producto?.nombre || "-"}
              </ThemedText>
            </View>
            <View style={{ flex: 0.7, alignItems: "flex-end" }}>
              <ThemedText style={styles.tablaCell}>
                {detalle.cantidad}
              </ThemedText>
            </View>
            <View style={{ flex: 0.8, alignItems: "flex-end" }}>
              <ThemedText style={styles.tablaCell}>
                Bs {Number(detalle.precioUnitario).toFixed(2)}
              </ThemedText>
            </View>
            <View style={{ flex: 0.8, alignItems: "flex-end" }}>
              <ThemedText style={[styles.tablaCell, { fontWeight: "900", color: colors.destructive }]}>
                Bs {Number(detalle.subTotal).toFixed(2)}
              </ThemedText>
            </View>
            <View style={{ flex: 0.9 }}>
              <ThemedText style={[styles.tablaCell, { fontSize: 11 }]}>
                {item.concepto}
              </ThemedText>
            </View>
            <View style={{ flex: 1.2 }}>
              <ThemedText style={[styles.tablaCell, { fontSize: 12 }]}>
                {item.encargado
                  ? `${item.encargado.nombres} ${item.encargado.apellidoPaterno}`
                  : "-"}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.emptyText}>Cargando historial...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.tablaContainer}>
      <View style={[styles.tablaHeader, { paddingHorizontal: 16, paddingTop: 16 }]}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.tablaHeaderCell}>Fecha/Hora</ThemedText>
        </View>
        <View style={{ flex: 1.5 }}>
          <ThemedText style={styles.tablaHeaderCell}>Producto</ThemedText>
        </View>
        <View style={{ flex: 0.7, alignItems: "flex-end" }}>
          <ThemedText style={styles.tablaHeaderCell}>Cant.</ThemedText>
        </View>
        <View style={{ flex: 0.8, alignItems: "flex-end" }}>
          <ThemedText style={styles.tablaHeaderCell}>Precio U.</ThemedText>
        </View>
        <View style={{ flex: 0.8, alignItems: "flex-end" }}>
          <ThemedText style={styles.tablaHeaderCell}>Subtotal</ThemedText>
        </View>
        <View style={{ flex: 0.9 }}>
          <ThemedText style={styles.tablaHeaderCell}>Concepto</ThemedText>
        </View>
        <View style={{ flex: 1.2 }}>
          <ThemedText style={styles.tablaHeaderCell}>Encargado</ThemedText>
        </View>
      </View>

      <FlatList
        data={bajas}
        renderItem={renderBaja}
        keyExtractor={(item) => item.idBaja.toString()}
        contentContainerStyle={styles.tablaScroll}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={48} color={colors.textMuted} />
            <ThemedText style={styles.emptyText}>
              No hay bajas registradas
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}
