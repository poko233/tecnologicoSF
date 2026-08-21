import { ThemedText } from "@/components/ThemedText";
import { InventarioVenta } from "@/screens/ventas/types/venta.types";
import { getToken } from "@/storage/secureStorage";
import { useTheme } from "@/theme/useTheme";
import { formatDateTimeNatural } from "@/utils/dateHelpers";
import { BlurView } from "expo-blur";
import { X } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useArqueoTransacciones } from "../hooks/useArqueoTransacciones";
import { arqueoService } from "../services/arqueo.service";
import { Arqueo, Conteo, Egreso, Ingreso, Pago } from "../types/arqueo.types";
import { ArqueoTransaccionTable } from "./ArqueoTransaccionTable";

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

const denominationConfig: {
  key: keyof Conteo;
  label: string;
  value: number;
}[] = [
  { key: "billete_200", label: "Billetes 200 Bs", value: 200 },
  { key: "billete_100", label: "Billetes 100 Bs", value: 100 },
  { key: "billete_50", label: "Billetes 50 Bs", value: 50 },
  { key: "billete_20", label: "Billetes 20 Bs", value: 20 },
  { key: "billete_10", label: "Billetes 10 Bs", value: 10 },
  { key: "moneda_5", label: "Monedas 5 Bs", value: 5 },
  { key: "moneda_2", label: "Monedas 2 Bs", value: 2 },
  { key: "moneda_1", label: "Monedas 1 Bs", value: 1 },
  { key: "moneda_50ctvs", label: "Monedas 50 ctvs", value: 0.5 },
  { key: "moneda_20ctvs", label: "Monedas 20 ctvs", value: 0.2 },
  { key: "moneda_10ctvs", label: "Monedas 10 ctvs", value: 0.1 },
];

interface ResumenItemProps {
  label: string;
  value: number;
  theme: any;
  highlight?: boolean;
}

