import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    ScrollView,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { createIngresoProductosStyles } from "../styles/ingresoProductos.styles";
import { ProductoDisponibleIngreso } from "../types/ingresoProductos.types";
import {
    formatearNumero,
    normalizarBusquedaIngreso,
} from "../utils/ingresoProductos.utils";

type Props = {
  visible: boolean;
  productos: ProductoDisponibleIngreso[];
  seleccionadoId: number | null;
  loading: boolean;
  onClose: () => void;
  onSelect: (producto: ProductoDisponibleIngreso) => void;
};

export default function ProductoIngresoSelectorModal({
  visible,
  productos,
  seleccionadoId,
  loading,
  onClose,
  onSelect,
}: Props) {
  const { theme } = useTheme();
  const styles = useMemo(
    () => createIngresoProductosStyles(theme.colors, false, false),
    [theme.colors],
  );
  const [buscar, setBuscar] = useState("");

  const filtrados = useMemo(() => {
    const query = normalizarBusquedaIngreso(buscar);

    if (!query) return productos;

    return productos.filter((producto) =>
      normalizarBusquedaIngreso(
        `${producto.sku} ${producto.nombre}`,
      ).includes(query),
    );
  }, [buscar, productos]);

  const cerrar = () => {
    setBuscar("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cerrar}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.selectorModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderIcon}>
              <Ionicons
                name="cube-outline"
                size={23}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.modalHeaderText}>
              <ThemedText style={styles.modalTitle}>
                Seleccionar producto
              </ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                Solo se muestran productos activos ya registrados en inventario.
              </ThemedText>
            </View>

            <Pressable onPress={cerrar} style={styles.closeButton}>
              <Ionicons name="close" size={23} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.modalSearch}>
            <Ionicons
              name="search-outline"
              size={19}
              color={theme.colors.textSecondary}
            />
            <TextInput
              value={buscar}
              onChangeText={setBuscar}
              placeholder="Buscar por nombre o SKU..."
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.searchInput}
            />
            {!!buscar && (
              <Pressable onPress={() => setBuscar("")}>
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <ThemedText style={styles.mutedText}>
                Cargando productos...
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              style={styles.selectorList}
              contentContainerStyle={styles.selectorListContent}
              showsVerticalScrollIndicator
            >
              {filtrados.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons
                    name="cube-outline"
                    size={31}
                    color={theme.colors.primary}
                  />
                  <ThemedText style={styles.emptyTitle}>
                    No se encontraron productos
                  </ThemedText>
                  <ThemedText style={styles.mutedText}>
                    Registra o activa el producto primero desde Inventario.
                  </ThemedText>
                </View>
              ) : (
                filtrados.map((producto) => {
                  const selected = producto.idProducto === seleccionadoId;

                  return (
                    <Pressable
                      key={producto.idProducto}
                      onPress={() => {
                        onSelect(producto);
                        setBuscar("");
                      }}
                      style={[
                        styles.productOption,
                        selected && styles.productOptionSelected,
                      ]}
                    >
                      {producto.imagenPrincipal ? (
                        <Image
                          source={{ uri: producto.imagenPrincipal }}
                          resizeMode="cover"
                          style={styles.productOptionImage}
                        />
                      ) : (
                        <View style={styles.productOptionImageEmpty}>
                          <Ionicons
                            name="cube-outline"
                            size={23}
                            color={theme.colors.primary}
                          />
                        </View>
                      )}

                      <View style={styles.productOptionInfo}>
                        <ThemedText
                          numberOfLines={2}
                          style={styles.productOptionName}
                        >
                          {producto.nombre}
                        </ThemedText>
                        <ThemedText style={styles.productOptionMeta}>
                          SKU: {producto.sku}
                        </ThemedText>
                        <ThemedText style={styles.productOptionMeta}>
                          Stock actual: {formatearNumero(producto.stock)} {producto.unidadMedida}
                        </ThemedText>
                      </View>

                      <Ionicons
                        name={selected ? "checkmark-circle" : "chevron-forward"}
                        size={21}
                        color={theme.colors.primary}
                      />
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
