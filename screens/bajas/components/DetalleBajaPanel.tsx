import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { createBajaStyles } from "../styles/baja.styles";
import { ConceptoBaja } from "../types/baja.types";

type Props = {
  concepto: ConceptoBaja | "";
  setConcepto: (value: ConceptoBaja | "") => void;
  observacion: string;
  setObservacion: (value: string) => void;
  totalItems: number;
  totalBaja: number;
  onRealizarBaja: () => void;
  registrando: boolean;
  styles: ReturnType<typeof createBajaStyles>;
  colors: any;
};

export default function DetalleBajaPanel({
  concepto,
  setConcepto,
  observacion,
  setObservacion,
  totalItems,
  totalBaja,
  onRealizarBaja,
  registrando,
  styles,
  colors,
}: Props) {
  const puedeRealizarBaja = concepto !== "" && totalItems > 0 && !registrando;

  const conceptos: Array<{ value: ConceptoBaja; label: string }> = [
    { value: "DAÑADO", label: "Producto dañado" },
    { value: "VENCIDO", label: "Producto vencido" },
    { value: "PERDIDA", label: "Pérdida" },
    { value: "AJUSTE", label: "Ajuste de inventario" },
  ];

  return (
    <ScrollView
      style={styles.detalleColumn}
      contentContainerStyle={styles.detallePanel}
      showsVerticalScrollIndicator={false}
    >
      <ThemedText style={styles.detalleTitulo}>
        Detalle de Baja
      </ThemedText>

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
          numberOfLines={4}
        />
      </View>

      <View style={styles.detalleSeccion}>
        <View style={styles.detalleInfoRow}>
          <ThemedText style={styles.detalleInfoLabel}>
            Cantidad de items
          </ThemedText>
          <ThemedText style={[styles.detalleInfoValue, { color: colors.destructive }]}>
            {totalItems}
          </ThemedText>
        </View>

        <View style={styles.detalleTotalRow}>
          <ThemedText style={styles.detalleTotalLabel}>
            Precio Total
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
  );
}
