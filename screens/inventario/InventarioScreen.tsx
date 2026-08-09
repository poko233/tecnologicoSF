import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../components/ThemedText";
import { useTheme } from "../../theme/useTheme";

import CategoriaFormModal from "./components/CategoriaFormModal";
import CategoriasPanel from "./components/CategoriasPanel";
import InventarioResumen from "./components/InventarioResumen";
import InventarioTabs from "./components/InventarioTabs";
import ProductoFormModal from "./components/ProductoFormModal";
import ProductoImagenesModal from "./components/ProductoImagenesModal";
import ProductosPanel from "./components/ProductosPanel";

import { useInventario } from "./hooks/useInventario";
import { createInventarioStyles } from "./styles/inventario.styles";

import {
  InventarioCategoria,
  InventarioProducto,
  TabInventario,
} from "./types/inventario.types";

export default function InventarioScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width < 760;

  const styles = useMemo(
    () =>
      createInventarioStyles(
        theme.colors,
        isMobile,
        width < 1120,
      ),
    [theme.colors, isMobile, width],
  );

  const {
    productos,
    categorias,
    resumen,

    loading,
    guardandoProducto,
    guardandoCategoria,
    procesandoAccion,
    procesandoImagen,

    cargarInventario,
    guardarProducto,
    cambiarEstadoProducto,

    guardarCategoria,
    cambiarEstadoCategoria,

    subirImagen,
    marcarImagenPrincipal,
    eliminarImagen,
  } = useInventario();

  const [tab, setTab] =
    useState<TabInventario>("productos");

  const [
    productoFormVisible,
    setProductoFormVisible,
  ] = useState(false);

  const [
    productoEditando,
    setProductoEditando,
  ] = useState<InventarioProducto | null>(null);

  const [
    productoImagenes,
    setProductoImagenes,
  ] = useState<InventarioProducto | null>(null);

  const [
    categoriaFormVisible,
    setCategoriaFormVisible,
  ] = useState(false);

  const [
    categoriaEditando,
    setCategoriaEditando,
  ] = useState<InventarioCategoria | null>(null);

  const abrirNuevo = () => {
    if (tab === "productos") {
      setProductoEditando(null);
      setProductoFormVisible(true);
      return;
    }

    setCategoriaEditando(null);
    setCategoriaFormVisible(true);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() =>
              void cargarInventario(true)
            }
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroTitleRow}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="cube-outline"
                  size={29}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.heroTextBox}>
                <ThemedText style={styles.kicker}>
                  Administración
                </ThemedText>

                <ThemedText style={styles.heroTitle}>
                  Registro de productos
                </ThemedText>

                <ThemedText style={styles.heroSubtitle}>
                  Registra y organiza los productos,
                  sus categorías, precios e imágenes
                  para mantener actualizado el catálogo
                  institucional.
                </ThemedText>
              </View>
            </View>

            <View style={styles.heroActions}>
              <Pressable
                disabled={loading}
                onPress={() =>
                  void cargarInventario(true)
                }
                style={[
                  styles.secondaryButton,
                  loading && styles.disabled,
                ]}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={theme.colors.text}
                />

                <ThemedText
                  style={styles.secondaryButtonText}
                >
                  Actualizar
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={abrirNuevo}
                style={styles.primaryButton}
              >
                <Ionicons
                  name={
                    tab === "productos"
                      ? "add-circle-outline"
                      : "pricetag-outline"
                  }
                  size={19}
                  color={
                    theme.colors.primaryForeground
                  }
                />

                <ThemedText
                  style={styles.primaryButtonText}
                >
                  {tab === "productos"
                    ? "Nuevo producto"
                    : "Nueva categoría"}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        <InventarioTabs
          value={tab}
          onChange={setTab}
          styles={styles}
          colors={theme.colors}
        />

        <InventarioResumen
          resumen={resumen}
          styles={styles}
          colors={theme.colors}
        />

        {tab === "productos" ? (
          <ProductosPanel
            productos={productos}
            categorias={categorias}
            loading={loading}
            procesando={procesandoAccion}
            styles={styles}
            colors={theme.colors}
            onEditar={(producto) => {
              setProductoEditando(producto);
              setProductoFormVisible(true);
            }}
            onImagenes={setProductoImagenes}
            onCambiarEstado={(producto) =>
              void cambiarEstadoProducto(producto)
            }
          />
        ) : (
          <CategoriasPanel
            categorias={categorias}
            loading={loading}
            procesando={procesandoAccion}
            styles={styles}
            colors={theme.colors}
            onEditar={(categoria) => {
              setCategoriaEditando(categoria);
              setCategoriaFormVisible(true);
            }}
            onCambiarEstado={(categoria) =>
              void cambiarEstadoCategoria(categoria)
            }
          />
        )}
      </ScrollView>

      <ProductoFormModal
        visible={productoFormVisible}
        producto={productoEditando}
        categorias={categorias}
        guardando={guardandoProducto}
        onClose={() => {
          if (guardandoProducto) return;

          setProductoFormVisible(false);
          setProductoEditando(null);
        }}
        onSave={guardarProducto}
      />

      <ProductoImagenesModal
        visible={!!productoImagenes}
        producto={productoImagenes}
        procesando={procesandoImagen}
        onClose={() => {
          if (!procesandoImagen) {
            setProductoImagenes(null);
          }
        }}
        onSubir={subirImagen}
        onPrincipal={marcarImagenPrincipal}
        onEliminar={eliminarImagen}
      />

      <CategoriaFormModal
        visible={categoriaFormVisible}
        categoria={categoriaEditando}
        guardando={guardandoCategoria}
        onClose={() => {
          if (guardandoCategoria) return;

          setCategoriaFormVisible(false);
          setCategoriaEditando(null);
        }}
        onSave={guardarCategoria}
      />
    </View>
  );
}