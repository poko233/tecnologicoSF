// screens/gestiones/components/CloseGestionModal.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { AlertTriangle, Lock, X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal as RNModal,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Gestion } from "../types/gestiones.types";

const CONFIRM_WORD = "CERRAR";

interface CloseGestionModalProps {
  gestion: Gestion | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function CloseGestionModal({
  gestion,
  onClose,
  onConfirm,
}: CloseGestionModalProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState<0 | 1>(0);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Resetear al paso 0 cada vez que se abre un nuevo cierre
  useEffect(() => {
    setStep(0);
    setInput("");
  }, [gestion]);

  if (!gestion) return null;

  const canConfirmFinal = input.trim() === CONFIRM_WORD && !submitting;

  const handleFinalConfirm = async () => {
    if (!canConfirmFinal) return;
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
      setStep(0);
      setInput("");
      onClose();
    }
  };

  const resetAndClose = () => {
    setStep(0);
    setInput("");
    onClose();
  };

  return (
    <AnimatePresence>
      {gestion && (
        <RNModal transparent visible onRequestClose={resetAndClose}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.centeredView}
          >
            {/* Overlay animado */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 200 }}
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.45)" },
              ]}
            />

            <View
              style={{ width: "100%", maxWidth: 440, alignItems: "center" }}
            >
              {/* Panel 1 (Advertencia) — visible cuando step === 0 */}
              {step === 0 && (
                <MotiView
                  key="advertencia"
                  from={{ opacity: 0, translateX: 0 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  exit={{ opacity: 0, translateX: -300 }}
                  transition={{ type: "spring", damping: 25, stiffness: 170 }}
                  style={[
                    styles.modal,
                    {
                      width: "100%",
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
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
                        flex: 1,
                      }}
                    >
                      Cerrar {gestion.nombre}
                    </ThemedText>
                    <Pressable onPress={resetAndClose}>
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
                      onPress={resetAndClose}
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
                      onPress={() => setStep(1)}
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
              )}

              {/* Panel 2 (Confirmación escrita) — visible cuando step === 1 */}
              {step === 1 && (
                <MotiView
                  key="confirmacion"
                  from={{ opacity: 0, translateX: 300 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  exit={{ opacity: 0, translateX: 300 }}
                  transition={{ type: "spring", damping: 25, stiffness: 170 }}
                  style={[
                    styles.modal,
                    {
                      width: "100%",
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.dangerHeader}>
                    <Lock size={20} color={theme.colors.destructive} />
                    <ThemedText
                      style={{
                        color: theme.colors.destructive,
                        fontWeight: "700",
                        fontSize: 16,
                        marginLeft: 8,
                        flex: 1,
                      }}
                    >
                      Confirmación final
                    </ThemedText>
                    <Pressable onPress={() => setStep(0)}>
                      <X size={20} color={theme.colors.textSecondary} />
                    </Pressable>
                  </View>

                  <View style={styles.body}>
                    <ThemedText
                      style={{
                        color: theme.colors.text,
                        marginBottom: 16,
                        textAlign: "center",
                      }}
                    >
                      Escribe la palabra{" "}
                      <ThemedText
                        style={{
                          fontWeight: "700",
                          color: theme.colors.destructive,
                        }}
                      >
                        CERRAR
                      </ThemedText>{" "}
                      para confirmar:
                    </ThemedText>
                    <TextInput
                      value={input}
                      onChangeText={setInput}
                      autoCapitalize="characters"
                      autoFocus
                      style={[
                        styles.confirmInput,
                        {
                          borderColor: theme.colors.border,
                          color: theme.colors.text,
                          backgroundColor: theme.colors.input,
                        },
                      ]}
                      placeholder="CERRAR"
                      placeholderTextColor={theme.colors.muted}
                    />
                    {input.length > 0 && input.trim() !== CONFIRM_WORD && (
                      <ThemedText
                        style={{
                          color: theme.colors.destructive,
                          fontSize: 12,
                          marginTop: 8,
                        }}
                      >
                        Debes escribir exactamente “CERRAR”.
                      </ThemedText>
                    )}
                  </View>

                  <View
                    style={[
                      styles.footer,
                      { borderTopColor: theme.colors.border },
                    ]}
                  >
                    <Pressable
                      onPress={() => setStep(0)}
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
                        Volver
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={handleFinalConfirm}
                      disabled={!canConfirmFinal}
                      style={[
                        styles.button,
                        {
                          backgroundColor: canConfirmFinal
                            ? theme.colors.destructive
                            : theme.colors.disabled,
                        },
                      ]}
                    >
                      <ThemedText
                        style={{
                          color: canConfirmFinal
                            ? theme.colors.destructiveForeground
                            : theme.colors.disabledForeground,
                          fontWeight: "600",
                        }}
                      >
                        {submitting ? "Cerrando..." : "Cerrar definitivamente"}
                      </ThemedText>
                    </Pressable>
                  </View>
                </MotiView>
              )}
            </View>
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
  confirmInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "700",
    width: "100%",
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
