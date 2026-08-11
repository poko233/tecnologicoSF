import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Toast from "react-native-toast-message";

import {
  cerrarVentanaPrevisualizacionRecibo,
  guardarIngresoProducto,
  obtenerCategoriasParaIngreso,
  obtenerIngresosProducto,
  obtenerProductosParaIngreso,
  prepararVentanaPrevisualizacionRecibo,
  previsualizarReciboIngresoProducto,
  type VentanaPrevisualizacionRecibo,
} from "../services/ingresoProductos.service";

import {
  CategoriaDisponibleIngreso,
  IngresoProducto,
  IngresoProductoPayload,
  ProductoDisponibleIngreso,
} from "../types/ingresoProductos.types";

import {
  obtenerMensajeErrorIngreso,
} from "../utils/ingresoProductos.utils";

export function useIngresoProductos() {
  const [ingresos, setIngresos] = useState<
    IngresoProducto[]
  >([]);

  const [productos, setProductos] = useState<
    ProductoDisponibleIngreso[]
  >([]);

  const [categorias, setCategorias] = useState<
    CategoriaDisponibleIngreso[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [loadingHistorial, setLoadingHistorial] =
    useState(false);

  const [guardando, setGuardando] = useState(false);

  const [
    previsualizandoId,
    setPrevisualizandoId,
  ] = useState<number | null>(null);

  const cargar = useCallback(
    async (mostrarError = true) => {
      try {
        setLoading(true);

        const [
          ingresosResponse,
          productosResponse,
          categoriasResponse,
        ] = await Promise.all([
          obtenerIngresosProducto(),
          obtenerProductosParaIngreso(),
          obtenerCategoriasParaIngreso(),
        ]);

        setIngresos(
          ingresosResponse.ingresos ?? [],
        );

        setProductos(
          (productosResponse.productos ?? []).filter(
            (producto) =>
              producto.estado === "ACTIVO",
          ),
        );

        setCategorias(
          (categoriasResponse.categorias ?? []).filter(
            (categoria) =>
              !categoria.estado ||
              categoria.estado === "ACTIVO",
          ),
        );
      } catch (error) {
        if (mostrarError) {
          Toast.show({
            type: "error",
            text1: "No se pudo cargar",
            text2:
              obtenerMensajeErrorIngreso(error),
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const cargarHistorial = useCallback(async () => {
    try {
      setLoadingHistorial(true);

      const response =
        await obtenerIngresosProducto();

      setIngresos(response.ingresos ?? []);
    } catch (error) {
      Toast.show({
        type: "error",
        text1:
          "No se pudo cargar el historial",
        text2:
          obtenerMensajeErrorIngreso(error),
      });
    } finally {
      setLoadingHistorial(false);
    }
  }, []);

  useEffect(() => {
    void cargar(true);
  }, [cargar]);

  const registrar = useCallback(
    async (
      payload: IngresoProductoPayload,
    ): Promise<IngresoProducto | null> => {
      try {
        setGuardando(true);

        const response =
          await guardarIngresoProducto(payload);

        const ingreso = response.ingreso;

        setIngresos((actuales) => [
          ingreso,
          ...actuales.filter(
            (item) =>
              item.idIngresoProducto !==
              ingreso.idIngresoProducto,
          ),
        ]);

        const nuevosStocks = new Map(
          ingreso.detalles.map((detalle) => [
            detalle.idProducto,
            detalle.stockPosterior,
          ]),
        );

        setProductos((actuales) =>
          actuales.map((producto) => {
            const nuevoStock =
              nuevosStocks.get(
                producto.idProducto,
              );

            if (nuevoStock === undefined) {
              return producto;
            }

            return {
              ...producto,
              stock: nuevoStock,
            };
          }),
        );

        Toast.show({
          type: "success",
          text1: "Ingreso registrado",
          text2:
            response.message ||
            "El stock fue actualizado correctamente.",
        });

        return ingreso;
      } catch (error) {
        Toast.show({
          type: "error",
          text1:
            "No se pudo registrar el ingreso",
          text2:
            obtenerMensajeErrorIngreso(error),
        });

        return null;
      } finally {
        setGuardando(false);
      }
    },
    [],
  );

  const previsualizarRecibo = useCallback(
    async (
      idIngresoProducto: number,
      ventanaPreparada?:
        VentanaPrevisualizacionRecibo,
    ) => {
      try {
        setPrevisualizandoId(
          idIngresoProducto,
        );

        await previsualizarReciboIngresoProducto(
          idIngresoProducto,
          ventanaPreparada,
        );
      } catch (error) {
        Toast.show({
          type: "error",
          text1:
            "No se pudo abrir el recibo",
          text2:
            obtenerMensajeErrorIngreso(error),
        });
      } finally {
        setPrevisualizandoId(null);
      }
    },
    [],
  );

  return {
    ingresos,
    productos,
    categorias,
    loading,
    loadingHistorial,
    guardando,
    previsualizandoId,
    cargar,
    cargarHistorial,
    registrar,

    prepararPrevisualizacionRecibo:
      prepararVentanaPrevisualizacionRecibo,

    cerrarPrevisualizacionRecibo:
      cerrarVentanaPrevisualizacionRecibo,

    previsualizarRecibo,
  };
}