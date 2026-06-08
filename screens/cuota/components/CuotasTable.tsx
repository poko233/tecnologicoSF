// screens/cuota/components/CuotasTable.tsx (modificado con selección múltiple)
import { useResponsive } from "@/hooks/useResponsive";
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
import { pagoService } from "../services/pago.service";
import { CarreraInscrita, Cuota } from "../types/cuota.types";
import { FilterDropdown } from "./FilterDropdown";
import { FilterGroup } from "./FilterGroup";
import { PaymentMulticuotaModal } from "./PaymentMulticuotaModal";
import { ReciboViewerModal } from "./ReciboViewerModal";
import { SummaryCards } from "./SummaryCards";
interface Props {
  cuotas: Cuota[];
  loading: boolean;
  carrera: CarreraInscrita | null;
  onRefresh: () => void;
  // Propiedades adicionales para la integración con la pantalla principal
  selectedStudentId: number;
}

export const CuotasTable: React.FC<Props> = ({
  cuotas,
  loading,
  carrera,
  onRefresh,
  selectedStudentId,
}) => {
  const { theme } = useTheme();
  const [selectedCuotas, setSelectedCuotas] = useState<Set<number>>(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [cuotasDirectas, setCuotasDirectas] = useState<Cuota[] | null>(null);

  const [reciboModalVisible, setReciboModalVisible] = useState(false);
  const [selectedIdPago, setSelectedIdPago] = useState<number | null>(null);
  // Filtros
  const [filterYear, setFilterYear] = useState<string>("todos");
  const [filterType, setFilterType] = useState<string>("todos");
  const [sequentialSemester, setSequentialSemester] = useState<
    number | "todos"
  >("todos");
  const { isMobile } = useResponsive();

  // Años disponibles
  const years = useMemo(() => {
    const yearsSet = new Set<string>();
    cuotas.forEach((c) => {
      if (c.fecha_vencimiento) yearsSet.add(c.fecha_vencimiento.split("-")[0]);
    });
    return Array.from(yearsSet).sort();
  }, [cuotas]);

  // Opciones de semestre para régimen semestral
  const semesterOptions = useMemo(() => {
    if (!carrera || carrera.regimen !== "Semestral") return [];
    return getSequentialSemestersFromCuotas(cuotas, carrera.cuotas_por_anio);
  }, [cuotas, carrera]);

  // Filtrar cuotas
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

  // Totales
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

  const toggleCuotaSelection = (idCuota: number) => {
    setSelectedCuotas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idCuota)) newSet.delete(idCuota);
      else newSet.add(idCuota);
      return newSet;
    });
  };

  const handleOpenPaymentModal = () => {
    setModalVisible(true);
  };

  const handlePaymentSuccess = () => {
    setSelectedCuotas(new Set());
    onRefresh();
  };

  const cuotasParaPagar = useMemo(() => {
    if (cuotasDirectas !== null) return cuotasDirectas;
    return filteredCuotas.filter((c) => selectedCuotas.has(c.idCuota));
  }, [filteredCuotas, selectedCuotas, cuotasDirectas]);

  if (!carrera) return null;

  return (
    <>
      <View
        className="rounded-xl border overflow-hidden"
        style={{
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        }}
      >
        {/* Barra de filtros */}
        <View
          className={`p-4 border-b flex-wrap ${isMobile ? "flex-col gap-3" : "flex-row justify-between items-end"}`}
          style={{ borderColor: theme.colors.border }}
        >
          <View
            className={`flex-wrap ${isMobile ? "flex-col gap-3" : "flex-row items-end gap-4"}`}
          >
            {carrera.regimen !== "Semestral" && (
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
            {carrera.regimen === "Semestral" && (
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
          {/* Botón para abrir pago múltiple */}
          {selectedCuotas.size > 0 && (
            <Pressable
              onPress={handleOpenPaymentModal}
              className="flex-row items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Ionicons name="wallet-outline" size={16} color="white" />
              <Text className="text-white font-bold text-sm">
                Pagar {selectedCuotas.size} cuota
                {selectedCuotas.size > 1 ? "s" : ""}
              </Text>
            </Pressable>
          )}
        </View>

        {loading ? (
          <ActivityIndicator className="my-10" color={theme.colors.primary} />
        ) : filteredCuotas.length === 0 ? (
          <View className="py-10 items-center">
            <Text style={{ color: theme.colors.textSecondary }}>
              No hay cuotas que coincidan con los filtros.
            </Text>
          </View>
        ) : (
          <ScrollView horizontal contentContainerStyle={{ minWidth: "100%" }}>
            <View className="w-full" style={{ minWidth: "100%" }}>
              {/* Cabecera de la tabla */}
              <View
                className="flex-row py-3 px-4"
                style={{
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderBottomWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <View className="w-10" />
                <View className="flex-[2.5]">
                  <Text
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Concepto
                  </Text>
                </View>
                <View className="flex-[1.5]">
                  <Text
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Vencimiento
                  </Text>
                </View>
                <View className="flex-[1.5] items-end">
                  <Text
                    className="text-xs font-semibold uppercase tracking-wider text-right"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Monto (Bs.)
                  </Text>
                </View>
                <View className="flex-[1.5] items-center">
                  <Text
                    className="text-xs font-semibold uppercase tracking-wider text-center"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Estado
                  </Text>
                </View>
                <View className="flex-[1.5] items-end">
                  <Text
                    className="text-xs font-semibold uppercase tracking-wider text-right"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Acción
                  </Text>
                </View>
              </View>
              {filteredCuotas.map((cuota) => {
                const overdue = isOverdue(cuota);
                const isSelected = selectedCuotas.has(cuota.idCuota);
                const isPending = cuota.estadoCuota === "Debe";

                return (
                  <Pressable
                    key={cuota.idCuota}
                    disabled={!isPending}
                    onPress={() => toggleCuotaSelection(cuota.idCuota)}
                    className={`flex-row py-3.5 px-4 border-b`}
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: isSelected
                        ? theme.colors.primary + "12"
                        : overdue
                          ? theme.colors.destructive + "15"
                          : theme.colors.card,
                      borderLeftWidth: 4,
                      borderLeftColor: isSelected
                        ? theme.colors.primary
                        : overdue
                          ? theme.colors.destructive
                          : "transparent",
                    }}
                  >
                    {/* Checkbox de selección (solo cuotas pendientes) */}
                    <View className="w-10 justify-center items-center">
                      {isPending && (
                        <View
                          className="w-5 h-5 rounded border items-center justify-center"
                          style={{
                            borderColor: isSelected
                              ? theme.colors.primary
                              : theme.colors.border,
                            backgroundColor: isSelected
                              ? theme.colors.primary
                              : "transparent",
                          }}
                        >
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={14}
                              color="white"
                            />
                          )}
                        </View>
                      )}
                    </View>

                    <View className="flex-[2.5] flex-row items-center gap-2">
                      <Ionicons
                        name={
                          overdue
                            ? "warning"
                            : cuota.tipo === "MATRICULA"
                              ? "receipt-outline"
                              : "calendar-outline"
                        }
                        size={16}
                        color={
                          isSelected
                            ? theme.colors.primary
                            : overdue
                              ? theme.colors.destructive
                              : theme.colors.textTertiary
                        }
                      />
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: theme.colors.text }}
                      >
                        {cuota.tipo === "MATRICULA"
                          ? "Matrícula"
                          : `Mensualidad ${cuota.numeroCuota}`}
                      </Text>
                    </View>
                    <View className="flex-[1.5] justify-center">
                      <Text
                        className="text-sm"
                        style={{
                          color: overdue
                            ? theme.colors.destructive
                            : theme.colors.textSecondary,
                        }}
                      >
                        {formatDisplayDate(cuota.fecha_vencimiento)}
                      </Text>
                    </View>
                    <View className="flex-[1.5] items-end justify-center">
                      <Text
                        className="text-sm font-bold"
                        style={{ color: theme.colors.text }}
                      >
                        {cuota.monto.toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-[1.5] items-center justify-center">
                      <View
                        className="px-2 py-1 rounded-full flex-row items-center gap-1"
                        style={{
                          backgroundColor:
                            cuota.estadoCuota === "Pagado"
                              ? theme.colors.success + "20"
                              : overdue
                                ? theme.colors.destructive + "20"
                                : theme.colors.backgroundTertiary,
                          borderWidth: overdue ? 1 : 0,
                          borderColor: overdue
                            ? theme.colors.destructive + "33"
                            : "transparent",
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
                          className="text-xs font-semibold"
                          style={{
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
                    <View className="flex-[1.5] items-end justify-center">
                      {isPending ? (
                        <Pressable
                          onPress={(e) => {
                            // Detener propagación para que no dispare el toggle al hacer click en el botón de pago
                            e.stopPropagation();
                            setSelectedCuotas(new Set([cuota.idCuota]));
                            setModalVisible(true);
                          }}
                          className="px-3 py-1.5 rounded-lg"
                          style={{
                            backgroundColor: overdue
                              ? theme.colors.primary
                              : "transparent",
                            borderWidth: overdue ? 0 : 1,
                            borderColor: theme.colors.primary,
                          }}
                        >
                          <Text
                            className="text-sm font-semibold"
                            style={{
                              color: overdue
                                ? theme.colors.primaryForeground
                                : theme.colors.primary,
                            }}
                          >
                            Pagar
                          </Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={async () => {
                            try {
                              let idPago =
                                (cuota as any).idPago ||
                                (cuota as any).id_pago ||
                                (cuota as any).pago_id;

                              if (!idPago) {
                                const response = await pagoService.getPagos({
                                  idUsuario: selectedStudentId,
                                  per_page: 50,
                                });

                                if (response.success && response.data?.data) {
                                  const pagos = response.data.data;
                                  
                                  // Log para ver estructura real
                                  if (__DEV__) console.log('Primer pago:', JSON.stringify(pagos[0], null, 2));

                                  const pagoMatch = pagos.find((p: any) => {
                                    const cuotasArr = p.cuotas ?? p.Cuotas ?? [];
                                    
                                    if (Array.isArray(cuotasArr) && cuotasArr.length > 0) {
                                      return cuotasArr.some((c: any) => {
                                        // Si es objeto
                                        if (typeof c === 'object' && c !== null) {
                                          return (
                                            c.idCuota === cuota.idCuota ||
                                            c.id === cuota.idCuota ||
                                            c.id_cuota === cuota.idCuota
                                          );
                                        }
                                        // Si es número directo
                                        return c === cuota.idCuota;
                                      });
                                    }
                                    return false;
                                  });

                                  if (pagoMatch) {
                                    idPago = pagoMatch.id ?? pagoMatch.idPago ?? pagoMatch.id_pago;
                                  }
                                }
                              }

                              if (idPago) {
                                setSelectedIdPago(idPago);
                                setReciboModalVisible(true);
                              } else {
                                alert("El recibo aún no está disponible.");
                              }
                            } catch (error) {
                              console.error("Error al buscar el recibo:", error);
                              alert("Error al buscar el recibo.");
                            }
                          }}
                          className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg"
                          style={{
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                          }}
                        >
                          <Ionicons
                            name="receipt-outline"
                            size={14}
                            color={theme.colors.textSecondary}
                          />
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            Ver recibo
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>

      <SummaryCards
        totalPagado={totalPagado}
        totalDebe={totalDebe}
        proximaVencimiento={proximaVencimiento}
      />

      {/* Modal de pago multicuota */}
      <ReciboViewerModal
        visible={reciboModalVisible}
        idPago={selectedIdPago}
        onClose={() => {
          setReciboModalVisible(false);
          setSelectedIdPago(null);
        }}
      />
      <PaymentMulticuotaModal
        visible={modalVisible}
        cuotas={cuotasParaPagar}
        idUsuario={selectedStudentId}
        onClose={() => {
          setModalVisible(false);
          setCuotasDirectas(null); 
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};
