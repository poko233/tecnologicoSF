import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    View,
    useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { createInventarioStyles } from "../styles/inventario.styles";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  procesando: boolean;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function ConfirmarAccionModal({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  procesando,
  destructive = true,
  onClose,
  onConfirm,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(
    () => createInventarioStyles(theme.colors, width < 720, width < 1100),
    [theme.colors, width],
  );
  const accent = destructive
    ? theme.colors.destructive || "#DC2626"
    : theme.colors.primary;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, styles.modalSmall]}>
          <View style={styles.confirmBody}>
            <View
              style={[
                styles.confirmIcon,
                { backgroundColor: `${accent}14`, borderColor: `${accent}45` },
              ]}
            >
              <Ionicons
                name={destructive ? "warning-outline" : "help-circle-outline"}
                size={34}
                color={accent}
              />
            </View>
            <ThemedText style={styles.confirmTitle}>{title}</ThemedText>
            <ThemedText style={styles.confirmText}>{message}</ThemedText>
          </View>
          <View style={styles.modalFooter}>
            <Pressable
              disabled={procesando}
              onPress={onClose}
              style={[styles.cancelButton, procesando && styles.disabled]}
            >
              <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
            </Pressable>
            <Pressable
              disabled={procesando}
              onPress={() => void onConfirm()}
              style={[
                destructive ? styles.dangerButton : styles.saveButton,
                procesando && styles.disabled,
              ]}
            >
              {procesando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons
                  name={destructive ? "trash-outline" : "checkmark-circle-outline"}
                  size={18}
                  color="#FFFFFF"
                />
              )}
              <ThemedText
                style={
                  destructive ? styles.dangerButtonText : styles.saveButtonText
                }
              >
                {procesando ? "Procesando..." : confirmLabel}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
