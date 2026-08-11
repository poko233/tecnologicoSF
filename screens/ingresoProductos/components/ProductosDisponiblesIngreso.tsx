import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { Colors } from "../../../theme/types";
import { createIngresoProductosStyles } from "../styles/ingresoProductos.styles";
import {
    CategoriaDisponibleIngreso,
    ProductoDisponibleIngreso,
} from "../types/ingresoProductos.types";
import { formatearNumero } from "../utils/ingresoProductos.utils";

type Props = {
  productos: ProductoDisponibleIngreso[];
  categorias: CategoriaDisponibleIngreso[];
  loading: boolean;
  busqueda: string;
  setBusqueda: (value: string) => void;
  categoriaFiltro: number | null;
  setCategoriaFiltro: (value: number | null) => void;
  onAgregarProducto: (idProducto: number) => void;
  styles: ReturnType<typeof createIngresoProductosStyles>;
  colors: Colors;
};

export default function ProductosDisponiblesIngreso({
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
}: Props) {
  const accent = (colors as any).success || colors.primary;

  const renderProducto = ({ item }: { item: ProductoDisponibleIngreso }) => {
    const imagenPrincipal =
      item.imagenPrincipal ||
      item.imagenes?.find((imagen) => imagen.esPrincipal)?.urlFoto ||
      item.imagenes?.[0]?.urlFoto;

    return (
      <Pressable
        style={styles.productoCard}
        onPress={() => onAgregarProducto(item.idProducto)}
      >
        {imagenPrincipal ? (
          <Image
            source={{ uri: imagenPrincipal }}
            style={styles.productoImagen}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[styles.productoImagen, styles.productoImagenPlaceholder]}
          >
            <Ionicons name="image-outline" size={32} color={colors.textMuted} />
          </View>
        )}

        <View style={styles.productoInfo}>
          <ThemedText style={styles.productoNombre} numberOfLines={2}>
            {item.nombre}
          </ThemedText>
          <ThemedText style={styles.productoCodigo}>{item.sku}</ThemedText>
          {!!item.categoria?.nombre && (
            <ThemedText style={styles.productoCategoria}>
              {item.categoria.nombre}
            </ThemedText>
          )}
          <View style={styles.productoFooter}>
            <ThemedText style={styles.productoUnidad}>
              {item.unidadMedida || "Unidad"}
            </ThemedText>
            <ThemedText style={styles.productoStock}>
              Stock: {formatearNumero(item.stock)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.primaryForeground} />
        </View>
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
            style={styles.buscadorInput}
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
            selectedValue={categoriaFiltro ?? 0}
            onValueChange={(value: number | string | null) => {
              const numero = Number(value ?? 0);
              setCategoriaFiltro(numero > 0 ? numero : null);
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
            {categorias.map((categoria) => (
              <Picker.Item
                key={categoria.idCategoria}
                label={categoria.nombre}
                value={categoria.idCategoria}
                color={colors.text}
              />
            ))}
          </Picker>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent} />
          <ThemedText style={styles.emptyText}>
            Cargando productos...
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderProducto}
          keyExtractor={(item) => String(item.idProducto)}
          contentContainerStyle={styles.productosLista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="cube-outline"
                size={48}
                color={colors.textMuted}
              />
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
}
