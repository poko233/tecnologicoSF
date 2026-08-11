import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../components/ThemedText";
import { useTheme } from "../../theme/useTheme";
import HistorialIngresosPanel from "./components/HistorialIngresosPanel";
import IngresoProductosTabs from "./components/IngresoProductosTabs";
import RealizarIngresoPanel from "./components/RealizarIngresoPanel";
import { useIngresoProductos } from "./hooks/useIngresoProductos";
import { createIngresoProductosStyles } from "./styles/ingresoProductos.styles";
import {
  IngresoProductoPayload,
  TabIngresoProducto,
} from "./types/ingresoProductos.types";

export default function IngresoProductosScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width < 760;

  const styles = useMemo(
    () => createIngresoProductosStyles(
      theme.colors,
      isMobile,
      width < 1120,
    ),
    [theme.colors, isMobile, width],
  );

  const {
    ingresos,
    productos,
    categorias,
    loading,
    loadingHistorial,
    guardando,
    previsualizandoId,
    cargar,
    cargarHistorial,
    registrar,
    prepararPrevisualizacionRecibo,
    cerrarPrevisualizacionRecibo,
    previsualizarRecibo,
  } = useIngresoProductos();

  const [tab, setTab] =
    useState<TabIngresoProducto>("realizar");

  const [refreshing, setRefreshing] = useState(false);

  const accent =
    theme.colors.success || theme.colors.primary;

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      if (tab === "historial") {
        await cargarHistorial();
      } else {
        await cargar(true);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleRealizarIngreso = async (
    payload: IngresoProductoPayload,
  ) => {
    /*
     * Se abre la pestaña antes de realizar el POST.
     * Así Chrome reconoce la apertura como una acción directa
     * del usuario y no la bloquea.
     */
    const ventanaPreview =
      prepararPrevisualizacionRecibo();

    const ingreso = await registrar(payload);

    if (!ingreso) {
      cerrarPrevisualizacionRecibo(ventanaPreview);
      return null;
    }

    setTab("historial");

    await previsualizarRecibo(
      ingreso.idIngresoProducto,
      ventanaPreview,
    );

    return ingreso;
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
            tintColor={accent}
          />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroTitleRow}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="add-circle"
                  size={32}
                  color={accent}
                />
              </View>

              <View style={styles.heroTextBox}>
                <ThemedText style={styles.kicker}>
                  GESTIÓN DE INVENTARIO
                </ThemedText>

                <ThemedText style={styles.heroTitle}>
                  Ingreso de Productos
                </ThemedText>

                <ThemedText style={styles.heroSubtitle}>
                  Registra uno o varios productos en una sola
                  operación y actualiza automáticamente sus
                  existencias
                </ThemedText>
              </View>
            </View>
          </View>

          <IngresoProductosTabs
            value={tab}
            onChange={setTab}
            styles={styles}
            colors={theme.colors}
          />
        </View>

        <View style={styles.panelContainer}>
          {tab === "realizar" ? (
            <RealizarIngresoPanel
              productos={productos}
              categorias={categorias}
              loading={loading}
              registrando={guardando}
              onRealizarIngreso={handleRealizarIngreso}
              styles={styles}
              colors={theme.colors}
            />
          ) : (
            <HistorialIngresosPanel
              ingresos={ingresos}
              loading={loadingHistorial}
              previsualizandoId={previsualizandoId}
              onCargar={cargarHistorial}
              onPrevisualizar={previsualizarRecibo}
              styles={styles}
              colors={theme.colors}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}