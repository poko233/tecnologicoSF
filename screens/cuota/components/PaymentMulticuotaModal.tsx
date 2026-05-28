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
  onPaymentSuccess: () => void;
}

export const PaymentMulticuotaModal: React.FC<Props> = ({
  visible,
  cuotas,
  idUsuario,
  onClose,
  onPaymentSuccess,
}) => {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();

  const [metodo, setMetodo] = useState<MetodoPago>("EFECTIVO");
  const [comprobante, setComprobante] = useState("");
  const [observacion, setObservacion] = useState("");
  const [loading, setLoading] = useState(false);

  const montoTotal = useMemo(
    () =>
      cuotas.reduce(
        (sum, c) => sum + Math.max(0, c.monto - (c.descuento || 0)),
        0,
      ),
    [cuotas],
  );

  const handleConfirm = async () => {
    if (cuotas.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        idUsuario,
        cuotas: cuotas.map((c) => c.idCuota),
        metodo,
        monto: montoTotal,
        comprobante: comprobante || undefined,
        observacion: observacion || undefined,
      };
      await pagoService.registrarPago(payload);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onPaymentSuccess();
      onClose();
    } catch (error: any) {
      // Manejado por capas superiores
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  // --- Configuración de Layout Ampliado para Escritorio ---
  // Incrementamos a 680px para dar la máxima holgura horizontal a los textos
  const containerMaxWidth = isMobile ? "95%" : 800;
  const contentPadding = isMobile ? 16 : 28;
  const listMaxHeight = isMobile ? 160 : 240;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center px-4"
        style={{ backgroundColor: theme.colors.overlay }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 25 }}
          className="w-full rounded-2xl shadow-2xl"
          style={{
            backgroundColor: theme.colors.card,
            maxWidth: containerMaxWidth,
            maxHeight: "85%", // Altura controlada para evitar desbordes verticales en pantallas chicas
            overflow: "hidden", // Enmascara los bordes exteriores del modal
          }}
        >
          {/* Header */}
          <View
            className="flex-row items-center justify-between py-4.5 border-b"
            style={{
              borderColor: theme.colors.border,
              paddingHorizontal: contentPadding,
            }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="wallet-outline"
                size={22}
                color={theme.colors.primary}
              />
              <Text
                className="text-lg font-bold tracking-tight"
                style={{ color: theme.colors.text }}
              >
                Registrar Pago Múltiple
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              className="p-1 rounded-full active:opacity-60"
            >
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          {/* Cuerpo del Modal */}
          <View style={{ padding: contentPadding, gap: 20 }}>
            {/* Lista de Cuotas Seleccionadas */}
            <View className="gap-2">
              <Text
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: theme.colors.textSecondary }}
              >
                Cuotas Seleccionadas ({cuotas.length})
              </Text>

              {/* Contenedor de la lista con bordes redondeados forzados */}
              <View
                style={{
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  maxHeight: listMaxHeight,
                  backgroundColor:
                    theme.colors.backgroundSecondary || "#151f32",
                  overflow: "hidden", // Corta el scrollbar dentro del radio del borde
                }}
              >
                <FlatList
                  data={cuotas}
                  keyExtractor={(item) => item.idCuota.toString()}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  renderItem={({ item }) => (
                    <View
                      className="flex-row justify-between items-center py-3 border-b"
                      style={{ borderColor: theme.colors.divider || "#22314d" }}
                    >
                      <View className="flex-row items-center gap-3 flex-1 pr-2">
                        <Ionicons
                          name={
                            item.tipo === "MATRICULA"
                              ? "receipt-outline"
                              : "calendar-outline"
                          }
                          size={15}
                          color={theme.colors.textTertiary}
                        />
                        <Text
                          className="text-xs font-medium"
                          style={{ color: theme.colors.text }}
                          numberOfLines={1}
                        >
                          {item.tipo === "MATRICULA"
                            ? "Matrícula"
                            : `Cuota N° ${item.numeroCuota}`}
                        </Text>
                      </View>
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: theme.colors.text }}
                      >
                        {(item.monto - (item.descuento || 0)).toFixed(2)} Bs.
                      </Text>
                    </View>
                  )}
                />
              </View>
            </View>

            {/* Resumen de Monto Total */}
            <View
              className="flex-row justify-between items-center py-4 px-5 rounded-xl border border-dashed"
              style={{
                backgroundColor: theme.colors.backgroundSecondary || "#151f32",
                borderColor: theme.colors.primary + "40",
              }}
            >
              <Text
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: theme.colors.textSecondary }}
              >
                Total Neto a Liquidar
              </Text>
              <Text
                className="text-xl font-black"
                style={{ color: theme.colors.primary }}
              >
                {montoTotal.toFixed(2)} Bs.
              </Text>
            </View>

            {/* Selector de Métodos de Pago */}
            <View className="gap-2">
              <Text
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: theme.colors.textSecondary }}
              >
                Método de Pago Preferente
              </Text>
              <View className="flex-row gap-3 w-full">
                {(
                  ["EFECTIVO", "TRANSFERENCIA", "TARJETA", "QR"] as MetodoPago[]
                ).map((m) => {
                  const isActive = metodo === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setMetodo(m)}
                      className="flex-1 py-3 rounded-xl items-center justify-center border"
                      style={{
                        backgroundColor: isActive
                          ? theme.colors.primary
                          : theme.colors.backgroundSecondary || "#151f32",
                        borderColor: isActive
                          ? theme.colors.primary
                          : theme.colors.border,
                      }}
                    >
                      <Text
                        className="text-xs font-bold tracking-wide text-center"
                        style={{
                          color: isActive
                            ? theme.colors.primaryForeground
                            : theme.colors.textSecondary,
                        }}
                        numberOfLines={1}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Formulario Inputs */}
            <View className="flex-row gap-4">
              <View className="flex-1">
                <TextInput
                  placeholder="N° Comprobante (opcional)"
                  placeholderTextColor={theme.colors.textMuted || "#64748b"}
                  value={comprobante}
                  onChangeText={setComprobante}
                  className="rounded-xl p-3 border text-xs"
                  style={{
                    backgroundColor:
                      theme.colors.backgroundSecondary || "#151f32",
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  }}
                />
              </View>

              <View className="flex-1">
                <TextInput
                  placeholder="Observaciones"
                  placeholderTextColor={theme.colors.textMuted || "#64748b"}
                  value={observacion}
                  onChangeText={setObservacion}
                  className="rounded-xl p-3 border text-xs"
                  style={{
                    backgroundColor:
                      theme.colors.backgroundSecondary || "#151f32",
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  }}
                />
              </View>
            </View>
          </View>

          {/* Footer */}
          <View
            className="flex-row justify-end py-4.5 border-t"
            style={{
              borderColor: theme.colors.border,
              paddingHorizontal: contentPadding,
              gap: 14,
            }}
          >
            <Pressable
              onPress={onClose}
              className="px-4 py-2.5 rounded-xl active:opacity-50"
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: theme.colors.textSecondary }}
              >
                Cancelar Operación
              </Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl flex-row items-center justify-center min-w-[160px]"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text
                  className="text-xs font-bold"
                  style={{ color: theme.colors.primaryForeground }}
                >
                  Confirmar Transacción
                </Text>
              )}
            </Pressable>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};
