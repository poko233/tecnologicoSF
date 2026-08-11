import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Colors } from "../../../theme/types";
import { FiltrosVenta } from "../types/venta.types";
import DatePickerModal, { DatePickerResult } from "../../../components/DatePickerModal";

interface FiltrosVentasPanelProps {
  colors: Colors;
  onAplicarFiltros: (filtros: FiltrosVenta) => void;
  onLimpiarFiltros: () => void;
  busqueda: string;
  onBusquedaChange: (text: string) => void;
  onBuscar: () => void;
}

const MESES = [
  { numero: 1, nombre: "Enero" },
  { numero: 2, nombre: "Febrero" },
  { numero: 3, nombre: "Marzo" },
  { numero: 4, nombre: "Abril" },
  { numero: 5, nombre: "Mayo" },
  { numero: 6, nombre: "Junio" },
  { numero: 7, nombre: "Julio" },
  { numero: 8, nombre: "Agosto" },
  { numero: 9, nombre: "Septiembre" },
  { numero: 10, nombre: "Octubre" },
  { numero: 11, nombre: "Noviembre" },
  { numero: 12, nombre: "Diciembre" },
];

type TipoFiltro = "mes" | "rango";

export const FiltrosVentasPanel: React.FC<FiltrosVentasPanelProps> = ({
  colors,
  onAplicarFiltros,
  onLimpiarFiltros,
  busqueda,
  onBusquedaChange,
  onBuscar,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  // Tipo de filtro activo
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("mes");

  // Estado del mes actual por defecto
  const hoy = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(hoy.getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(hoy.getFullYear());

  // Estados para rango de fechas
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");

  // Estados para los modales
  const [modalMesVisible, setModalMesVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // Generar años (5 años atrás y 2 adelante)
  const anios = Array.from({ length: 8 }, (_, i) => hoy.getFullYear() - 5 + i);

  // Nombre del mes seleccionado
  const nombreMesSeleccionado = MESES.find((m) => m.numero === mesSeleccionado)?.nombre || "";

  // Al montar, aplicar filtro de mes actual
  useEffect(() => {
    onAplicarFiltros({
      mes: mesSeleccionado,
      anio: anioSeleccionado,
    });
  }, []);

  const handleSeleccionarMes = (mes: number) => {
    setMesSeleccionado(mes);
  };

  const handleSeleccionarAnio = (anio: number) => {
    setAnioSeleccionado(anio);
  };

  const handleAplicar = () => {
    setModalMesVisible(false);

    if (tipoFiltro === "mes") {
      onAplicarFiltros({
        mes: mesSeleccionado,
        anio: anioSeleccionado,
      });
    } else {
      // Validar que ambas fechas estén presentes
      if (!fechaInicio || !fechaFin) {
        return;
      }
      onAplicarFiltros({
        fecha_from: fechaInicio,
        fecha_to: fechaFin,
      });
    }
  };

  const handleLimpiar = () => {
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();
    setMesSeleccionado(mesActual);
    setAnioSeleccionado(anioActual);
    setFechaInicio("");
    setFechaFin("");
    setTipoFiltro("mes");
    setModalMesVisible(false);
    onLimpiarFiltros();
  };

  const handleCambiarTipoFiltro = (tipo: TipoFiltro) => {
    setTipoFiltro(tipo);
  };

  const handleDatePickerApply = (result: DatePickerResult) => {
    if (result.type === "range") {
      setFechaInicio(result.start);
      setFechaFin(result.end);
    }
  };

  const formatearFecha = (fecha: string): string => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
      }}
    >
      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          gap: 8,
          alignItems: isMobile ? "stretch" : "center",
        }}
      >
        {/* Toggle compacto */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.backgroundSecondary,
            padding: 2,
            borderRadius: 8,
            gap: 2,
          }}
        >
          <Pressable
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 6,
              backgroundColor: tipoFiltro === "mes" ? colors.primary : "transparent",
            }}
            onPress={() => handleCambiarTipoFiltro("mes")}
          >
            <ThemedText
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: tipoFiltro === "mes" ? colors.primaryForeground : colors.textMuted,
              }}
            >
              Mes
            </ThemedText>
          </Pressable>

          <Pressable
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 6,
              backgroundColor: tipoFiltro === "rango" ? colors.primary : "transparent",
            }}
            onPress={() => handleCambiarTipoFiltro("rango")}
          >
            <ThemedText
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: tipoFiltro === "rango" ? colors.primaryForeground : colors.textMuted,
              }}
            >
              Rango
            </ThemedText>
          </Pressable>
        </View>

        {/* Selector de período/rango */}
        {tipoFiltro === "mes" ? (
          <Pressable
            style={{
              flex: isMobile ? undefined : 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.input,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 8,
              minWidth: isMobile ? undefined : 180,
            }}
            onPress={() => setModalMesVisible(true)}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <ThemedText style={{ fontSize: 12, fontWeight: "600" }}>
                {nombreMesSeleccionado} {anioSeleccionado}
              </ThemedText>
            </View>
            <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
          </Pressable>
        ) : (
          <Pressable
            style={{
              flex: isMobile ? undefined : 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.input,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 8,
              minWidth: isMobile ? undefined : 200,
            }}
            onPress={() => setDatePickerVisible(true)}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              {fechaInicio && fechaFin ? (
                <ThemedText style={{ fontSize: 12, fontWeight: "600" }}>
                  {formatearFecha(fechaInicio)} - {formatearFecha(fechaFin)}
                </ThemedText>
              ) : (
                <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>
                  Seleccionar
                </ThemedText>
              )}
            </View>
            <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
          </Pressable>
        )}

        {/* Botones compactos */}
        <View style={{ flexDirection: "row", gap: 6 }}>
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: colors.primary,
            }}
            onPress={handleAplicar}
          >
            <Ionicons name="search-outline" size={16} color={colors.primaryForeground} />
            {!isMobile && (
              <ThemedText
                style={{ fontSize: 11, fontWeight: "700", color: colors.primaryForeground }}
              >
                Buscar
              </ThemedText>
            )}
          </Pressable>

          <Pressable
            style={{
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: colors.backgroundSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={handleLimpiar}
          >
            <Ionicons name="refresh-outline" size={16} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Campo de búsqueda - Desktop */}
        {!isMobile && (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.input,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 6,
              gap: 6,
            }}
          >
            <Ionicons name="search-outline" size={16} color={colors.textMuted} />
            <TextInput
              style={{
                flex: 1,
                fontSize: 12,
                fontWeight: "600",
                color: colors.text,
                padding: 0,
              }}
              placeholder="Buscar por número, cajero..."
              placeholderTextColor={colors.textMuted}
              value={busqueda}
              onChangeText={onBusquedaChange}
              onSubmitEditing={onBuscar}
            />
            {busqueda.length > 0 && (
              <Pressable onPress={() => onBusquedaChange("")}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Campo de búsqueda - Móvil */}
      {isMobile && (
        <View style={{ marginTop: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.input,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 6,
              gap: 6,
            }}
          >
            <Ionicons name="search-outline" size={16} color={colors.textMuted} />
            <TextInput
              style={{
                flex: 1,
                fontSize: 12,
                fontWeight: "600",
                color: colors.text,
                padding: 0,
              }}
              placeholder="Buscar..."
              placeholderTextColor={colors.textMuted}
              value={busqueda}
              onChangeText={onBusquedaChange}
              onSubmitEditing={onBuscar}
            />
            {busqueda.length > 0 && (
              <Pressable onPress={() => onBusquedaChange("")}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Modal de Selección de Mes */}
      <Modal
        visible={modalMesVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalMesVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: isMobile ? "100%" : 480,
              maxHeight: "90%",
              backgroundColor: colors.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 20,
                borderBottomWidth: 1,
                borderColor: colors.border,
                backgroundColor: `${colors.primary}10`,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: `${colors.primary}20`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="calendar" size={24} color={colors.primary} />
                </View>
                <View>
                  <ThemedText style={{ fontSize: 18, fontWeight: "900" }}>
                    Seleccionar Período
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>
                    Elige el mes y año
                  </ThemedText>
                </View>
              </View>

              <Pressable
                onPress={() => setModalMesVisible(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: colors.backgroundSecondary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 500 }} contentContainerStyle={{ padding: 20 }}>
              {/* Selector de Año */}
              <View style={{ marginBottom: 24 }}>
                <ThemedText
                  style={{
                    fontSize: 13,
                    fontWeight: "900",
                    color: colors.textMuted,
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Año
                </ThemedText>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {anios.map((anio) => {
                    const seleccionado = anio === anioSeleccionado;
                    return (
                      <Pressable
                        key={anio}
                        style={{
                          paddingHorizontal: 20,
                          paddingVertical: 12,
                          borderRadius: 12,
                          backgroundColor: seleccionado ? colors.primary : colors.backgroundSecondary,
                          borderWidth: 1,
                          borderColor: seleccionado ? colors.primary : colors.border,
                          minWidth: 80,
                          alignItems: "center",
                        }}
                        onPress={() => handleSeleccionarAnio(anio)}
                      >
                        <ThemedText
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: seleccionado ? colors.primaryForeground : colors.text,
                          }}
                        >
                          {anio}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Selector de Mes */}
              <View>
                <ThemedText
                  style={{
                    fontSize: 13,
                    fontWeight: "900",
                    color: colors.textMuted,
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Mes
                </ThemedText>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {MESES.map((mes) => {
                    const seleccionado = mes.numero === mesSeleccionado;
                    return (
                      <Pressable
                        key={mes.numero}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 12,
                          backgroundColor: seleccionado ? colors.primary : colors.backgroundSecondary,
                          borderWidth: 1,
                          borderColor: seleccionado ? colors.primary : colors.border,
                          flex: isMobile ? 1 : 0,
                          minWidth: isMobile ? undefined : 120,
                          alignItems: "center",
                        }}
                        onPress={() => handleSeleccionarMes(mes.numero)}
                      >
                        <ThemedText
                          style={{
                            fontSize: 13,
                            fontWeight: "700",
                            color: seleccionado ? colors.primaryForeground : colors.text,
                          }}
                        >
                          {mes.nombre}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                padding: 20,
                borderTopWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.backgroundSecondary,
              }}
            >
              <Pressable
                style={{
                  flex: 1,
                  minHeight: 48,
                  borderRadius: 12,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => setModalMesVisible(false)}
              >
                <ThemedText style={{ fontSize: 14, fontWeight: "900", color: colors.text }}>
                  Cancelar
                </ThemedText>
              </Pressable>

              <Pressable
                style={{
                  flex: 1,
                  minHeight: 48,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                }}
                onPress={handleAplicar}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.primaryForeground} />
                <ThemedText
                  style={{
                    fontSize: 14,
                    fontWeight: "900",
                    color: colors.primaryForeground,
                  }}
                >
                  Aplicar
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Selección de Rango de Fechas */}
      <DatePickerModal
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        mode="range"
        onApply={handleDatePickerApply}
        initialRange={
          fechaInicio && fechaFin
            ? { start: fechaInicio, end: fechaFin }
            : undefined
        }
      />
    </View>
  );
};
