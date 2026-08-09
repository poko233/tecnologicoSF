import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Pressable, View, useWindowDimensions } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { createBajaStyles } from "../styles/baja.styles";
import { ProductoBajaItem } from "../types/baja.types";
import { CantidadSelector } from "./CantidadSelector";

type Props = {
  productos: ProductoBajaItem[];
  onCambiarCantidad: (idProducto: number, cantidad: number) => void;
  onEliminarProducto: (idProducto: number) => void;
  styles: ReturnType<typeof createBajaStyles>;
  colors: any;
};

export default function TablaProductosBaja({
  productos,
  onCambiarCantidad,
  onEliminarProducto,
  styles,
  colors,
}: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const renderProducto = ({ item }: { item: ProductoBajaItem }) => {
    if (isMobile) {
      return (
        <View style={styles.tablaFila}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.tablaCell, { fontSize: 14, fontWeight: "900" }]}>
                {item.nombre}
              </ThemedText>
              <ThemedText style={[styles.tablaCell, { fontSize: 11, color: colors.textMuted, marginTop: 2 }]}>
                {item.sku}
              </ThemedText>
              <ThemedText style={[styles.tablaCell, { fontSize: 11, color: colors.textMuted, marginTop: 2 }]}>
                Stock disponible: {item.stock}
              </ThemedText>
            </View>
            <Pressable
              style={styles.deleteButton}
              onPress={() => onEliminarProducto(item.idProducto)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.destructive} />
            </Pressable>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ThemedText style={[styles.tablaHeaderCell, { fontSize: 11 }]}>Cantidad:</ThemedText>
            <CantidadSelector
              cantidad={item.cantidad}
              stockDisponible={item.stock}
              onCambiarCantidad={(cantidad) => onCambiarCantidad(item.idProducto, cantidad)}
              colors={colors}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.tablaFila}>
        <View style={{ flex: 2 }}>
          <ThemedText style={[styles.tablaCell, { fontSize: 14, fontWeight: "900" }]}>
            {item.nombre}
          </ThemedText>
          <ThemedText style={[styles.tablaCell, { fontSize: 11, color: colors.textMuted, marginTop: 2 }]}>
            {item.sku} • Stock disponible: {item.stock}
          </ThemedText>
        </View>

        <View style={{ width: 140, alignItems: "center" }}>
          <CantidadSelector
            cantidad={item.cantidad}
            stockDisponible={item.stock}
            onCambiarCantidad={(cantidad) => onCambiarCantidad(item.idProducto, cantidad)}
            colors={colors}
          />
        </View>

        <View style={{ width: 50, alignItems: "center" }}>
          <Pressable
            style={styles.deleteButton}
            onPress={() => onEliminarProducto(item.idProducto)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.destructive} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.tablaContainer}>
      {!isMobile && (
        <View style={[styles.tablaHeader, { paddingHorizontal: 16, paddingTop: 16 }]}>
          <View style={{ flex: 2 }}>
            <ThemedText style={styles.tablaHeaderCell}>Producto</ThemedText>
          </View>
          <View style={{ width: 140, alignItems: "center" }}>
            <ThemedText style={styles.tablaHeaderCell}>Cantidad</ThemedText>
          </View>
          <View style={{ width: 50 }} />
        </View>
      )}

      <FlatList
        data={productos}
        renderItem={renderProducto}
        keyExtractor={(item) => item.idProducto.toString()}
        contentContainerStyle={styles.tablaScroll}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
            <ThemedText style={styles.emptyText}>
              Selecciona productos del inventario para dar de baja
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}
