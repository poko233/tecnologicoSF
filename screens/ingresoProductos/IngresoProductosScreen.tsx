import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../components/ThemedText";
import { useTheme } from "../../theme/useTheme";
import ProductoIngresoSelectorModal from "./components/ProductoIngresoSelectorModal";
import { useIngresoProductos } from "./hooks/useIngresoProductos";
import { createIngresoProductosStyles } from "./styles/ingresoProductos.styles";
import {
  IngresoProductoForm,
  ProductoDisponibleIngreso,
} from "./types/ingresoProductos.types";
import {
  IngresoProductoFormErrors,
  crearIngresoProductoForm,
  formatearFechaIngreso,
  formatearNumero,
  ingresoFormAPayload,
  nombreUsuarioIngreso,
  normalizarBusquedaIngreso,
  validarIngresoProductoForm,
} from "./utils/ingresoProductos.utils";

export default function IngresoProductosScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const isCompact = width < 1120;
  const styles = useMemo(
    () => createIngresoProductosStyles(theme.colors, isMobile, isCompact),
    [theme.colors, isMobile, isCompact],
  );

  const {
    ingresos,
    productos,
    loading,
    guardando,
    descargandoId,
    cargar,
    registrar,
    descargarRecibo,
  } = useIngresoProductos();

  const [form, setForm] = useState<IngresoProductoForm>(() =>
    crearIngresoProductoForm(),
  );
  const [errors, setErrors] = useState<IngresoProductoFormErrors>({});
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [buscarHistorial, setBuscarHistorial] = useState("");

  const productoSeleccionado = useMemo(
    () =>
      productos.find(
        (producto) => String(producto.idProducto) === form.idProducto,
      ) ?? null,
    [form.idProducto, productos],
  );

  const cantidadPrevia = Number(form.cantidad);
  const cantidadValida =
    Number.isInteger(cantidadPrevia) && cantidadPrevia > 0 ? cantidadPrevia : 0;
  const stockPosterior =
    (productoSeleccionado?.stock ?? 0) + cantidadValida;

  const ingresosFiltrados = useMemo(() => {
    const query = normalizarBusquedaIngreso(buscarHistorial);

    if (!query) return ingresos;

    return ingresos.filter((ingreso) => {
      const texto = normalizarBusquedaIngreso(
        [
          ingreso.producto?.nombre,
          ingreso.producto?.sku,
          ingreso.usuario?.nombreCompleto,
          ingreso.usuario?.usuario,
          ingreso.fechaIngreso,
          ingreso.idIngresoProducto,
        ].join(" "),
      );

      return texto.includes(query);
    });
  }, [buscarHistorial, ingresos]);

  const actualizar = (campo: keyof IngresoProductoForm, value: string) => {
    setForm((actual) => ({ ...actual, [campo]: value }));
    setErrors((actual) => ({ ...actual, [campo]: undefined }));
  };

  const seleccionarProducto = (producto: ProductoDisponibleIngreso) => {
    actualizar("idProducto", String(producto.idProducto));
    setSelectorVisible(false);
  };

  const guardar = async () => {
    if (guardando) return;

    const encontrados = validarIngresoProductoForm(form);

    if (Object.keys(encontrados).length > 0) {
      setErrors(encontrados);
      Toast.show({
        type: "error",
        text1: "Revisa los datos del ingreso",
        text2: Object.values(encontrados).find(Boolean),
      });
      return;
    }

    const ingreso = await registrar(ingresoFormAPayload(form));

    if (!ingreso) return;

    setForm(crearIngresoProductoForm());
    setErrors({});

    // El recibo se genera/descarga inmediatamente después de guardar.
    await descargarRecibo(ingreso.idIngresoProducto);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void cargar(true)}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            <View style={styles.heroMain}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="enter-outline"
                  size={27}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.heroText}>
                <ThemedText style={styles.kicker}>Inventario</ThemedText>
                <ThemedText style={styles.title}>Ingreso de productos</ThemedText>
                <ThemedText style={styles.subtitle}>
                  Registra entradas de productos existentes, actualiza el stock y
                  genera el recibo PDF del movimiento.
                </ThemedText>
              </View>
            </View>

            <Pressable
              disabled={loading}
              onPress={() => void cargar(true)}
              style={[styles.secondaryButton, loading && styles.disabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={theme.colors.text}
                />
              )}
              <ThemedText style={styles.secondaryButtonText}>
                Actualizar
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <View>
              <ThemedText style={styles.sectionTitle}>Nuevo ingreso</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                La cantidad registrada se sumará al stock actual del producto.
              </ThemedText>
            </View>

            <View style={styles.sessionBadge}>
              <Ionicons
                name="person-circle-outline"
                size={16}
                color={theme.colors.primary}
              />
              <ThemedText style={styles.sessionBadgeText}>
                Usuario tomado de la sesión
              </ThemedText>
            </View>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.field}>
              <ThemedText style={styles.label}>Fecha de ingreso *</ThemedText>
              <TextInput
                value={form.fechaIngreso}
                onChangeText={(value) => actualizar("fechaIngreso", value)}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.input, errors.fechaIngreso && styles.inputError]}
                maxLength={10}
              />
              <ThemedText style={styles.helper}>Formato: AAAA-MM-DD</ThemedText>
              {!!errors.fechaIngreso && (
                <ThemedText style={styles.errorText}>
                  {errors.fechaIngreso}
                </ThemedText>
              )}
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Producto *</ThemedText>
              <Pressable
                onPress={() => setSelectorVisible(true)}
                style={[
                  styles.selectorButton,
                  errors.idProducto && styles.selectorButtonError,
                ]}
              >
                <ThemedText
                  numberOfLines={1}
                  style={[
                    styles.selectorButtonText,
                    !productoSeleccionado && styles.selectorPlaceholder,
                  ]}
                >
                  {productoSeleccionado
                    ? `${productoSeleccionado.sku} - ${productoSeleccionado.nombre}`
                    : "Seleccionar producto"}
                </ThemedText>
                <Ionicons
                  name="chevron-down-outline"
                  size={18}
                  color={theme.colors.text}
                />
              </Pressable>
              <ThemedText style={styles.helper}>
                Solo productos activos registrados en Inventario.
              </ThemedText>
              {!!errors.idProducto && (
                <ThemedText style={styles.errorText}>
                  {errors.idProducto}
                </ThemedText>
              )}
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Cantidad *</ThemedText>
              <TextInput
                value={form.cantidad}
                onChangeText={(value) =>
                  actualizar("cantidad", value.replace(/\D/g, ""))
                }
                placeholder="Ej.: 10"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="number-pad"
                style={[styles.input, errors.cantidad && styles.inputError]}
                maxLength={10}
              />
              <ThemedText style={styles.helper}>
                Ingresa unidades enteras mayores a cero.
              </ThemedText>
              {!!errors.cantidad && (
                <ThemedText style={styles.errorText}>{errors.cantidad}</ThemedText>
              )}
            </View>
          </View>

          {productoSeleccionado && (
            <View style={styles.selectedProduct}>
              <View style={styles.selectedProductMain}>
                <View style={styles.selectedProductIcon}>
                  <Ionicons
                    name="cube-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.selectedProductInfo}>
                  <ThemedText
                    numberOfLines={1}
                    style={styles.selectedProductName}
                  >
                    {productoSeleccionado.nombre}
                  </ThemedText>
                  <ThemedText style={styles.mutedText}>
                    SKU: {productoSeleccionado.sku} · Unidad: {productoSeleccionado.unidadMedida}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.stockPreview}>
                <View style={styles.stockItem}>
                  <ThemedText style={styles.stockLabel}>Stock actual</ThemedText>
                  <ThemedText style={styles.stockValue}>
                    {formatearNumero(productoSeleccionado.stock)}
                  </ThemedText>
                </View>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color={theme.colors.textSecondary}
                />

                <View style={styles.stockItem}>
                  <ThemedText style={styles.stockLabel}>Después</ThemedText>
                  <ThemedText
                    style={[styles.stockValue, styles.stockValueSuccess]}
                  >
                    {formatearNumero(stockPosterior)}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          <View style={styles.formFooter}>
            <ThemedText style={styles.formFooterInfo}>
              Consulta quién registró cada movimiento y vuelve a previsualizar su comprobante.
            </ThemedText>

            <Pressable
              disabled={guardando}
              onPress={() => void guardar()}
              style={[styles.primaryButton, guardando && styles.disabled]}
            >
              {guardando ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primaryForeground}
                />
              ) : (
                <Ionicons
                  name="save-outline"
                  size={18}
                  color={theme.colors.primaryForeground}
                />
              )}
              <ThemedText style={styles.primaryButtonText}>
                {guardando ? "Registrando..." : "Registrar ingreso"}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <ThemedText style={styles.sectionTitle}>
                Historial de ingresos
              </ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                Consulta quién registró cada movimiento y vuelve a descargar su
                comprobante.
              </ThemedText>
            </View>

            <View style={styles.resultBadge}>
              <ThemedText style={styles.resultBadgeText}>
                {ingresosFiltrados.length} ingreso(s)
              </ThemedText>
            </View>
          </View>

          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={18}
              color={theme.colors.textSecondary}
            />
            <TextInput
              value={buscarHistorial}
              onChangeText={setBuscarHistorial}
              placeholder="Buscar por producto, SKU, usuario o fecha..."
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.searchInput}
            />
            {!!buscarHistorial && (
              <Pressable onPress={() => setBuscarHistorial("")}>
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            )}
          </View>

          {loading && ingresos.length === 0 ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <ThemedText style={styles.mutedText}>
                Cargando ingresos...
              </ThemedText>
            </View>
          ) : ingresosFiltrados.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons
                name="archive-outline"
                size={32}
                color={theme.colors.primary}
              />
              <ThemedText style={styles.emptyTitle}>
                No hay ingresos para mostrar
              </ThemedText>
              <ThemedText style={styles.mutedText}>
                Registra el primer ingreso o modifica la búsqueda.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.list}>
              {ingresosFiltrados.map((ingreso) => (
                <View key={ingreso.idIngresoProducto} style={styles.row}>
                  <View style={styles.rowMain}>
                    <View style={styles.rowTop}>
                      <ThemedText numberOfLines={2} style={styles.rowTitle}>
                        {ingreso.producto?.nombre || "Producto no disponible"}
                      </ThemedText>
                      <View style={styles.idBadge}>
                        <ThemedText style={styles.idBadgeText}>
                          #{String(ingreso.idIngresoProducto).padStart(6, "0")}
                        </ThemedText>
                      </View>
                    </View>

                    <ThemedText style={styles.rowMeta}>
                      SKU: {ingreso.producto?.sku || "-"} · Fecha: {formatearFechaIngreso(ingreso.fechaIngreso)}
                    </ThemedText>
                    <ThemedText style={styles.rowMeta}>
                      Registrado por: {nombreUsuarioIngreso(ingreso.usuario)}
                    </ThemedText>
                    <ThemedText style={styles.rowMeta}>
                      Stock: {formatearNumero(ingreso.stockAnterior)} → {formatearNumero(ingreso.stockPosterior)}
                    </ThemedText>
                  </View>

                  <View style={styles.rowStats}>
                    <View style={styles.quantityBox}>
                      <ThemedText style={styles.quantityLabel}>Cantidad</ThemedText>
                      <ThemedText style={styles.quantityValue}>
                        +{formatearNumero(ingreso.cantidad)}
                      </ThemedText>
                    </View>

                    <Pressable
                      disabled={descargandoId === ingreso.idIngresoProducto}
                      onPress={() =>
                        void descargarRecibo(ingreso.idIngresoProducto)
                      }
                      style={[
                        styles.receiptButton,
                        descargandoId === ingreso.idIngresoProducto &&
                          styles.disabled,
                      ]}
                    >
                      {descargandoId === ingreso.idIngresoProducto ? (
                        <ActivityIndicator
                          size="small"
                          color={theme.colors.primary}
                        />
                      ) : (
                        <Ionicons
                          name="document-text-outline"
                          size={17}
                          color={theme.colors.primary}
                        />
                      )}
                      <ThemedText style={styles.receiptButtonText}>
                        Recibo PDF
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ProductoIngresoSelectorModal
        visible={selectorVisible}
        productos={productos}
        seleccionadoId={productoSeleccionado?.idProducto ?? null}
        loading={loading}
        onClose={() => setSelectorVisible(false)}
        onSelect={seleccionarProducto}
      />
    </View>
  );
}
