import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";

import {
    InventarioVistaCategoria,
    InventarioVistaFiltros,
} from "../types/inventarioVistaProducto.types";

import { InventarioVistaProductoStyles } from "../styles/inventarioVistaProducto.styles";

import InventarioDropdownPanel from "./InventarioDropdownPanel";
import InventarioFilterButton from "./InventarioFilterButton";

type FilterKey =
  | "categoria"
  | "estado"
  | "stock";

type Props = {
  filtros: InventarioVistaFiltros;

  categorias: InventarioVistaCategoria[];

  loading: boolean;

  colors: any;

  styles: InventarioVistaProductoStyles;

  onChange: (
    filtros: InventarioVistaFiltros,
  ) => void;

  onRefresh: () => void;
};

export default function InventarioFiltros({
  filtros,
  categorias,
  loading,
  colors,
  styles,
  onChange,
  onRefresh,
}: Props) {
  const [
    activeFilter,
    setActiveFilter,
  ] = useState<FilterKey | null>(
    null,
  );

  const categoriaSeleccionada =
    categorias.find(
      (categoria) =>
        String(
          categoria.idCategoria,
        ) ===
        String(filtros.idCategoria),
    );

  const hayFiltrosActivos =
    !!filtros.idCategoria ||
    !!filtros.estado ||
    !!filtros.estadoStock;

  const setCategoria = (
    value: string,
  ) => {
    onChange({
      ...filtros,
      idCategoria: value,
    });
  };

  const setEstado = (
    value: string,
  ) => {
    onChange({
      ...filtros,

      estado:
        value as InventarioVistaFiltros["estado"],
    });
  };

  const setEstadoStock = (
    value: string,
  ) => {
    onChange({
      ...filtros,

      estadoStock:
        value as InventarioVistaFiltros["estadoStock"],
    });
  };

  const limpiarFiltros = () => {
    onChange({
      ...filtros,

      idCategoria: "",

      estado: "",

      estadoStock: "",
    });

    setActiveFilter(null);
  };

  const renderDropdown = () => {
    if (!activeFilter) {
      return null;
    }

    if (
      activeFilter === "categoria"
    ) {
      return (
        <InventarioDropdownPanel
          title="Filtrar por categoría"
          empty="No hay categorías registradas."
          options={[
            {
              label: "Todas",
              value: "",
            },

            ...categorias.map(
              (categoria) => ({
                label:
                  categoria.nombre,

                value: String(
                  categoria.idCategoria,
                ),
              }),
            ),
          ]}
          selectedValue={
            filtros.idCategoria
          }
          colors={colors}
          styles={styles}
          onClose={() =>
            setActiveFilter(null)
          }
          onSelect={(value) => {
            setCategoria(value);

            setActiveFilter(null);
          }}
        />
      );
    }

    if (activeFilter === "estado") {
      return (
        <InventarioDropdownPanel
          title="Filtrar por estado"
          empty="No hay estados disponibles."
          options={[
            {
              label: "Todos",
              value: "",
            },
            {
              label: "Activos",
              value: "ACTIVO",
            },
            {
              label: "Inactivos",
              value: "INACTIVO",
            },
          ]}
          selectedValue={
            filtros.estado
          }
          colors={colors}
          styles={styles}
          onClose={() =>
            setActiveFilter(null)
          }
          onSelect={(value) => {
            setEstado(value);

            setActiveFilter(null);
          }}
        />
      );
    }

    return (
      <InventarioDropdownPanel
        title="Filtrar por existencia"
        empty="No hay estados de existencia."
        options={[
          {
            label: "Todos",
            value: "",
          },
          {
            label: "Disponible",
            value: "DISPONIBLE",
          },
          {
            label: "Stock bajo",
            value: "BAJO",
          },
          {
            label: "Sin stock",
            value: "SIN_STOCK",
          },
        ]}
        selectedValue={
          filtros.estadoStock
        }
        colors={colors}
        styles={styles}
        onClose={() =>
          setActiveFilter(null)
        }
        onSelect={(value) => {
          setEstadoStock(value);

          setActiveFilter(null);
        }}
      />
    );
  };

  const estadoTexto =
    filtros.estado === "ACTIVO"
      ? "Activos"
      : filtros.estado ===
          "INACTIVO"
        ? "Inactivos"
        : "Todos";

  const stockTexto =
    filtros.estadoStock ===
    "DISPONIBLE"
      ? "Disponible"
      : filtros.estadoStock ===
          "BAJO"
        ? "Stock bajo"
        : filtros.estadoStock ===
            "SIN_STOCK"
          ? "Sin stock"
          : "Todos";

  return (
    <View
      style={
        styles.filtersContainer
      }
    >
      <View
        style={
          styles.filtersPrimaryRow
        }
      >
        <View
          style={styles.filterItem}
        >
          <InventarioFilterButton
            label="Categoría"
            value={
              categoriaSeleccionada?.nombre ||
              "Todas"
            }
            selected={
              !!filtros.idCategoria
            }
            open={
              activeFilter ===
              "categoria"
            }
            colors={colors}
            styles={styles}
            onPress={() =>
              setActiveFilter(
                (actual) =>
                  actual ===
                  "categoria"
                    ? null
                    : "categoria",
              )
            }
          />
        </View>

        <View
          style={styles.filterItem}
        >
          <InventarioFilterButton
            label="Estado"
            value={estadoTexto}
            selected={
              !!filtros.estado
            }
            open={
              activeFilter ===
              "estado"
            }
            colors={colors}
            styles={styles}
            onPress={() =>
              setActiveFilter(
                (actual) =>
                  actual === "estado"
                    ? null
                    : "estado",
              )
            }
          />
        </View>

        <View
          style={styles.filterItem}
        >
          <InventarioFilterButton
            label="Existencia"
            value={stockTexto}
            selected={
              !!filtros.estadoStock
            }
            open={
              activeFilter ===
              "stock"
            }
            colors={colors}
            styles={styles}
            onPress={() =>
              setActiveFilter(
                (actual) =>
                  actual === "stock"
                    ? null
                    : "stock",
              )
            }
          />
        </View>
      </View>

      {renderDropdown()}

      <View
        style={
          styles.filterActionsRow
        }
      >
        {hayFiltrosActivos && (
          <Pressable
            onPress={limpiarFiltros}
            style={({ pressed }) => [
              styles.clearBtn,

              {
                opacity: pressed
                  ? 0.75
                  : 1,
              },
            ]}
          >
            <Ionicons
              name="funnel-outline"
              size={16}
              color={colors.text}
            />

            <ThemedText
              style={
                styles.clearBtnText
              }
            >
              Limpiar
            </ThemedText>
          </Pressable>
        )}

        <Pressable
          disabled={loading}
          onPress={onRefresh}
          style={({ pressed }) => [
            styles.refreshBtn,

            {
              opacity:
                loading
                  ? 0.6
                  : pressed
                    ? 0.78
                    : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={
                colors.primaryForeground ||
                "#FFFFFF"
              }
            />
          ) : (
            <Ionicons
              name="refresh-outline"
              size={18}
              color={
                colors.primaryForeground ||
                "#FFFFFF"
              }
            />
          )}

          <ThemedText
            style={
              styles.refreshBtnText
            }
          >
            Actualizar
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}