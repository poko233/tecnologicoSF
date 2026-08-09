import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { FlatList, Pressable, ScrollView, TextInput, View, useWindowDimensions } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { createBajaStyles } from "../styles/baja.styles";
import { ConceptoBaja, ProductoBajaItem } from "../types/baja.types";
import { CantidadSelector } from "./CantidadSelector";

type Props = {
  productos: ProductoBajaItem[];
  concepto: ConceptoBaja | "";
  setConcepto: (value: ConceptoBaja | "") => void;
  observacion: string;
  setObservacion: (value: string) => void;
  onCambiarCantidad: (idProducto: number, cantidad: number) => void;
  onEliminarProducto: (idProducto: number) => void;
  onRealizarBaja: () => void;
  registrando: boolean;
  styles: ReturnType<typeof createBajaStyles>;
  colors: any;
};

export default function ProductosBajaPanel({
  productos,
  concepto,
  setConcepto,
  observacion,
  setObservacion,
  onCambiarCantidad,
  onEliminarProducto,
  onRealizarBaja,
  registrando,
  styles,
  colors,
}: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const conceptos: Array<{ value: ConceptoBaja; label: string }> = [
    { value: "DAÑADO", label: "Producto dañado" },
    { value: "VENCIDO", label: "Producto vencido" },
    { value: "PERDIDA", label: "Pérdida" },
    { value: "AJUSTE", label: "Ajuste de inventario" },
  ];

  const totalItems = productos.reduce((sum, p) => sum + p.cantidad, 0);
  const totalBaja = productos.reduce((sum, p) => sum + p.subTotal, 0);
  const puedeRealizarBaja = concepto !== "" && totalItems > 0 && !registrando;

  const renderProducto = ({ item }: { item: ProductoBajaItem }) => {
    return (
      <View style={[styles.tablaFila, { paddingVertical: 12, paddingHorizontal: isMobile ? 0 : 8 }]}>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.tablaCell, { fontSize: 13, fontWeight: "900" }]}>
            {item.nombre}
          </ThemedText>
          <ThemedText style={[styles.tablaCell, { fontSize: 11, color: colors.textMuted, marginTop: 2 }]}>
            {item.sku} • Stock: {item.stock}
          </ThemedText>
          <ThemedText style={[styles.tablaCell, { fontSize: 12, color: colors.destructive, marginTop: 4, fontWeight: "700" }]}>
            Bs {item.precioVenta.toFixed(2)} c/u
          </ThemedText>
        </View>

        <View style={{ width: isMobile ? "100%" : 150, alignItems: "center", gap: 6, marginTop: isMobile ? 8 : 0 }}>
          <ThemedText style={[styles.detalleLabel, { marginBottom: 0, fontSize: 10 }]}>Cantidad</ThemedText>
          <CantidadSelector
            cantidad={item.cantidad}
            stockDisponible={item.stock}
            onCambiarCantidad={(cantidad) => onCambiarCantidad(item.idProducto, cantidad)}
            colors={colors}
          />
        </View>

        <View style={{ width: 40, alignItems: "center", position: isMobile ? "absolute" : "relative", top: isMobile ? 12 : 0, right: isMobile ? 0 : 0 }}>
          <Pressable
            style={styles.deleteButton}
            onPress={() => onEliminarProducto(item.idProducto)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.destructive} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.detalleColumn}>
      <ThemedText style={styles.columnTitle}>Productos a dar de baja</ThemedText>

      <View style={{ flex: 1 }}>
        <FlatList
          data={productos}
          renderItem={renderProducto}
          keyExtractor={(item) => item.idProducto.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
              <ThemedText style={styles.emptyText}>
                Selecciona productos de la izquierda
              </ThemedText>
            </View>
          }
        />
      </View>

      <ScrollView
        style={{ maxHeight: 400 }}
        contentContainerStyle={{ padding: 16, gap: 16, borderTopWidth: 2, borderColor: colors.border }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detalleSeccion}>
          <ThemedText style={styles.detalleLabel}>
            Concepto de la baja
          </ThemedText>
          <View
            style={[
              styles.pickerContainer,
              { borderColor: colors.inputBorder, backgroundColor: colors.input },
            ]}
          >
            <Picker
              selectedValue={concepto}
              onValueChange={(value) => setConcepto(value as ConceptoBaja)}
              style={[
                styles.picker,
                { color: colors.text, backgroundColor: colors.input },
              ]}
              dropdownIconColor={colors.text}
              mode="dropdown"
            >
              <Picker.Item
                label="Seleccione un concepto"
                value=""
                color={colors.textMuted}
              />
              {conceptos.map((c) => (
                <Picker.Item
                  key={c.value}
                  label={c.label}
                  value={c.value}
                  color={colors.text}
                />
              ))}
            </Picker>
          </View>
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
            onChangeText={setObservacion}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.detalleSeccion}>
          <View style={styles.detalleInfoRow}>
            <ThemedText style={styles.detalleInfoLabel}>
              Total de items
            </ThemedText>
            <ThemedText style={[styles.detalleInfoValue, { color: colors.destructive }]}>
              {totalItems}
            </ThemedText>
          </View>

          <View style={styles.detalleTotalRow}>
            <ThemedText style={styles.detalleTotalLabel}>
              Total Baja
            </ThemedText>
            <ThemedText style={styles.detalleTotalValue}>
              Bs {totalBaja.toFixed(2)}
            </ThemedText>
          </View>
        </View>

        <Pressable
          style={[
            styles.primaryButton,
            !puedeRealizarBaja && styles.primaryButtonDisabled,
          ]}
          onPress={onRealizarBaja}
          disabled={!puedeRealizarBaja}
        >
          <Ionicons
            name={registrando ? "hourglass-outline" : "checkmark-circle-outline"}
            size={20}
            color={colors.primaryForeground}
          />
          <ThemedText style={styles.primaryButtonText}>
            {registrando ? "Procesando..." : "Realizar Baja"}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </View>
  );
}
