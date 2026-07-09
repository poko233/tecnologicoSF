// screens/asistencia/components/GroupSelector.tsx
import { useTheme } from "@/theme/useTheme";
import { Check, Search, X } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useCallback, useMemo, useState } from "react";
import {
  DimensionValue,
  FlatList,
  LayoutChangeEvent,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { fadeSlideUp } from "../animations/asistencia.animations";
import { GrupoAsignado } from "../types/asistencia.types";
import { GroupCard } from "./GroupCard";

interface Props {
  grupos: GrupoAsignado[];
  onSelect: (id: number) => void;
}

type FilterType = "carrera" | "materia" | "turno" | "grupo" | "regimen";

export function GroupSelector({ grupos, onSelect }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    carrera: null as string | null,
    materia: null as string | null,
    turno: null as string | null,
    grupo: null as string | null,
    regimen: null as string | null,
  });

  const [activeFilterModal, setActiveFilterModal] = useState<FilterType | null>(
    null,
  );
  const [filterSearchQuery, setFilterSearchQuery] = useState("");
  const [containerWidth, setContainerWidth] = useState(0);

  // Devuelve opciones únicas para un tipo de filtro dado,
  // teniendo en cuenta todos los demás filtros activos.
  const getFilteredOptionsFor = useCallback(
    (type: FilterType): string[] => {
      const otherFilters = Object.entries(filters).filter(
        ([key, val]) => key !== type && val !== null,
      ) as [FilterType, string][];

      const subset = grupos.filter((g) => {
        if (query.trim()) {
          const lower = query.toLowerCase();
          const match =
            g.grupo.toLowerCase().includes(lower) ||
            g.materia.toLowerCase().includes(lower) ||
            (g.carrera && g.carrera.toLowerCase().includes(lower)) ||
            (g.turno && g.turno.toLowerCase().includes(lower));
          if (!match) return false;
        }
        return otherFilters.every(([key, val]) => {
          const prop = g[key as keyof GrupoAsignado];
          return prop === val;
        });
      });

      const values = subset
        .map((g) => g[type as keyof GrupoAsignado])
        .filter((v): v is string => v !== null && v !== undefined);
      return Array.from(new Set(values)).sort();
    },
    [grupos, query, filters],
  );

  // Limpia cualquier filtro que ya no tenga su valor en las opciones disponibles
  const cleanupInvalidFilters = useCallback(
    (updatedFilters: typeof filters) => {
      setFilters((prev) => {
        const newFilters = { ...updatedFilters };
        (Object.keys(newFilters) as FilterType[]).forEach((key) => {
          const currentVal = newFilters[key];
          if (currentVal !== null) {
            const options = getFilteredOptionsFor(key);
            if (!options.includes(currentVal)) {
              newFilters[key] = null;
            }
          }
        });
        return newFilters;
      });
    },
    [getFilteredOptionsFor],
  );

  const handleSelectFilter = (type: FilterType, value: string | null) => {
    const updatedFilters = { ...filters, [type]: value };
    setFilters(updatedFilters);
    cleanupInvalidFilters(updatedFilters);
    setActiveFilterModal(null);
    setFilterSearchQuery("");
  };

  const clearAllFilters = () => {
    setQuery("");
    setFilters({
      carrera: null,
      materia: null,
      turno: null,
      grupo: null,
      regimen: null,
    });
  };

  const hasActiveFilters =
    Object.values(filters).some((v) => v !== null) || query !== "";

  // Opciones del modal actual, filtradas por búsqueda interna
  const filteredModalOptions = useMemo(() => {
    if (!activeFilterModal) return [] as string[];
    const options = getFilteredOptionsFor(activeFilterModal);
    if (!filterSearchQuery.trim()) return options;
    return options.filter((opt) =>
      opt.toLowerCase().includes(filterSearchQuery.toLowerCase()),
    );
  }, [activeFilterModal, filterSearchQuery, getFilteredOptionsFor]);

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const getGridConfig = (): {
    numColumns: number;
    itemWidth: DimensionValue;
    gap: number;
  } => {
    if (containerWidth === 0)
      return { numColumns: 1, itemWidth: "100%" as DimensionValue, gap: 0 };
    const gap = 12;
    const numColumns = containerWidth < 768 ? 1 : containerWidth < 1024 ? 2 : 3;
    const totalGapWidth = gap * (numColumns - 1);
    const itemWidth = (containerWidth - totalGapWidth) / numColumns;
    return { numColumns, itemWidth, gap };
  };

  const { numColumns, itemWidth, gap } = getGridConfig();

  // Filtrado final para las tarjetas
  const filtered = useMemo(() => {
    return grupos.filter((g) => {
      if (query.trim()) {
        const lower = query.toLowerCase();
        const match =
          g.grupo.toLowerCase().includes(lower) ||
          g.materia.toLowerCase().includes(lower) ||
          (g.carrera && g.carrera.toLowerCase().includes(lower)) ||
          (g.turno && g.turno.toLowerCase().includes(lower));
        if (!match) return false;
      }
      return (Object.keys(filters) as FilterType[]).every((key) => {
        const filterVal = filters[key];
        if (filterVal === null) return true;
        const prop = g[key as keyof GrupoAsignado];
        return prop === filterVal;
      });
    });
  }, [grupos, query, filters]);

  // Píldora de filtro reutilizable
  const FilterPill = ({ type, label }: { type: FilterType; label: string }) => {
    const value = filters[type];
    const isActive = value !== null;
    return (
      <View
        style={[
          styles.pillContainer,
          { borderColor: isActive ? c.primary : c.border },
          isActive && { backgroundColor: c.primary + "10" },
        ]}
      >
        <TouchableOpacity
          style={styles.pillClickable}
          onPress={() => {
            setFilterSearchQuery("");
            setActiveFilterModal(type);
          }}
        >
          <Text
            style={[
              styles.pillText,
              { color: isActive ? c.primary : c.textSecondary },
            ]}
          >
            {value || label}
          </Text>
          {!isActive && (
            <Text style={{ color: c.textMuted, fontSize: 10, marginLeft: 4 }}>
              ▼
            </Text>
          )}
        </TouchableOpacity>
        {isActive && (
          <TouchableOpacity
            style={styles.pillClear}
            onPress={() => handleSelectFilter(type, null)}
          >
            <X size={14} color={c.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <MotiView style={styles.container} {...fadeSlideUp}>
      <View style={styles.filterSection}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: c.input, borderColor: c.inputBorder },
          ]}
        >
          <Search size={18} color={c.textSecondary} />
          <TextInput
            placeholder="Buscar por grupo, materia o carrera..."
            placeholderTextColor={c.textMuted}
            style={[styles.input, { color: c.text, outline: "none" } as any]}
            value={query}
            onChangeText={setQuery}
          />
          {hasActiveFilters && (
            <TouchableOpacity
              onPress={clearAllFilters}
              style={styles.clearAllBtn}
            >
              <Text
                style={{ color: c.primary, fontSize: 12, fontWeight: "600" }}
              >
                Limpiar
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <FilterPill type="carrera" label="Carrera" />
          <FilterPill type="materia" label="Materia" />
          <FilterPill type="turno" label="Turno" />
          <FilterPill type="grupo" label="Grupo" />
          <FilterPill type="regimen" label="Régimen" />
        </ScrollView>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.empty, { color: c.textSecondary }]}>
            No se encontraron grupos con los filtros seleccionados.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer} onLayout={onLayout}>
          {containerWidth > 0 && (
            <FlatList
              data={filtered}
              key={numColumns}
              keyExtractor={(item) => item.id_grupo_materia_docente.toString()}
              numColumns={numColumns}
              columnWrapperStyle={numColumns > 1 ? { gap } : undefined}
              renderItem={({ item, index }) => (
                <View style={{ width: itemWidth, marginBottom: gap }}>
                  <GroupCard
                    grupo={item}
                    onPress={onSelect}
                    index={index}
                    itemWidth={Number(itemWidth)}
                    columnCount={numColumns}
                  />
                </View>
              )}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      <Modal
        visible={activeFilterModal !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActiveFilterModal(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setActiveFilterModal(null)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>
                Filtrar por{" "}
                {activeFilterModal ? activeFilterModal.toUpperCase() : ""}
              </Text>
              <TouchableOpacity onPress={() => setActiveFilterModal(null)}>
                <X size={20} color={c.textSecondary} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.modalSearchBox,
                { backgroundColor: c.input, borderColor: c.inputBorder },
              ]}
            >
              <Search size={16} color={c.textSecondary} />
              <TextInput
                placeholder={`Buscar ${activeFilterModal}...`}
                placeholderTextColor={c.textMuted}
                style={[styles.modalInput, { color: c.text, outline: "none" }]}
                value={filterSearchQuery}
                onChangeText={setFilterSearchQuery}
              />
            </View>

            <ScrollView
              style={{ maxHeight: 250 }}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  !filters[activeFilterModal!] && {
                    backgroundColor: c.primary + "10",
                  },
                ]}
                onPress={() => handleSelectFilter(activeFilterModal!, null)}
              >
                <Text
                  style={{
                    color: !filters[activeFilterModal!]
                      ? c.primary
                      : c.textSecondary,
                    fontWeight: !filters[activeFilterModal!] ? "600" : "400",
                  }}
                >
                  Todos / Todos los registros
                </Text>
                {!filters[activeFilterModal!] && (
                  <Check size={16} color={c.primary} />
                )}
              </TouchableOpacity>

              {filteredModalOptions.map((opt) => {
                const isSelected = filters[activeFilterModal!] === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.modalOption,
                      isSelected && { backgroundColor: c.primary + "15" },
                    ]}
                    onPress={() => handleSelectFilter(activeFilterModal!, opt)}
                  >
                    <Text
                      style={{
                        color: isSelected ? c.primary : c.text,
                        fontWeight: isSelected ? "600" : "400",
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {opt}
                    </Text>
                    {isSelected && <Check size={16} color={c.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </MotiView>
  );
}

// ... estilos sin cambios (ya incluidos antes) ...
const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 12 },
  filterSection: { paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 46,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 14 },
  clearAllBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  filterRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  pillContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingLeft: 12,
    paddingRight: 8,
    height: 36,
  },
  pillClickable: { flexDirection: "row", alignItems: "center", height: "100%" },
  pillText: { fontSize: 13, fontWeight: "500" },
  pillClear: {
    marginLeft: 6,
    padding: 2,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  list: { paddingBottom: 32 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  empty: { textAlign: "center", fontSize: 15, lineHeight: 22 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  modalInput: { flex: 1, marginLeft: 6, fontSize: 14, paddingVertical: 0 },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
});
