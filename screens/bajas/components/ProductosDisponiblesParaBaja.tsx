import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { ActivityIndicator, FlatList, Image, Pressable, TextInput, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Colors } from "../../../theme/types";
import { InventarioCategoria, InventarioProducto } from "../../inventario/types/inventario.types";

interface ProductosDisponiblesParaBajaProps {
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

export const ProductosDisponiblesParaBaja: React.FC<ProductosDisponiblesParaBajaProps> = ({
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
        style={styles.productoCard}
        onPress={() => onAgregarProducto(item.idProducto)}
      >
        {imagenPrincipal?.urlFoto ? (
          <Image
            source={{ uri: imagenPrincipal.urlFoto }}
            style={styles.productoImagen}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.productoImagen, styles.productoImagenPlaceholder]}>
            <Ionicons name="image-outline" size={32} color={colors.textMuted} />
          </View>
        )}

        <View style={styles.productoInfo}>
          <ThemedText style={styles.productoNombre} numberOfLines={2}>
            {item.nombre}
          </ThemedText>
          <ThemedText style={styles.productoCodigo}>{item.sku}</ThemedText>
          {item.categoria && (
            <ThemedText style={styles.productoCategoria}>
              {item.categoria.nombre}
            </ThemedText>
          )}
          <View style={styles.productoFooter}>
            <ThemedText style={styles.productoPrecio}>Bs {item.precioVenta.toFixed(2)}</ThemedText>
            <ThemedText style={styles.productoStock}>Stock: {item.stock}</ThemedText>
          </View>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => onAgregarProducto(item.idProducto)}
        >
          <Ionicons name="add" size={24} color={colors.primaryForeground} />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={styles.productosColumn}>
      <ThemedText style={styles.columnTitle}>Productos Disponibles</ThemedText>

      <View style={styles.filtros}>
        <View style={styles.buscadorContainer}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.buscadorInput, { color: colors.text }]}
            placeholder="Buscar por nombre o código..."
            placeholderTextColor={colors.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        <View
          style={[
            styles.pickerContainer,
            { borderColor: colors.border, backgroundColor: colors.input },
          ]}
        >
          <Picker
            selectedValue={categoriaFiltro === null ? 0 : categoriaFiltro}
            onValueChange={(value: number | string | null) => {
              // Convertir 0 a null para "Todas las categorías"
              const valorNumerico = typeof value === 'string' ? parseInt(value) : value;
              const valorFiltro = valorNumerico === 0 || valorNumerico === null ? null : Number(valorNumerico);
              setCategoriaFiltro(valorFiltro);
            }}
            style={[
              styles.picker,
              { color: colors.text, backgroundColor: colors.input },
            ]}
            dropdownIconColor={colors.text}
            mode="dropdown"
          >
            <Picker.Item
              label="Todas las categorías"
              value={0}
              color={colors.text}
            />
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

      <View style={styles.productosFooter}>
        <ThemedText style={styles.productosCount}>
          Mostrando {productos.length} productos
        </ThemedText>
      </View>
    </View>
  );
};
