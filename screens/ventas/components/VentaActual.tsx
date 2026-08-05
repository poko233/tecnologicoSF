import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Colors } from "../../../theme/types";
import { CarritoItem, MetodoPago, VentaResumen } from "../types/venta.types";

interface VentaActualProps {
  carrito: CarritoItem[];
  resumen: VentaResumen;
  metodoPago: MetodoPago;
  setMetodoPago: (value: MetodoPago) => void;
  observacion: string;
  setObservacion: (value: string) => void;
  onActualizarCantidad: (idProducto: number, cantidad: number) => void;
  onEliminarProducto: (idProducto: number) => void;
  onFinalizarVenta: () => void;
  guardando: boolean;
  styles: any;
  colors: Colors;
}

export const VentaActual: React.FC<VentaActualProps> = ({
  carrito,
  resumen,
  metodoPago,
  setMetodoPago,
  observacion,
  setObservacion,
  onActualizarCantidad,
  onEliminarProducto,
  onFinalizarVenta,
  guardando,
  styles,
  colors,
}) => {

  const renderCarritoItem = ({ item }: { item: CarritoItem }) => (
    <View style={styles.carritoItem}>
      {item.imagenUrl ? (
        <Image
          source={{ uri: item.imagenUrl }}
          style={styles.carritoItemImagen}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.carritoItemImagen, styles.carritoItemImagenPlaceholder]}>
          <Ionicons name="image-outline" size={20} color={colors.textMuted} />
        </View>
      )}

      <View style={styles.carritoItemInfo}>
        <ThemedText style={styles.carritoItemNombre}>{item.nombre}</ThemedText>
        <ThemedText style={styles.carritoItemCodigo}>{item.sku}</ThemedText>
        <ThemedText style={styles.carritoItemPrecio}>
          Bs {item.precioUnitario.toFixed(2)} c/u
        </ThemedText>
      </View>

      <View style={styles.carritoItemControles}>
        <View style={styles.cantidadControles}>
          <Pressable
            style={styles.cantidadButton}
            onPress={() => onActualizarCantidad(item.idProducto, item.cantidad - 1)}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </Pressable>
          <ThemedText style={styles.cantidadText}>{item.cantidad}</ThemedText>
          <Pressable
            style={styles.cantidadButton}
            onPress={() => onActualizarCantidad(item.idProducto, item.cantidad + 1)}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </Pressable>
        </View>
        <ThemedText style={styles.carritoItemSubtotal}>
          Bs {item.subTotal.toFixed(2)}
        </ThemedText>
      </View>

      <Pressable
        style={styles.eliminarButton}
        onPress={() => onEliminarProducto(item.idProducto)}
      >
        <Ionicons name="trash-outline" size={20} color={colors.destructive} />
      </Pressable>
    </View>
  );

  const metodosPago: Array<{ value: MetodoPago; label: string; icon: string }> = [
    { value: 'EFECTIVO', label: 'Efectivo', icon: 'cash-outline' },
    { value: 'TARJETA', label: 'Tarjeta', icon: 'card-outline' },
    { value: 'QR', label: 'QR/Transf', icon: 'qr-code-outline' },
    { value: 'TRANSFERENCIA', label: 'Transferencia', icon: 'swap-horizontal-outline' },
  ];

  return (
    <View style={styles.ventaColumn}>
      <View style={styles.ventaHeader}>
        <ThemedText style={styles.columnTitle}>Venta Actual</ThemedText>
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>{carrito.length}</ThemedText>
        </View>
      </View>

      {/* Lista del carrito */}
      <FlatList
        data={carrito}
        renderItem={renderCarritoItem}
        keyExtractor={(item) => item.idProducto.toString()}
        contentContainerStyle={styles.carritoLista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.carritoVacio}>
            <Ionicons name="cart-outline" size={48} color={colors.textMuted} />
            <ThemedText style={styles.carritoVacioText}>
              Carrito vacío
            </ThemedText>
            <ThemedText style={styles.carritoVacioSubtext}>
              Seleccione productos para comenzar
            </ThemedText>
          </View>
        }
      />

      {/* Resumen de pago */}
      {carrito.length > 0 && (
        <View style={styles.resumenContainer}>
          <View style={styles.resumenRow}>
            <ThemedText style={styles.totalLabel}>TOTAL A PAGAR:</ThemedText>
            <ThemedText style={styles.totalValue}>
              Bs {resumen.total.toFixed(2)}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          {/* Métodos de pago */}
          <ThemedText style={styles.seccionTitle}>Método de pago</ThemedText>
          <View style={styles.metodosPagoGrid}>
            {metodosPago.map((metodo) => (
              <Pressable
                key={metodo.value}
                style={[
                  styles.metodoPagoButton,
                  metodoPago === metodo.value && styles.metodoPagoButtonActive,
                ]}
                onPress={() => setMetodoPago(metodo.value)}
              >
                <Ionicons
                  name={metodo.icon as any}
                  size={24}
                  color={
                    metodoPago === metodo.value
                      ? colors.primaryForeground
                      : colors.text
                  }
                />
                <ThemedText
                  style={[
                    styles.metodoPagoText,
                    metodoPago === metodo.value && styles.metodoPagoTextActive,
                  ]}
                >
                  {metodo.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {/* Observación */}
          <TextInput
            style={[styles.observacionInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Observación (opcional)"
            placeholderTextColor={colors.textMuted}
            value={observacion}
            onChangeText={setObservacion}
            multiline
            numberOfLines={2}
          />

          {/* Botón finalizar */}
          <Pressable
            style={[
              styles.finalizarButton,
              guardando && styles.finalizarButtonDisabled,
            ]}
            onPress={onFinalizarVenta}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={24} color={colors.primaryForeground} />
                <ThemedText style={styles.finalizarButtonText}>
                  Finalizar Venta
                </ThemedText>
              </>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
};
