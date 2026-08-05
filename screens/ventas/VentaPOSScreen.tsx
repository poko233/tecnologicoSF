import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, ScrollView, ActivityIndicator, Pressable } from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { useTheme } from "../../theme/useTheme";
import { useResponsive } from "../../hooks/useResponsive";
import { useArqueo } from "../arqueo/hooks/useArqueo";
import ArqueoOpenModal from "../arqueo/components/ArqueoOpenModal";
import { useInventario } from "../inventario/hooks/useInventario";
import { useVentas } from "./hooks/useVentas";
import { CarritoItem, MetodoPago } from "./types/venta.types";
import { ProductosDisponibles } from "./components/ProductosDisponibles";
import { VentaActual } from "./components/VentaActual";
import { createVentaPOSStyles } from "./styles/ventapos.styles";

export default function VentaPOSScreen() {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const { activeArqueo, loading: loadingArqueo, refetch: refetchArqueo } = useArqueo();
  const { productos, categorias, loading: loadingInventario, cargarInventario } = useInventario();
  const { crearVenta, guardando } = useVentas();

  const styles = useMemo(
    () => createVentaPOSStyles(theme.colors, isMobile),
    [theme.colors, isMobile]
  );

  const [arqueoModalVisible, setArqueoModalVisible] = useState(false);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [observacion, setObservacion] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null);

  // Verificar arqueo abierto al montar el componente
  useEffect(() => {
    const verificarArqueo = async () => {
      await refetchArqueo();
      if (!activeArqueo && !loadingArqueo) {
        setArqueoModalVisible(true);
      }
    };
    verificarArqueo();
  }, []);

  // Productos filtrados
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchBusqueda =
        !busqueda ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigoBarras?.toLowerCase().includes(busqueda.toLowerCase());

      const matchCategoria =
        !categoriaFiltro || p.idCategoria === categoriaFiltro;

      const activo = p.estado === 'ACTIVO';
      const conStock = p.stock > 0;

      return matchBusqueda && matchCategoria && activo && conStock;
    });
  }, [productos, busqueda, categoriaFiltro]);

  // Agregar producto al carrito
  const agregarAlCarrito = useCallback((productoId: number) => {
    const producto = productos.find((p) => p.idProducto === productoId);
    if (!producto) return;

    setCarrito((prev) => {
      const existe = prev.find((item) => item.idProducto === productoId);
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          Toast.show({
            type: 'error',
            text1: 'Stock insuficiente',
            text2: `Solo hay ${producto.stock} unidades disponibles`,
          });
          return prev;
        }
        return prev.map((item) =>
          item.idProducto === productoId
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subTotal: (item.cantidad + 1) * item.precioUnitario,
              }
            : item
        );
      }

      const imagenPrincipal = producto.imagenes?.find((img) => img.esPrincipal);

      return [
        ...prev,
        {
          idProducto: producto.idProducto,
          nombre: producto.nombre,
          sku: producto.sku,
          precioUnitario: producto.precioVenta,
          cantidad: 1,
          subTotal: producto.precioVenta,
          stock: producto.stock,
          imagenUrl: imagenPrincipal?.urlFoto,
        },
      ];
    });
  }, [productos]);

  // Actualizar cantidad en el carrito
  const actualizarCantidad = useCallback((productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      setCarrito((prev) => prev.filter((item) => item.idProducto !== productoId));
      return;
    }

    setCarrito((prev) =>
      prev.map((item) => {
        if (item.idProducto === productoId) {
          if (nuevaCantidad > item.stock) {
            Toast.show({
              type: 'error',
              text1: 'Stock insuficiente',
              text2: `Solo hay ${item.stock} unidades disponibles`,
            });
            return item;
          }
          return {
            ...item,
            cantidad: nuevaCantidad,
            subTotal: nuevaCantidad * item.precioUnitario,
          };
        }
        return item;
      })
    );
  }, []);

  // Eliminar del carrito
  const eliminarDelCarrito = useCallback((productoId: number) => {
    setCarrito((prev) => prev.filter((item) => item.idProducto !== productoId));
  }, []);

  // Limpiar carrito
  const limpiarCarrito = useCallback(() => {
    setCarrito([]);
    setObservacion('');
  }, []);

  // Cálculos del resumen
  const resumen = useMemo(() => {
    const subtotal = carrito.reduce((acc, item) => acc + item.subTotal, 0);
    const total = subtotal;

    return { subtotal, descuento: 0, impuesto: 0, total };
  }, [carrito]);

  // Finalizar venta
  const finalizarVenta = useCallback(async () => {
    if (!activeArqueo) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Debe abrir un turno de caja antes de realizar ventas',
      });
      setArqueoModalVisible(true);
      return;
    }

    if (carrito.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Carrito vacío',
        text2: 'Agregue productos al carrito antes de finalizar',
      });
      return;
    }

    const venta = await crearVenta({
      metodo_pago: metodoPago,
      observacion: observacion || undefined,
      detalles: carrito.map((item) => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      })),
    });

    if (venta) {
      limpiarCarrito();
      await cargarInventario(); // Recargar para actualizar stock
    }
  }, [activeArqueo, carrito, metodoPago, observacion, crearVenta, limpiarCarrito, cargarInventario]);

  // Bloquear la pantalla si no hay arqueo abierto
  if (loadingArqueo) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Verificando turno de caja...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="storefront-outline" size={28} color={theme.colors.primary} />
          </View>
          <View>
            <ThemedText style={styles.title}>Punto de Venta</ThemedText>
            {activeArqueo && (
              <ThemedText style={styles.subtitle}>
                Turno: {activeArqueo.turno} • Cajero activo
              </ThemedText>
            )}
          </View>
        </View>
        <Pressable onPress={limpiarCarrito} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.destructive} />
          <ThemedText style={styles.clearButtonText}>Limpiar</ThemedText>
        </Pressable>
      </View>

      {/* Contenido principal */}
      <View style={styles.content}>
        <ProductosDisponibles
          productos={productosFiltrados}
          categorias={categorias}
          loading={loadingInventario}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          categoriaFiltro={categoriaFiltro}
          setCategoriaFiltro={setCategoriaFiltro}
          onAgregarProducto={agregarAlCarrito}
          styles={styles}
          colors={theme.colors}
        />

        <VentaActual
          carrito={carrito}
          resumen={resumen}
          metodoPago={metodoPago}
          setMetodoPago={setMetodoPago}
          observacion={observacion}
          setObservacion={setObservacion}
          onActualizarCantidad={actualizarCantidad}
          onEliminarProducto={eliminarDelCarrito}
          onFinalizarVenta={finalizarVenta}
          guardando={guardando}
          styles={styles}
          colors={theme.colors}
        />
      </View>

      {/* Modal para abrir arqueo */}
      <ArqueoOpenModal
        visible={arqueoModalVisible}
        onClose={() => setArqueoModalVisible(false)}
        onSuccess={() => {
          setArqueoModalVisible(false);
          refetchArqueo();
        }}
      />
    </View>
  );
}
