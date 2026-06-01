// screens/asistencia/components/ConfirmationModal.tsx
import { useTheme } from "@/theme/useTheme";
import { AlertTriangle, X } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmationModal({ visible, onCancel, onConfirm }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 200 }}
          style={[styles.dialog, { backgroundColor: c.card }]}
        >
          <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
            <X size={20} color={c.textSecondary} />
          </TouchableOpacity>
          <View style={styles.warningRow}>
            <AlertTriangle size={28} color={c.destructive} />
            <Text style={[styles.title, { color: c.destructive }]}>
              Confirmar Guardado
            </Text>
          </View>
          <Text style={[styles.message, { color: c.text }]}>
            Una vez guardada la asistencia ya no se podrá modificar. ¿Desea
            continuar?
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.btn, { borderColor: c.border, borderWidth: 1 }]}
            >
              <Text style={{ color: c.textSecondary, fontWeight: "500" }}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.btn, { backgroundColor: c.primary }]}
            >
              <Text style={{ color: c.primaryForeground, fontWeight: "600" }}>
                Aceptar
              </Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 1,
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
});
