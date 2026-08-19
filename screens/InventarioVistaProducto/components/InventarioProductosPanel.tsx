import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
    ActivityIndicator,
    Pressable,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

import {
    InventarioVistaCategoria,
    InventarioVistaFiltros,
    InventarioVistaProducto,
    InventarioVistaResumenFiltrado,
} from "../types/inventarioVistaProducto.types";

import { createInventarioVistaProductoStyles } from "../styles/inventarioVistaProducto.styles";

import InventarioFiltros from "./InventarioFiltros";
import InventarioTabla from "./InventarioTabla";

type Props = {
  productos: InventarioVistaProducto[];

  categorias: InventarioVistaCategoria[];

  resumenFiltrado: InventarioVistaResumenFiltrado;

  filtros: InventarioVistaFiltros;

  loading: boolean;

  onFiltrosChange: (
    filtros: InventarioVistaFiltros,
  ) => void;

  onRefresh: () => void;
};

export default function InventarioProductosPanel({
  productos,
  categorias,
  resumenFiltrado,
  filtros,
  loading,
  onFiltrosChange,
  onRefresh,
}: Props) {
  const { theme } = useTheme();

  const colors = theme.colors;

  const { width } =
    useWindowDimensions();

  const isMobile = width < 760;

  const isCompact = width < 1120;

  const styles = useMemo(
    () =>
      createInventarioVistaProductoStyles(
        colors,
        isMobile,
        isCompact,
      ),
    [
      colors,
      isMobile,
      isCompact,
    ],
  );

  const limpiarBusqueda = () => {
    onFiltrosChange({
      ...filtros,
      buscar: "",
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View
          style={styles.titleRow}
        >
          <View
            style={styles.titleIcon}
          >
            <Ionicons
              name="cube-outline"
              size={23}
              color={colors.primary}
            />
          </View>

          <View
            style={
              styles.titleTextBox
            }
          >
            <ThemedText
              style={styles.title}
            >
              Productos registrados
            </ThemedText>

            <ThemedText
              style={styles.subtitle}
            >
              {
                resumenFiltrado.totalProductos
              }{" "}
              producto(s) encontrado(s)
            </ThemedText>
          </View>
        </View>

        <InventarioFiltros
          filtros={filtros}
          categorias={categorias}
          loading={loading}
          colors={colors}
          styles={styles}
          onChange={
            onFiltrosChange
          }
          onRefresh={onRefresh}
        />
      </View>

      <View
        style={styles.searchBox}
      >
        <Ionicons
          name="search-outline"
          size={19}
          color={
            colors.textMuted ||
            colors.textSecondary
          }
        />

        <TextInput
          value={filtros.buscar}
          onChangeText={(buscar) =>
            onFiltrosChange({
              ...filtros,
              buscar,
            })
          }
          placeholder="Buscar por nombre, SKU, descripción o categoría..."
          placeholderTextColor={
            colors.textMuted ||
            colors.textSecondary
          }
          style={styles.searchInput}
        />

        {!!filtros.buscar && (
          <Pressable
            onPress={
              limpiarBusqueda
            }
            hitSlop={8}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={
                colors.textMuted ||
                colors.textSecondary
              }
            />
          </Pressable>
        )}
      </View>

      {loading &&
      productos.length === 0 ? (
        <View
          style={styles.loadingBox}
        >
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <ThemedText
            style={styles.loadingText}
          >
            Cargando productos...
          </ThemedText>
        </View>
      ) : productos.length === 0 ? (
        <View style={styles.empty}>
          <View
            style={styles.emptyIcon}
          >
            <Ionicons
              name="cube-outline"
              size={38}
              color={
                colors.textMuted ||
                colors.textSecondary
              }
            />
          </View>

          <ThemedText
            style={styles.emptyTitle}
          >
            No se encontraron
            productos
          </ThemedText>

          <ThemedText
            style={styles.emptyText}
          >
            Prueba con otra categoría,
            estado, existencia o término
            de búsqueda.
          </ThemedText>
        </View>
      ) : (
        <InventarioTabla
          productos={productos}
        />
      )}
    </View>
  );
}