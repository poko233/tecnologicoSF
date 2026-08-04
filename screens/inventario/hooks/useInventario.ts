import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

import {
    actualizarCategoriaInventario,
    actualizarProductoInventario,
    cambiarEstadoCategoriaInventario,
    cambiarEstadoProductoInventario,
    crearCategoriaInventario,
    crearProductoInventario,
    eliminarCategoriaInventario,
    eliminarImagenProductoInventario,
    eliminarProductoInventario,
    marcarImagenPrincipalInventario,
    obtenerCategoriasInventario,
    obtenerProductosInventario,
    subirImagenProductoInventario,
} from "../services/inventario.service";
import {
    ArchivoImagenInventario,
    CategoriaPayload,
    EstadoInventario,
    InventarioCategoria,
    InventarioProducto,
    InventarioResumen,
    ProductoPayload,
} from "../types/inventario.types";
import { obtenerMensajeError } from "../utils/inventario.utils";

const RESUMEN_INICIAL: InventarioResumen = {
  totalProductos: 0,
  productosActivos: 0,
  sinStock: 0,
  stockBajo: 0,
  unidadesDisponibles: 0,
  valorInventario: 0,
};

export function useInventario() {
  const [productos, setProductos] = useState<InventarioProducto[]>([]);
  const [categorias, setCategorias] = useState<InventarioCategoria[]>([]);
  const [resumen, setResumen] = useState<InventarioResumen>(RESUMEN_INICIAL);

  const [loading, setLoading] = useState(false);
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);
  const [procesandoAccion, setProcesandoAccion] = useState(false);
  const [procesandoImagen, setProcesandoImagen] = useState(false);

  const cargarInventario = useCallback(async (mostrarToast = false) => {
    try {
      setLoading(true);

      const [productosResponse, categoriasResponse] = await Promise.all([
        obtenerProductosInventario(),
        obtenerCategoriasInventario(),
      ]);

      setProductos(
        Array.isArray(productosResponse.productos)
          ? productosResponse.productos
          : [],
      );
      setResumen(productosResponse.resumen ?? RESUMEN_INICIAL);
      setCategorias(
        Array.isArray(categoriasResponse.categorias)
          ? categoriasResponse.categorias
          : [],
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
        text1: "No se pudo cargar el inventario",
        text2: obtenerMensajeError(
          error,
          "Revisa la conexión con el servidor.",
        ),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarInventario(false);
  }, [cargarInventario]);

  const guardarProducto = useCallback(
    async (
      payload: ProductoPayload,
      producto?: InventarioProducto | null,
    ) => {
      try {
        setGuardandoProducto(true);

        const response = producto
          ? await actualizarProductoInventario(producto.idProducto, payload)
          : await crearProductoInventario(payload);

        Toast.show({
          type: "success",
          text1: producto ? "Producto actualizado" : "Producto creado",
          text2: response.message,
        });

        await cargarInventario(false);
        return response.producto;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "No se pudo guardar el producto",
          text2: obtenerMensajeError(error, "Verifica los datos ingresados."),
        });
        return null;
      } finally {
        setGuardandoProducto(false);
      }
    },
    [cargarInventario],
  );

  const cambiarEstadoProducto = useCallback(
    async (producto: InventarioProducto) => {
      try {
        setProcesandoAccion(true);
        const nuevoEstado: EstadoInventario =
          producto.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";

        await cambiarEstadoProductoInventario(
          producto.idProducto,
          nuevoEstado,
        );
        await cargarInventario(false);

        Toast.show({
          type: "success",
          text1:
            nuevoEstado === "ACTIVO"
              ? "Producto activado"
              : "Producto desactivado",
        });
        return true;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "No se pudo cambiar el estado",
          text2: obtenerMensajeError(error, "Intenta nuevamente."),
        });
        return false;
      } finally {
        setProcesandoAccion(false);
      }
    },
    [cargarInventario],
  );

  const eliminarProducto = useCallback(
    async (producto: InventarioProducto) => {
      try {
        setProcesandoAccion(true);
        await eliminarProductoInventario(producto.idProducto);
        await cargarInventario(false);

        Toast.show({
          type: "success",
          text1: "Producto eliminado",
        });
        return true;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "No se pudo eliminar el producto",
          text2: obtenerMensajeError(error, "Intenta nuevamente."),
        });
        return false;
      } finally {
        setProcesandoAccion(false);
      }
    },
    [cargarInventario],
  );

  const guardarCategoria = useCallback(
    async (
      payload: CategoriaPayload,
      categoria?: InventarioCategoria | null,
    ) => {
      try {
        setGuardandoCategoria(true);

        const response = categoria
          ? await actualizarCategoriaInventario(
              categoria.idCategoria,
              payload,
            )
          : await crearCategoriaInventario(payload);

        await cargarInventario(false);

        Toast.show({
          type: "success",
          text1: categoria ? "Categoría actualizada" : "Categoría creada",
          text2: response.message,
        });
        return response.categoria;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "No se pudo guardar la categoría",
          text2: obtenerMensajeError(error, "Verifica los datos ingresados."),
        });
        return null;
      } finally {
        setGuardandoCategoria(false);
      }
    },
    [cargarInventario],
  );

  const cambiarEstadoCategoria = useCallback(
    async (categoria: InventarioCategoria) => {
      try {
        setProcesandoAccion(true);
        const nuevoEstado: EstadoInventario =
          categoria.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";

        await cambiarEstadoCategoriaInventario(
          categoria.idCategoria,
          nuevoEstado,
        );
        await cargarInventario(false);

        Toast.show({
          type: "success",
          text1:
            nuevoEstado === "ACTIVO"
              ? "Categoría activada"
              : "Categoría desactivada",
        });
        return true;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "No se pudo cambiar el estado",
          text2: obtenerMensajeError(error, "Intenta nuevamente."),
        });
        return false;
      } finally {
        setProcesandoAccion(false);
      }
    },
    [cargarInventario],
  );

  const eliminarCategoria = useCallback(
    async (categoria: InventarioCategoria) => {
      try {
        setProcesandoAccion(true);
        await eliminarCategoriaInventario(categoria.idCategoria);
        await cargarInventario(false);

        Toast.show({
          type: "success",
          text1: "Categoría eliminada",
        });
        return true;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "No se pudo eliminar la categoría",
          text2: obtenerMensajeError(error, "Intenta nuevamente."),
        });
        return false;
      } finally {
        setProcesandoAccion(false);
      }
    },
    [cargarInventario],
  );

  const subirImagen = useCallback(
    async (
      producto: InventarioProducto,
      params: {
        archivo?: ArchivoImagenInventario | null;
        urlFoto?: string | null;
        esPrincipal?: boolean;
      },
    ) => {
      try {
        setProcesandoImagen(true);
        const response = await subirImagenProductoInventario(
          producto.idProducto,
          params,
        );

        await cargarInventario(false);
        Toast.show({
          type: "success",
          text1: "Imagen agregada",
        });
        return response.producto;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "No se pudo agregar la imagen",
          text2: obtenerMensajeError(error, "Verifica el archivo o la URL."),
        });
        return null;
      } finally {
        setProcesandoImagen(false);
      }
    },
    [cargarInventario],
  );

  const marcarImagenPrincipal = useCallback(
    async (producto: InventarioProducto, idImagen: number) => {
      try {
        setProcesandoImagen(true);
        const response = await marcarImagenPrincipalInventario(
          producto.idProducto,
          idImagen,
        );
        await cargarInventario(false);
        return response.producto;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "No se pudo marcar la imagen principal",
          text2: obtenerMensajeError(error, "Intenta nuevamente."),
        });
        return null;
      } finally {
        setProcesandoImagen(false);
      }
    },
    [cargarInventario],
  );

  const eliminarImagen = useCallback(
    async (producto: InventarioProducto, idImagen: number) => {
      try {
        setProcesandoImagen(true);
        const response = await eliminarImagenProductoInventario(
          producto.idProducto,
          idImagen,
        );
        await cargarInventario(false);
        return response.producto;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "No se pudo eliminar la imagen",
          text2: obtenerMensajeError(error, "Intenta nuevamente."),
        });
        return null;
      } finally {
        setProcesandoImagen(false);
      }
    },
    [cargarInventario],
  );

  return {
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
    eliminarProducto,
    guardarCategoria,
    cambiarEstadoCategoria,
    eliminarCategoria,
    subirImagen,
    marcarImagenPrincipal,
    eliminarImagen,
  };
}
