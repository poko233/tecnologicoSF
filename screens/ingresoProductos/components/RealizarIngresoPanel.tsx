import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

import { createIngresoProductosStyles } from "../styles/ingresoProductos.styles";
import {
    CategoriaDisponibleIngreso,
    IngresoProducto,
    IngresoProductoPayload,
    ProductoDisponibleIngreso,
    ProductoIngresoItem,
} from "../types/ingresoProductos.types";
import {
    fechaIngresoEsValida,
    fechaLocalHoy,
    normalizarBusquedaIngreso,
} from "../utils/ingresoProductos.utils";
import ProductosDisponiblesIngreso from "./ProductosDisponiblesIngreso";
import ProductosIngresoPanel from "./ProductosIngresoPanel";

type Props = {
  productos: ProductoDisponibleIngreso[];
  categorias: CategoriaDisponibleIngreso[];
  loading: boolean;
  registrando: boolean;
  onRealizarIngreso: (
    payload: IngresoProductoPayload,
  ) => Promise<IngresoProducto | null>;
  styles: ReturnType<typeof createIngresoProductosStyles>;
  colors: any;
};

export default function RealizarIngresoPanel({
  productos,
  categorias,
  loading,
  registrando,
  onRealizarIngreso,
  styles,
  colors,
}: Props) {
  const [productosIngreso, setProductosIngreso] = useState<
    ProductoIngresoItem[]
  >([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null);
  const [fechaIngreso, setFechaIngreso] = useState(fechaLocalHoy());
  const [observacion, setObservacion] = useState("");

  const agregarProducto = useCallback(
    (idProducto: number) => {
      const producto = productos.find(
        (item) => item.idProducto === Number(idProducto),
      );

      if (!producto) return;

      const maximo = 4294967295 - Number(producto.stock ?? 0);

      if (maximo < 1) {
        Toast.show({
          type: "error",
          text1: "Stock sin capacidad",
          text2: "Este producto alcanzó el máximo permitido.",
        });
        return;
      }

      const agregado = productosIngreso.find(
        (item) => item.idProducto === producto.idProducto,
      );

      if (agregado) {
        if (agregado.cantidad >= maximo) {
          Toast.show({
            type: "error",
            text1: "Cantidad máxima alcanzada",
            text2: producto.nombre,
          });
          return;
        }

        setProductosIngreso((actuales) =>
          actuales.map((item) =>
            item.idProducto === producto.idProducto
              ? { ...item, cantidad: item.cantidad + 1 }
              : item,
          ),
        );
        return;
      }

      const imagenPrincipal =
        producto.imagenPrincipal ||
        producto.imagenes?.find((imagen) => imagen.esPrincipal)?.urlFoto ||
        producto.imagenes?.[0]?.urlFoto ||
        null;

      setProductosIngreso((actuales) => [
        ...actuales,
        {
          idProducto: producto.idProducto,
          sku: producto.sku,
          nombre: producto.nombre,
          stock: Number(producto.stock ?? 0),
          unidadMedida: producto.unidadMedida || "Unidad",
          cantidad: 1,
          imagenPrincipal,
        },
      ]);

      Toast.show({
        type: "success",
        text1: "Producto agregado",
        text2: producto.nombre,
      });
    },
    [productos, productosIngreso],
  );

  const cambiarCantidad = useCallback(
    (idProducto: number, cantidad: number) => {
      setProductosIngreso((actuales) =>
        actuales.map((producto) => {
          if (producto.idProducto !== idProducto) return producto;

          const maximo = Math.max(1, 4294967295 - producto.stock);
          return {
            ...producto,
            cantidad: Math.max(1, Math.min(cantidad, maximo)),
          };
        }),
      );
    },
    [],
  );

  const eliminarProducto = useCallback((idProducto: number) => {
    setProductosIngreso((actuales) =>
      actuales.filter((producto) => producto.idProducto !== idProducto),
    );
  }, []);

  const productosFiltrados = useMemo(() => {
    const query = normalizarBusquedaIngreso(busqueda);

    return productos.filter((producto) => {
      if (producto.estado !== "ACTIVO") return false;

      const coincideBusqueda =
        !query ||
        normalizarBusquedaIngreso(
          `${producto.nombre} ${producto.sku}`,
        ).includes(query);
      const coincideCategoria =
        categoriaFiltro === null ||
        Number(producto.idCategoria) === categoriaFiltro;

      return coincideBusqueda && coincideCategoria;
    });
  }, [busqueda, categoriaFiltro, productos]);

  const fechaError = fechaIngresoEsValida(fechaIngreso);

  const registrar = async () => {
    if (fechaError) {
      Toast.show({
        type: "error",
        text1: "Fecha incorrecta",
        text2: fechaError,
      });
      return;
    }

    if (productosIngreso.length === 0) {
      Toast.show({
        type: "error",
        text1: "No hay productos",
        text2: "Agrega al menos un producto al ingreso.",
      });
      return;
    }

    const ingreso = await onRealizarIngreso({
      fechaIngreso,
      observacion: observacion.trim() || null,
      detalles: productosIngreso.map((producto) => ({
        idProducto: producto.idProducto,
        cantidad: producto.cantidad,
      })),
    });

    if (!ingreso) return;

    setProductosIngreso([]);
    setFechaIngreso(fechaLocalHoy());
    setObservacion("");
  };

  return (
    <View style={styles.dosColumnasContainer}>
      <ProductosDisponiblesIngreso
        productos={productosFiltrados}
        categorias={categorias}
        loading={loading}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        categoriaFiltro={categoriaFiltro}
        setCategoriaFiltro={setCategoriaFiltro}
        onAgregarProducto={agregarProducto}
        styles={styles}
        colors={colors}
      />

      <ProductosIngresoPanel
        productos={productosIngreso}
        fechaIngreso={fechaIngreso}
        setFechaIngreso={setFechaIngreso}
        fechaError={fechaError}
        observacion={observacion}
        setObservacion={setObservacion}
        onCambiarCantidad={cambiarCantidad}
        onEliminarProducto={eliminarProducto}
        onRealizarIngreso={() => void registrar()}
        registrando={registrando}
        styles={styles}
        colors={colors}
      />
    </View>
  );
}
