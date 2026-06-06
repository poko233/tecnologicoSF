import { useTheme } from "@/theme/useTheme";
import { X } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { modalTiming } from "../animations/notas.animations";

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (nombre: string, observaciones?: string) => Promise<void>;
  isLoading?: boolean;
}

export function CreateECModal({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [nombre, setNombre] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const handleConfirm = async () => {
    if (nombre.trim()) {
      await onConfirm(nombre.trim(), observaciones.trim() || undefined);
      setNombre("");
      setObservaciones("");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <MotiView
          style={[
            styles.modal,
            {
              backgroundColor: c.modal,
              borderColor: c.border,
              shadowColor: "#000",
            },
          ]}
          {...modalTiming}
        >
          {/* Cabecera */}
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <Text style={[styles.title, { color: c.text }]}>
              Añadir Nuevo Elemento
            </Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              style={styles.closeBtn}
            >
              <X size={20} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Cuerpo */}
          <View style={styles.body}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>
                Nombre del Elemento
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: c.input,
                    borderColor: c.inputBorder,
                    color: c.text,
                  },
                ]}
                placeholder="Ej: Examen Parcial"
                placeholderTextColor={c.textMuted}
                value={nombre}
                onChangeText={setNombre}
                maxLength={150}
                editable={!isLoading}
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>
                Observaciones
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: c.input,
                    borderColor: c.inputBorder,
                    color: c.text,
                  },
                ]}
                placeholder="Opcional..."
                placeholderTextColor={c.textMuted}
                value={observaciones}
                onChangeText={setObservaciones}
                multiline
                numberOfLines={3}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Pie */}
          <View style={[styles.footer, { borderTopColor: c.border }]}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              style={[
                styles.btn,
                styles.cancelBtn,
                {
                  borderColor: c.border,
                  backgroundColor: c.card,
                  opacity: isLoading ? 0.5 : 1,
                },
              ]}
            >
              <Text style={[styles.cancelText, { color: c.text }]}>
                CANCELAR
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!nombre.trim() || isLoading}
              style={[
                styles.btn,
                {
                  backgroundColor: c.primary,
                  opacity: !nombre.trim() || isLoading ? 0.6 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={c.primaryForeground} />
              ) : (
                <Text
                  style={[styles.confirmText, { color: c.primaryForeground }]}
                >
                  GUARDAR
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </MotiView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 24,
  },
  modal: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  cancelBtn: {
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  confirmText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
