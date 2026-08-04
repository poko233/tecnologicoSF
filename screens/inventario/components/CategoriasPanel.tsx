import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { createInventarioStyles } from "../styles/inventario.styles";
import {
  CategoriaFiltros,
  InventarioCategoria,
} from "../types/inventario.types";
import { normalizarBusqueda } from "../utils/inventario.utils";

type Props = {
  categorias: InventarioCategoria[];
  loading: boolean;
  procesando: boolean;
  styles: ReturnType<typeof createInventarioStyles>;
  colors: any;
  onEditar: (categoria: InventarioCategoria) => void;
  onCambiarEstado: (categoria: InventarioCategoria) => void;
  onEliminar: (categoria: InventarioCategoria) => void;
};

export default function CategoriasPanel({
  categorias,
  loading,
  procesando,
  styles,
  colors,
  onEditar,
  onCambiarEstado,
  onEliminar,
}: Props) {
  const [filtros, setFiltros] = useState<CategoriaFiltros>({
    buscar: "",
    estado: "",
  });

  const filtradas = useMemo(() => {
    const buscar = normalizarBusqueda(filtros.buscar);
    return categorias.filter((categoria) => {
      const texto = normalizarBusqueda(
        `${categoria.nombre} ${categoria.descripcion ?? ""}`,
      );
      return (
        (!buscar || texto.includes(buscar)) &&
        (!filtros.estado || categoria.estado === filtros.estado)
      );
    });
  }, [categorias, filtros]);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHeaderText}>
          <ThemedText style={styles.panelTitle}>Categorías</ThemedText>
          <ThemedText style={styles.panelSubtitle}>
            Clasifica los productos y controla qué categorías están disponibles.
          </ThemedText>
        </View>
        <View style={styles.resultBadge}>
          <ThemedText style={styles.resultBadgeText}>
            {filtradas.length} resultado(s)
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
            placeholder="Buscar categoría..."
            placeholderTextColor={colors.textMuted || colors.textSecondary}
            style={styles.searchInput}
          />
        </View>
        <View style={styles.filterOptions}>
          {[
            { label: "Todas", value: "" },
            { label: "Activas", value: "ACTIVO" },
            { label: "Inactivas", value: "INACTIVO" },
          ].map((option) => {
            const activa = filtros.estado === option.value;
            return (
              <Pressable
                key={option.label}
                onPress={() =>
                  setFiltros((prev) => ({
                    ...prev,
                    estado: option.value as CategoriaFiltros["estado"],
                  }))
                }
                style={[
                  styles.filterOption,
                  activa && styles.filterOptionActive,
                ]}
              >
                <ThemedText
                  style={[
                    styles.filterOptionText,
                    activa && styles.filterOptionTextActive,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.loadingText}>Cargando categorías...</ThemedText>
        </View>
      ) : filtradas.length === 0 ? (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <Ionicons name="pricetags-outline" size={32} color={colors.primary} />
          </View>
          <ThemedText style={styles.emptyTitle}>No hay categorías</ThemedText>
          <ThemedText style={styles.emptyText}>
            Registra una categoría o modifica los filtros.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.categoryGrid}>
          {filtradas.map((categoria) => {
            const activa = categoria.estado === "ACTIVO";
            const estadoColor = activa
              ? colors.success || "#16A34A"
              : colors.destructive || "#DC2626";

            return (
              <View key={categoria.idCategoria} style={styles.categoryCard}>
                <View style={styles.categoryTop}>
                  <View style={styles.categoryIcon}>
                    <Ionicons name="pricetag-outline" size={21} color={colors.primary} />
                  </View>
                  <View style={styles.categoryInfo}>
                    <ThemedText style={styles.categoryName} numberOfLines={2}>
                      {categoria.nombre}
                    </ThemedText>
                    <ThemedText
                      style={styles.categoryDescription}
                      numberOfLines={3}
                    >
                      {categoria.descripcion || "Sin descripción"}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.categoryFooter}>
                  <View>
                    <ThemedText style={styles.categoryCount}>
                      {categoria.productos_count ?? 0} producto(s)
                    </ThemedText>
                    <ThemedText
                      style={[styles.productMeta, { color: estadoColor }]}
                    >
                      {activa ? "Activada" : "Desactivada"}
                    </ThemedText>
                  </View>
                  <View style={styles.actionRow}>
                    <Pressable
                      disabled={procesando}
                      onPress={() => onEditar(categoria)}
                      style={[styles.iconButton, styles.iconButtonPrimary]}
                    >
                      <Ionicons name="create-outline" size={19} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      disabled={procesando}
                      onPress={() => onCambiarEstado(categoria)}
                      style={[
                        styles.switchTrack,
                        {
                          backgroundColor: activa
                            ? colors.success || "#16A34A"
                            : colors.border,
                          borderColor: activa
                            ? colors.success || "#16A34A"
                            : colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.switchThumb,
                          activa && styles.switchThumbActive,
                        ]}
                      />
                    </Pressable>
                    <Pressable
                      disabled={procesando}
                      onPress={() => onEliminar(categoria)}
                      style={[styles.iconButton, styles.iconButtonDanger]}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.destructive || "#DC2626"}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
