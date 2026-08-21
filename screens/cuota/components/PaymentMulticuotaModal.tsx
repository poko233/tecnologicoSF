// screens/cuota/components/PaymentMulticuotaModal.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useEffect, useMemo, useState } from "react";
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
import Toast from "react-native-toast-message";
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

  // Generar número de comprobante automático al abrir el modal
  const generarNumeroComprobante = () => {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
  };

  const [metodo, setMetodo]           = useState<MetodoPago>("EFECTIVO");
  const [comprobante, setComprobante] = useState(generarNumeroComprobante());
  const [observacion, setObservacion] = useState("");
  const [loading, setLoading]         = useState(false);

  // Montos parciales editables por cuota
  const [montosParciales, setMontosParciales] = useState<Record<number, string>>({});

  // Multas opcionales por cuota
  const [multas, setMultas] = useState<Record<number, string>>({});

  // Regenerar número de comprobante cada vez que se abre el modal
  useEffect(() => {
    if (visible) {
      setComprobante(generarNumeroComprobante());
    }
  }, [visible]);

  const montoTotal = useMemo(() => {
    return cuotas.reduce((sum, c) => {
      const montoParcial = montosParciales[c.idCuota];
      const multa = multas[c.idCuota];

      let subtotal = 0;

      // Monto a pagar (capital)
      if (montoParcial) {
        const valor = parseFloat(montoParcial);
        subtotal += isNaN(valor) ? 0 : valor;
      } else {
        // Si no hay monto parcial, usar el saldo completo
        const saldo = (c as any).saldo ?? Math.max(0, c.monto - (c.descuento ?? 0));
        subtotal += saldo;
      }

      // Multa (si hay)
      if (multa) {
        const valorMulta = parseFloat(multa);
        subtotal += isNaN(valorMulta) ? 0 : valorMulta;
      }

      return sum + subtotal;
    }, 0);
  }, [cuotas, montosParciales, multas]);

  // Actualizar monto parcial de una cuota
  const setMontoParcial = (idCuota: number, valor: string) => {
    setMontosParciales(prev => ({
      ...prev,
      [idCuota]: valor
    }));
  };

  // Actualizar multa de una cuota
  const setMulta = (idCuota: number, valor: string) => {
    setMultas(prev => ({
      ...prev,
      [idCuota]: valor
    }));
  };

  // Establecer saldo completo
  const setSaldoCompleto = (idCuota: number, saldo: number) => {
    setMontosParciales(prev => ({
      ...prev,
      [idCuota]: saldo.toFixed(2)
    }));
  };

  const handleConfirm = async () => {
    if (cuotas.length === 0) return;

    // Validar montos
    for (const cuota of cuotas) {
      const montoParcial = montosParciales[cuota.idCuota];
      if (montoParcial) {
        const valor = parseFloat(montoParcial);
        const saldo = (cuota as any).saldo || Math.max(0, cuota.monto - (cuota.descuento || 0));

        if (isNaN(valor) || valor <= 0) {
          Toast.show({
            type: "error",
            text1: "Monto inválido",
            text2: "Todos los montos deben ser mayores a 0",
          });
          return;
        }

        if (valor > saldo) {
          Toast.show({
            type: "error",
            text1: "Monto excedido",
            text2: `El monto no puede superar el saldo de Bs. ${saldo.toFixed(2)}`,
          });
          return;
        }
      }
    }

    setLoading(true);
    try {
      // Preparar datos con montos parciales y multas
      const cuotasConMontos = cuotas.map(c => {
        const montoParcial = montosParciales[c.idCuota];
        const multaStr = multas[c.idCuota];
        const saldo = (c as any).saldo ?? Math.max(0, c.monto - (c.descuento ?? 0));
        const montoAbonado = montoParcial ? parseFloat(montoParcial) : saldo;

        const payload: { idCuota: number; monto_abonado: number; multa?: number } = {
          idCuota: c.idCuota,
          monto_abonado: montoAbonado
        };

        // Agregar multa solo si hay valor
        if (multaStr) {
          const multaNum = parseFloat(multaStr);
          if (!isNaN(multaNum) && multaNum > 0) {
            payload.multa = multaNum;
          }
        }

        return payload;
      });

      const response = await pagoService.registrarPago({
        idUsuario,
        cuotas: cuotasConMontos,
        metodo,
        comprobante: comprobante || undefined,
        observacion: observacion || undefined,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const idPago = (response?.data as any)?.id || (response?.data as any)?.idPago;

      onPaymentSuccess(idPago);
      onClose();

      // Limpiar montos parciales y multas
      setMontosParciales({});
      setMultas({});
    } catch (error: any) {
      // Cerrar el modal PRIMERO para que el Toast se vea bien
      onClose();

      // Mostrar error con Toast grande DESPUÉS de cerrar el modal
      const mensaje = error?.message || error?.error || "No se pudo registrar el pago";

      // Esperar un poquito para que el modal se cierre completamente
      setTimeout(() => {
        // Si el error es por arqueo, mostrar mensaje especial
        if (mensaje.includes("arqueo") || mensaje.includes("turno")) {
          Toast.show({
            type: "error",
            text1: "Arqueo cerrado",
            text2: "Debe ABRIR UN ARQUEO antes de registrar pagos. Vaya al módulo de Arqueos.",
            visibilityTime: 6000,
            position: "top",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Error al registrar pago",
            text2: mensaje,
            visibilityTime: 4000,
          });
        }
      }, 300);
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
                  renderItem={({ item, index }) => {
                    const saldo = (item as any).saldo || Math.max(0, item.monto - (item.descuento || 0));
                    const montoParcial = montosParciales[item.idCuota] || saldo.toFixed(2);
                    const multaValue = multas[item.idCuota] || "";

                    return (
                      <View style={{
                        paddingHorizontal: 14,
                        paddingVertical: 11,
                        borderBottomWidth: index < cuotas.length - 1 ? 0.5 : 0,
                        borderBottomColor: c.border,
                        gap: 10,
                      }}>
                        {/* Primera fila: Info de cuota + Monto */}
                        <View style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                            <Ionicons
                              name={item.tipo === "MATRICULA" ? "receipt-outline" : "calendar-outline"}
                              size={14}
                              color={c.textMuted}
                            />
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 13, color: c.text }} numberOfLines={1}>
                                {item.tipo === "MATRICULA" ? "Matrícula" : `Cuota N° ${item.numeroCuota}`}
                              </Text>
                              <Text style={{ fontSize: 10, color: c.textMuted }}>
                                Saldo: {saldo.toFixed(2)} Bs.
                              </Text>
                            </View>
                          </View>

                          {/* Input editable para monto parcial */}
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <TextInput
                              style={{
                                backgroundColor: c.input,
                                borderWidth: 1,
                                borderColor: c.border,
                                borderRadius: 6,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                fontSize: 13,
                                fontWeight: "600",
                                color: c.text,
                                width: 80,
                                textAlign: "right",
                              }}
                              value={montoParcial}
                              onChangeText={(text) => setMontoParcial(item.idCuota, text)}
                              keyboardType="decimal-pad"
                              placeholder="0.00"
                              placeholderTextColor={c.textMuted}
                            />
                            <Text style={{ fontSize: 11, color: c.textMuted, width: 25 }}>Bs.</Text>

                            {/* Botón para poner saldo completo */}
                            <Pressable
                              onPress={() => setSaldoCompleto(item.idCuota, saldo)}
                              style={{
                                paddingHorizontal: 6,
                                paddingVertical: 4,
                                borderRadius: 4,
                                backgroundColor: c.primary + "20",
                              }}
                            >
                              <Text style={{ fontSize: 9, fontWeight: "600", color: c.primary }}>
                                TODO
                              </Text>
                            </Pressable>
                          </View>
                        </View>

                        {/* Segunda fila: Input de multa (opcional) */}
                        <View style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 6,
                          paddingLeft: 30,
                        }}>
                          <Text style={{ fontSize: 11, color: c.textMuted, flex: 1 }}>
                            Multa (opcional):
                          </Text>
                          <TextInput
                            style={{
                              backgroundColor: c.input,
                              borderWidth: 1,
                              borderColor: c.border,
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              fontSize: 13,
                              fontWeight: "600",
                              color: c.text,
                              width: 80,
                              textAlign: "right",
                            }}
                            value={multaValue}
                            onChangeText={(text) => setMulta(item.idCuota, text)}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            placeholderTextColor={c.textMuted}
                          />
                          <Text style={{ fontSize: 11, color: c.textMuted, width: 25 }}>Bs.</Text>
                          {/* Espacio para alinear con el botón TODO de arriba */}
                          <View style={{ width: 40 }} />
                        </View>
                      </View>
                    );
                  }}
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