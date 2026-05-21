import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { formatDisplayDate } from "../../../utils/dateHelpers";
import {
  filterCuotasBySequentialSemester,
  getSequentialSemestersFromCuotas,
} from "../../../utils/semesterHelpers";
import { CarreraInscrita, Cuota } from "../types/cuota.types";
import { PaymentModal } from "./PaymentModal";
import { SummaryCards } from "./SummaryCards";

import { useResponsive } from "@/hooks/useResponsive";
import { FilterDropdown } from "./FilterDropdown";
import { FilterGroup } from "./FilterGroup";

interface Props {
  cuotas: Cuota[];
  loading: boolean;
  carrera: CarreraInscrita | null;
  onRefresh: () => void;
}

export const CuotasTable: React.FC<Props> = ({
  cuotas,
  loading,
  carrera,
  onRefresh,
}) => {
  const { theme } = useTheme();
  const [selectedCuota, setSelectedCuota] = useState<Cuota | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Filtros
  const [filterYear, setFilterYear] = useState<string>("todos");
  const [filterType, setFilterType] = useState<string>("todos");
  const [tableWidth, setTableWidth] = useState(0);
  const [sequentialSemester, setSequentialSemester] = useState<
    number | "todos"
  >("todos");
  const { isMobile } = useResponsive();

  const years = useMemo(() => {
    const yearsSet = new Set<string>();
    cuotas.forEach((c) => {
      if (c.fecha_vencimiento) yearsSet.add(c.fecha_vencimiento.split("-")[0]);
    });
    return Array.from(yearsSet).sort();
  }, [cuotas]);

  const semesterOptions = useMemo(() => {
    if (!carrera || carrera.regimen !== "Semestral") return [];
    return getSequentialSemestersFromCuotas(cuotas, carrera.cuotas_por_anio);
  }, [cuotas, carrera]);

  const filteredCuotas = useMemo(() => {
    let filtered = [...cuotas];
    filtered.sort((a, b) =>
      (a.fecha_vencimiento || "").localeCompare(b.fecha_vencimiento || ""),
    );

    if (filterYear !== "todos") {
      filtered = filtered.filter((c) =>
        c.fecha_vencimiento?.startsWith(filterYear),
      );
    }

    if (carrera?.regimen === "Semestral" && sequentialSemester !== "todos") {
      filtered = filterCuotasBySequentialSemester(
        filtered,
        sequentialSemester,
        carrera.cuotas_por_anio,
      );
    }

    if (filterType !== "todos") {
      filtered = filtered.filter((c) => c.tipo === filterType);
    }
    return filtered;
  }, [cuotas, filterYear, sequentialSemester, filterType, carrera]);

  const totalPagado = filteredCuotas
    .filter((c) => c.estadoCuota === "Pagado")
    .reduce((s, c) => s + c.monto, 0);
  const totalDebe = filteredCuotas
    .filter((c) => c.estadoCuota === "Debe")
    .reduce((s, c) => s + c.monto, 0);
  const proximaVencimiento = filteredCuotas.find(
    (c) => c.estadoCuota === "Debe",
  )?.fecha_vencimiento;

  const isOverdue = (cuota: Cuota): boolean => {
    if (cuota.estadoCuota !== "Debe" || !cuota.fecha_vencimiento) return false;
    const today = new Date().toISOString().split("T")[0];
    return cuota.fecha_vencimiento < today;
  };

  const handlePago = (cuota: Cuota) => {
    setSelectedCuota(cuota);
    setModalVisible(true);
  };

  const handleConfirmPayment = async (
    cuotaId: number,
    metodo: string,
    comprobante: string,
    observacion: string,
  ) => {
    console.log("Pagar cuota", cuotaId, metodo, comprobante, observacion);
    onRefresh();
  };
  if (!carrera) return null;

  return (
    <>
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.border,
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Filters Bar */}
        <View
          style={{
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.card,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "flex-end",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Izquierda: Semestre/Año + Tipo juntos */}
          <View
            style={{
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "flex-end",
              gap: 12,
            }}
          >
            {/* Semestre o Año */}
            {carrera?.regimen !== "Semestral" && (
              <FilterDropdown
                label="Año Académico"
                value={filterYear}
                options={[
                  { label: "Todos", value: "todos" },
                  ...years.map((y) => ({ label: y, value: y })),
                ]}
                onChange={setFilterYear}
              />
            )}
            {carrera?.regimen === "Semestral" && (
              <FilterDropdown
                label="Semestre"
                value={sequentialSemester}
                options={[
                  { label: "Todos", value: "todos" },
                  ...semesterOptions.map((s) => ({
                    label: s.label,
                    value: s.value,
                  })),
                ]}
                onChange={setSequentialSemester}
              />
            )}

            {/* Tipo — al lado en desktop, abajo en mobile */}
            <FilterGroup
              label="Tipo"
              options={[
                { label: "Todos", value: "todos" },
                { label: "Matrícula", value: "MATRICULA" },
                { label: "Mensual", value: "MENSUAL" },
              ]}
              value={filterType}
              onChange={setFilterType}
            />
          </View>

          {/* Derecha: Estado de Cuenta */}
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
            }}
          >
            <Ionicons
              name="print-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={{
                color: theme.colors.primary,
                fontWeight: "500",
                fontSize: 14,
              }}
            >
              Estado de Cuenta
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            style={{ margin: 40 }}
            color={theme.colors.primary}
          />
        ) : filteredCuotas.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>
              No hay cuotas que coincidan con los filtros.
            </Text>
          </View>
        ) : (
          <View
            onLayout={(e) => setTableWidth(e.nativeEvent.layout.width)}
            style={{ width: "100%" }}
          >
            <ScrollView horizontal style={{ width: "100%" }}>
              <View style={{ minWidth: tableWidth, paddingBottom: 16 }}>
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: theme.colors.backgroundSecondary,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <View style={{ flex: 2.5 }}>
                    <Text
                      style={{
                        fontWeight: "500",
                        color: theme.colors.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Concepto
                    </Text>
                  </View>
                  <View style={{ flex: 1.5 }}>
                    <Text
                      style={{
                        fontWeight: "500",
                        color: theme.colors.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Vencimiento
                    </Text>
                  </View>
                  <View style={{ flex: 1.5, alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontWeight: "500",
                        color: theme.colors.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        textAlign: "right",
                      }}
                    >
                      Monto (Bs.)
                    </Text>
                  </View>
                  <View style={{ flex: 1.5, alignItems: "center" }}>
                    <Text
                      style={{
                        fontWeight: "500",
                        color: theme.colors.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        textAlign: "center",
                      }}
                    >
                      Estado
                    </Text>
                  </View>
                  <View style={{ flex: 1.5, alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontWeight: "500",
                        color: theme.colors.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        textAlign: "right",
                      }}
                    >
                      Acción
                    </Text>
                  </View>
                </View>
                {filteredCuotas.map((cuota) => {
                  const overdue = isOverdue(cuota);
                  return (
                    <View
                      key={cuota.idCuota}
                      style={{
                        flexDirection: "row",
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border,
                        backgroundColor: overdue
                          ? theme.colors.destructive + "20"
                          : theme.colors.card,
                        borderLeftWidth: overdue ? 4 : 0,
                        borderLeftColor: overdue
                          ? theme.colors.destructive
                          : "transparent",
                      }}
                    >
                      <View
                        style={{
                          flex: 2.5,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          paddingLeft: overdue ? 8 : 0,
                        }}
                      >
                        <Ionicons
                          name={
                            overdue
                              ? "warning"
                              : cuota.tipo === "MATRICULA"
                                ? "receipt-outline"
                                : "calendar-outline"
                          }
                          size={18}
                          color={
                            overdue
                              ? theme.colors.destructive
                              : theme.colors.textTertiary
                          }
                        />
                        <Text
                          style={{
                            fontWeight: "500",
                            color: theme.colors.text,
                            fontSize: 14,
                          }}
                        >
                          {cuota.tipo === "MATRICULA"
                            ? "Matrícula"
                            : `Mensualidad ${cuota.numeroCuota}`}
                        </Text>
                      </View>
                      <View style={{ flex: 1.5, justifyContent: "center" }}>
                        <Text
                          style={{
                            color: overdue
                              ? theme.colors.destructive
                              : theme.colors.textSecondary,
                            fontSize: 14,
                            fontWeight: overdue ? "500" : "400",
                          }}
                        >
                          {formatDisplayDate(cuota.fecha_vencimiento)}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1.5,
                          alignItems: "flex-end",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "500",
                            color: theme.colors.text,
                            fontSize: 14,
                            textAlign: "right",
                          }}
                        >
                          {cuota.monto.toFixed(2)}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1.5,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 9999,
                            borderWidth: overdue ? 1 : 0,
                            borderColor: overdue
                              ? theme.colors.destructive + "33"
                              : "transparent",
                            backgroundColor:
                              cuota.estadoCuota === "Pagado"
                                ? theme.colors.success + "20"
                                : overdue
                                  ? theme.colors.destructive + "20"
                                  : theme.colors.backgroundTertiary,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {cuota.estadoCuota === "Pagado" && (
                            <Ionicons
                              name="checkmark"
                              size={12}
                              color={theme.colors.success}
                            />
                          )}
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "500",
                              color:
                                cuota.estadoCuota === "Pagado"
                                  ? theme.colors.success
                                  : overdue
                                    ? theme.colors.destructive
                                    : theme.colors.textSecondary,
                            }}
                          >
                            {cuota.estadoCuota === "Pagado"
                              ? "Pagado"
                              : overdue
                                ? "Vencido"
                                : "Pendiente"}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          flex: 1.5,
                          alignItems: "flex-end",
                          justifyContent: "center",
                        }}
                      >
                        {cuota.estadoCuota === "Debe" ? (
                          <Pressable
                            onPress={() => handlePago(cuota)}
                            style={{
                              backgroundColor: overdue
                                ? theme.colors.primary
                                : theme.colors.card,
                              borderWidth: overdue ? 0 : 1,
                              borderColor: theme.colors.primary,
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 6,
                            }}
                          >
                            <Text
                              style={{
                                color: overdue
                                  ? theme.colors.primaryForeground
                                  : theme.colors.primary,
                                fontSize: 14,
                                fontWeight: "500",
                              }}
                            >
                              Pagar
                            </Text>
                          </Pressable>
                        ) : (
                          <Pressable style={{ padding: 4 }}>
                            <Ionicons
                              name="eye-outline"
                              size={20}
                              color={theme.colors.primary}
                            />
                          </Pressable>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      <SummaryCards
        totalPagado={totalPagado}
        totalDebe={totalDebe}
        proximaVencimiento={proximaVencimiento}
      />

      <PaymentModal
        visible={modalVisible}
        cuota={selectedCuota}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmPayment}
      />
    </>
  );
};
