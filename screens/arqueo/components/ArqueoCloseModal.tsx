import { ThemedText } from "@/components/ThemedText";
import { getToken } from "@/storage/secureStorage";
import { useTheme } from "@/theme/useTheme";
import { formatDateTimeNatural } from "@/utils/dateHelpers";
import { BlurView } from "expo-blur";
import { AlertTriangle, X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { InventarioVenta } from "../../ventas/types/venta.types";
import { useArqueo } from "../hooks/useArqueo";
import { useArqueoTransacciones } from "../hooks/useArqueoTransacciones";
import { arqueoService } from "../services/arqueo.service";
import { Conteo, Egreso, Ingreso, Pago } from "../types/arqueo.types";
import { ArqueoTransaccionTable } from "./ArqueoTransaccionTable";

interface ArqueoCloseModalProps {
  visible: boolean;
  arqueoId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const denominations: { key: keyof Conteo; label: string; value: number }[] = [
  { key: "billete_200", label: "Billetes 200 Bs", value: 200 },
  { key: "billete_100", label: "Billetes 100 Bs", value: 100 },
  { key: "billete_50", label: "Billetes 50 Bs", value: 50 },
  { key: "billete_20", label: "Billetes 20 Bs", value: 20 },
  { key: "billete_10", label: "Billetes 10 Bs", value: 10 },
  { key: "moneda_5", label: "Monedas 5 Bs", value: 5 },
  { key: "moneda_2", label: "Monedas 2 Bs", value: 2 },
  { key: "moneda_1", label: "Monedas 1 Bs", value: 1 },
];

const tipoMap: Record<string, string> = {
  MATRICULA: "MATRICULA",
  MENSUAL: "MENSUALIDAD",
  CONVALIDACION: "CONVALIDACION",
};

export default function ArqueoCloseModal({
  visible,
  arqueoId,
  onClose,
  onSuccess,
}: ArqueoCloseModalProps) {
  const { theme } = useTheme();
  const { activeArqueo, closeArqueo, refetch } = useArqueo();
  const [loading, setLoading] = useState(false);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [ventas, setVentas] = useState<InventarioVenta[]>([]);
  const [pagosLoading, setPagosLoading] = useState(false);
  const [conteo, setConteo] = useState<Conteo>({
    billete_200: 0,
    billete_100: 0,
    billete_50: 0,
    billete_20: 0,
    billete_10: 0,
    moneda_5: 0,
    moneda_2: 0,
    moneda_1: 0,
  });

  const arqueo = activeArqueo?.id === arqueoId ? activeArqueo : null;
  const cajeroUsername =
    arqueo && typeof arqueo.usuario === "string"
      ? arqueo.usuario
      : arqueo?.usuario && typeof arqueo.usuario !== "string"
        ? arqueo.usuario.usuario
        : "";
  const {
    ingresosCombinados,
    updateTransaccionEstado,
    updatingId,
    loadTransacciones,
  } = useArqueoTransacciones(arqueoId, pagos, ventas, cajeroUsername);

  useEffect(() => {
    if (visible && arqueoId) {
      loadArqueoDetail(arqueoId);
      loadTransacciones("INGRESO");
    }
  }, [visible, arqueoId]);

  const loadArqueoDetail = async (id: number) => {
    setPagosLoading(true);
    try {
      const response = await arqueoService.getById(id);
      const arqueoData = response.data;
      setPagos(arqueoData.pagos || []);
      setIngresos(arqueoData.ingresos || []);
      setEgresos(arqueoData.egresos || []);
      setVentas(arqueoData.ventasInventario || []);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los movimientos",
      });
    } finally {
      setPagosLoading(false);
    }
  };

  const totalPagos = useMemo(
    () => pagos.reduce((s, p) => s + p.monto, 0),
    [pagos],
  );
  const totalIngresosManual = useMemo(
    () =>
      ingresos
        .filter((i) => i.estado !== "ANULADO")
        .reduce((s, i) => s + i.monto, 0),
    [ingresos],
  );
  const totalEgresos = useMemo(
    () =>
      egresos
        .filter((e) => e.estado !== "ANULADO")
        .reduce((s, e) => s + e.monto, 0),
    [egresos],
  );
  const totalVentas = useMemo(
    () =>
      ventas
        .filter((v) => v.estado === "PAGADO")
        .reduce((s, v) => s + parseFloat(v.total.toString()), 0),
    [ventas],
  );
  const saldoAnterior = arqueo?.saldo_anterior || 0;

  const totalesPorMetodo = useMemo(() => {
    let efectivo = 0,
      tarjeta = 0,
      qr = 0,
      transferencia = 0;
    pagos.forEach((p) => {
      const monto = p.monto || 0;
      switch (p.metodo) {
        case "EFECTIVO":
          efectivo += monto;
          break;
        case "TARJETA":
          tarjeta += monto;
          break;
        case "QR":
          qr += monto;
          break;
        case "TRANSFERENCIA":
          transferencia += monto;
          break;
      }
    });
    ingresos.forEach((i) => {
      if (i.estado === "ANULADO") return;
      const monto = i.monto || 0;
      switch (i.metodo) {
        case "EFECTIVO":
          efectivo += monto;
          break;
        case "TARJETA":
          tarjeta += monto;
          break;
        case "QR":
          qr += monto;
          break;
        case "TRANSFERENCIA":
          transferencia += monto;
          break;
      }
    });
    egresos.forEach((e) => {
      if (e.estado === "ANULADO") return;
      const monto = e.monto || 0;
      switch (e.metodo) {
        case "EFECTIVO":
          efectivo -= monto;
          break;
        case "TARJETA":
          tarjeta -= monto;
          break;
        case "QR":
          qr -= monto;
          break;
        case "TRANSFERENCIA":
          transferencia -= monto;
          break;
      }
    });
    ventas.forEach((v) => {
      if (v.estado !== "PAGADO") return;
      const monto = parseFloat(v.total.toString()) || 0;
      switch (v.metodo_pago) {
        case "EFECTIVO":
          efectivo += monto;
          break;
        case "TARJETA":
          tarjeta += monto;
          break;
        case "QR":
          qr += monto;
          break;
        case "TRANSFERENCIA":
          transferencia += monto;
          break;
      }
    });
    return { efectivo, tarjeta, qr, transferencia };
  }, [pagos, ingresos, egresos, ventas]);

  const totalMovimientos =
    totalesPorMetodo.efectivo +
    totalesPorMetodo.tarjeta +
    totalesPorMetodo.qr +
    totalesPorMetodo.transferencia;

  const expectedEfectivo = useMemo(() => {
    return saldoAnterior + totalesPorMetodo.efectivo;
  }, [saldoAnterior, totalesPorMetodo.efectivo]);

  const totalContado = useMemo(() => {
    let total = 0;
    for (const denom of denominations) {
      total += (conteo[denom.key] || 0) * denom.value;
    }
    return total;
  }, [conteo]);

  const diferencia = totalContado - expectedEfectivo;

  const handleConteoChange = (key: keyof Conteo, value: string) => {
    const num = parseInt(value) || 0;
    setConteo((prev) => ({ ...prev, [key]: Math.max(0, num) }));
  };

  const handleClose = async () => {
    if (!arqueoId) return;
    setLoading(true);
    try {
      await closeArqueo(arqueoId, conteo);
      await refetch();
      Toast.show({
        type: "success",
        text1: "Turno cerrado",
        text2: "Arqueo realizado exitosamente",
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "No se pudo cerrar el turno",
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

  const cuotasConPago = useMemo(() => {
    return pagos.flatMap((pago, pagoIndex) =>
      (pago.cuotas || []).map((cuota) => ({
        ...cuota,
        pagoIndex: pagoIndex + 1,
      })),
    );
  }, [pagos]);

  if (!arqueo) return null;

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
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    width: "95%",
                    maxWidth: 800,
                    maxHeight: "90%",
                  },
                ]}
              >
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
                      Cierre de arqueo
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.subtitle,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Turno: {arqueo.turno} • Apertura:{" "}
                      {formatDateTimeNatural(arqueo.fecha_apertura)}
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

                <ScrollView contentContainerStyle={styles.scrollContent}>
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

                  <View style={styles.section}>
                    <ThemedText
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Ingresos
                    </ThemedText>
                    {pagosLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.primary}
                      />
                    ) : ingresosCombinados.length === 0 ? (
                      <ThemedText style={{ color: theme.colors.textSecondary }}>
                        No hay ingresos registrados
                      </ThemedText>
                    ) : (
                      <ArqueoTransaccionTable
                        transacciones={ingresosCombinados}
                        loading={pagosLoading}
                        tipo="INGRESO"
                        showMenu={false}
                        onUpdateEstado={undefined}
                        updatingId={null}
                        arqueoId={arqueo.id}
                        showReceipt={true}
                        onPrintReceipt={handlePrintReceipt}
                      />
                    )}
                  </View>

                  <View style={styles.section}>
                    <ThemedText
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Egresos registrados
                    </ThemedText>
                    {pagosLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.primary}
                      />
                    ) : egresos.length === 0 ? (
                      <ThemedText style={{ color: theme.colors.textSecondary }}>
                        No hay egresos en este turno
                      </ThemedText>
                    ) : (
                      <ArqueoTransaccionTable
                        transacciones={egresos}
                        loading={pagosLoading}
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

                  <View style={styles.section}>
                    <ThemedText
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Pagos registrados
                    </ThemedText>
                    {pagosLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.primary}
                      />
                    ) : pagos.length === 0 ? (
                      <ThemedText style={{ color: theme.colors.textSecondary }}>
                        No hay pagos en este turno
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

                  <View style={styles.section}>
                    <ThemedText
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Cuotas pagadas
                    </ThemedText>
                    {pagosLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.primary}
                      />
                    ) : cuotasConPago.length === 0 ? (
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

                  <View style={styles.section}>
                    <ThemedText
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Ventas de productos
                    </ThemedText>
                    {pagosLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.primary}
                      />
                    ) : ventas.length === 0 ? (
                      <ThemedText
                        style={{
                          color: theme.colors.textSecondary,
                          marginBottom: 16,
                        }}
                      >
                        No hay ventas de productos
                      </ThemedText>
                    ) : (
                      <View style={[styles.tableWrapper, { marginBottom: 16 }]}>
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
                                Productos
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
                                Total
                              </ThemedText>
                            </View>
                            {ventas
                              .filter((v) => v.estado === "PAGADO")
                              .map((venta, idx) => (
                                <View
                                  key={venta.idVenta || idx}
                                  style={[
                                    styles.tableRow,
                                    {
                                      borderBottomColor: theme.colors.border,
                                    },
                                  ]}
                                >
                                  <ThemedText
                                    style={[
                                      styles.tableCell,
                                      { color: theme.colors.text },
                                    ]}
                                  >
                                    #{venta.idVenta}
                                  </ThemedText>
                                  <ThemedText
                                    style={[
                                      styles.tableCell,
                                      { color: theme.colors.text },
                                    ]}
                                  >
                                    {venta.fechaVenta
                                      ? new Date(
                                          venta.fechaVenta,
                                        ).toLocaleDateString()
                                      : "-"}
                                  </ThemedText>
                                  <ThemedText
                                    style={[
                                      styles.tableCell,
                                      { color: theme.colors.text },
                                    ]}
                                  >
                                    {venta.detalles
                                      ?.map(
                                        (d) =>
                                          `${d.cantidad}x ${d.producto?.nombre || "Producto"}`,
                                      )
                                      .join(", ") || "-"}
                                  </ThemedText>
                                  <ThemedText
                                    style={[
                                      styles.tableCell,
                                      { color: theme.colors.text },
                                    ]}
                                  >
                                    {venta.metodo_pago}
                                  </ThemedText>
                                  <ThemedText
                                    style={[
                                      styles.tableCell,
                                      {
                                        color: theme.colors.text,
                                        fontWeight: "600",
                                      },
                                    ]}
                                  >
                                    {parseFloat(venta.total.toString()).toFixed(
                                      2,
                                    )}{" "}
                                    Bs
                                  </ThemedText>
                                </View>
                              ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}

                    <ThemedText
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Conteo de efectivo
                    </ThemedText>
                    <View style={styles.conteoGrid}>
                      {denominations.map((denom) => (
                        <View key={denom.key} style={styles.conteoField}>
                          <ThemedText
                            style={[
                              styles.conteoLabel,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            {denom.label}
                          </ThemedText>
                          <TextInput
                            value={String(conteo[denom.key] || 0)}
                            onChangeText={(val) =>
                              handleConteoChange(denom.key, val)
                            }
                            keyboardType="numeric"
                            style={[
                              styles.conteoInput,
                              {
                                backgroundColor: theme.colors.input,
                                borderColor: theme.colors.inputBorder,
                                color: theme.colors.text,
                              },
                            ]}
                          />
                        </View>
                      ))}
                    </View>
                    <View style={styles.totalContadoRow}>
                      <ThemedText
                        style={[
                          styles.totalContadoLabel,
                          { color: theme.colors.text },
                        ]}
                      >
                        Total contado (Bs):
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.totalContadoValue,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {totalContado.toFixed(2)}
                      </ThemedText>
                    </View>
                    <View style={styles.totalContadoRow}>
                      <ThemedText
                        style={[
                          styles.totalContadoLabel,
                          { color: theme.colors.text },
                        ]}
                      >
                        Caja esperada (Bs):
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.totalContadoValue,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {expectedEfectivo.toFixed(2)}
                      </ThemedText>
                    </View>
                    {diferencia !== 0 && (
                      <View
                        style={[
                          styles.alert,
                          {
                            backgroundColor:
                              diferencia > 0 ? "#FEF3C7" : "#FEE2E2",
                          },
                        ]}
                      >
                        <AlertTriangle
                          size={16}
                          color={diferencia > 0 ? "#D97706" : "#DC2626"}
                        />
                        <ThemedText
                          style={{
                            fontSize: 12,
                            color: diferencia > 0 ? "#D97706" : "#DC2626",
                          }}
                        >
                          {diferencia > 0
                            ? `Sobrante: ${diferencia.toFixed(2)} Bs`
                            : `Faltante: ${Math.abs(diferencia).toFixed(2)} Bs`}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </ScrollView>

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
                    onPress={handleClose}
                    disabled={loading || diferencia !== 0}
                    animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
                    style={[
                      styles.applyBtn,
                      {
                        backgroundColor: theme.colors.primary,
                        opacity: loading || diferencia !== 0 ? 0.5 : 1,
                      },
                    ]}
                  >
                    <ThemedText style={styles.applyText}>
                      {loading ? "Cerrando..." : "Realizar arqueo"}
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
  tableWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    width: "100%",
  },
  table: { flexDirection: "column", width: "100%" },
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
  conteoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  conteoField: { width: "48%", minWidth: 120 },
  conteoLabel: { fontSize: 12, marginBottom: 4 },
  conteoInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
  },
  totalContadoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  totalContadoLabel: { fontSize: 14, fontWeight: "600" },
  totalContadoValue: { fontSize: 18, fontWeight: "700" },
  alert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
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
