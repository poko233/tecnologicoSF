import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, View, useWindowDimensions } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { useTheme } from "../../theme/useTheme";
import BajaTabs from "./components/BajaTabs";
import HistorialBajasPanel from "./components/HistorialBajasPanel";
import RealizarBajaPanel from "./components/RealizarBajaPanel";
import BajaReporteModal from "./components/BajaReporteModal";
import { useBajas } from "./hooks/useBajas";
import { createBajaStyles } from "./styles/baja.styles";
import { ConceptoBaja, ProductoBajaItem, TabBaja } from "./types/baja.types";

export default function BajasScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const styles = useMemo(
    () => createBajaStyles(theme.colors, isMobile, width < 1120),
    [theme.colors, isMobile, width]
  );

  const { bajas, loading, registrando, cargarHistorial, crearBaja } = useBajas();

  const [tab, setTab] = useState<TabBaja>("realizar");
  const [refreshing, setRefreshing] = useState(false);
  const [bajaRegistrada, setBajaRegistrada] = useState<any>(null);
  const [reporteVisible, setReporteVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    if (tab === "historial") {
      await cargarHistorial();
    }
    setRefreshing(false);
  };

  const handleRealizarBaja = async (
    concepto: ConceptoBaja,
    observacion: string,
    productos: ProductoBajaItem[]
  ) => {
    const payload = {
      concepto,
      observacion: observacion || null,
      detalles: productos.map((p) => ({
        idProducto: p.idProducto,
        cantidad: p.cantidad,
        precioUnitario: p.precioVenta,
        subTotal: p.subTotal,
      })),
    };

    const exito = await crearBaja(payload);

    if (exito) {
      setBajaRegistrada({
        concepto,
        observacion,
        productos,
        fecha: new Date().toISOString(),
        total: productos.reduce((sum, p) => sum + p.subTotal, 0),
      });
      setReporteVisible(true);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroTitleRow}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="remove-circle"
                  size={32}
                  color={theme.colors.destructive}
                />
              </View>
              <View style={styles.heroTextBox}>
                <ThemedText style={styles.kicker}>
                  GESTIÓN DE INVENTARIO
                </ThemedText>
                <ThemedText style={styles.heroTitle}>Bajas de Productos</ThemedText>
                <ThemedText style={styles.heroSubtitle}>
                  Registra bajas de inventario por productos dañados, vencidos, perdidos o ajustes de stock
                </ThemedText>
              </View>
            </View>
          </View>

          <BajaTabs
            value={tab}
            onChange={setTab}
            styles={styles}
            colors={theme.colors}
          />
        </View>

        <View style={styles.panelContainer}>
          {tab === "realizar" ? (
            <RealizarBajaPanel
              onRealizarBaja={handleRealizarBaja}
              registrando={registrando}
              styles={styles}
              colors={theme.colors}
            />
          ) : (
            <HistorialBajasPanel
              bajas={bajas}
              loading={loading}
              onCargar={cargarHistorial}
              styles={styles}
              colors={theme.colors}
            />
          )}
        </View>

        <BajaReporteModal
          visible={reporteVisible}
          onClose={() => {
            setReporteVisible(false);
            setTab("historial");
          }}
          baja={bajaRegistrada}
          colors={theme.colors}
        />
      </ScrollView>
    </View>
  );
}
