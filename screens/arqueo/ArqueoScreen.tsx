import { Plus } from "lucide-react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { useResponsive } from "../../hooks/useResponsive";
import { getToken } from "../../storage/secureStorage";
import { useTheme } from "../../theme/useTheme";
import { ArqueoDetailModal } from "./components/ArqueoDetailModal";
import { ArqueoHistoryHeader } from "./components/ArqueoHistoryHeader";
import ArqueoOpenModal from "./components/ArqueoOpenModal";
import { ArqueoPaginationFooter } from "./components/ArqueoPaginationFooter";
import { ArqueoTable } from "./components/ArqueoTable";
import { ArqueoTransaccionForm } from "./components/ArqueoTransaccionForm";
import { ArqueoTransaccionTable } from "./components/ArqueoTransaccionTable";
import { TiposTransaccionTab } from "./components/TiposTransaccionTab";
import { useArqueo } from "./hooks/useArqueo";
import { useArqueoTransacciones } from "./hooks/useArqueoTransacciones";
import { arqueoService } from "./services/arqueo.service";
import { Arqueo } from "./types/arqueo.types";

type Tab = "arqueos" | "ingresos" | "egresos" | "configuracion";

export default function ArqueoScreen() {
  const { theme } = useTheme();
  const { activeArqueo, refetch } = useArqueo();
  const { isMobile } = useResponsive();

  const [activeTab, setActiveTab] = useState<Tab>("arqueos");
  const [openModalVisible, setOpenModalVisible] = useState(false);

  const [transaccionFormVisible, setTransaccionFormVisible] = useState(false);
  const [transaccionFormTipo, setTransaccionFormTipo] = useState<
    "INGRESO" | "EGRESO"
  >("INGRESO");

  const [arqueos, setArqueos] = useState<Arqueo[]>([]);
  const [loadingArqueos, setLoadingArqueos] = useState(true);
  const [selectedArqueo, setSelectedArqueo] = useState<Arqueo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPageArqueos, setCurrentPageArqueos] = useState(1);
  const [hasNextPageArqueos, setHasNextPageArqueos] = useState(false);
  const PER_PAGE = 15;

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [turno, setTurno] = useState("");
  const [fechaAperturaFrom, setFechaAperturaFrom] = useState("");
  const [fechaAperturaTo, setFechaAperturaTo] = useState("");
  const [fechaCierreFrom, setFechaCierreFrom] = useState("");
  const [fechaCierreTo, setFechaCierreTo] = useState("");
  const [totalMin, setTotalMin] = useState<number | undefined>(undefined);
  const [totalMax, setTotalMax] = useState<number | undefined>(undefined);

  const [arqueoDetalle, setArqueoDetalle] = useState<Arqueo | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const {
    ingresos,
    egresos,
    ingresosCombinados,
    loadingTransacciones,
    loadTransacciones,
    createTransaccion,
    updateTransaccionEstado,
    updatingId,
  } = useArqueoTransacciones(
    activeArqueo?.id ?? null,
    arqueoDetalle?.pagos ?? [],
  );

  useEffect(() => {
    if (activeTab === "ingresos" && activeArqueo && !arqueoDetalle) {
      const loadDetalle = async () => {
        setLoadingDetalle(true);
        try {
          const response = await arqueoService.getById(activeArqueo.id);
          setArqueoDetalle(response.data);
        } catch (err) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "No se pudo cargar el detalle del arqueo",
          });
        } finally {
          setLoadingDetalle(false);
        }
      };
      loadDetalle();
    }
  }, [activeTab, activeArqueo, arqueoDetalle]);

  const loadArqueos = useCallback(
    async (page: number) => {
      setLoadingArqueos(true);
      try {
        const response = await arqueoService.getHistory(
          page,
          filterEstado,
          appliedSearchQuery || undefined,
          turno || undefined,
          fechaAperturaFrom || undefined,
          fechaAperturaTo || undefined,
          fechaCierreFrom || undefined,
          fechaCierreTo || undefined,
          totalMin,
          totalMax,
        );
        setArqueos(response.data);
        setHasNextPageArqueos(response.data.length === PER_PAGE);
        setCurrentPageArqueos(page);
      } catch {
      } finally {
        setLoadingArqueos(false);
      }
    },
    [
      appliedSearchQuery,
      filterEstado,
      turno,
      fechaAperturaFrom,
      fechaAperturaTo,
      fechaCierreFrom,
      fechaCierreTo,
      totalMin,
      totalMax,
    ],
  );

  useEffect(() => {
    loadArqueos(1);
  }, [loadArqueos]);

  useEffect(() => {
    if (activeTab === "ingresos") loadTransacciones("INGRESO");
    else if (activeTab === "egresos") loadTransacciones("EGRESO");
  }, [activeTab, activeArqueo]);

  const handlePageChangeArqueos = (newPage: number) => loadArqueos(newPage);
  const handleDetail = (arqueo: Arqueo) => {
    setSelectedArqueo(arqueo);
    setModalVisible(true);
  };

  const handleClearFilters = () => {
    setTurno("");
    setFechaAperturaFrom("");
    setFechaAperturaTo("");
    setFechaCierreFrom("");
    setFechaCierreTo("");
    setTotalMin(undefined);
    setTotalMax(undefined);
    setFilterEstado("");
    setSearchQuery("");
    setAppliedSearchQuery("");
  };

  const handleOpenTransaccionForm = (tipo: "INGRESO" | "EGRESO") => {
    setTransaccionFormTipo(tipo);
    setTransaccionFormVisible(true);
  };

  const handlePrintReceipt = async (
    idOriginal: number,
    origen: "pago" | "ingreso" | "egreso",
  ) => {
    try {
      const token = await getToken();
      let url = "";
      if (origen === "pago") {
        url = `/api/pagos/${idOriginal}/recibo?token=${token}`;
      } else if (origen === "ingreso") {
        url = `/api/ingresos/${idOriginal}/recibo?token=${token}`;
      } else if (origen === "egreso") {
        url = `/api/egresos/${idOriginal}/recibo?token=${token}`;
      }
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

  const tabs = [
    { key: "arqueos", label: "Arqueos Diarios" },
    { key: "ingresos", label: "Ingresos" },
    { key: "egresos", label: "Egresos" },
    { key: "configuracion", label: "Configuración de Cajas" },
  ] as const;

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[
          styles.container,
          isMobile ? styles.mobile : styles.desktop,
        ]}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <ThemedText
            style={[styles.headerTitle, { color: theme.colors.text }]}
          >
            Gestión de Arqueos
          </ThemedText>
          <ThemedText
            style={{
              color: theme.colors.textSecondary,
              fontSize: 14,
              marginTop: 4,
            }}
          >
            Administración y control de flujo de caja.
          </ThemedText>
        </MotiView>

        <View
          style={[
            styles.tabContainer,
            { borderBottomColor: theme.colors.border },
          ]}
        >
          {tabs.map((tab) => (
            <MotiPressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
              style={[
                styles.tabItem,
                activeTab === tab.key && {
                  borderBottomColor: theme.colors.primary,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabLabel,
                  {
                    color:
                      activeTab === tab.key
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                  },
                ]}
              >
                {tab.label}
              </ThemedText>
            </MotiPressable>
          ))}
        </View>

        {activeTab === "arqueos" && (
          <>
            <View style={styles.historySection}>
              <ArqueoHistoryHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchSubmit={() => {
                  setAppliedSearchQuery(searchQuery);
                  loadArqueos(1);
                }}
                filterEstado={filterEstado}
                onFilterChange={setFilterEstado}
                turno={turno}
                onTurnoChange={setTurno}
                fechaAperturaFrom={fechaAperturaFrom}
                fechaAperturaTo={fechaAperturaTo}
                onFechaAperturaChange={(f, t) => {
                  setFechaAperturaFrom(f);
                  setFechaAperturaTo(t);
                }}
                fechaCierreFrom={fechaCierreFrom}
                fechaCierreTo={fechaCierreTo}
                onFechaCierreChange={(f, t) => {
                  setFechaCierreFrom(f);
                  setFechaCierreTo(t);
                }}
                totalMin={totalMin}
                totalMax={totalMax}
                onTotalChange={(min, max) => {
                  setTotalMin(min);
                  setTotalMax(max);
                }}
                onClearFilters={handleClearFilters}
              />
              <ArqueoTable
                arqueos={arqueos}
                loading={loadingArqueos}
                onDetail={handleDetail}
              />
              <View style={{ marginTop: 16 }}>
                <ArqueoPaginationFooter
                  currentPage={currentPageArqueos}
                  hasNextPage={hasNextPageArqueos}
                  onPageChange={handlePageChangeArqueos}
                />
              </View>
            </View>
          </>
        )}

        {(activeTab === "ingresos" || activeTab === "egresos") && (
          <View style={{ marginTop: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: theme.colors.text,
                }}
              >
                {activeTab === "ingresos" ? "Ingresos" : "Egresos"}
              </ThemedText>
              <MotiPressable
                onPress={() =>
                  handleOpenTransaccionForm(
                    activeTab === "ingresos" ? "INGRESO" : "EGRESO",
                  )
                }
                animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
                style={[
                  styles.newButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Plus size={16} color="#fff" />
                <ThemedText
                  style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}
                >
                  Nuevo {activeTab === "ingresos" ? "Ingreso" : "Egreso"}
                </ThemedText>
              </MotiPressable>
            </View>

            <ArqueoTransaccionTable
              transacciones={
                activeTab === "ingresos" ? ingresosCombinados : egresos
              }
              loading={loadingTransacciones || loadingDetalle}
              tipo={activeTab === "ingresos" ? "INGRESO" : "EGRESO"}
              onUpdateEstado={(id, nuevoEstado) =>
                updateTransaccionEstado(
                  activeTab === "ingresos" ? "INGRESO" : "EGRESO",
                  id,
                  nuevoEstado,
                )
              }
              updatingId={updatingId}
              arqueoId={activeArqueo?.id ?? null}
              showReceipt={true}
              onPrintReceipt={handlePrintReceipt}
            />
          </View>
        )}

        {activeTab === "configuracion" && (
          <View style={{ marginTop: 16 }}>
            <TiposTransaccionTab />
          </View>
        )}
      </ScrollView>

      <ArqueoOpenModal
        visible={openModalVisible}
        onClose={() => setOpenModalVisible(false)}
        onSuccess={() => {
          setOpenModalVisible(false);
          refetch();
        }}
      />
      {selectedArqueo && (
        <ArqueoDetailModal
          visible={modalVisible}
          arqueoId={selectedArqueo.id}
          onClose={() => setModalVisible(false)}
        />
      )}

      <ArqueoTransaccionForm
        visible={transaccionFormVisible}
        onClose={() => setTransaccionFormVisible(false)}
        onSubmit={(payload) => createTransaccion(transaccionFormTipo, payload)}
        tipo={transaccionFormTipo}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 16, gap: 16 },
  mobile: { paddingHorizontal: 12 },
  desktop: {
    paddingHorizontal: 24,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginTop: 16,
    gap: 24,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabLabel: { fontSize: 14, fontWeight: "600" },
  historySection: { marginTop: 16, gap: 8 },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
