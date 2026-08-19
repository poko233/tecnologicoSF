import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";

import { obtenerInventarioVistaProductos } from "../services/inventarioVistaProducto.service";

import {
    InventarioVistaCategoria,
    InventarioVistaFiltros,
    InventarioVistaProducto,
    InventarioVistaResumenFiltrado,
    InventarioVistaResumenGeneral,
} from "../types/inventarioVistaProducto.types";

const RESUMEN_GENERAL_INICIAL: InventarioVistaResumenGeneral =
  {
    totalProductos: 0,
    unidadesDisponibles: 0,
    productosConStock: 0,
    productosSinStock: 0,
    stockBajo: 0,
    productosActivos: 0,
    productosInactivos: 0,
  };

const RESUMEN_FILTRADO_INICIAL: InventarioVistaResumenFiltrado =
  {
    totalProductos: 0,
    unidadesDisponibles: 0,
  };

function obtenerMensajeError(
  error: any,
  fallback: string,
): string {
  if (error?.data?.message) {
    return String(error.data.message);
  }

  if (error?.message) {
    return String(error.message);
  }

  return fallback;
}

export function useInventarioVistaProducto() {
  const [productos, setProductos] =
    useState<InventarioVistaProducto[]>([]);

  const [categorias, setCategorias] =
    useState<InventarioVistaCategoria[]>(
      [],
    );

  const [
    resumenGeneral,
    setResumenGeneral,
  ] =
    useState<InventarioVistaResumenGeneral>(
      RESUMEN_GENERAL_INICIAL,
    );

  const [
    resumenFiltrado,
    setResumenFiltrado,
  ] =
    useState<InventarioVistaResumenFiltrado>(
      RESUMEN_FILTRADO_INICIAL,
    );

  const [loading, setLoading] =
    useState(false);

  const cargar = useCallback(
    async (
      filtros: InventarioVistaFiltros,
      mostrarToast = false,
    ) => {
      try {
        setLoading(true);

        const response =
          await obtenerInventarioVistaProductos(
            filtros,
          );

        setProductos(
          Array.isArray(response.productos)
            ? response.productos
            : [],
        );

        setCategorias(
          Array.isArray(response.categorias)
            ? response.categorias
            : [],
        );

        setResumenGeneral(
          response.resumenGeneral ??
            RESUMEN_GENERAL_INICIAL,
        );

        setResumenFiltrado(
          response.resumenFiltrado ??
            RESUMEN_FILTRADO_INICIAL,
        );

        if (mostrarToast) {
          Toast.show({
            type: "success",
            text1: "Inventario actualizado",
          });
        }
      } catch (error: any) {
        Toast.show({
          type: "error",

          text1:
            "No se pudo cargar el inventario",

          text2: obtenerMensajeError(
            error,
            "Revisa la conexión con el servidor.",
          ),
        });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    productos,
    categorias,
    resumenGeneral,
    resumenFiltrado,
    loading,
    cargar,
  };
}