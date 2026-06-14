// screens/cuota/components/PaymentMulticuotaModal.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTheme } from "../../../theme/useTheme";
import { pagoService } from "../services/pago.service";
import { Cuota } from "../types/cuota.types";
import { MetodoPago } from "../types/pago.types";

interface Props {
  visible: boolean;
  cuotas: Cuota[];
  idUsuario: number;
  onClose: () => void;
  /** Se llama tras un registro exitoso. Si el backend devuelve el id del pago, se pasa aquí. */
  onPaymentSuccess: (idPago?: number) => void;
}

// Icono y etiqueta por método de pago
const METODOS: { id: MetodoPago; label: string; icon: string }[] = [
  { id: "EFECTIVO",      label: "Efectivo",    icon: "cash-outline" },
  { id: "TRANSFERENCIA", label: "Transfer.",    icon: "swap-horizontal-outline" },
  { id: "TARJETA",       label: "Tarjeta",      icon: "card-outline" },
  { id: "QR",            label: "QR",           icon: "qr-code-outline" },
];

export const PaymentMulticuotaModal: React.FC<Props> = ({
  visible,
  cuotas,
  idUsuario,
  onClose,
  onPaymentSuccess,
}) => {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();

  const [metodo, setMetodo]           = useState<MetodoPago>("EFECTIVO");
  const [comprobante, setComprobante] = useState("");
  const [observacion, setObservacion] = useState("");
  const [loading, setLoading]         = useState(false);

  const montoTotal = useMemo(
    () => cuotas.reduce((sum, c) => sum + Math.max(0, c.monto - (c.descuento || 0)), 0),
    [cuotas],
  );

  const handleConfirm = async () => {
    if (cuotas.length === 0) return;
    setLoading(true);
    try {
      const response = await pagoService.registrarPago({
        idUsuario,
        cuotas: cuotas.map((c) => c.idCuota),
        metodo,
        monto: montoTotal,
        comprobante: comprobante || undefined,
        observacion: observacion || undefined,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const idPago = (response?.data as any)?.id || (response?.data as any)?.idPago;

      onPaymentSuccess(idPago);
      onClose();
    } catch (_) {
      // Manejado por capas superiores
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  const maxWidth      = isMobile ? "95%" : 520;
  const px            = isMobile ? 16 : 24;
  const listMaxHeight = isMobile ? 160 : 220;

  // ─── Colores locales para no repetir accesos ─────────────────────────────
  const c = theme.colors;
  const bgSecondary = c.backgroundSecondary ?? "#F4F6FA";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>

      {/* ── Overlay ── */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 16, backgroundColor: c.overlay }}>

        <MotiView
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 22, stiffness: 200 }}
          style={{
            width: "100%",
            maxWidth,
            backgroundColor: c.card,
            borderRadius: 18,
            overflow: "hidden",
            // sombra suave
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 24,
            elevation: 10,
          }}
        >

          {/* ══════════════ HEADER ══════════════ */}
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: px,
            paddingVertical: 14,
            borderBottomWidth: 0.5,
            borderBottomColor: c.border,
          }}>
            {/* Icono + Título */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{
                width: 34, height: 34,
                borderRadius: 10,
                backgroundColor: c.primary + "18",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Ionicons name="wallet-outline" size={18} color={c.primary} />
              </View>
              <Text style={{ fontSize: 15, fontWeight: "600", color: c.text }}>
                Registrar pago múltiple
              </Text>
            </View>

            {/* Botón cerrar */}
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => ({
                width: 30, height: 30,
                borderRadius: 15,
                borderWidth: 0.5,
                borderColor: c.border,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <Ionicons name="close" size={16} color={c.textMuted} />
            </Pressable>
          </View>

          {/* ══════════════ BODY ══════════════ */}
          <View style={{ paddingHorizontal: px, paddingTop: 20, paddingBottom: 16, gap: 16 }}>

            {/* ── Cuotas seleccionadas ── */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: c.textSecondary, textTransform: "uppercase", letterSpacing: 0.7 }}>
                Cuotas seleccionadas ({cuotas.length})
              </Text>

              <View style={{
                borderWidth: 0.5,
                borderColor: c.border,
                borderRadius: 12,
                maxHeight: listMaxHeight,
                backgroundColor: bgSecondary,
                overflow: "hidden",
              }}>
                <FlatList
                  data={cuotas}
                  keyExtractor={(item) => item.idCuota.toString()}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                  renderItem={({ item, index }) => (
                    <View style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 14,
                      paddingVertical: 11,
                      borderBottomWidth: index < cuotas.length - 1 ? 0.5 : 0,
                      borderBottomColor: c.border,
                    }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                        <Ionicons
                          name={item.tipo === "MATRICULA" ? "receipt-outline" : "calendar-outline"}
                          size={14}
                          color={c.textMuted}
                        />
                        <Text style={{ fontSize: 13, color: c.text }} numberOfLines={1}>
                          {item.tipo === "MATRICULA" ? "Matrícula" : `Cuota N° ${item.numeroCuota}`}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: c.text }}>
                        {(item.monto - (item.descuento || 0)).toFixed(2)} Bs.
                      </Text>
                    </View>
                  )}
                />
              </View>
            </View>

            {/* ── Total ── */}
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderRadius: 12,
              borderWidth: 0.5,
              borderColor: c.border,
              backgroundColor: bgSecondary,
            }}>
              <Text style={{ fontSize: 13, color: c.textSecondary }}>Total neto a liquidar</Text>
              <Text style={{ fontSize: 22, fontWeight: "700", color: c.primary }}>
                {montoTotal.toFixed(2)} Bs.
              </Text>
            </View>

            {/* ── Método de pago ── */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: c.textSecondary, textTransform: "uppercase", letterSpacing: 0.7 }}>
                Método de pago
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {METODOS.map(({ id, label, icon }) => {
                  const active = metodo === id;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => setMetodo(id)}
                      style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 10,
                        borderWidth: active ? 1.5 : 0.5,
                        borderColor: active ? c.primary : c.border,
                        backgroundColor: active ? c.primary + "14" : bgSecondary,
                        alignItems: "center",
                        gap: 4,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Ionicons
                        name={icon as any}
                        size={17}
                        color={active ? c.primary : c.textMuted}
                      />
                      <Text style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: active ? c.primary : c.textSecondary,
                        textAlign: "center",
                      }}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* ── Inputs ── */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Comprobante */}
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: c.textSecondary, textTransform: "uppercase", letterSpacing: 0.7 }}>
                  N° comprobante
                </Text>
                <TextInput
                  placeholder="Opcional"
                  placeholderTextColor={c.textMuted}
                  value={comprobante}
                  onChangeText={setComprobante}
                  style={{
                    backgroundColor: bgSecondary,
                    borderWidth: 0.5,
                    borderColor: c.border,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    fontSize: 13,
                    color: c.text,
                  }}
                />
              </View>

              {/* Observaciones */}
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={{ fontSize: 11, fontWeight: "600", color: c.textSecondary, textTransform: "uppercase", letterSpacing: 0.7 }}>
                  Observaciones
                </Text>
                <TextInput
                  placeholder="Opcional"
                  placeholderTextColor={c.textMuted}
                  value={observacion}
                  onChangeText={setObservacion}
                  style={{
                    backgroundColor: bgSecondary,
                    borderWidth: 0.5,
                    borderColor: c.border,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    fontSize: 13,
                    color: c.text,
                  }}
                />
              </View>
            </View>

          </View>

          {/* ══════════════ FOOTER ══════════════ */}
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingHorizontal: px,
            paddingVertical: 14,
            borderTopWidth: 0.5,
            borderTopColor: c.border,
            backgroundColor: bgSecondary,
            gap: 10,
          }}>
            {/* Cancelar */}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 10,
                borderWidth: 0.5,
                borderColor: c.border,
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <Text style={{ fontSize: 13, fontWeight: "500", color: c.textSecondary }}>
                Cancelar
              </Text>
            </Pressable>

            {/* Confirmar */}
            <Pressable
              onPress={handleConfirm}
              disabled={loading}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 20,
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor: c.primary,
                opacity: pressed || loading ? 0.7 : 1,
                minWidth: 160,
                justifyContent: "center",
              })}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={15} color={c.primaryForeground} />
                  <Text style={{ fontSize: 13, fontWeight: "600", color: c.primaryForeground }}>
                    Confirmar transacción
                  </Text>
                </>
              )}
            </Pressable>
          </View>

        </MotiView>
      </View>
    </Modal>
  );
};