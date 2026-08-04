import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { createInventarioStyles } from "../styles/inventario.styles";
import {
    InventarioCategoria,
    InventarioProducto,
    ProductoFiltros,
} from "../types/inventario.types";
import {
    formatearMoneda,
    normalizarBusqueda,
    obtenerEstadoStockLabel,
} from "../utils/inventario.utils";

type Props = {
  productos: InventarioProducto[];
  categorias: InventarioCategoria[];
  loading: boolean;
  procesando: boolean;
  styles: ReturnType<typeof createInventarioStyles>;
  colors: any;
  onEditar: (producto: InventarioProducto) => void;
  onImagenes: (producto: InventarioProducto) => void;
  onCambiarEstado: (producto: InventarioProducto) => void;
  onEliminar: (producto: InventarioProducto) => void;
};

type FiltroActivo = "categoria" | "estado" | "stock" | null;

const FILTROS_INICIALES: ProductoFiltros = {
  buscar: "",
  idCategoria: "",
  estado: "",
  stock: "",
};

export default function ProductosPanel({
  productos,
  categorias,
  loading,
  procesando,
  styles,
  colors,
  onEditar,
  onImagenes,
  onCambiarEstado,
  onEliminar,
}: Props) {
  const [filtros, setFiltros] = useState<ProductoFiltros>(FILTROS_INICIALES);
  const [filtroActivo, setFiltroActivo] = useState<FiltroActivo>(null);

  const productosFiltrados = useMemo(() => {
    const buscar = normalizarBusqueda(filtros.buscar);

    return productos.filter((producto) => {
      const texto = normalizarBusqueda(
        [
          producto.nombre,
          producto.sku,
          producto.codigoBarras,
          producto.descripcion,
          producto.categoria?.nombre,
          producto.unidadMedida,
        ].join(" "),
      );

      const cumpleBusqueda = !buscar || texto.includes(buscar);
      const cumpleCategoria =
        !filtros.idCategoria ||
        String(producto.idCategoria ?? "") === filtros.idCategoria;
      const cumpleEstado = !filtros.estado || producto.estado === filtros.estado;
      const cumpleStock =
        !filtros.stock ||
        (filtros.stock === "sin_stock" && producto.estadoStock === "SIN_STOCK") ||
        (filtros.stock === "bajo" && producto.estadoStock === "BAJO") ||
        (filtros.stock === "disponible" &&
          producto.estadoStock === "DISPONIBLE");

      return cumpleBusqueda && cumpleCategoria && cumpleEstado && cumpleStock;
    });
  }, [filtros, productos]);

  const categoriaSeleccionada = categorias.find(
    (categoria) => String(categoria.idCategoria) === filtros.idCategoria,
  );

  const limpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES);
    setFiltroActivo(null);
  };

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHeaderText}>
          <ThemedText style={styles.panelTitle}>Productos registrados</ThemedText>
          <ThemedText style={styles.panelSubtitle}>
            Administra precios, stock, categorías, imágenes y estado de cada producto.
          </ThemedText>
        </View>

        <View style={styles.resultBadge}>
          <ThemedText style={styles.resultBadgeText}>
            {productosFiltrados.length} resultado(s)
          </ThemedText>
        </View>
      </View>

      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={19}
            color={colors.textMuted || colors.textSecondary}
          />
          <TextInput
            value={filtros.buscar}
            onChangeText={(buscar) => setFiltros((prev) => ({ ...prev, buscar }))}
            placeholder="Buscar por nombre, SKU, código, categoría..."
            placeholderTextColor={colors.textMuted || colors.textSecondary}
            style={styles.searchInput}
          />
          {!!filtros.buscar && (
            <Pressable
              onPress={() => setFiltros((prev) => ({ ...prev, buscar: "" }))}
            >
              <Ionicons
                name="close-circle-outline"
                size={19}
                color={colors.textMuted || colors.textSecondary}
              />
            </Pressable>
          )}
        </View>

        <FilterButton
          label="Categoría"
          value={categoriaSeleccionada?.nombre || "Todas"}
          selected={!!filtros.idCategoria}
          styles={styles}
          colors={colors}
          onPress={() =>
            setFiltroActivo((actual) =>
              actual === "categoria" ? null : "categoria",
            )
          }
        />

        <FilterButton
          label="Estado"
          value={
            filtros.estado === "ACTIVO"
              ? "Activos"
              : filtros.estado === "INACTIVO"
                ? "Inactivos"
                : "Todos"
          }
          selected={!!filtros.estado}
          styles={styles}
          colors={colors}
          onPress={() =>
            setFiltroActivo((actual) =>
              actual === "estado" ? null : "estado",
            )
          }
        />

        <FilterButton
          label="Stock"
          value={
            filtros.stock === "disponible"
              ? "Disponible"
              : filtros.stock === "bajo"
                ? "Stock bajo"
                : filtros.stock === "sin_stock"
                  ? "Sin stock"
                  : "Todos"
          }
          selected={!!filtros.stock}
          styles={styles}
          colors={colors}
          onPress={() =>
            setFiltroActivo((actual) =>
              actual === "stock" ? null : "stock",
            )
          }
        />
      </View>

      {filtroActivo === "categoria" && (
        <FilterPanel
          title="Selecciona una categoría"
          options={[
            { label: "Todas", value: "" },
            ...categorias.map((categoria) => ({
              label: categoria.nombre,
              value: String(categoria.idCategoria),
            })),
          ]}
          value={filtros.idCategoria}
          styles={styles}
          colors={colors}
          onSelect={(idCategoria) => {
            setFiltros((prev) => ({ ...prev, idCategoria }));
            setFiltroActivo(null);
          }}
        />
      )}

      {filtroActivo === "estado" && (
        <FilterPanel
          title="Selecciona el estado"
          options={[
            { label: "Todos", value: "" },
            { label: "Activos", value: "ACTIVO" },
            { label: "Inactivos", value: "INACTIVO" },
          ]}
          value={filtros.estado}
          styles={styles}
          colors={colors}
          onSelect={(estado) => {
            setFiltros((prev) => ({ ...prev, estado: estado as any }));
            setFiltroActivo(null);
          }}
        />
      )}

      {filtroActivo === "stock" && (
        <FilterPanel
          title="Selecciona el estado del stock"
          options={[
            { label: "Todos", value: "" },
            { label: "Disponible", value: "disponible" },
            { label: "Stock bajo", value: "bajo" },
            { label: "Sin stock", value: "sin_stock" },
          ]}
          value={filtros.stock}
          styles={styles}
          colors={colors}
          onSelect={(stock) => {
            setFiltros((prev) => ({ ...prev, stock: stock as any }));
            setFiltroActivo(null);
          }}
        />
      )}

      {(filtros.buscar || filtros.idCategoria || filtros.estado || filtros.stock) && (
        <Pressable onPress={limpiarFiltros} style={styles.secondaryButton}>
          <Ionicons name="funnel-outline" size={17} color={colors.text} />
          <ThemedText style={styles.secondaryButtonText}>
            Limpiar filtros
          </ThemedText>
        </Pressable>
      )}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.loadingText}>Cargando productos...</ThemedText>
        </View>
      ) : productosFiltrados.length === 0 ? (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cube-outline" size={32} color={colors.primary} />
          </View>
          <ThemedText style={styles.emptyTitle}>No hay productos para mostrar</ThemedText>
          <ThemedText style={styles.emptyText}>
            Crea un producto nuevo o cambia los filtros de búsqueda.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.productList}>
          {productosFiltrados.map((producto) => (
            <ProductoRow
              key={producto.idProducto}
              producto={producto}
              procesando={procesando}
              styles={styles}
              colors={colors}
              onEditar={() => onEditar(producto)}
              onImagenes={() => onImagenes(producto)}
              onCambiarEstado={() => onCambiarEstado(producto)}
              onEliminar={() => onEliminar(producto)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function ProductoRow({
  producto,
  procesando,
  styles,
  colors,
  onEditar,
  onImagenes,
  onCambiarEstado,
  onEliminar,
}: {
  producto: InventarioProducto;
  procesando: boolean;
  styles: ReturnType<typeof createInventarioStyles>;
  colors: any;
  onEditar: () => void;
  onImagenes: () => void;
  onCambiarEstado: () => void;
  onEliminar: () => void;
}) {
  const stockColor =
    producto.estadoStock === "SIN_STOCK"
      ? colors.destructive || "#DC2626"
      : producto.estadoStock === "BAJO"
        ? colors.warning || "#D97706"
        : colors.success || "#16A34A";
  const activo = producto.estado === "ACTIVO";
  const precioMostrado = producto.precioDescuento ?? producto.precioVenta;

  return (
    <View style={styles.productRow}>
      {producto.imagenPrincipal ? (
        <Image
          source={{ uri: producto.imagenPrincipal }}
          style={styles.productImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.productImageEmpty}>
          <Ionicons
            name="image-outline"
            size={30}
            color={colors.textMuted || colors.textSecondary}
          />
        </View>
      )}

      <View style={styles.productMain}>
        <View style={styles.productTitleRow}>
          <ThemedText numberOfLines={2} style={styles.productName}>
            {producto.nombre}
          </ThemedText>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: activo
                  ? `${colors.success || "#16A34A"}16`
                  : `${colors.destructive || "#DC2626"}14`,
                borderColor: activo
                  ? colors.success || "#16A34A"
                  : colors.destructive || "#DC2626",
              },
            ]}
          >
            <ThemedText
              style={[
                styles.badgeText,
                {
                  color: activo
                    ? colors.success || "#16A34A"
                    : colors.destructive || "#DC2626",
                },
              ]}
            >
              {activo ? "Activado" : "Desactivado"}
            </ThemedText>
          </View>
        </View>

        <ThemedText numberOfLines={1} style={styles.productSku}>
          SKU: {producto.sku}
          {producto.codigoBarras ? ` · Código: ${producto.codigoBarras}` : ""}
        </ThemedText>
        <ThemedText numberOfLines={1} style={styles.productDescription}>
          {producto.descripcion || "Sin descripción"}
        </ThemedText>
      </View>

      <View style={styles.productData}>
        <ThemedText style={styles.productPrice}>
          {formatearMoneda(precioMostrado)}
        </ThemedText>
        {!!producto.precioDescuento && (
          <ThemedText style={styles.productMeta}>
            Precio normal: {formatearMoneda(producto.precioVenta)}
          </ThemedText>
        )}
        <ThemedText numberOfLines={1} style={styles.productMeta}>
          {producto.categoria?.nombre || "Sin categoría"}
        </ThemedText>
        <ThemedText style={styles.productMeta}>
          {producto.cantidadImagenes} imagen(es)
        </ThemedText>
      </View>

      <View style={styles.stockBox}>
        <ThemedText style={styles.stockNumber}>{producto.stock}</ThemedText>
        <ThemedText style={styles.stockLabel}>
          {producto.unidadMedida}
        </ThemedText>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: `${stockColor}14`,
              borderColor: stockColor,
            },
          ]}
        >
          <ThemedText style={[styles.badgeText, { color: stockColor }]}>
            {obtenerEstadoStockLabel(producto.estadoStock)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          disabled={procesando}
          onPress={onEditar}
          style={[styles.iconButton, styles.iconButtonPrimary]}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </Pressable>
        <Pressable
          disabled={procesando}
          onPress={onImagenes}
          style={[styles.iconButton, styles.iconButtonPrimary]}
        >
          <Ionicons name="images-outline" size={20} color={colors.primary} />
        </Pressable>
        <Pressable
          disabled={procesando}
          onPress={onCambiarEstado}
          style={[
            styles.switchTrack,
            {
              backgroundColor: activo
                ? colors.success || "#16A34A"
                : colors.border,
              borderColor: activo
                ? colors.success || "#16A34A"
                : colors.border,
            },
          ]}
        >
          <View
            style={[styles.switchThumb, activo && styles.switchThumbActive]}
          />
        </Pressable>
        <Pressable
          disabled={procesando}
          onPress={onEliminar}
          style={[styles.iconButton, styles.iconButtonDanger]}
        >
          <Ionicons
            name="trash-outline"
            size={19}
            color={colors.destructive || "#DC2626"}
          />
        </Pressable>
      </View>
    </View>
  );
}

