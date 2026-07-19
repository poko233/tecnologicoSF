// screens/arqueo/components/ArqueoHistoryHeader.tsx
import DatePickerModal, {
  DatePickerResult,
} from "@/components/DatePickerModal";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { Calendar, Filter, Search, X } from "lucide-react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

interface ArqueoHistoryHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchSubmit: () => void;
  filterEstado: string;
  onFilterChange: (value: string) => void;
  // Filtros avanzados
  turno: string;
  onTurnoChange: (value: string) => void;
  fechaAperturaFrom: string;
  fechaAperturaTo: string;
  onFechaAperturaChange: (from: string, to: string) => void;
  fechaCierreFrom: string;
  fechaCierreTo: string;
  onFechaCierreChange: (from: string, to: string) => void;
  totalMin: number | undefined;
  totalMax: number | undefined;
  onTotalChange: (min?: number, max?: number) => void;
  onClearFilters: () => void;
}

const TURNOS_OPCIONES = ["Mañana", "Tarde", "Noche"];

export function ArqueoHistoryHeader({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  filterEstado,
  onFilterChange,
  turno,
  onTurnoChange,
  fechaAperturaFrom,
  fechaAperturaTo,
  onFechaAperturaChange,
  fechaCierreFrom,
  fechaCierreTo,
  onFechaCierreChange,
  totalMin,
  totalMax,
  onTotalChange,
  onClearFilters,
}: ArqueoHistoryHeaderProps) {
  const { theme } = useTheme();
  const [showFilters, setShowFilters] = useState(false);

  // Estado local para el input de montos (evita llamadas en tiempo real)
  const [localMin, setLocalMin] = useState<string>(totalMin?.toString() || "");
  const [localMax, setLocalMax] = useState<string>(totalMax?.toString() || "");

  // Sincronizar estado local cuando cambian las props desde fuera
  useEffect(() => {
    setLocalMin(totalMin?.toString() || "");
    setLocalMax(totalMax?.toString() || "");
  }, [totalMin, totalMax]);

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<
    "apertura" | "cierre"
  >("apertura");

  const activeFiltersCount = [
    turno,
    fechaAperturaFrom || fechaAperturaTo,
    fechaCierreFrom || fechaCierreTo,
    totalMin !== undefined || totalMax !== undefined,
  ].filter(Boolean).length;

  const handleDatePickerOpen = (target: "apertura" | "cierre") => {
    setDatePickerTarget(target);
    setDatePickerVisible(true);
  };

  const handleDatePickerApply = (result: DatePickerResult) => {
    if (result.type === "range") {
      if (datePickerTarget === "apertura") {
        onFechaAperturaChange(result.start, result.end);
      } else {
        onFechaCierreChange(result.start, result.end);
      }
    }
    setDatePickerVisible(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setLocalMin("");
    setLocalMax("");
    setShowFilters(false);
  };

  // Aplica el filtro de monto solo cuando el usuario termina de escribir (Enter o Blur)
  const applyMontoFilter = () => {
    const min = localMin === "" ? undefined : parseFloat(localMin);
    const max = localMax === "" ? undefined : parseFloat(localMax);
    if ((min !== undefined && isNaN(min)) || (max !== undefined && isNaN(max)))
      return;
    onTotalChange(min, max);
  };

  const renderFilterChip = (label: string, onRemove: () => void) => (
    <View
      style={[
        styles.chip,
        { backgroundColor: theme.colors.backgroundSecondary },
      ]}
    >
      <ThemedText style={{ fontSize: 12, color: theme.colors.text }}>
        {label}
      </ThemedText>
      <Pressable onPress={onRemove} style={styles.chipRemove}>
        <X size={14} color={theme.colors.textSecondary} />
      </Pressable>
    </View>
  );

  return (
    <View style={{ zIndex: 1 }}>
      {/* Barra superior compacta */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.left}>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>
            Historial de Arqueos
          </ThemedText>
        </View>
        <View style={styles.right}>
          {/* Búsqueda */}
          <View
            style={[
              styles.searchContainer,
              { borderColor: theme.colors.border },
            ]}
          >
            <Search
              size={16}
              color={theme.colors.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Buscar..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={onSearchChange}
              onSubmitEditing={onSearchSubmit}
              style={[styles.searchInput, { color: theme.colors.text }]}
            />
            <MotiPressable
              onPress={onSearchSubmit}
              animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
              style={[
                styles.searchButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Search size={16} color="#fff" />
            </MotiPressable>
          </View>

          {/* Botón Filtros */}
          <MotiPressable
            onPress={() => setShowFilters(!showFilters)}
            animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  showFilters || activeFiltersCount > 0
                    ? theme.colors.primary
                    : theme.colors.backgroundSecondary,
              },
            ]}
          >
            <Filter
              size={16}
              color={
                showFilters || activeFiltersCount > 0
                  ? "#fff"
                  : theme.colors.text
              }
            />
            <ThemedText
              style={{
                color:
                  showFilters || activeFiltersCount > 0
                    ? "#fff"
                    : theme.colors.text,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              Filtros
              {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
            </ThemedText>
          </MotiPressable>

          {/* Filtro Estado */}
          <View
            style={[
              styles.filterContainer,
              { borderColor: theme.colors.border },
            ]}
          >
            <select
              value={filterEstado}
              onChange={(e) => onFilterChange(e.target.value)}
              style={{
                backgroundColor: theme.colors.input,
                color: theme.colors.text,
                border: "none",
                padding: 8,
                borderRadius: 6,
                fontSize: 14,
                outline: "none",
              }}
            >
              <option value="">Estado</option>
              <option value="TERMINADO">Terminado</option>
              <option value="INICIADO">Iniciado</option>
            </select>
          </View>
        </View>
      </View>

      {/* Panel de filtros avanzados */}
      {showFilters && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ type: "timing", duration: 300 }}
          style={[
            styles.filtersPanel,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
          >
            {/* Turno */}
            <View style={styles.filterGroup}>
              <ThemedText
                style={[
                  styles.filterLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Turno
              </ThemedText>
              <View
                style={[
                  styles.filterInput,
                  { borderColor: theme.colors.border },
                ]}
              >
                <select
                  value={turno}
                  onChange={(e) => onTurnoChange(e.target.value)}
                  style={{
                    backgroundColor: theme.colors.input,
                    color: theme.colors.text,
                    border: "none",
                    padding: 6,
                    borderRadius: 6,
                    fontSize: 13,
                    outline: "none",
                    width: 100,
                  }}
                >
                  <option value="">Todos</option>
                  {TURNOS_OPCIONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </View>
            </View>

            {/* Apertura - Con botón de limpiar */}
            <View style={styles.filterGroup}>
              <ThemedText
                style={[
                  styles.filterLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Apertura
              </ThemedText>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Pressable
                  onPress={() => handleDatePickerOpen("apertura")}
                  style={[
                    styles.dateButton,
                    { borderColor: theme.colors.border },
                  ]}
                >
                  <Calendar size={14} color={theme.colors.text} />
                  <ThemedText
                    style={{ fontSize: 12, color: theme.colors.text }}
                  >
                    {fechaAperturaFrom && fechaAperturaTo
                      ? `${fechaAperturaFrom} → ${fechaAperturaTo}`
                      : "Rango"}
                  </ThemedText>
                </Pressable>
                {/* 🆕 Botón de limpiar fecha */}
                {(fechaAperturaFrom || fechaAperturaTo) && (
                  <MotiPressable
                    onPress={() => onFechaAperturaChange("", "")}
                    animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
                    style={styles.clearDateBtn}
                  >
                    <X size={14} color={theme.colors.textSecondary} />
                  </MotiPressable>
                )}
              </View>
            </View>

            {/* Cierre - Con botón de limpiar */}
            <View style={styles.filterGroup}>
              <ThemedText
                style={[
                  styles.filterLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Cierre
              </ThemedText>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Pressable
                  onPress={() => handleDatePickerOpen("cierre")}
                  style={[
                    styles.dateButton,
                    { borderColor: theme.colors.border },
                  ]}
                >
                  <Calendar size={14} color={theme.colors.text} />
                  <ThemedText
                    style={{ fontSize: 12, color: theme.colors.text }}
                  >
                    {fechaCierreFrom && fechaCierreTo
                      ? `${fechaCierreFrom} → ${fechaCierreTo}`
                      : "Rango"}
                  </ThemedText>
                </Pressable>
                {/* 🆕 Botón de limpiar fecha */}
                {(fechaCierreFrom || fechaCierreTo) && (
                  <MotiPressable
                    onPress={() => onFechaCierreChange("", "")}
                    animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
                    style={styles.clearDateBtn}
                  >
                    <X size={14} color={theme.colors.textSecondary} />
                  </MotiPressable>
                )}
              </View>
            </View>

            {/* Monto - No actualiza en tiempo real */}
            <View style={styles.filterGroup}>
              <ThemedText
                style={[
                  styles.filterLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Monto (Bs)
              </ThemedText>
              <View style={styles.montoRow}>
                <TextInput
                  placeholder="Min"
                  value={localMin}
                  onChangeText={setLocalMin}
                  onBlur={applyMontoFilter}
                  onSubmitEditing={applyMontoFilter}
                  keyboardType="numeric"
                  style={[
                    styles.montoInput,
                    {
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                />
                <ThemedText style={{ color: theme.colors.textSecondary }}>
                  –
                </ThemedText>
                <TextInput
                  placeholder="Max"
                  value={localMax}
                  onChangeText={setLocalMax}
                  onBlur={applyMontoFilter}
                  onSubmitEditing={applyMontoFilter}
                  keyboardType="numeric"
                  style={[
                    styles.montoInput,
                    {
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Botón Limpiar filtros - Alineado verticalmente */}
            {activeFiltersCount > 0 && (
              <View style={{ justifyContent: "center" }}>
                <MotiPressable
                  onPress={handleClearFilters}
                  animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
                  style={[
                    styles.clearButton,
                    { backgroundColor: theme.colors.destructive, height: 36 },
                  ]}
                >
                  <ThemedText
                    style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}
                  >
                    Limpiar filtros
                  </ThemedText>
                </MotiPressable>
              </View>
            )}
          </ScrollView>
        </MotiView>
      )}

      {/* Chips de filtros activos */}
      {activeFiltersCount > 0 && !showFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
          contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}
        >
          {turno &&
            renderFilterChip(`Turno: ${turno}`, () => onTurnoChange(""))}
          {(fechaAperturaFrom || fechaAperturaTo) &&
            renderFilterChip(
              `Apertura: ${fechaAperturaFrom || "..."} → ${fechaAperturaTo || "..."}`,
              () => onFechaAperturaChange("", ""),
            )}
          {(fechaCierreFrom || fechaCierreTo) &&
            renderFilterChip(
              `Cierre: ${fechaCierreFrom || "..."} → ${fechaCierreTo || "..."}`,
              () => onFechaCierreChange("", ""),
            )}
          {(totalMin !== undefined || totalMax !== undefined) &&
            renderFilterChip(
              `Monto: ${totalMin ?? "0"} - ${totalMax ?? "∞"}`,
              () => onTotalChange(undefined, undefined),
            )}
        </ScrollView>
      )}

      {/* DatePicker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        mode="range"
        onApply={handleDatePickerApply}
        initialRange={
          datePickerTarget === "apertura" &&
          fechaAperturaFrom &&
          fechaAperturaTo
            ? { start: fechaAperturaFrom, end: fechaAperturaTo }
            : datePickerTarget === "cierre" && fechaCierreFrom && fechaCierreTo
              ? { start: fechaCierreFrom, end: fechaCierreTo }
              : undefined
        }
        key={`date-picker-${datePickerTarget}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: "transparent",
    flexWrap: "wrap",
    gap: 8,
  },
  left: { flex: 1, minWidth: 100 },
  title: { fontSize: 18, fontWeight: "700" },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 2,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 36,
    minWidth: 120,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    height: "100%",
  },
  searchButton: {
    padding: 6,
    borderRadius: 6,
    marginLeft: 4,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterContainer: {
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 80,
    overflow: "hidden",
  },
  filtersPanel: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  filterGroup: {
    flexDirection: "column",
    gap: 4,
    minWidth: 100,
  },
  filterLabel: { fontSize: 11, fontWeight: "500" },
  filterInput: {
    borderWidth: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  clearDateBtn: {
    padding: 4,
    borderRadius: 6,
  },
  montoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  montoInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    width: 50,
    fontSize: 13,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  chipsContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  chipRemove: {
    padding: 2,
  },
});
