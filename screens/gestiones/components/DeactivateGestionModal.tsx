// screens/gestiones/components/DeactivateGestionModal.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { PauseCircle, X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal as RNModal,
  StyleSheet,
  View,
} from "react-native";
import { springConfig } from "../animations/gestiones.animations";
import { Gestion } from "../types/gestiones.types";

interface DeactivateGestionModalProps {
  gestion: Gestion | null;
  onClose: () => void;
  onConfirm: () => Promise<void>; // ahora retorna Promise<void>
}

export function DeactivateGestionModal({
  gestion,
  onClose,
  onConfirm,
}: DeactivateGestionModalProps) {
  const { theme } = useTheme();
  const [submitting, setSubmitting] = useState(false);

  if (!gestion) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(); // espera la respuesta (incluye el toast)
    } finally {
      setSubmitting(false);
      onClose(); // cierra tras recibir respuesta
    }
  };

  return (
    <AnimatePresence>
      {gestion && (
        <RNModal transparent visible onRequestClose={onClose}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.centeredView}
          >
            {/* Overlay animado sin BlurView */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 200 }}
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.4)" },
              ]}
            />
            <MotiView
              from={{ opacity: 0, scale: 0.92, translateY: 30 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.95, translateY: -10 }}
              transition={{ type: "spring", ...springConfig }}
              style={[
                styles.modal,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.header}>
                <PauseCircle size={20} color={theme.colors.warning} />
                <ThemedText
                  style={{
                    color: theme.colors.text,
                    fontSize: 18,
                    fontWeight: "600",
                    marginLeft: 8,
                    flex: 1,
                  }}
                >
                  Desactivar gestión
                </ThemedText>
                <Pressable onPress={onClose} disabled={submitting}>
                  <X size={20} color={theme.colors.textSecondary} />
                </Pressable>
              </View>
              <View style={styles.body}>
                <ThemedText
                  style={{ color: theme.colors.text, marginBottom: 12 }}
                >
                  ¿Deseas desactivar la gestión "{gestion.nombre}"?
                </ThemedText>
                <ThemedText
                  style={{ color: theme.colors.textSecondary, fontSize: 13 }}
                >
                  Pasará a estado inactivo en caso de que no tenga grupos
                  activos asociados a esta gestión. En caso de tenerlos, primero
                  cierre esta gestión.
                </ThemedText>
              </View>
              <View style={styles.footer}>
                <Pressable
                  onPress={onClose}
                  style={styles.cancelBtn}
                  disabled={submitting}
                >
                  <ThemedText
                    style={{
                      color: theme.colors.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    Cancelar
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={handleConfirm}
                  disabled={submitting}
                  style={[
                    styles.confirmBtn,
                    {
                      backgroundColor: submitting
                        ? theme.colors.disabled
                        : theme.colors.warning,
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: submitting
                        ? theme.colors.disabledForeground
                        : theme.colors.warningForeground,
                      fontWeight: "600",
                    }}
                  >
                    {"Desactivar"}
                  </ThemedText>
                </Pressable>
              </View>
            </MotiView>
          </KeyboardAvoidingView>
        </RNModal>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "inherit",
  },
  body: {
    padding: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderColor: "inherit",
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
