// screens/arqueo/components/TipoTransaccionFormModal.tsx
import { BlurView } from "expo-blur";
import { X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { tipoTransaccionService } from "../services/tipoTransaccion.service";
import { TipoTransaccion } from "../types/transaccion.types";

interface TipoTransaccionFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipoEdit?: TipoTransaccion | null;
}

export function TipoTransaccionFormModal({
  visible,
  onClose,
  onSuccess,
  tipoEdit,
}: TipoTransaccionFormModalProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [transaccion, setTransaccion] = useState("");
  const [tipo, setTipo] = useState<"INGRESO" | "EGRESO">("INGRESO");

  useEffect(() => {
    if (tipoEdit) {
      setCodigo(tipoEdit.codigo);
      setTransaccion(tipoEdit.transaccion);
      setTipo(tipoEdit.tipo);
    } else {
      setCodigo("");
      setTransaccion("");
      setTipo("INGRESO");
    }
  }, [tipoEdit, visible]);

  const handleSubmit = async () => {
    if (!codigo || !transaccion) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "El código y la transacción son obligatorios",
      });
      return;
    }
    setLoading(true);
    try {
      if (tipoEdit) {
        await tipoTransaccionService.update(tipoEdit.id, {
          codigo,
          transaccion,
          tipo,
        });
        Toast.show({
          type: "success",
          text1: "Éxito",
          text2: "Tipo actualizado correctamente",
        });
      } else {
        await tipoTransaccionService.create({ codigo, transaccion, tipo });
        Toast.show({
          type: "success",
          text1: "Éxito",
          text2: "Tipo creado correctamente",
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      onClose();
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Ocurrió un error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <Modal
          transparent
          visible={visible}
          onRequestClose={onClose}
          key={visible ? "modal-open" : "modal-closed"}
        >
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MotiView
                from={{ opacity: 0, scale: 0.9, translateY: 30 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.95, translateY: -10 }}
                transition={{ type: "spring", damping: 32, stiffness: 200 }}
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    width: "90%",
                    maxWidth: 420,
                  },
                ]}
              >
                <View
                  style={[
                    styles.header,
                    { borderBottomColor: theme.colors.border },
                  ]}
                >
                  <ThemedText
                    style={[styles.title, { color: theme.colors.text }]}
                  >
                    {tipoEdit ? "Editar" : "Nuevo"} Tipo de Transacción
                  </ThemedText>
                  <MotiPressable
                    onPress={onClose}
                    animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
                  >
                    <View
                      style={[
                        styles.closeBtn,
                        { backgroundColor: theme.colors.backgroundSecondary },
                      ]}
                    >
                      <X size={18} color={theme.colors.muted} />
                    </View>
                  </MotiPressable>
                </View>
                <View style={styles.body}>
                  <View style={styles.field}>
                    <ThemedText
                      style={[styles.label, { color: theme.colors.text }]}
                    >
                      Código
                    </ThemedText>
                    <TextInput
                      value={codigo}
                      onChangeText={setCodigo}
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.input,
                          borderColor: theme.colors.inputBorder,
                          color: theme.colors.text,
                        },
                      ]}
                      placeholder="Ej: VENTA"
                      placeholderTextColor={theme.colors.textMuted}
                    />
                  </View>
                  <View style={styles.field}>
                    <ThemedText
                      style={[styles.label, { color: theme.colors.text }]}
                    >
                      Transacción
                    </ThemedText>
                    <TextInput
                      value={transaccion}
                      onChangeText={setTransaccion}
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.input,
                          borderColor: theme.colors.inputBorder,
                          color: theme.colors.text,
                        },
                      ]}
                      placeholder="Ej: Venta de materiales"
                      placeholderTextColor={theme.colors.textMuted}
                    />
                  </View>
                  <View style={styles.field}>
                    <ThemedText
                      style={[styles.label, { color: theme.colors.text }]}
                    >
                      Tipo
                    </ThemedText>
                    <View
                      style={[
                        styles.selectInput,
                        { borderColor: theme.colors.border },
                      ]}
                    >
                      <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as any)}
                        style={{
                          backgroundColor: theme.colors.input,
                          color: theme.colors.text,
                          border: "none",
                          padding: 8,
                          borderRadius: 6,
                          fontSize: 14,
                          width: "100%",
                          outline: "none",
                        }}
                      >
                        <option value="INGRESO">Ingreso</option>
                        <option value="EGRESO">Egreso</option>
                      </select>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.footer,
                    { borderTopColor: theme.colors.border },
                  ]}
                >
                  <Pressable onPress={onClose} style={styles.cancelBtn}>
                    <ThemedText
                      style={{
                        color: theme.colors.textSecondary,
                        fontWeight: "600",
                      }}
                    >
                      Cancelar
                    </ThemedText>
                  </Pressable>
                  <MotiPressable
                    onPress={handleSubmit}
                    disabled={loading}
                    animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
                    style={[
                      styles.applyBtn,
                      {
                        backgroundColor: theme.colors.primary,
                        opacity: loading ? 0.5 : 1,
                      },
                    ]}
                  >
                    <ThemedText style={styles.applyText}>Guardar</ThemedText>
                  </MotiPressable>
                </View>
              </MotiView>
            </KeyboardAvoidingView>
          </BlurView>
        </Modal>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "700" },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 24, gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  selectInput: { borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  applyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  applyText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});
