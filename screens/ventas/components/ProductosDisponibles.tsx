import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { ActivityIndicator, FlatList, Image, Pressable, TextInput, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Colors } from "../../../theme/types";
import { InventarioCategoria, InventarioProducto } from "../../inventario/types/inventario.types";

interface ProductosDisponiblesProps {
  productos: InventarioProducto[];
  categorias: InventarioCategoria[];
  loading: boolean;
  busqueda: string;
  setBusqueda: (value: string) => void;
  categoriaFiltro: number | null;
  setCategoriaFiltro: (value: number | null) => void;
  onAgregarProducto: (idProducto: number) => void;
  styles: any;
  colors: Colors;
}

export const ProductosDisponibles: React.FC<ProductosDisponiblesProps> = ({
  productos,
  categorias,
  loading,
  busqueda,
  setBusqueda,
  categoriaFiltro,
  setCategoriaFiltro,
  onAgregarProducto,
  styles,
  colors,
}) => {
  const renderProducto = ({ item }: { item: InventarioProducto }) => {
    const imagenPrincipal = item.imagenes?.find((img) => img.esPrincipal);

    return (
      <Pressable
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 8,
          borderBottomWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          gap: 8,
        }}
        onPress={() => onAgregarProducto(item.idProducto)}
      >
        {imagenPrincipal?.urlFoto ? (
          <Image
            source={{ uri: imagenPrincipal.urlFoto }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              backgroundColor: colors.backgroundSecondary,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              backgroundColor: colors.backgroundSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="image-outline" size={20} color={colors.textMuted} />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontSize: 12, fontWeight: "700" }} numberOfLines={1}>
            {item.nombre}
          </ThemedText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
            <ThemedText style={{ fontSize: 10, color: colors.textMuted }}>
              {item.sku}
            </ThemedText>
            <ThemedText style={{ fontSize: 10, color: colors.textMuted }}>
              • Stock: {item.stock}
            </ThemedText>
          </View>
          <ThemedText
            style={{ fontSize: 11, fontWeight: "900", color: colors.primary, marginTop: 2 }}
          >
            Bs {item.precioVenta.toFixed(2)}
          </ThemedText>
        </View>

        <Pressable
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => onAgregarProducto(item.idProducto)}
        >
          <Ionicons name="add" size={18} color={colors.primaryForeground} />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={styles.productosColumn}>
      <ThemedText
        style={{
          fontSize: 13,
          fontWeight: "900",
          textTransform: "uppercase",
          color: colors.textMuted,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: colors.backgroundSecondary,
        }}
      >
        Productos Disponibles
      </ThemedText>

      {/* Filtros compactos */}
      <View style={{ padding: 8, gap: 6, backgroundColor: colors.card }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.input,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            gap: 6,
          }}
        >
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={{ flex: 1, fontSize: 12, fontWeight: "600", color: colors.text, padding: 0 }}
            placeholder="Buscar..."
            placeholderTextColor={colors.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.input,
            borderRadius: 8,
            height: 36,
          }}
        >
          <Picker
            selectedValue={categoriaFiltro === null ? 0 : categoriaFiltro}
            onValueChange={(value: number | string | null) => {
              const valorNumerico = typeof value === "string" ? parseInt(value) : value;
              const valorFiltro =
                valorNumerico === 0 || valorNumerico === null ? null : Number(valorNumerico);
              setCategoriaFiltro(valorFiltro);
            }}
            style={{ color: colors.text, backgroundColor: colors.input, height: 36, fontSize: 12 }}
            dropdownIconColor={colors.text}
            mode="dropdown"
          >
            <Picker.Item label="Todas las categorías" value={0} color={colors.text} />
            {categorias.map((cat) => (
              <Picker.Item
                key={cat.idCategoria}
                label={cat.nombre}
                value={cat.idCategoria}
                color={colors.text}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Lista de productos */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderProducto}
          keyExtractor={(item) => item.idProducto.toString()}
          contentContainerStyle={styles.productosLista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
              <ThemedText style={styles.emptyText}>
                No hay productos disponibles
              </ThemedText>
            </View>
          }
        />
      )}

      {/* Footer con contador */}
      <View style={styles.productosFooter}>
        <ThemedText style={styles.productosCount}>
          Mostrando {productos.length} productos
        </ThemedText>
      </View>
    </View>
  );
};