function FilterButton({
  label,
  value,
  selected,
  styles,
  colors,
  onPress,
}: {
  label: string;
  value: string;
  selected: boolean;
  styles: ReturnType<typeof createInventarioStyles>;
  colors: any;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterButton, selected && styles.filterButtonSelected]}
    >
      <View style={styles.filterButtonTextBox}>
        <ThemedText style={styles.filterLabel}>{label}</ThemedText>
        <ThemedText numberOfLines={1} style={styles.filterValue}>
          {value}
        </ThemedText>
      </View>
      <Ionicons name="chevron-down-outline" size={17} color={colors.text} />
    </Pressable>
  );
}

function FilterPanel({
  title,
  options,
  value,
  styles,
  colors,
  onSelect,
}: {
  title: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  styles: ReturnType<typeof createInventarioStyles>;
  colors: any;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.filterPanel}>
      <ThemedText style={styles.filterPanelTitle}>{title}</ThemedText>
      <View style={styles.filterOptions}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={`${title}-${option.value || "todos"}`}
              onPress={() => onSelect(option.value)}
              style={[
                styles.filterOption,
                active && styles.filterOptionActive,
              ]}
            >
              {active && (
                <Ionicons
                  name="checkmark-circle"
                  size={15}
                  color={colors.primaryForeground}
                />
              )}
              <ThemedText
                style={[
                  styles.filterOptionText,
                  active && styles.filterOptionTextActive,
                ]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
