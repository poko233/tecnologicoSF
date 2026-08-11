import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { createIngresoProductosStyles } from "../styles/ingresoProductos.styles";
import { ProductoIngresoItem } from "../types/ingresoProductos.types";
import { formatearNumero } from "../utils/ingresoProductos.utils";
import CantidadIngresoSelector from "./CantidadIngresoSelector";

type Props = {
  productos: ProductoIngresoItem[];
  fechaIngreso: string;
  setFechaIngreso: (value: string) => void;
  fechaError: string | null;
  observacion: string;
  setObservacion: (value: string) => void;
  onCambiarCantidad: (idProducto: number, cantidad: number) => void;
  onEliminarProducto: (idProducto: number) => void;
  onRealizarIngreso: () => void;
  registrando: boolean;
  styles: ReturnType<typeof createIngresoProductosStyles>;
  colors: any;
};

export default function ProductosIngresoPanel({
  productos,
  fechaIngreso,
  setFechaIngreso,
  fechaError,
  observacion,
  setObservacion,
  onCambiarCantidad,
  onEliminarProducto,
  onRealizarIngreso,
  registrando,
  styles,
  colors,
}: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const totalUnidades = productos.reduce(
    (total, producto) => total + producto.cantidad,
    0,
  );
  const puedeRegistrar =
    productos.length > 0 && !fechaError && !!fechaIngreso && !registrando;
  const accent = colors.success || colors.primary;

  const renderProducto = ({ item }: { item: ProductoIngresoItem }) => {
    const maximo = Math.max(1, 4294967295 - item.stock);

    return (
      <View
        style={[
          styles.tablaFila,
          { paddingVertical: 12, paddingHorizontal: isMobile ? 0 : 8 },
        ]}
      >
        <View style={{ flex: 1 }}>
          <ThemedText
            style={[styles.tablaCell, { fontSize: 13, fontWeight: "900" }]}
          >
            {item.nombre}
          </ThemedText>
          <ThemedText
            style={[
              styles.tablaCell,
              { fontSize: 11, color: colors.textMuted, marginTop: 2 },
            ]}
          >
            {item.sku} · Stock actual: {formatearNumero(item.stock)}
          </ThemedText>
          <ThemedText
            style={[
              styles.tablaCell,
              { fontSize: 12, color: accent, marginTop: 4, fontWeight: "800" },
            ]}
          >
            Después: {formatearNumero(item.stock + item.cantidad)}{" "}
            {item.unidadMedida}
          </ThemedText>
        </View>

        <View
          style={{
            width: isMobile ? "100%" : 150,
            alignItems: "center",
            gap: 6,
            marginTop: isMobile ? 8 : 0,
          }}
        >
          <ThemedText
            style={[styles.detalleLabel, { marginBottom: 0, fontSize: 10 }]}
          >
            Cantidad
          </ThemedText>
          <CantidadIngresoSelector
            cantidad={item.cantidad}
            maximo={maximo}
            onCambiarCantidad={(cantidad) =>
              onCambiarCantidad(item.idProducto, cantidad)
            }
            colors={colors}
          />
        </View>

        <View
          style={{
            width: 40,
            alignItems: "center",
            position: isMobile ? "absolute" : "relative",
            top: isMobile ? 12 : 0,
            right: 0,
          }}
        >
          <Pressable
            style={styles.deleteButton}
            onPress={() => onEliminarProducto(item.idProducto)}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={colors.destructive}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.detalleColumn}>
      <ThemedText style={styles.columnTitle}>Productos a ingresar</ThemedText>

      <View style={{ flex: 1 }}>
        <FlatList
          data={productos}
          renderItem={renderProducto}
          keyExtractor={(item) => String(item.idProducto)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="add-circle-outline"
                size={48}
                color={colors.textMuted}
              />
              <ThemedText style={styles.emptyText}>
                Selecciona productos de la izquierda
              </ThemedText>
            </View>
          }
        />
      </View>

      <ScrollView
        style={{ maxHeight: 430 }}
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          borderTopWidth: 2,
          borderColor: colors.border,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detalleSeccion}>
          <ThemedText style={styles.detalleLabel}>Fecha de ingreso</ThemedText>
          <TextInput
            value={fechaIngreso}
            onChangeText={(value) =>
              setFechaIngreso(value.replace(/[^0-9-]/g, "").slice(0, 10))
            }
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colors.textMuted}
            maxLength={10}
            style={[
              styles.detalleInput,
              fechaError ? styles.inputError : undefined,
              { color: colors.text },
            ]}
          />
          {!!fechaError && (
            <ThemedText style={styles.errorText}>{fechaError}</ThemedText>
          )}
        </View>

        <View style={styles.detalleSeccion}>
          <ThemedText style={styles.detalleLabel}>
            Observación (opcional)
          </ThemedText>
          <TextInput
            style={[
              styles.detalleInput,
              styles.detalleTextArea,
              { color: colors.text, borderColor: colors.inputBorder },
            ]}
            placeholder="Agrega detalles adicionales..."
            placeholderTextColor={colors.textMuted}
            value={observacion}
            onChangeText={(value) => setObservacion(value.slice(0, 500))}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        <View style={styles.detalleSeccion}>
          <View style={styles.detalleInfoRow}>
            <ThemedText style={styles.detalleInfoLabel}>
              Productos seleccionados
            </ThemedText>
            <ThemedText style={[styles.detalleInfoValue, { color: accent }]}>
              {productos.length}
            </ThemedText>
          </View>

          <View style={styles.detalleTotalRow}>
            <ThemedText style={styles.detalleTotalLabel}>
              Total unidades
            </ThemedText>
            <ThemedText style={styles.detalleTotalValue}>
              +{formatearNumero(totalUnidades)}
            </ThemedText>
          </View>
        </View>

        <Pressable
          style={[
            styles.primaryButton,
            !puedeRegistrar && styles.primaryButtonDisabled,
          ]}
          onPress={onRealizarIngreso}
          disabled={!puedeRegistrar}
        >
          <Ionicons
            name={
              registrando ? "hourglass-outline" : "checkmark-circle-outline"
            }
            size={20}
            color={colors.primaryForeground}
          />
          <ThemedText style={styles.primaryButtonText}>
            {registrando ? "Procesando..." : "Realizar Ingreso"}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </View>
  );
}