function ResumenItem({ label, value, theme, highlight }: ResumenItemProps) {
  return (
    <View
      style={[
        styles.resumenCard,
        {
          backgroundColor: highlight
            ? theme.colors.primary + "15"
            : theme.colors.backgroundSecondary,
          borderColor: highlight ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <ThemedText
        style={[styles.resumenLabel, { color: theme.colors.textSecondary }]}
      >
        {label}
      </ThemedText>
      <ThemedText
        style={[
          styles.resumenValue,
          {
            color: highlight ? theme.colors.primary : theme.colors.text,
            fontWeight: highlight ? "700" : "600",
          },
        ]}
      >
        Bs. {Number(value || 0).toFixed(2)}
      </ThemedText>
    </View>
  );
}

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
  const [ventas, setVentas] = useState<InventarioVenta[]>([]);

  const cajeroUsername =
    arqueo && typeof arqueo.usuario === "string"
      ? arqueo.usuario
      : arqueo?.usuario && typeof arqueo.usuario !== "string"
        ? arqueo.usuario.usuario
        : "";

  const { ingresosCombinados, loadTransacciones } = useArqueoTransacciones(
    arqueoId,
    pagos,
    ventas,
    cajeroUsername,
  );

  useEffect(() => {
    if (visible && arqueoId) {
      loadArqueoDetail(arqueoId);
      loadTransacciones("INGRESO");
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
      setVentas(data.ventasInventario || []);
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

  const handlePrintReceipt = async (
    idOriginal: number,
    origen: "pago" | "ingreso" | "egreso" | "venta",
  ) => {
    try {
      const token = await getToken();
      let url = "";
      if (origen === "pago")
        url = `/api/pagos/${idOriginal}/recibo?token=${token}`;
      else if (origen === "ingreso")
        url = `/api/ingresos/${idOriginal}/recibo?token=${token}`;
      else if (origen === "egreso")
        url = `/api/egresos/${idOriginal}/recibo?token=${token}`;
      else if (origen === "venta")
        url = `/api/ventas/${idOriginal}/recibo?token=${token}`;
      const fullUrl = `${process.env.EXPO_PUBLIC_API_URL}${url}`;
      window.open(fullUrl, "_blank");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo abrir el recibo",
      });
    }
  };

  const totalContado = useMemo(() => {
    if (!arqueo?.conteo) return 0;
    return denominationConfig.reduce((total, denom) => {
      const cantidad = arqueo.conteo?.[denom.key] || 0;
      return total + cantidad * denom.value;
    }, 0);
  }, [arqueo?.conteo]);

  if (!visible || !arqueo) return null;

  // 🔥 Cálculos con conversión numérica
  const saldoAnterior = Number(arqueo.saldo_anterior) || 0;

  const totalPagos = pagos.reduce((s, p) => s + Number(p.monto || 0), 0);
  const totalIngresosManual = ingresos
    .filter((i) => i.estado !== "ANULADO")
    .reduce((s, i) => s + Number(i.monto || 0), 0);
  const totalEgresos = egresos
    .filter((e) => e.estado !== "ANULADO")
    .reduce((s, e) => s + Number(e.monto || 0), 0);

  const totalesPorMetodo = (() => {
    let efectivo = 0,
      tarjeta = 0,
      qr = 0,
      transferencia = 0;
    pagos.forEach((p) => {
      const monto = Number(p.monto) || 0;
      if (p.metodo === "EFECTIVO") efectivo += monto;
      else if (p.metodo === "TARJETA") tarjeta += monto;
      else if (p.metodo === "QR") qr += monto;
      else if (p.metodo === "TRANSFERENCIA") transferencia += monto;
    });
    ingresos.forEach((i) => {
      if (i.estado === "ANULADO") return;
      const monto = Number(i.monto) || 0;
      if (i.metodo === "EFECTIVO") efectivo += monto;
      else if (i.metodo === "TARJETA") tarjeta += monto;
      else if (i.metodo === "QR") qr += monto;
      else if (i.metodo === "TRANSFERENCIA") transferencia += monto;
    });
    egresos.forEach((e) => {
      if (e.estado === "ANULADO") return;
      const monto = Number(e.monto) || 0;
      if (e.metodo === "EFECTIVO") efectivo -= monto;
      else if (e.metodo === "TARJETA") tarjeta -= monto;
      else if (e.metodo === "QR") qr -= monto;
      else if (e.metodo === "TRANSFERENCIA") transferencia -= monto;
    });
    // 🔥 AGREGADO: VENTAS DE PRODUCTOS
    ventas.forEach((v) => {
      if (v.estado !== "PAGADO") return;
      const monto = Number(v.total) || 0;
      if (v.metodo_pago === "EFECTIVO") efectivo += monto;
      else if (v.metodo_pago === "TARJETA") tarjeta += monto;
      else if (v.metodo_pago === "QR") qr += monto;
      else if (v.metodo_pago === "TRANSFERENCIA") transferencia += monto;
    });
    return { efectivo, tarjeta, qr, transferencia };
  })();

  const totalMovimientos =
    totalesPorMetodo.efectivo +
    totalesPorMetodo.tarjeta +
    totalesPorMetodo.qr +
    totalesPorMetodo.transferencia;

  // 🔥 CORRECCIÓN CLAVE: solo efectivo esperado para comparar con conteo
  const expectedEfectivo = saldoAnterior + totalesPorMetodo.efectivo;

  const nombreUsuario =
    typeof arqueo.usuario !== "string"
      ? `${arqueo.usuario.nombres || ""} ${arqueo.usuario.apellidoPaterno || ""}`.trim() ||
        arqueo.usuario.usuario
      : arqueo.usuario;

  const cuotasConPago = pagos.flatMap((pago, pagoIndex) =>
    (pago.cuotas || []).map((cuota) => ({
      ...cuota,
      pagoIndex: pagoIndex + 1,
    })),
  );

  const diferenciaConteo = totalContado - expectedEfectivo;

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
              <View style={{ flex: 1, paddingRight: 12 }}>
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
                  <X size={20} color={theme.colors.muted} />
                </View>
              </MotiPressable>
            </View>

            {/* Body */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              ) : (
                <>
                  {/* Resumen de caja */}
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
                        label="Caja esperada (efectivo)"
                        value={expectedEfectivo}
                        theme={theme}
                        highlight
                      />
                    </View>
                  </View>

                  {/* Totales por método */}
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

                  {/* Ingresos */}
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
                      <ArqueoTransaccionTable
                        transacciones={ingresosCombinados}
                        loading={loading}
                        tipo="INGRESO"
                        onUpdateEstado={undefined}
                        updatingId={null}
                        arqueoId={arqueo.id}
                        showReceipt={true}
                        showMenu={false}
                        onPrintReceipt={handlePrintReceipt}
                      />
                    )}
                  </View>

                  {/* Egresos */}
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
                      <ArqueoTransaccionTable
                        transacciones={egresos}
                        loading={loading}
                        tipo="EGRESO"
                        onUpdateEstado={undefined}
                        updatingId={null}
                        arqueoId={arqueo.id}
                        showReceipt={true}
                        showMenu={false}
                        onPrintReceipt={handlePrintReceipt}
                      />
                    )}
                  </View>

                  {/* Pagos */}
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
                          showsHorizontalScrollIndicator={true}
                          contentContainerStyle={{ minWidth: "100%" }}
                        >
                          <View style={styles.table}>
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
                                  styles.colIdx,
                                  { color: theme.colors.text },
                                ]}
                              >
                                #
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  styles.colFecha,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Fecha
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  styles.colEstudiante,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Estudiante
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  styles.colConcepto,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Concepto
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  styles.colMetodo,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Método
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  styles.colMonto,
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
                                    styles.colIdx,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {idx + 1}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    styles.colFecha,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {formatDateTimeNatural(pago.fecha)}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    styles.colEstudiante,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {`${pago.estudiante?.nombres || ""} ${pago.estudiante?.apellidoPaterno || ""}`.trim() ||
                                    "-"}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    styles.colConcepto,
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
                                    styles.colMetodo,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {pago.metodo}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    styles.colMonto,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  Bs. {Number(pago.monto).toFixed(2)}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* Cuotas */}
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
                          showsHorizontalScrollIndicator={true}
                          contentContainerStyle={{ minWidth: "100%" }}
                        >
                          <View style={styles.table}>
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
                                  styles.colIdx,
                                  { color: theme.colors.text },
                                ]}
                              >
                                #
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  styles.colIdx,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Pago
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  styles.colConcepto,
                                  { color: theme.colors.text },
                                ]}
                              >
                                Período / Concepto
                              </ThemedText>
                              <ThemedText
                                style={[
                                  styles.tableCellHeader,
                                  styles.colMonto,
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
                                    styles.colIdx,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {idx + 1}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    styles.colIdx,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  #{cuota.pagoIndex}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    styles.colConcepto,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  {cuota.tipo === "MATRICULA"
                                    ? "Matrícula"
                                    : cuota.tipo === "MENSUAL"
                                      ? "Mensualidad"
                                      : cuota.tipo}
                                </ThemedText>
                                <ThemedText
                                  style={[
                                    styles.tableCell,
                                    styles.colMonto,
                                    { color: theme.colors.text },
                                  ]}
                                >
                                  Bs. {Number(cuota.monto || 0).toFixed(2)}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* Conteo de efectivo */}
                  {arqueo.conteo && (
                    <View style={styles.section}>
                      <ThemedText
                        style={[
                          styles.sectionTitle,
                          { color: theme.colors.text },
                        ]}
                      >
                        Conteo de efectivo
                      </ThemedText>
                      <View style={styles.conteoGrid}>
                        {denominationConfig.map((denom) => {
                          const cantidad = arqueo.conteo?.[denom.key] || 0;
                          if (cantidad <= 0) return null;
                          return (
                            <View
                              key={denom.key}
                              style={[
                                styles.conteoItem,
                                {
                                  backgroundColor:
                                    theme.colors.backgroundSecondary,
                                },
                              ]}
                            >
                              <ThemedText
                                style={{
                                  fontSize: 12,
                                  color: theme.colors.textSecondary,
                                }}
                              >
                                {denom.label}
                              </ThemedText>
                              <ThemedText
                                style={{
                                  fontSize: 14,
                                  fontWeight: "600",
                                  color: theme.colors.text,
                                }}
                              >
                                {cantidad} × {denom.value.toFixed(2)} ={" "}
                                {(cantidad * denom.value).toFixed(2)} Bs
                              </ThemedText>
                            </View>
                          );
                        })}
                      </View>
                      <View style={styles.totalConteoRow}>
                        <ThemedText
                          style={{
                            color: theme.colors.textSecondary,
                            fontWeight: "600",
                          }}
                        >
                          Total contado:
                        </ThemedText>
                        <ThemedText
                          style={{
                            color: theme.colors.primary,
                            fontWeight: "700",
                            fontSize: 16,
                          }}
                        >
                          {totalContado.toFixed(2)} Bs
                        </ThemedText>
                      </View>
                      <View style={styles.totalConteoRow}>
                        <ThemedText
                          style={{
                            color: theme.colors.textSecondary,
                            fontWeight: "600",
                          }}
                        >
                          Caja esperada (efectivo):
                        </ThemedText>
                        <ThemedText
                          style={{
                            color: theme.colors.text,
                            fontWeight: "600",
                          }}
                        >
                          {expectedEfectivo.toFixed(2)} Bs
                        </ThemedText>
                      </View>
                      {diferenciaConteo !== 0 && (
                        <View
                          style={[
                            styles.alertRow,
                            {
                              backgroundColor:
                                diferenciaConteo > 0 ? "#FEF3C7" : "#FEE2E2",
                            },
                          ]}
                        >
                          <ThemedText
                            style={{
                              fontSize: 12,
                              color:
                                diferenciaConteo > 0 ? "#D97706" : "#DC2626",
                              fontWeight: "600",
                            }}
                          >
                            {diferenciaConteo > 0
                              ? `Sobrante: ${diferenciaConteo.toFixed(2)} Bs`
                              : `Faltante: ${Math.abs(diferenciaConteo).toFixed(2)} Bs`}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  modalContent: {
    width: "96%",
    maxWidth: 1500,
    maxHeight: "92%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "700", flexWrap: "wrap" },
  subtitle: { fontSize: 13, marginTop: 2, flexWrap: "wrap" },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  resumenGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  resumenCard: {
    flex: 1,
    minWidth: 160,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  resumenLabel: { fontSize: 12, marginBottom: 4, flexWrap: "wrap" },
  resumenValue: { fontSize: 16 },
  tableWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.2)",
    overflow: "hidden",
  },
  table: { minWidth: "100%" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableHeader: { borderBottomWidth: 1 },
  tableCellHeader: { fontWeight: "700", fontSize: 13, flexWrap: "wrap" },
  tableCell: { fontSize: 13, flexWrap: "wrap" },
  colIdx: { width: 50, paddingHorizontal: 4 },
  colFecha: { minWidth: 160, flexShrink: 0, paddingHorizontal: 4 },
  colEstudiante: { minWidth: 200, flex: 1, paddingHorizontal: 4 },
  colConcepto: { minWidth: 180, flex: 1, paddingHorizontal: 4 },
  colMetodo: { minWidth: 120, paddingHorizontal: 4 },
  colMonto: { minWidth: 110, paddingHorizontal: 4 },
  conteoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  conteoItem: {
    flexBasis: "45%",
    flexGrow: 1,
    minWidth: 140,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.2)",
  },
  totalConteoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 4,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
});
