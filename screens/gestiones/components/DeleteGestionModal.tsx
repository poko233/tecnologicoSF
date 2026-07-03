// screens/gestiones/components/DeleteGestionModal.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { BlurView } from "expo-blur";
import { CheckCircle, Trash2 } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React from "react";
import { Pressable, Modal as RNModal, StyleSheet, View } from "react-native";
import { springConfig } from "../animations/gestiones.animations";
import { Gestion } from "../types/gestiones.types";

interface DeleteGestionModalProps {
  gestion: Gestion | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteGestionModal({
  gestion,
  onClose,
  onConfirm,
}: DeleteGestionModalProps) {
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
                <View
                  style={[
                    styles.header,
                    { borderBottomColor: theme.colors.border },
                  ]}
                >
                  <Trash2 size={18} color={theme.colors.destructive} />
                  <ThemedText
                    style={{
                      color: theme.colors.text,
                      fontSize: 18,
                      fontWeight: "600",
                      marginLeft: 8,
                      flex: 1,
                    }}
                  >
                    Eliminar Gestión
                  </ThemedText>
                  <Pressable onPress={onClose}>
                    <ThemedText style={{ color: theme.colors.textSecondary }}>
                      ✕
                    </ThemedText>
                  </Pressable>
                </View>

                <View style={styles.body}>
                  <ThemedText
                    style={{ color: theme.colors.text, marginBottom: 12 }}
                  >
                    Se procederá a eliminar la gestión `{gestion.nombre}``.
                  </ThemedText>

                  <View
                    style={[
                      styles.validationBox,
                      {
                        borderColor: theme.colors.primary,
                        backgroundColor: theme.colors.primarySubtle,
                      },
                    ]}
                  >
                    <CheckCircle size={16} color={theme.colors.primary} />
                    <ThemedText
                      style={{
                        color: theme.colors.text,
                        fontSize: 13,
                        flex: 1,
                      }}
                    >
                      Validación superada:{" "}
                      <ThemedText style={{ fontWeight: "700" }}>
                        0 inscripciones activas
                      </ThemedText>{" "}
                      encontradas.
                    </ThemedText>
                  </View>

                  <View style={styles.footer}>
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
                    <Pressable
                      onPress={onConfirm}
                      style={[
                        styles.deleteBtn,
                        {
                          backgroundColor: theme.colors.card,
                          borderColor: theme.colors.destructive,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <ThemedText
                        style={{
                          color: theme.colors.destructive,
                          fontWeight: "600",
                        }}
                      >
                        Eliminar Definitivamente
                      </ThemedText>
                    </Pressable>
                  </View>
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
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  body: {
    padding: 20,
  },
  validationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  deleteBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
