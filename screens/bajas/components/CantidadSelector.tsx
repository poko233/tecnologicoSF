import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, TextInput, View, StyleSheet, useWindowDimensions } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Colors } from "../../../theme/types";

interface CantidadSelectorProps {
  cantidad: number;
  stockDisponible: number;
  onCambiarCantidad: (cantidad: number) => void;
  colors: Colors;
}

export const CantidadSelector: React.FC<CantidadSelectorProps> = ({
  cantidad,
  stockDisponible,
  onCambiarCantidad,
  colors,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const [inputValue, setInputValue] = useState(cantidad.toString());

  const handleIncrement = () => {
    if (cantidad < stockDisponible) {
      const nuevaCantidad = cantidad + 1;
      onCambiarCantidad(nuevaCantidad);
      setInputValue(nuevaCantidad.toString());
    }
  };

  const handleDecrement = () => {
    if (cantidad > 1) {
      const nuevaCantidad = cantidad - 1;
      onCambiarCantidad(nuevaCantidad);
      setInputValue(nuevaCantidad.toString());
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);

    const numero = parseInt(text);
    if (!isNaN(numero) && numero >= 1 && numero <= stockDisponible) {
      onCambiarCantidad(numero);
    }
  };

  const handleInputBlur = () => {
    const numero = parseInt(inputValue);

    if (isNaN(numero) || numero < 1) {
      setInputValue("1");
      onCambiarCantidad(1);
    } else if (numero > stockDisponible) {
      setInputValue(stockDisponible.toString());
      onCambiarCantidad(stockDisponible);
    } else {
      setInputValue(numero.toString());
      onCambiarCantidad(numero);
    }
  };

  // Sincronizar cuando cantidad cambia externamente
  React.useEffect(() => {
    setInputValue(cantidad.toString());
  }, [cantidad]);

  const buttonSize = isMobile ? 36 : 32;
  const inputWidth = isMobile ? 60 : 55;

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            backgroundColor: cantidad <= 1 ? `${colors.textMuted}20` : `${colors.primary}15`,
            borderColor: cantidad <= 1 ? colors.border : `${colors.primary}40`,
          }
        ]}
        onPress={handleDecrement}
        disabled={cantidad <= 1}
      >
        <Ionicons
          name="remove"
          size={18}
          color={cantidad <= 1 ? colors.textMuted : colors.primary}
        />
      </Pressable>

      <TextInput
        style={[
          styles.input,
          {
            width: inputWidth,
            color: colors.text,
            borderColor: colors.inputBorder || colors.border,
            backgroundColor: colors.input || colors.background,
          }
        ]}
        value={inputValue}
        onChangeText={handleInputChange}
        onBlur={handleInputBlur}
        keyboardType="numeric"
        selectTextOnFocus
        maxLength={String(stockDisponible).length}
      />

      <Pressable
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            backgroundColor: cantidad >= stockDisponible ? `${colors.textMuted}20` : `${colors.primary}15`,
            borderColor: cantidad >= stockDisponible ? colors.border : `${colors.primary}40`,
          }
        ]}
        onPress={handleIncrement}
        disabled={cantidad >= stockDisponible}
      >
        <Ionicons
          name="add"
          size={18}
          color={cantidad >= stockDisponible ? colors.textMuted : colors.primary}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});
