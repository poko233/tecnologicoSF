import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { obtenerCategoriasInventario, obtenerProductosInventario } from "../../inventario/services/inventario.service";
import { InventarioCategoria, InventarioProducto } from "../../inventario/types/inventario.types";
import { createBajaStyles } from "../styles/baja.styles";
import { ConceptoBaja, ProductoBajaItem } from "../types/baja.types";
import { ProductosDisponiblesParaBaja } from "./ProductosDisponiblesParaBaja";
import ProductosBajaPanel from "./ProductosBajaPanel";

type Props = {
  onRealizarBaja: (
    concepto: ConceptoBaja,
    observacion: string,
    productos: ProductoBajaItem[]
  ) => Promise<void>;
  registrando: boolean;
  styles: ReturnType<typeof createBajaStyles>;
  colors: any;
};

export default function RealizarBajaPanel({
  onRealizarBaja,
  registrando,
  styles,
  colors,
}: Props) {
  const [productos, setProductos] = useState<InventarioProducto[]>([]);
  const [categorias, setCategorias] = useState<InventarioCategoria[]>([]);
  const [productosBaja, setProductosBaja] = useState<ProductoBajaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null);
  const [concepto, setConcepto] = useState<ConceptoBaja | "">("");
  const [observacion, setObservacion] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [productosRes, categoriasRes] = await Promise.all([
          obtenerProductosInventario(),
          obtenerCategoriasInventario(),
        ]);
        setProductos(productosRes.productos || []);
        setCategorias(categoriasRes.categorias || []);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error al cargar datos",
          text2: "No se pudo obtener el inventario",
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const agregarProducto = useCallback(
    (idProducto: number) => {
      const producto = productos.find((p) => p.idProducto === Number(idProducto));

      if (!producto) {
        return;
      }

      const yaAgregado = productosBaja.find((p) => p.idProducto === producto.idProducto);

      if (yaAgregado) {
        const nuevaCantidad = yaAgregado.cantidad + 1;

        if (nuevaCantidad > producto.stock) {
          Toast.show({
            type: "error",
            text1: "Stock insuficiente",
            text2: `Solo hay ${producto.stock} unidades disponibles`,
          });
          return;
        }

        setProductosBaja((prev) =>
          prev.map((p) =>
            p.idProducto === producto.idProducto
              ? {
                  ...p,
                  cantidad: nuevaCantidad,
                  subTotal: nuevaCantidad * p.precioVenta,
                }
              : p
          )
        );

        Toast.show({
          type: "success",
          text1: "Cantidad actualizada",
          text2: `${producto.nombre}: ${nuevaCantidad} unidades`,
        });
      } else {
        const imagenPrincipal = producto.imagenes?.find((img) => img.esPrincipal);

        const nuevoProducto: ProductoBajaItem = {
          idProducto: producto.idProducto,
          nombre: producto.nombre,
          sku: producto.sku,
          codigoBarras: producto.codigoBarras || undefined,
          stock: producto.stock,
          precioVenta: producto.precioVenta,
          cantidad: 1,
          subTotal: producto.precioVenta,
          imagenPrincipal: imagenPrincipal?.urlFoto || undefined,
        };

        setProductosBaja((prev) => [...prev, nuevoProducto]);

        Toast.show({
          type: "success",
          text1: "Producto agregado",
          text2: producto.nombre,
        });
      }
    },
    [productos, productosBaja]
  );

  const cambiarCantidad = useCallback(
    (idProducto: number, cantidad: number) => {
      if (cantidad <= 0) {
        eliminarProducto(idProducto);
        return;
      }

      setProductosBaja((prev) =>
        prev.map((p) => {
          if (p.idProducto === idProducto) {
            // Validar que la cantidad no exceda el stock disponible
            const cantidadFinal = Math.min(cantidad, p.stock);

            if (cantidadFinal !== cantidad) {
              Toast.show({
                type: "error",
                text1: "Cantidad excede el stock",
                text2: `Solo hay ${p.stock} unidades disponibles`,
              });
            }

            return {
              ...p,
              cantidad: cantidadFinal,
              subTotal: cantidadFinal * p.precioVenta,
            };
          }
          return p;
        })
      );
    },
    []
  );

  const eliminarProducto = useCallback((idProducto: number) => {
    setProductosBaja((prev) => prev.filter((p) => p.idProducto !== idProducto));
  }, []);

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      if (p.estado !== "ACTIVO" || p.stock <= 0) return false;

      const matchBusqueda =
        busqueda === "" ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku.toLowerCase().includes(busqueda.toLowerCase());

      const matchCategoria =
        categoriaFiltro === null || p.idCategoria === categoriaFiltro;

      return matchBusqueda && matchCategoria;
    });
  }, [productos, busqueda, categoriaFiltro]);

  const totalItems = productosBaja.reduce((sum, p) => sum + p.cantidad, 0);
  const totalBaja = productosBaja.reduce((sum, p) => sum + p.subTotal, 0);

  const handleRealizarBaja = async () => {
    if (concepto === "") {
      Toast.show({
        type: "error",
        text1: "Concepto requerido",
        text2: "Selecciona un concepto para la baja",
      });
      return;
    }

    if (productosBaja.length === 0) {
      Toast.show({
        type: "error",
        text1: "No hay productos",
        text2: "Agrega al menos un producto para dar de baja",
      });
      return;
    }

    await onRealizarBaja(concepto, observacion, productosBaja);

    setProductosBaja([]);
    setConcepto("");
    setObservacion("");
  };

  return (
    <View style={styles.dosColumnasContainer}>
      <ProductosDisponiblesParaBaja
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

      <ProductosBajaPanel
        productos={productosBaja}
        concepto={concepto}
        setConcepto={setConcepto}
        observacion={observacion}
        setObservacion={setObservacion}
        onCambiarCantidad={cambiarCantidad}
        onEliminarProducto={eliminarProducto}
        onRealizarBaja={handleRealizarBaja}
        registrando={registrando}
        styles={styles}
        colors={colors}
      />
    </View>
  );
}
