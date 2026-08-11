import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Pressable,
    StyleSheet,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";

import { Colors } from "../../../theme/types";

type Props = {
  cantidad: number;
  maximo: number;
  onCambiarCantidad: (cantidad: number) => void;
  colors: Colors;
};

export default function CantidadIngresoSelector({
  cantidad,
  maximo,
  onCambiarCantidad,
  colors,
}: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const [inputValue, setInputValue] = useState(String(cantidad));

  useEffect(() => {
    setInputValue(String(cantidad));
  }, [cantidad]);

  const cambiar = (nuevaCantidad: number) => {
    const cantidadFinal = Math.max(1, Math.min(nuevaCantidad, maximo));
    onCambiarCantidad(cantidadFinal);
    setInputValue(String(cantidadFinal));
  };

  const handleInputChange = (text: string) => {
    const limpio = text.replace(/\D/g, "");
    setInputValue(limpio);

    const numero = Number(limpio);
    if (Number.isInteger(numero) && numero >= 1 && numero <= maximo) {
      onCambiarCantidad(numero);
    }
  };

  const handleInputBlur = () => {
    const numero = Number(inputValue);
    cambiar(Number.isInteger(numero) ? numero : 1);
  };

  const accent = (colors as any).success || colors.primary;
  const buttonSize = isMobile ? 36 : 32;

  return (
    <View style={localStyles.container}>
      <Pressable
        onPress={() => cambiar(cantidad - 1)}
        disabled={cantidad <= 1}
        style={[
          localStyles.button,
          {
            width: buttonSize,
            height: buttonSize,
            backgroundColor:
              cantidad <= 1 ? `${colors.textMuted}20` : `${accent}15`,
            borderColor: cantidad <= 1 ? colors.border : `${accent}40`,
          },
        ]}
      >
        <Ionicons
          name="remove"
          size={18}
          color={cantidad <= 1 ? colors.textMuted : accent}
        />
      </Pressable>

      <TextInput
        value={inputValue}
        onChangeText={handleInputChange}
        onBlur={handleInputBlur}
        keyboardType="numeric"
        selectTextOnFocus
        maxLength={10}
        style={[
          localStyles.input,
          {
            width: isMobile ? 68 : 62,
            color: colors.text,
            borderColor: colors.inputBorder || colors.border,
            backgroundColor: colors.input || colors.background,
          },
        ]}
      />

      <Pressable
        onPress={() => cambiar(cantidad + 1)}
        disabled={cantidad >= maximo}
        style={[
          localStyles.button,
          {
            width: buttonSize,
            height: buttonSize,
            backgroundColor:
              cantidad >= maximo ? `${colors.textMuted}20` : `${accent}15`,
            borderColor: cantidad >= maximo ? colors.border : `${accent}40`,
          },
        ]}
      >
        <Ionicons
          name="add"
          size={18}
          color={cantidad >= maximo ? colors.textMuted : accent}
        />
      </Pressable>
    </View>
  );
}

const localStyles = StyleSheet.create({
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
