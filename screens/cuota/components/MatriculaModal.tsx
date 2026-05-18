import { Toaster } from "@/components/Toaster";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "../../../theme/useTheme";

interface MatriculaModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    requierePago: boolean,
    monto: number,
    observacion: string,
  ) => Promise<void>;
  isLoading: boolean;
  estudianteNombre: string;
}

export const MatriculaModal: React.FC<MatriculaModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isLoading,
  estudianteNombre,
}) => {
  const { theme } = useTheme();
  const [requierePago, setRequierePago] = useState(true);
  const [monto, setMonto] = useState("200.00");
  const [observacion, setObservacion] = useState("");

  const handleConfirm = async () => {
    const montoNumber = parseFloat(monto);

    // Validación: si requiere pago, el monto debe ser mayor a cero
    if (requierePago && (isNaN(montoNumber) || montoNumber <= 0)) {
      Toast.show({
        type: "error",
        text1: "Monto inválido",
        text2: "El monto debe ser mayor a cero cuando requiere pago.",
      });
      return;
    }

    await onConfirm(requierePago, requierePago ? montoNumber : 0, observacion);

    // Resetear estado local después de confirmar
    setRequierePago(true);
    setMonto("200.00");
    setObservacion("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 24,
            width: "100%",
            maxWidth: 400,
            padding: 24,
            gap: 20,
          }}
        >
          {/* Cabecera */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: theme.colors.text,
              }}
            >
              Generar Matrícula
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <Text style={{ color: theme.colors.textSecondary }}>
            Estudiante:{" "}
            <Text style={{ fontWeight: "bold" }}>{estudianteNombre}</Text>
          </Text>

          {/* Switch requiere pago */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 8,
            }}
          >
            <Text style={{ color: theme.colors.text }}>
              ¿Requiere pago de matrícula?
            </Text>
            <Switch
              value={requierePago}
              onValueChange={setRequierePago}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.card}
            />
          </View>

          {/* Campo monto (solo si requiere pago) */}
          {requierePago && (
            <View>
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 4,
                  color: theme.colors.textSecondary,
                }}
              >
                Monto de la matrícula (Bs)
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                keyboardType="numeric"
                value={monto}
                onChangeText={setMonto}
                placeholder="0.00"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          )}

          {/* Observación */}
          <View>
            <Text
              style={{
                fontSize: 12,
                marginBottom: 4,
                color: theme.colors.textSecondary,
              }}
            >
              Observación (opcional)
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              placeholder="Ej: Pago en efectivo..."
              placeholderTextColor={theme.colors.textMuted}
              value={observacion}
              onChangeText={setObservacion}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Botones */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: theme.colors.backgroundSecondary,
                alignItems: "center",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: theme.colors.textSecondary }}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={isLoading}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: theme.colors.primary,
                alignItems: "center",
                opacity: pressed || isLoading ? 0.7 : 1,
              })}
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primaryForeground}
                />
              ) : (
                <Text
                  style={{
                    color: theme.colors.primaryForeground,
                    fontWeight: "600",
                  }}
                >
                  Confirmar
                </Text>
              )}
            </Pressable>
          </View>
        </View>
        <Toaster />
      </View>
    </Modal>
  );
};
