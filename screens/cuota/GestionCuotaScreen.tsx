// screens/cuota/GestionCuotaScreen.tsx
import { ThemeSelector } from "@/components/ThemeSelector";
import React, { useCallback, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useResponsive } from "../../hooks/useResponsive";
import { useTheme } from "../../theme/useTheme";
import { CarrerasList } from "./components/CarrerasList";
import { CuotasTable } from "./components/CuotasTable";
import { PaymentHistory } from "./components/PaymentHistory";
import { PaymentReceiptModal } from "./components/PaymentReceiptModal";
import { StudentListView } from "./components/StudentListView";
import { StudentSearchBar } from "./components/StudentSearchBar";
import { StudentSummaryHeader } from "./components/StudentSummaryHeader";
import { useCarreraCuotas } from "./hooks/useCarreraCuotas";
import { usePagos } from "./hooks/usePagos";
import { useStudentCarreras } from "./hooks/useStudentCarreras";
import { useStudentSearch } from "./hooks/useStudentSearch";
import { Estudiante } from "./types/cuota.types";
import { Pago } from "./types/pago.types";

type ActiveTab = "cuotas" | "pagos";

export default function GestionCuotaScreen() {
  const { isMobile } = useResponsive();
  const { theme } = useTheme();
  const {
    students,
    loading: searchLoading,
    refreshing,
    searchTerm,
    setSearchTerm,
    loadMore,
    refresh,
    hasMore,
    selectedStudent,
    selectStudent,
    searchImmediately,
    resetSearch,
  } = useStudentSearch();

  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("cuotas");
  const [receiptPago, setReceiptPago] = useState<Pago | null>(null);

  const {
    carreras,
    loading: carrerasLoading,
    selectedCarrera,
    setSelectedCarrera,
  } = useStudentCarreras(selectedStudent?.id || null);

  const {
    cuotas,
    loading: cuotasLoading,
    loadCuotas,
  } = useCarreraCuotas(
    selectedStudent?.id || null,
    selectedCarrera?.idCarrera || null,
  );

  const {
    pagos,
    loading: pagosLoading,
    refresh: refreshPagos,
  } = usePagos(selectedStudent?.id || null);

  const handleSelectStudent = (student: Estudiante) => {
    selectStudent(student);
    setShowDropdown(false);
    resetSearch();
    setActiveTab("cuotas");
  };

  const handleRefresh = () => {
    if (selectedStudent) {
      loadCuotas();
      refreshPagos();
    } else {
      refresh();
    }
  };

  const handleViewReceipt = (pago: Pago) => {
    setReceiptPago(pago);
  };

  // ──── Animación del indicador de pestañas ────
  const tabLayouts = useRef<{
    cuotas?: { x: number; width: number };
    pagos?: { x: number; width: number };
  }>({});
  const indicatorLeft = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const onTabLayout = (tab: ActiveTab) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabLayouts.current[tab] = { x, width };
    // Solo actualiza si es la pestaña activa actual
    if (tab === activeTab) {
      indicatorLeft.value = x;
      indicatorWidth.value = width;
    }
  };

  const switchTab = useCallback(
    (tab: ActiveTab) => {
      setActiveTab(tab);
      const layout = tabLayouts.current[tab];
      if (layout) {
        indicatorLeft.value = withSpring(layout.x, {
          damping: 20,
          stiffness: 180,
        });
        indicatorWidth.value = withSpring(layout.width, {
          damping: 20,
          stiffness: 180,
        });
      }
    },
    [indicatorLeft, indicatorWidth],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    left: indicatorLeft.value,
    width: indicatorWidth.value,
  }));

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Cabecera con buscador */}
      <View
        className="px-6 pt-6 pb-4 border-b z-10"
        style={{
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        }}
      >
        <View
          className={`${isMobile ? "flex-col gap-4" : "flex-row justify-between items-center"}`}
        >
          <ThemeSelector />
          <View>
            <Text
              className="text-2xl md:text-3xl font-bold"
              style={{ color: theme.colors.text }}
            >
              Instituto Tecnológico del Sur
            </Text>
            <Text
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              Gestión de Pagos por Carrera
            </Text>
          </View>
          <View className={`${isMobile ? "w-full" : "w-80"} relative z-20`}>
            <StudentSearchBar
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSearch={() => searchImmediately(searchTerm)}
              onFocus={() => setShowDropdown(true)}
              isLoading={searchLoading}
            />
            {showDropdown && (students.length > 0 || searchLoading) && (
              <View
                className="absolute top-12 left-0 right-0 rounded-xl border max-h-96 overflow-hidden"
                style={{
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  shadowColor: theme.colors.text,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <StudentListView
                  students={students}
                  loading={searchLoading}
                  refreshing={refreshing}
                  onRefresh={() => {
                    refresh();
                    setShowDropdown(true);
                  }}
                  onLoadMore={loadMore}
                  hasMore={hasMore}
                  onSelectStudent={handleSelectStudent}
                  isDropdown
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Contenido scrollable */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing || carrerasLoading || cuotasLoading || pagosLoading
            }
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 24 }}
      >
        {!selectedStudent ? (
          <View className="flex-1 justify-center items-center min-h-[400px] px-4">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: theme.colors.backgroundSecondary }}
            >
              <Text className="text-5xl">🔍</Text>
            </View>
            <Text
              className="text-xl font-bold text-center mb-2"
              style={{ color: theme.colors.text }}
            >
              Buscar Estudiante
            </Text>
            <Text
              className="text-sm text-center"
              style={{ color: theme.colors.textSecondary }}
            >
              Utilice la barra de búsqueda superior para encontrar un estudiante
              por nombre, CI o matrícula y gestionar sus pagos.
            </Text>
          </View>
        ) : (
          <View className="gap-6">
            <StudentSummaryHeader student={selectedStudent} />

            <View>
              <Text
                className="text-xs font-bold uppercase tracking-wide mb-3"
                style={{ color: theme.colors.textSecondary }}
              >
                Carreras Inscritas
              </Text>
              <CarrerasList
                carreras={carreras}
                selectedCarrera={selectedCarrera}
                onSelectCarrera={setSelectedCarrera}
                loading={carrerasLoading}
              />
            </View>

            {/* ──── Pestañas con indicador deslizante ──── */}
            <View className="flex-row justify-center">
              <View
                className="flex-row rounded-full p-1 relative"
                style={{ backgroundColor: theme.colors.backgroundSecondary }}
              >
                {/* Indicador animado */}
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      top: 4,
                      bottom: 4,
                      borderRadius: 9999,
                      backgroundColor: theme.colors.primary,
                    },
                    indicatorStyle,
                  ]}
                />

                {/* Botón Cuotas */}
                <Pressable
                  onLayout={onTabLayout("cuotas")}
                  onPress={() => switchTab("cuotas")}
                  className="py-2 px-6 rounded-full z-10"
                  style={{ backgroundColor: "transparent" }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeTab === "cuotas" }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color:
                        activeTab === "cuotas"
                          ? theme.colors.primaryForeground
                          : theme.colors.textSecondary,
                    }}
                  >
                    Cuotas
                  </Text>
                </Pressable>

                {/* Botón Historial de Pagos */}
                <Pressable
                  onLayout={onTabLayout("pagos")}
                  onPress={() => switchTab("pagos")}
                  className="py-2 px-6 rounded-full z-10"
                  style={{ backgroundColor: "transparent" }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeTab === "pagos" }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color:
                        activeTab === "pagos"
                          ? theme.colors.primaryForeground
                          : theme.colors.textSecondary,
                    }}
                  >
                    Historial de Pagos
                  </Text>
                </Pressable>
              </View>
            </View>

            {activeTab === "cuotas" ? (
              <CuotasTable
                cuotas={cuotas}
                loading={cuotasLoading}
                carrera={selectedCarrera}
                onRefresh={loadCuotas}
                selectedStudentId={selectedStudent.id}
              />
            ) : (
              <PaymentHistory
                pagos={pagos}
                loading={pagosLoading}
                onViewReceipt={handleViewReceipt}
              />
            )}
          </View>
        )}
      </ScrollView>

      <PaymentReceiptModal
        visible={!!receiptPago}
        pago={receiptPago}
        onClose={() => setReceiptPago(null)}
      />
    </View>
  );
}
