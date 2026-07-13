import { useTheme } from "@/theme/useTheme";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { InscritosFilters } from "../hooks/useInscritosFilters";
import {
  InscritosFiltrosResponse,
  SelectorOption,
} from "../types/reportes.types";
import { FilterChip } from "./FilterChip";
import { FilterSelectButton } from "./FilterSelectButton";
import { SelectorModal } from "./SelectorModal";

interface Props {
  filtrosData: InscritosFiltrosResponse | null;
  loading: boolean;
  filters: InscritosFilters;
  onToggleCarrera: (id: number) => void;
  onToggleAllCarreras: (allIds: number[]) => void;
  onSetTurno: (turno: string | null) => void;
  onSetGestion: (id: number | null) => void;
  onSetSemestre: (value: number | null) => void;
  onSetAnio: (value: number | null) => void;
  onSetPeriodoActivo: (tipo: "semestre" | "anio") => void;
}

export function InscritosForm({
  filtrosData,
  loading,
  filters,
  onToggleCarrera,
  onToggleAllCarreras,
  onSetTurno,
  onSetGestion,
  onSetSemestre,
  onSetAnio,
  onSetPeriodoActivo,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [carrerasModalVisible, setCarrerasModalVisible] = useState(false);
  const [gestionModalVisible, setGestionModalVisible] = useState(false);

  // ✅ Reemplazo de Skeleton por ActivityIndicator
  if (loading || !filtrosData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const carreraOptions: SelectorOption[] = filtrosData.carreras.map((c) => ({
    id: c.idCarrera,
    label: c.nombreCarrera,
    subtitle: c.codigo,
  }));

  const gestionOptions: SelectorOption[] = filtrosData.gestiones.map((g) => ({
    id: g.id,
    label: g.nombre,
    subtitle: `${g.periodo} • ${g.anio}`,
  }));

  const carreraText =
    filters.carreras.length === 0
      ? "Todas las carreras"
      : `${filters.carreras.length} seleccionada(s)`;

  const gestionText =
    filters.idGestion === null
      ? "Todas las gestiones"
      : filtrosData.gestiones.find((g) => g.id === filters.idGestion)?.nombre ||
        "Seleccionar";

  const isAllCarrerasSelected =
    filtrosData.carreras.length > 0 &&
    filters.carreras.length === filtrosData.carreras.length;

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "timing",
          duration: 300,
          easing: (t) => t * t * (3 - 2 * t),
        }}
      >
        {/* CARRERAS */}
        <FilterSelectButton
          label="Carreras"
          selectedText={carreraText}
          onPress={() => setCarrerasModalVisible(true)}
          isActive={filters.carreras.length > 0}
        />

        {/* GESTIÓN */}
        <FilterSelectButton
          label="Gestión"
          selectedText={gestionText}
          onPress={() => setGestionModalVisible(true)}
          isActive={filters.idGestion !== null}
        />

        {/* TURNO - CON DESELECCIÓN AL HACER CLIC NUEVAMENTE */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Turno</Text>
          <View style={styles.chipContainer}>
            {filtrosData.turnos.map((t) => (
              <FilterChip
                key={t.valor}
                label={t.etiqueta}
                selected={filters.turno === t.valor}
                // ⭐ Si ya está seleccionado, envía null (deselecciona)
                onToggle={() =>
                  onSetTurno(filters.turno === t.valor ? null : t.valor)
                }
                multiSelect={false}
              />
            ))}
          </View>
        </View>

        {/* ✅ PERIODO ACADÉMICO EN UNA SOLA FILA (2 COLUMNAS) */}
        <View style={{ flexDirection: "row", gap: 16, marginBottom: 16 }}>
          {/* Columna Izquierda: Toggle */}
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={[styles.label, { color: c.textSecondary }]}>
              Periodo académico
            </Text>
            <View style={styles.periodRow}>
              <FilterChip
                label="Semestre"
                selected={filters.periodoActivo === "semestre"}
                onToggle={() => onSetPeriodoActivo("semestre")}
                multiSelect={false}
                color={c.info}
              />
              <FilterChip
                label="Año"
                selected={filters.periodoActivo === "anio"}
                onToggle={() => onSetPeriodoActivo("anio")}
                multiSelect={false}
                color={c.success}
              />
            </View>
          </View>

          {/* Columna Derecha: Control numérico */}
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={[styles.label, { color: c.textSecondary }]}>
              {filters.periodoActivo === "semestre"
                ? "Semestre"
                : "Año Académico"}
            </Text>
            <View style={styles.numberInputRow}>
              <MotiPressable
                onPress={() => {
                  if (filters.periodoActivo === "semestre") {
                    const current = filters.semestre ?? 0;
                    onSetSemestre(Math.max(1, current - 1));
                  } else {
                    const current = filters.anio ?? 0;
                    onSetAnio(Math.max(1, current - 1));
                  }
                }}
                style={[styles.numberBtn, { borderColor: c.border }]}
                animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
                transition={{ type: "timing", duration: 100 }}
              >
                {/* ⭐ selectable={false} evita la selección de texto */}
                <Text
                  style={[styles.numberBtnText, { color: c.text }]}
                  selectable={false}
                >
                  −
                </Text>
              </MotiPressable>
              <Text style={[styles.numberValue, { color: c.text }]}>
                {filters.periodoActivo === "semestre"
                  ? (filters.semestre ?? "—")
                  : (filters.anio ?? "—")}
              </Text>
              <MotiPressable
                onPress={() => {
                  if (filters.periodoActivo === "semestre") {
                    const current = filters.semestre ?? 0;
                    onSetSemestre(current + 1);
                  } else {
                    const current = filters.anio ?? 0;
                    onSetAnio(current + 1);
                  }
                }}
                style={[styles.numberBtn, { borderColor: c.border }]}
                animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
                transition={{ type: "timing", duration: 100 }}
              >
                {/* ⭐ selectable={false} evita la selección de texto */}
                <Text
                  style={[styles.numberBtnText, { color: c.text }]}
                  selectable={false}
                >
                  +
                </Text>
              </MotiPressable>
              <MotiPressable
                onPress={() => {
                  if (filters.periodoActivo === "semestre") onSetSemestre(null);
                  else onSetAnio(null);
                }}
                style={{ paddingHorizontal: 8 }}
              >
                <Text
                  style={{
                    color: c.destructive,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Limpiar
                </Text>
              </MotiPressable>
            </View>
          </View>
        </View>

        {/* MODAL DE CARRERAS (con buscador y Seleccionar todas) */}
        <SelectorModal
          visible={carrerasModalVisible}
          title="Seleccionar carreras"
          options={carreraOptions}
          selectedIds={filters.carreras}
          onToggle={(id) => onToggleCarrera(Number(id))}
          onSelectAll={() =>
            onToggleAllCarreras(filtrosData.carreras.map((c) => c.idCarrera))
          }
          isAllSelected={isAllCarrerasSelected}
          onApply={() => setCarrerasModalVisible(false)}
          onClose={() => setCarrerasModalVisible(false)}
          multiple={true}
        />

        {/* ✅ MODAL DE GESTIÓN - CON CIERRE AUTOMÁTICO AL SELECCIONAR "TODAS" */}
        <SelectorModal
          visible={gestionModalVisible}
          title="Seleccionar gestión"
          options={gestionOptions}
          selectedIds={filters.idGestion !== null ? [filters.idGestion] : []}
          onToggle={(id) => onSetGestion(Number(id))}
          // ⭐ Ahora al hacer clic en "Todas las gestiones", se cierra el modal automáticamente
          onSelectAll={() => {
            onSetGestion(null);
            setGestionModalVisible(false);
          }}
          isAllSelected={filters.idGestion === null}
          onApply={() => setGestionModalVisible(false)}
          onClose={() => setGestionModalVisible(false)}
          multiple={false}
        />
      </MotiView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  periodRow: {
    flexDirection: "row",
    gap: 8,
  },
  numberInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  numberBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  numberBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
  numberValue: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
});
