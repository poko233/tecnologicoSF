// screens/gestiones/components/CloseGestionModal.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { BlurView } from "expo-blur";
import { AlertTriangle, Lock, X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React from "react";
import { Pressable, Modal as RNModal, StyleSheet, View } from "react-native";
import { springConfig } from "../animations/gestiones.animations";
import { Gestion } from "../types/gestiones.types";

interface CloseGestionModalProps {
  gestion: Gestion | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function CloseGestionModal({
  gestion,
  onClose,
  onConfirm,
}: CloseGestionModalProps) {
  const { theme } = useTheme();

  if (!gestion) return null;

  return (
    <AnimatePresence>
      {gestion && (
        <RNModal transparent visible onRequestClose={onClose}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={styles.centeredView}>
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
                {/* Header tipo error */}
                <View
                  style={[
                    styles.dangerHeader,
                    { backgroundColor: theme.colors.destructive + "18" },
                  ]}
                >
                  <AlertTriangle size={20} color={theme.colors.destructive} />
                  <ThemedText
                    style={{
                      color: theme.colors.destructive,
                      fontWeight: "700",
                      fontSize: 18,
                      marginLeft: 8,
                    }}
                  >
                    Cerrar {gestion.nombre}
                  </ThemedText>
                  <Pressable onPress={onClose} style={{ marginLeft: "auto" }}>
                    <X size={20} color={theme.colors.destructive} />
                  </Pressable>
                </View>

                <View style={styles.body}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: theme.colors.destructive + "18" },
                    ]}
                  >
                    <Lock size={32} color={theme.colors.destructive} />
                  </View>
                  <ThemedText
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: theme.colors.text,
                      textAlign: "center",
                      marginTop: 16,
                    }}
                  >
                    ¿Estás absolutamente seguro?
                  </ThemedText>
                  <ThemedText
                    style={{
                      color: theme.colors.textSecondary,
                      textAlign: "center",
                      marginTop: 8,
                      fontSize: 14,
                    }}
                  >
                    Esta acción es{" "}
                    <ThemedText
                      style={{
                        fontWeight: "700",
                        color: theme.colors.destructive,
                      }}
                    >
                      irreversible
                    </ThemedText>
                    . Cerrar la gestión detendrá todas las transacciones
                    académicas asociadas.
                  </ThemedText>

                  <View
                    style={[
                      styles.consequences,
                      {
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.backgroundSecondary,
                      },
                    ]}
                  >
                    <View style={styles.consItem}>
                      <X size={14} color={theme.colors.destructive} />
                      <ThemedText
                        style={{ color: theme.colors.text, fontSize: 13 }}
                      >
                        Las inscripciones quedarán inactivas.
                      </ThemedText>
                    </View>
                    <View style={styles.consItem}>
                      <X size={14} color={theme.colors.destructive} />
                      <ThemedText
                        style={{ color: theme.colors.text, fontSize: 13 }}
                      >
                        No se podrán modificar notas finales.
                      </ThemedText>
                    </View>
                    <View style={styles.consItem}>
                      <X size={14} color={theme.colors.destructive} />
                      <ThemedText
                        style={{ color: theme.colors.text, fontSize: 13 }}
                      >
                        Se bloquearán los registros de asistencia.
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.footer,
                    { borderTopColor: theme.colors.border },
                  ]}
                >
                  <Pressable
                    onPress={onClose}
                    style={[
                      styles.button,
                      { borderColor: theme.colors.border, borderWidth: 1 },
                    ]}
                  >
                    <ThemedText
                      style={{
                        color: theme.colors.textSecondary,
                        fontWeight: "600",
                      }}
                    >
                      Mantener Abierta
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={onConfirm}
                    style={[
                      styles.button,
                      { backgroundColor: theme.colors.destructive },
                    ]}
                  >
                    <ThemedText
                      style={{
                        color: theme.colors.destructiveForeground,
                        fontWeight: "600",
                      }}
                    >
                      Confirmar Cierre
                    </ThemedText>
                  </Pressable>
                </View>
              </MotiView>
            </View>
          </BlurView>
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
    maxWidth: 440,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  dangerHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  body: {
    padding: 24,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  consequences: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    gap: 8,
    alignSelf: "stretch",
  },
  consItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
