import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

import {
    descargarReciboIngresoProducto,
    guardarIngresoProducto,
    obtenerIngresosProducto,
    obtenerProductosParaIngreso,
} from "../services/ingresoProductos.service";
import {
    IngresoProducto,
    IngresoProductoPayload,
    ProductoDisponibleIngreso,
} from "../types/ingresoProductos.types";
import { obtenerMensajeErrorIngreso } from "../utils/ingresoProductos.utils";

export function useIngresoProductos() {
  const [ingresos, setIngresos] = useState<IngresoProducto[]>([]);
  const [productos, setProductos] = useState<ProductoDisponibleIngreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);

  const cargar = useCallback(async (mostrarError = true) => {
    try {
      setLoading(true);

      const [ingresosResponse, productosResponse] = await Promise.all([
        obtenerIngresosProducto(),
        obtenerProductosParaIngreso(),
      ]);

      setIngresos(ingresosResponse.ingresos ?? []);
      setProductos(
        (productosResponse.productos ?? []).filter(
          (producto) => producto.estado === "ACTIVO",
        ),
      );
    } catch (error) {
      if (mostrarError) {
        Toast.show({
          type: "error",
          text1: "No se pudo cargar",
          text2: obtenerMensajeErrorIngreso(error),
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar(true);
  }, [cargar]);

  const registrar = useCallback(async (payload: IngresoProductoPayload) => {
    try {
      setGuardando(true);

      const response = await guardarIngresoProducto(payload);
      const ingreso = response.ingreso;

      setIngresos((actuales) => [
        ingreso,
        ...actuales.filter(
          (item) => item.idIngresoProducto !== ingreso.idIngresoProducto,
        ),
      ]);

      setProductos((actuales) =>
        actuales.map((producto) =>
          producto.idProducto === ingreso.idProducto
            ? { ...producto, stock: ingreso.stockPosterior }
            : producto,
        ),
      );

      Toast.show({
        type: "success",
        text1: "Ingreso registrado",
        text2: "El stock fue actualizado correctamente.",
      });

      return ingreso;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "No se pudo registrar",
        text2: obtenerMensajeErrorIngreso(error),
      });

      return null;
    } finally {
      setGuardando(false);
    }
  }, []);

  const descargarRecibo = useCallback(async (idIngresoProducto: number) => {
    try {
      setDescargandoId(idIngresoProducto);
      await descargarReciboIngresoProducto(idIngresoProducto);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "No se pudo descargar el recibo",
        text2: obtenerMensajeErrorIngreso(error),
      });
    } finally {
      setDescargandoId(null);
    }
  }, []);

  return {
    ingresos,
    productos,
    loading,
    guardando,
    descargandoId,
    cargar,
    registrar,
    descargarRecibo,
  };
}
