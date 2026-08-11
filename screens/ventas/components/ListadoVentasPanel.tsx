import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { Colors } from "../../../theme/types";
import { InventarioVenta, FiltrosVenta } from "../types/venta.types";
import { ventaService } from "../services/venta.service";
import { AnularVentaModal } from "./AnularVentaModal";
import { FiltrosVentasPanel } from "./FiltrosVentasPanel";
import { getToken } from "../../../storage/secureStorage";
import { BASE_URL } from "../../../http/httpClient";
import * as WebBrowser from "expo-web-browser";

interface ListadoVentasPanelProps {
  colors: Colors;
}

export const ListadoVentasPanel: React.FC<ListadoVentasPanelProps> = ({ colors }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const [ventas, setVentas] = useState<InventarioVenta[]>([]);
  const [loading, setLoading] = useState(false); // Cambiado a false, el panel aplica filtros al montar
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState<FiltrosVenta>({});
  const [ventaSeleccionada, setVentaSeleccionada] = useState<InventarioVenta | null>(null);
  const [modalAnularVisible, setModalAnularVisible] = useState(false);
  const [anulando, setAnulando] = useState(false);

  useEffect(() => {
    if (Object.keys(filtros).length > 0) {
      cargarVentas();
    }
  }, [page, filtros]);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      const response = await ventaService.getVentasConFiltros(filtros, page, 25);

      setVentas(response.data);
      setTotalPages(response.last_page);
      setTotal(response.total);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error al cargar ventas",
        text2: error.message || "No se pudieron cargar las ventas",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    setFiltros({ ...filtros, search: busqueda });
    setPage(1);
  };

  const handleAplicarFiltros = (nuevosFiltros: FiltrosVenta) => {
    setFiltros({ ...filtros, ...nuevosFiltros });
    setPage(1);
  };

  const handleLimpiarFiltros = () => {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    setBusqueda("");
    setFiltros({ mes: mesActual, anio: anioActual });
    setPage(1);
  };

  const handleAnularVenta = async (motivo: string, observacion?: string) => {
    if (!ventaSeleccionada?.idVenta) return;

    try {
      setAnulando(true);
      const response = await ventaService.cancel(ventaSeleccionada.idVenta, {
        motivo,
        observacion,
      });

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Venta anulada",
          text2: "La venta fue anulada correctamente y el inventario fue restaurado",
        });

        setModalAnularVisible(false);
        setVentaSeleccionada(null);
        cargarVentas(); // Recargar listado
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.message || "No se pudo anular la venta",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error al anular",
        text2: error.message || "No se pudo anular la venta",
      });
    } finally {
      setAnulando(false);
    }
  };

  const abrirModalAnular = (venta: InventarioVenta) => {
    setVentaSeleccionada(venta);
    setModalAnularVisible(true);
  };

  const abrirComprobante = async (idVenta: number) => {
    try {
      const token = await getToken();
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se encontró el token de autenticación",
        });
        return;
      }

      // Construir URL del recibo con el token
      const url = `${BASE_URL}/api/ventas/${idVenta}/recibo?token=${encodeURIComponent(token)}`;

      // Abrir en el navegador
      await WebBrowser.openBrowserAsync(url);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error al abrir comprobante",
        text2: error.message || "No se pudo abrir el comprobante",
      });
    }
  };

  const renderVenta = ({ item }: { item: InventarioVenta }) => {
    const fechaVenta = item.fechaVenta
      ? new Date(item.fechaVenta).toLocaleDateString("es-BO")
      : "N/A";

    const esAnulada = item.estado === "CANCELADO";

    return (
      <View
        style={{
          padding: isMobile ? 12 : 16,
          borderBottomWidth: 1,
          borderColor: colors.border,
          backgroundColor: esAnulada ? `${colors.destructive}10` : colors.card,
        }}
      >
        <View
          style={{
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 8 : 16,
            alignItems: isMobile ? "flex-start" : "center",
          }}
        >
          {/* Número de venta */}
          <View style={{ width: isMobile ? "100%" : 80 }}>
            <ThemedText style={{ fontSize: 12, color: colors.textMuted, fontWeight: "600" }}>
              Venta #{item.idVenta}
            </ThemedText>
          </View>

          {/* Fecha */}
          <View style={{ flex: 1 }}>
            <ThemedText style={{ fontSize: 13, fontWeight: "700" }}>
              {fechaVenta}
            </ThemedText>
            <ThemedText style={{ fontSize: 11, color: colors.textMuted }}>
              {item.arqueo?.turno || "N/A"}
            </ThemedText>
          </View>

          {/* Método de pago y Total */}
          <View style={{ flex: 1 }}>
            <ThemedText style={{ fontSize: 14, fontWeight: "900", color: colors.primary }}>
              Bs {Number(item.total).toFixed(2)}
            </ThemedText>
            <ThemedText style={{ fontSize: 11, color: colors.textMuted }}>
              {item.metodo_pago}
            </ThemedText>
          </View>

          {/* Estado */}
          <View>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: esAnulada
                  ? `${colors.destructive}20`
                  : `${colors.success}20`,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 11,
                  fontWeight: "900",
                  color: esAnulada ? colors.destructive : colors.success,
                }}
              >
                {esAnulada ? "ANULADA" : item.estado}
              </ThemedText>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={{ flexDirection: isMobile ? "column" : "row", gap: 8 }}>
            {/* Botón Comprobante - SIEMPRE visible */}
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: `${colors.primary}15`,
                borderWidth: 1,
                borderColor: `${colors.primary}30`,
              }}
              onPress={() => item.idVenta && abrirComprobante(item.idVenta)}
            >
              <Ionicons name="receipt" size={18} color={colors.primary} />
              {!isMobile && (
                <ThemedText style={{ fontSize: 12, fontWeight: "900", color: colors.primary }}>
                  Comprobante
                </ThemedText>
              )}
            </Pressable>

            {/* Botón Dar de Baja - Solo si arqueo está INICIADO */}
            {!esAnulada && item.arqueo?.estado === "INICIADO" && (
              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: `${colors.destructive}15`,
                  borderWidth: 1,
                  borderColor: `${colors.destructive}30`,
                }}
                onPress={() => abrirModalAnular(item)}
              >
                <Ionicons name="close-circle" size={18} color={colors.destructive} />
                {!isMobile && (
                  <ThemedText style={{ fontSize: 12, fontWeight: "900", color: colors.destructive }}>
                    Dar de Baja
                  </ThemedText>
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* Información de anulación si aplica */}
        {esAnulada && item.motivoAnulacion && (
          <View
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderColor: `${colors.destructive}30`,
            }}
          >
            <ThemedText style={{ fontSize: 11, fontWeight: "900", color: colors.destructive }}>
              Motivo de anulación:
            </ThemedText>
            <ThemedText style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
              {item.motivoAnulacion}
            </ThemedText>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Filtros compactos */}
      <FiltrosVentasPanel
        colors={colors}
        onAplicarFiltros={handleAplicarFiltros}
        onLimpiarFiltros={handleLimpiarFiltros}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        onBuscar={handleBuscar}
      />

      {/* Listado */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={{ marginTop: 16, color: colors.textMuted }}>
            Cargando ventas...
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={ventas}
          renderItem={renderVenta}
          keyExtractor={(item) => item.idVenta?.toString() || Math.random().toString()}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
              <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
              <ThemedText style={{ marginTop: 12, fontSize: 14, color: colors.textMuted }}>
                No se encontraron ventas
              </ThemedText>
            </View>
          }
        />
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderTopWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Pressable
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: page > 1 ? colors.primary : colors.backgroundSecondary,
            }}
            onPress={() => page > 1 && setPage(page - 1)}
            disabled={page === 1}
          >
            <ThemedText
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: page > 1 ? colors.primaryForeground : colors.textMuted,
              }}
            >
              Anterior
            </ThemedText>
          </Pressable>

          <ThemedText style={{ fontSize: 13, fontWeight: "700" }}>
            Página {page} de {totalPages}
          </ThemedText>

          <Pressable
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: page < totalPages ? colors.primary : colors.backgroundSecondary,
            }}
            onPress={() => page < totalPages && setPage(page + 1)}
            disabled={page === totalPages}
          >
            <ThemedText
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: page < totalPages ? colors.primaryForeground : colors.textMuted,
              }}
            >
              Siguiente
            </ThemedText>
          </Pressable>
        </View>
      )}

      {/* Footer info */}
      <View
        style={{
          padding: 12,
          backgroundColor: colors.backgroundSecondary,
          borderTopWidth: 1,
          borderColor: colors.border,
        }}
      >
        <ThemedText style={{ fontSize: 12, fontWeight: "600", color: colors.textMuted, textAlign: "center" }}>
          Mostrando {ventas.length} de {total} ventas
        </ThemedText>
      </View>

      {/* Modal de anulación */}
      <AnularVentaModal
        visible={modalAnularVisible}
        venta={ventaSeleccionada}
        onClose={() => {
          setModalAnularVisible(false);
          setVentaSeleccionada(null);
        }}
        onConfirm={handleAnularVenta}
        colors={colors}
        anulando={anulando}
      />
    </View>
  );
};
