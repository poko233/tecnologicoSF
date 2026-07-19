// screens/arqueo/components/ArqueoTransaccionForm.tsx
import { BlurView } from "expo-blur";
import { X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import { Skeleton } from "moti/skeleton";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { transaccionService } from "../services/transaccion.service";
import { TipoTransaccion } from "../types/transaccion.types";

interface ArqueoTransaccionFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  tipo: "INGRESO" | "EGRESO";
}

export function ArqueoTransaccionForm({
  visible,
  onClose,
  onSubmit,
  tipo,
}: ArqueoTransaccionFormProps) {
  const { theme } = useTheme();
  const [loadingTipos, setLoadingTipos] = useState(false); // 🔥 Nuevo estado
  const [tipos, setTipos] = useState<TipoTransaccion[]>([]);

  // Campos del formulario
  const [tipoTransaccionId, setTipoTransaccionId] = useState<number | "">("");
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState<
    "EFECTIVO" | "TARJETA" | "QR" | "TRANSFERENCIA"
  >("EFECTIVO");
  const [detalle, setDetalle] = useState("");
  const [comprobante, setComprobante] = useState("");

  // 🔥 Manejo del botón de retroceso en Android
  useEffect(() => {
    const onBackPress = () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );
    return () => subscription.remove();
  }, [visible, onClose]);

  // Cargar tipos de transacción al abrir el modal
  useEffect(() => {
    if (visible) {
      loadTipos();
    }
  }, [visible]);

  const loadTipos = async () => {
    setLoadingTipos(true); // 🔥 Iniciamos el skeleton
    try {
      const response = await transaccionService.getTiposTransaccion();
      setTipos(response.data.filter((t) => t.tipo === tipo));
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los tipos de transacción",
      });
    } finally {
      setLoadingTipos(false); // 🔥 Finalizamos el skeleton
    }
  };

  const handleSubmit = () => {
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ingrese un monto válido mayor a 0",
      });
      return;
    }
    setLoadingTipos(false); // Asegurar que se limpie en caso de cierre rápido
    onSubmit({
      tipo_transaccion_id: tipoTransaccionId || undefined,
      monto: montoNum,
      metodo,
      detalle: detalle || undefined,
      comprobante: comprobante || undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 120 }}
          style={[StyleSheet.absoluteFillObject, { zIndex: 999 }]}
        >
          <BlurView
            intensity={20}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
          <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
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
                  Nuevo {tipo === "INGRESO" ? "Ingreso" : "Egreso"}
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
              <View style={styles.body}>
                {/* Tipo de Transacción con Skeleton */}
                <View style={styles.field}>
                  <ThemedText
                    style={[styles.label, { color: theme.colors.text }]}
                  >
                    Tipo de Transacción
                  </ThemedText>

                  {/* 🔥 Condicional: Skeleton o Select */}
                  {loadingTipos ? (
                    <MotiView
                      from={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: "timing", duration: 300 }}
                    >
                      <Skeleton
                        colorMode={theme.dark ? "dark" : "light"}
                        width="100%"
                        height={44}
                        radius={12}
                      />
                    </MotiView>
                  ) : (
                    <View
                      style={[
                        styles.selectInput,
                        { borderColor: theme.colors.border },
                      ]}
                    >
                      <select
                        value={tipoTransaccionId}
                        onChange={(e) =>
                          setTipoTransaccionId(Number(e.target.value) || "")
                        }
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
                        <option value="">Seleccione un tipo</option>
                        {tipos.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.transaccion}
                          </option>
                        ))}
                      </select>
                    </View>
                  )}
                </View>

                <View style={styles.field}>
                  <ThemedText
                    style={[styles.label, { color: theme.colors.text }]}
                  >
                    Monto (Bs)
                  </ThemedText>
                  <TextInput
                    value={monto}
                    onChangeText={setMonto}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.input,
                        borderColor: theme.colors.inputBorder,
                        color: theme.colors.text,
                      },
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>

                <View style={styles.field}>
                  <ThemedText
                    style={[styles.label, { color: theme.colors.text }]}
                  >
                    Método de Pago
                  </ThemedText>
                  <View
                    style={[
                      styles.selectInput,
                      { borderColor: theme.colors.border },
                    ]}
                  >
                    <select
                      value={metodo}
                      onChange={(e) => setMetodo(e.target.value as any)}
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
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TARJETA">Tarjeta</option>
                      <option value="QR">QR</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                  </View>
                </View>

                <View style={styles.field}>
                  <ThemedText
                    style={[styles.label, { color: theme.colors.text }]}
                  >
                    Detalle / Glosa
                  </ThemedText>
                  <TextInput
                    value={detalle}
                    onChangeText={setDetalle}
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.input,
                        borderColor: theme.colors.inputBorder,
                        color: theme.colors.text,
                      },
                    ]}
                    placeholder="Ej: Venta de material"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>

                <View style={styles.field}>
                  <ThemedText
                    style={[styles.label, { color: theme.colors.text }]}
                  >
                    Comprobante
                  </ThemedText>
                  <TextInput
                    value={comprobante}
                    onChangeText={setComprobante}
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.input,
                        borderColor: theme.colors.inputBorder,
                        color: theme.colors.text,
                      },
                    ]}
                    placeholder="Ej: REC-001"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
              </View>

              {/* Footer */}
              <View
                style={[styles.footer, { borderTopColor: theme.colors.border }]}
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
                  disabled={loadingTipos} // También deshabilitamos si los tipos aún no cargaron
                  animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
                  style={[
                    styles.applyBtn,
                    {
                      backgroundColor: theme.colors.primary,
                      opacity: loadingTipos ? 0.5 : 1,
                    },
                  ]}
                >
                  <ThemedText style={styles.applyText}>Registrar</ThemedText>
                </MotiPressable>
              </View>
            </MotiView>
          </KeyboardAvoidingView>
        </MotiView>
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
