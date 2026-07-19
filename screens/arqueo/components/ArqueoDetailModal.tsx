// screens/arqueo/components/ArqueoDetailModal.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { formatDateTimeNatural } from "@/utils/dateHelpers"; // ✅ Con hora
import { BlurView } from "expo-blur";
import { X } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { arqueoService } from "../services/arqueo.service";
import { Arqueo, Egreso, Ingreso, Pago } from "../types/arqueo.types";

interface ArqueoDetailModalProps {
  visible: boolean;
  arqueoId: number;
  onClose: () => void;
}

const tipoMap: Record<string, string> = {
  MATRICULA: "MATRICULA",
  MENSUAL: "MENSUALIDAD",
  CONVALIDACION: "CONVALIDACION",
};

export function ArqueoDetailModal({
  visible,
  arqueoId,
  onClose,
}: ArqueoDetailModalProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [arqueo, setArqueo] = useState<Arqueo | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [egresos, setEgresos] = useState<Egreso[]>([]);

  useEffect(() => {
    if (visible && arqueoId) {
      loadArqueoDetail(arqueoId);
    }
  }, [visible, arqueoId]);

  const loadArqueoDetail = async (id: number) => {
    setLoading(true);
    try {
      const response = await arqueoService.getById(id);
      const data = response.data;
      setArqueo(data);
      setPagos(data.pagos || []);
      setIngresos(data.ingresos || []);
      setEgresos(data.egresos || []);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cargar el detalle",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !arqueo) return null;

  // ---- Cálculos (Igual que en el cierre) ----
  const totalPagos = pagos.reduce((s, p) => s + p.monto, 0);
  const totalIngresosManual = ingresos
    .filter((i) => i.estado !== "ANULADO")
    .reduce((s, i) => s + i.monto, 0);
  const totalEgresos = egresos
    .filter((e) => e.estado !== "ANULADO")
    .reduce((s, e) => s + e.monto, 0);
  const saldoAnterior = arqueo.saldo_anterior || 0;
  const cajaEsperadaGeneral =
    saldoAnterior + totalPagos + totalIngresosManual - totalEgresos;

  const totalesPorMetodo = (() => {
    let efectivo = 0,
      tarjeta = 0,
      qr = 0,
      transferencia = 0;

    pagos.forEach((p) => {
      const monto = p.monto || 0;
      if (p.metodo === "EFECTIVO") efectivo += monto;
      else if (p.metodo === "TARJETA") tarjeta += monto;
      else if (p.metodo === "QR") qr += monto;
      else if (p.metodo === "TRANSFERENCIA") transferencia += monto;
    });

    ingresos.forEach((i) => {
      if (i.estado === "ANULADO") return;
      const monto = i.monto || 0;
      if (i.metodo === "EFECTIVO") efectivo += monto;
      else if (i.metodo === "TARJETA") tarjeta += monto;
      else if (i.metodo === "QR") qr += monto;
      else if (i.metodo === "TRANSFERENCIA") transferencia += monto;
    });

    egresos.forEach((e) => {
      if (e.estado === "ANULADO") return;
      const monto = e.monto || 0;
      if (e.metodo === "EFECTIVO") efectivo -= monto;
      else if (e.metodo === "TARJETA") tarjeta -= monto;
      else if (e.metodo === "QR") qr -= monto;
      else if (e.metodo === "TRANSFERENCIA") transferencia -= monto;
    });

    return { efectivo, tarjeta, qr, transferencia };
  })();
  const totalMovimientos =
    totalesPorMetodo.efectivo +
    totalesPorMetodo.tarjeta +
    totalesPorMetodo.qr +
    totalesPorMetodo.transferencia;

  // ---- Caja esperada en efectivo ----
  const expectedEfectivo = (() => {
    let efectivo = 0;
    pagos.forEach((p) => {
      if (p.metodo === "EFECTIVO") efectivo += p.monto;
    });
    ingresos.forEach((i) => {
      if (i.metodo === "EFECTIVO" && i.estado !== "ANULADO")
        efectivo += i.monto;
    });
    egresos.forEach((e) => {
      if (e.metodo === "EFECTIVO" && e.estado !== "ANULADO")
        efectivo -= e.monto;
    });
    return efectivo;
  })();

  const nombreUsuario =
    typeof arqueo.usuario !== "string"
      ? `${arqueo.usuario.nombres || ""} ${arqueo.usuario.apellidoPaterno || ""}`.trim() ||
        arqueo.usuario.usuario
      : arqueo.usuario;

  // ---- Datos para tablas ----
  const cuotasConPago = pagos.flatMap((pago, pagoIndex) =>
    (pago.cuotas || []).map((cuota) => ({
      ...cuota,
      pagoIndex: pagoIndex + 1,
    })),
  );

  const ingresosCombinados = (() => {
    const list: any[] = [];
    pagos.forEach((pago) => {
      list.push({
        id: `pago-${pago.id}`,
        fecha: pago.fecha,
        concepto:
          pago.cuotas && pago.cuotas.length > 0
            ? [
                ...new Set(pago.cuotas.map((c) => tipoMap[c.tipo] || c.tipo)),
              ].join(" + ")
            : "Pago",
        metodo: pago.metodo,
        monto: pago.monto,
        estado: "VALIDO",
        tipo: "Pago Estudiante",
      });
    });
    ingresos.forEach((ing) => {
      list.push({
        id: `ingreso-${ing.id}`,
        fecha: ing.fecha_registro,
        concepto: ing.tipo_transaccion || ing.detalle || "Sin concepto",
        metodo: ing.metodo,
        monto: ing.monto,
        estado: ing.estado,
        tipo: "Ingreso Manual",
      });
    });
    return list.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
  })();

  const tieneConteo = arqueo.conteo && arqueo.conteo.billete_200 !== null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
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
              <View>
                <ThemedText
                  style={[styles.title, { color: theme.colors.text }]}
                >
                  Detalle de Arqueo #{arqueo.id}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.subtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {arqueo.estado === "TERMINADO" ? "Cerrado" : "Abierto"} el{" "}
                  {formatDateTimeNatural(arqueo.fecha_apertura)}
                  {nombreUsuario && ` por ${nombreUsuario}`}
                </ThemedText>
              </View>
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

            {/* Scrollable body */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              ) : (
                <>
                  {/* ===== RESUMEN ===== */}
                  <View style={styles.section}>
                    <ThemedText
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Resumen de caja
                    </ThemedText>
                    <View style={styles.resumenGrid}>
                      <ResumenItem
                        label="Saldo anterior"
                        value={saldoAnterior}
                        theme={theme}
                      />
                      <ResumenItem
                        label="Total pagos"
                        value={totalPagos}
                        theme={theme}
                      />
                      <ResumenItem
                        label="Total ingresos"
                        value={totalIngresosManual}
                        theme={theme}
                      />
                      <ResumenItem
                        label="Total egresos"
                        value={totalEgresos}
                        theme={theme}
                      />
                      <ResumenItem
                        label="Caja esperada"
                        value={cajaEsperadaGeneral}
                        theme={theme}
                        highlight
                      />
                    </View>
                  </View>

                  {/* ===== TOTALES POR MÉTODO ===== */}
                  <View style={styles.section}>
                    <ThemedText
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Totales por método
                    </ThemedText>
                    <View style={styles.resumenGrid}>
                      <ResumenItem
                        label="Efectivo"
                        value={totalesPorMetodo.efectivo}
                        theme={theme}
                      />
                      <ResumenItem
                        label="Tarjeta"
                        value={totalesPorMetodo.tarjeta}
                        theme={theme}
                      />
                      <ResumenItem
                        label="QR"
                        value={totalesPorMetodo.qr}
                        theme={theme}
                      />
                      <ResumenItem
                        label="Transferencia"
                        value={totalesPorMetodo.transferencia}
                        theme={theme}
                      />
                      <ResumenItem
                        label="Total movimientos"
                        value={totalMovimientos}
                        theme={theme}
                        highlight
                      />
                    </View>
                  </View>

                  {/* ===== INGRESOS ===== */}
                  <View style={styles.section}>
                    <ThemedText
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Ingresos
                    </ThemedText>
                    {ingresosCombinados.length === 0 ? (
                      <ThemedText style={{ color: theme.colors.textSecondary }}>
                        No hay ingresos registrados
                      </ThemedText>
                    ) : (
                      <View style={styles.tableWrapper}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ minWidth: "100%" }}
                        >
                          <View style={[styles.table, { flex: 1 }]}>
                            <View
                              style={[
                                styles.tableRow,
                                styles.tableHeader,
                                {
                                  backgroundColor:
                                    theme.colors.backgroundSecondary,
                                },
                              ]}
                            >
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                #
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Fecha
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Concepto
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Método
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Monto
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Tipo
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Estado
                              </ThemedText>
                            </View>
                            {ingresosCombinados.map((item, idx) => (
                              <View
                                key={item.id}
                                style={[
                                  styles.tableRow,
                                  { borderBottomColor: theme.colors.border },
                                ]}
                              >
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {idx + 1}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {formatDateTimeNatural(item.fecha)}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {item.concepto}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {item.metodo}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {item.monto.toFixed(2)}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {item.tipo}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {item.estado === "ANULADO"
                                    ? "ANULADO"
                                    : "VÁLIDO"}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* ===== EGRESOS ===== */}
                  <View style={styles.section}>
                    <ThemedText
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Egresos registrados
                    </ThemedText>
                    {egresos.length === 0 ? (
                      <ThemedText style={{ color: theme.colors.textSecondary }}>
                        No hay egresos en este turno
                      </ThemedText>
                    ) : (
                      <View style={styles.tableWrapper}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ minWidth: "100%" }}
                        >
                          <View style={[styles.table, { flex: 1 }]}>
                            <View
                              style={[
                                styles.tableRow,
                                styles.tableHeader,
                                {
                                  backgroundColor:
                                    theme.colors.backgroundSecondary,
                                },
                              ]}
                            >
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                #
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Fecha
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Concepto
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Método
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Monto
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Estado
                              </ThemedText>
                            </View>
                            {egresos.map((eg, idx) => (
                              <View
                                key={eg.id}
                                style={[
                                  styles.tableRow,
                                  { borderBottomColor: theme.colors.border },
                                ]}
                              >
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {idx + 1}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {formatDateTimeNatural(eg.fecha_registro)}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {eg.tipo_transaccion ||
                                    eg.detalle ||
                                    "Sin concepto"}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {eg.metodo}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {eg.monto.toFixed(2)}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {eg.estado === "ANULADO"
                                    ? "ANULADO"
                                    : "VÁLIDO"}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* ===== PAGOS ===== */}
                  <View style={styles.section}>
                    <ThemedText
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Pagos registrados
                    </ThemedText>
                    {pagos.length === 0 ? (
                      <ThemedText style={{ color: theme.colors.textSecondary }}>
                        No hay pagos en este arqueo
                      </ThemedText>
                    ) : (
                      <View style={styles.tableWrapper}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ minWidth: "100%" }}
                        >
                          <View style={[styles.table, { flex: 1 }]}>
                            <View
                              style={[
                                styles.tableRow,
                                styles.tableHeader,
                                {
                                  backgroundColor:
                                    theme.colors.backgroundSecondary,
                                },
                              ]}
                            >
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                #
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Fecha
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Estudiante
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Concepto
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Método
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Monto
                              </ThemedText>
                            </View>
                            {pagos.map((pago, idx) => (
                              <View
                                key={pago.id}
                                style={[
                                  styles.tableRow,
                                  { borderBottomColor: theme.colors.border },
                                ]}
                              >
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {idx + 1}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {formatDateTimeNatural(pago.fecha)}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {pago.estudiante?.nombres}{" "}
                                  {pago.estudiante?.apellidoPaterno}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {pago.cuotas && pago.cuotas.length > 0
                                    ? [
                                        ...new Set(
                                          pago.cuotas.map(
                                            (c) => tipoMap[c.tipo] || c.tipo,
                                          ),
                                        ),
                                      ].join(" + ")
                                    : "Pago"}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {pago.metodo}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {pago.monto.toFixed(2)}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* ===== CUOTAS ===== */}
                  <View style={styles.section}>
                    <ThemedText
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Cuotas pagadas
                    </ThemedText>
                    {cuotasConPago.length === 0 ? (
                      <ThemedText style={{ color: theme.colors.textSecondary }}>
                        No hay cuotas asociadas
                      </ThemedText>
                    ) : (
                      <View style={styles.tableWrapper}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ minWidth: "100%" }}
                        >
                          <View style={[styles.table, { flex: 1 }]}>
                            <View
                              style={[
                                styles.tableRow,
                                styles.tableHeader,
                                {
                                  backgroundColor:
                                    theme.colors.backgroundSecondary,
                                },
                              ]}
                            >
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                #
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Pago
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Período
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Monto
                              </ThemedText>
                            </View>
                            {cuotasConPago.map((cuota, idx) => (
                              <View
                                key={`${cuota.id}-${idx}`}
                                style={[
                                  styles.tableRow,
                                  { borderBottomColor: theme.colors.border },
                                ]}
                              >
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {idx + 1}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {cuota.pagoIndex}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {cuota.tipo === "MATRICULA"
                                    ? "Matrícula"
                                    : cuota.tipo === "MENSUAL"
                                      ? `Mes ${cuota.numeroCuota}`
                                      : `${cuota.numeroCuota}`}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {cuota.monto.toFixed(2)}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </>
              )}
            </ScrollView>

            {/* Footer */}
            <View
              style={[styles.footer, { borderTopColor: theme.colors.border }]}
            >
              <MotiPressable
                onPress={onClose}
                animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
              >
                <ThemedText
                  style={{
                    color: theme.colors.textSecondary,
                    fontWeight: "600",
                  }}
                >
                  Cerrar
                </ThemedText>
              </MotiPressable>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

// ---- Componentes auxiliares ----
const ResumenItem = ({ label, value, theme, highlight = false }: any) => (
  <View
    style={[
      styles.resumenItem,
      { backgroundColor: theme.colors.backgroundSecondary },
    ]}
  >
    <ThemedText style={{ fontSize: 12, color: theme.colors.textSecondary }}>
      {label}
    </ThemedText>
    <ThemedText
      style={[
        styles.resumenValue,
        { color: theme.colors.text },
        highlight && { fontWeight: "800", color: theme.colors.primary },
      ]}
    >
      {value.toFixed(2)} Bs
    </ThemedText>
  </View>
);

const ConteoItem = ({ label, value, theme }: any) => (
  <View
    style={[
      styles.conteoItem,
      {
        backgroundColor: theme.colors.backgroundSecondary,
        borderColor: theme.colors.border,
        borderWidth: 1,
      },
    ]}
  >
    <ThemedText
      style={{
        fontSize: 12,
        fontWeight: "600",
        color: theme.colors.textSecondary,
      }}
    >
      {label}
    </ThemedText>
    <ThemedText
      style={{ fontSize: 14, fontWeight: "700", color: theme.colors.text }}
    >
      {value}
    </ThemedText>
  </View>
);

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: {
    width: "95%",
    maxWidth: 800,
    maxHeight: "90%",
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
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 2 },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { padding: 24, gap: 24 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  resumenGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  resumenItem: {
    flex: 1,
    minWidth: 100,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  resumenValue: { fontSize: 14, fontWeight: "600", marginTop: 4 },
  conteoItem: {
    flex: 1,
    minWidth: 80,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  tableWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    width: "100%",
  },
  table: {
    flexDirection: "column",
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tableHeader: { borderBottomWidth: 2 },
  tableCellHeader: {
    flex: 1,
    fontWeight: "700",
    fontSize: 12,
    minWidth: 80,
    paddingHorizontal: 4,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    minWidth: 80,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
});
