import { useTheme } from "@/theme/useTheme";
import { MotiView } from "moti";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { modalTiming } from "../animations/notas.animations";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmStatusModal({
  visible,
  title,
  message,
  confirmLabel = "Aceptar",
  isDestructive = false,
  isLoading = false,
  onCancel,
  onConfirm,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const iconBgColor = isDestructive ? c.destructive + "15" : c.primary + "15";
  const iconColor = isDestructive ? c.destructive : c.primary;
  const confirmBgColor = isDestructive ? c.destructive : c.primary;
  const confirmTextColor = isDestructive
    ? c.destructiveForeground
    : c.primaryForeground;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
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
          {/* Icono */}
          <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
            <Text style={{ fontSize: 28, color: iconColor, fontWeight: "700" }}>
              !
            </Text>
          </View>

          {/* Título */}
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>

          {/* Mensaje */}
          <Text style={[styles.message, { color: c.textSecondary }]}>
            {message}
          </Text>

          {/* Botones */}
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onCancel}
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
              disabled={isLoading}
              style={[
                styles.btn,
                {
                  backgroundColor: confirmBgColor,
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={confirmTextColor} />
              ) : (
                <Text style={[styles.confirmText, { color: confirmTextColor }]}>
                  {confirmLabel.toUpperCase()}
                </Text>
              )}
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 24,
  },
  modal: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    gap: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 8,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
