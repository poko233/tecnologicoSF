import {
    useEffect,
    useState,
} from "react";

import {
    ScrollView,
    View,
} from "react-native";

import InventarioProductosPanel from "./components/InventarioProductosPanel";
import InventarioResumenCards from "./components/InventarioResumenCards";

import { useInventarioVistaProducto } from "./hooks/useInventarioVistaProducto";

import { InventarioVistaFiltros } from "./types/inventarioVistaProducto.types";

import { useTheme } from "../../theme/useTheme";

const FILTROS_INICIALES: InventarioVistaFiltros =
  {
    buscar: "",
    idCategoria: "",
    estado: "",
    estadoStock: "",
  };

export default function InventarioVistaProductoScreen() {
  const { theme } = useTheme();

  const {
    productos,
    categorias,
    resumenGeneral,
    resumenFiltrado,
    loading,
    cargar,
  } = useInventarioVistaProducto();

  const [filtros, setFiltros] =
    useState<InventarioVistaFiltros>(
      FILTROS_INICIALES,
    );

  /*
   * Debounce para evitar hacer una
   * petición por cada tecla escrita.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      void cargar(
        filtros,
        false,
      );
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [filtros, cargar]);

  return (
    <View
      style={{
        flex: 1,

        backgroundColor:
          theme.colors.background,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          width: "100%",

          maxWidth: 1500,

          alignSelf: "center",

          paddingHorizontal: 24,

          paddingTop: 22,

          paddingBottom: 50,

          gap: 18,
        }}
      >
        <InventarioResumenCards
          resumenGeneral={
            resumenGeneral
          }
          resumenFiltrado={
            resumenFiltrado
          }
        />

        <InventarioProductosPanel
          productos={productos}
          categorias={categorias}
          resumenFiltrado={
            resumenFiltrado
          }
          filtros={filtros}
          loading={loading}
          onFiltrosChange={
            setFiltros
          }
          onRefresh={() =>
            void cargar(
              filtros,
              true,
            )
          }
        />
      </ScrollView>
    </View>
  );
}