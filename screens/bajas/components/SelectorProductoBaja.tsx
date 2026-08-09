import { Picker } from "@react-native-picker/picker";
import React from "react";
import { View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { InventarioProducto } from "../../inventario/types/inventario.types";
import { createBajaStyles } from "../styles/baja.styles";

type Props = {
  productos: InventarioProducto[];
  productoSeleccionado: number | null;
  setProductoSeleccionado: (value: number | null) => void;
  onAgregarProducto: (idProducto: number) => void;
  styles: ReturnType<typeof createBajaStyles>;
  colors: any;
};

export default function SelectorProductoBaja({
  productos,
  productoSeleccionado,
  setProductoSeleccionado,
  onAgregarProducto,
  styles,
  colors,
}: Props) {
  const handlePickerChange = (value: number | null) => {
    setProductoSeleccionado(value);

    if (value) {
      onAgregarProducto(value);
      setProductoSeleccionado(null);
    }
  };

  const productosActivos = productos.filter(
    (p) => p.estado === "ACTIVO" && p.stock > 0
  );

  return (
    <View style={styles.filtros}>
      <View>
        <ThemedText style={styles.detalleLabel}>
          Seleccionar producto
        </ThemedText>
        <View
          style={[
            styles.pickerContainer,
            { borderColor: colors.border, backgroundColor: colors.input },
          ]}
        >
          <Picker
            selectedValue={productoSeleccionado}
            onValueChange={handlePickerChange}
            style={[
              styles.picker,
              { color: colors.text, backgroundColor: colors.input },
            ]}
            dropdownIconColor={colors.text}
            mode="dropdown"
          >
            <Picker.Item
              label="Seleccione un producto del inventario"
              value={null}
              color={colors.textMuted}
            />
            {productosActivos.map((producto) => (
              <Picker.Item
                key={producto.idProducto}
                label={`${producto.nombre} - Stock: ${producto.stock} (${producto.sku})`}
                value={producto.idProducto}
                color={colors.text}
              />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}
