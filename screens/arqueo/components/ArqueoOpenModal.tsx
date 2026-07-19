// screens/arqueo/components/ArqueoOpenModal.tsx
import { BlurView } from "expo-blur";
import { ChevronDown, X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { useArqueo } from "../hooks/useArqueo";

interface ArqueoOpenModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TURNOS = ["Mañana", "Tarde", "Noche"];

export default function ArqueoOpenModal({
  visible,
  onClose,
  onSuccess,
}: ArqueoOpenModalProps) {
  const { theme } = useTheme();
  const { openArqueo } = useArqueo();
  const [turno, setTurno] = useState("Mañana");
  const [saldoAnterior, setSaldoAnterior] = useState("0");
  const [loading, setLoading] = useState(false);
  const [showTurnoOptions, setShowTurnoOptions] = useState(false);

  const handleOpen = async () => {
    const saldo = parseFloat(saldoAnterior);
    if (isNaN(saldo) || saldo < 0) {
      Toast.show({
        type: "error",
        text1: "Saldo inválido",
        text2: "Debe ser un número mayor o igual a 0",
      });
      return;
    }
    setLoading(true);
    try {
      await openArqueo(turno, saldo);
      Toast.show({
        type: "success",
        text1: "Turno abierto",
        text2: `Arqueo "${turno}" iniciado`,
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "No se pudo abrir el turno",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <Modal transparent visible={visible} onRequestClose={onClose}>
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
                // ✅ Animación de salida RÁPIDA para evitar el retraso de 1 segundo
                exitTransition={{
                  type: "timing",
                  duration: 180,
                }}
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
                {/* Header */}
                <View
                  style={[
                    styles.header,
                    { borderBottomColor: theme.colors.border },
                  ]}
                >
                  <ThemedText
                    style={[styles.title, { color: theme.colors.text }]}
                  >
                    Abrir nuevo turno
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

                {/* Body */}
                <View style={[styles.body, { zIndex: 1 }]}>
                  {/* Campo Turno (Selector) */}
                  <View style={[styles.field, { zIndex: 10 }]}>
                    <ThemedText
                      style={[styles.label, { color: theme.colors.text }]}
                    >
                      Turno
                    </ThemedText>
                    <Pressable
                      onPress={() => setShowTurnoOptions(!showTurnoOptions)}
                      style={[
                        styles.selectTrigger,
                        {
                          backgroundColor: theme.colors.input,
                          borderColor: theme.colors.inputBorder,
                        },
                      ]}
                    >
                      <ThemedText style={{ color: theme.colors.text }}>
                        {turno}
                      </ThemedText>
                      <ChevronDown size={18} color={theme.colors.textMuted} />
                    </Pressable>

                    {/* Dropdown animado (se superpone al Footer gracias al zIndex) */}
                    {showTurnoOptions && (
                      <Animated.View
                        entering={FadeIn.duration(150)}
                        exiting={FadeOut.duration(100)}
                        style={[
                          styles.optionsContainer,
                          {
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.border,
                            shadowColor: theme.colors.shadow,
                          },
                        ]}
                      >
                        {TURNOS.map((option, index) => (
                          <Pressable
                            key={option}
                            style={[
                              styles.optionItem,
                              {
                                borderBottomWidth:
                                  index === TURNOS.length - 1 ? 0 : 1,
                                borderBottomColor: theme.colors.border,
                              },
                              option === turno && {
                                backgroundColor: theme.colors.primarySubtle,
                              },
                            ]}
                            onPress={() => {
                              setTurno(option);
                              setShowTurnoOptions(false);
                            }}
                          >
                            <ThemedText style={{ color: theme.colors.text }}>
                              {option}
                            </ThemedText>
                            {option === turno && (
                              <View
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: theme.colors.primary,
                                }}
                              />
                            )}
                          </Pressable>
                        ))}
                      </Animated.View>
                    )}
                  </View>

                  {/* Campo Saldo anterior */}
                  <View style={[styles.field, { zIndex: 1 }]}>
                    <ThemedText
                      style={[styles.label, { color: theme.colors.text }]}
                    >
                      Saldo anterior (Bs)
                    </ThemedText>
                    <TextInput
                      value={saldoAnterior}
                      onChangeText={setSaldoAnterior}
                      keyboardType="numeric"
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.input,
                          borderColor: theme.colors.inputBorder,
                          color: theme.colors.text,
                        },
                      ]}
                      placeholder="0"
                      placeholderTextColor={theme.colors.textMuted}
                    />
                  </View>
                </View>

                {/* Footer */}
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
                    onPress={handleOpen}
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
                    <ThemedText style={styles.applyText}>
                      {loading ? "Abriendo..." : "Abrir turno"}
                    </ThemedText>
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
    overflow: "hidden", // ✅ Mantenemos el hidden para que los bordes sean perfectos
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
  field: { gap: 6, position: "relative" },
  label: { fontSize: 14, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  // ✅ Estilos del Selector
  selectTrigger: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 999, // ✅ Se pone por encima de todo
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
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
