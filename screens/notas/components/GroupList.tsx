// screens/notas/components/GroupList.tsx
import { useTheme } from "@/theme/useTheme";
import { Check, Search, X } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useCallback, useMemo, useRef, useState } from "react";
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
import { fadeSlideUp } from "../animations/notas.animations";
import { GrupoMateriaDocente } from "../types/notas.types";
import { GroupCard } from "./GroupCard";

interface Props {
  grupos: GrupoMateriaDocente[];
  onSelect: (id: number) => void;
}

type FilterType =
  | "gestion"
  | "grupo"
  | "paralelo"
  | "turno"
  | "materia"
  | "carrera";

export function GroupList({ grupos, onSelect }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    gestion: null as string | null,
    grupo: null as string | null,
    paralelo: null as string | null,
    turno: null as string | null,
    materia: null as string | null,
    carrera: null as string | null,
  });

  const [activeFilterModal, setActiveFilterModal] = useState<FilterType | null>(
    null,
  );
  const [filterSearchQuery, setFilterSearchQuery] = useState("");
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Devuelve las opciones disponibles para un tipo de filtro, teniendo en cuenta
  // todos los demás filtros activos y la búsqueda textual.
  const getAvailableOptionsFor = useCallback(
    (type: FilterType): string[] => {
      const otherFilters = Object.entries(filters).filter(
        ([key, val]) => key !== type && val !== null,
      ) as [FilterType, string][];

      const subset = grupos.filter((g) => {
        if (query.trim()) {
          const lower = query.toLowerCase();
          const matchMain =
            g.grupo.toLowerCase().includes(lower) ||
            g.materia.toLowerCase().includes(lower) ||
            (g.paralelo && g.paralelo.toLowerCase().includes(lower)) ||
            (g.turno && g.turno.toLowerCase().includes(lower));
          if (!matchMain) return false;
        }
        return otherFilters.every(([key, val]) => {
          const prop = g[key as keyof GrupoMateriaDocente];
          // El campo 'carreras' es un array; para el filtro 'carrera' se maneja aparte
          if (key === "carrera") return (g.carreras ?? []).includes(val);
          return prop === val;
        });
      });

      if (type === "carrera") {
        // Para carreras, aplanamos los arrays y obtenemos únicas
        const carreras = subset.flatMap((g) => g.carreras ?? []);
        return Array.from(new Set(carreras)).sort();
      } else {
        const values = subset.map(
          (g) => g[type as keyof GrupoMateriaDocente],
        ) as string[];
        return Array.from(new Set(values.filter(Boolean))).sort();
      }
    },
    [grupos, query, filters],
  );

  // Limpia filtros que ya no son válidos con las nuevas opciones
  const cleanupInvalidFilters = useCallback(
    (updatedFilters: typeof filters) => {
      setFilters((prev) => {
        const newFilters = { ...updatedFilters };
        (Object.keys(newFilters) as FilterType[]).forEach((key) => {
          const currentVal = newFilters[key];
          if (currentVal !== null) {
            const options = getAvailableOptionsFor(key);
            if (!options.includes(currentVal)) {
              newFilters[key] = null;
            }
          }
        });
        return newFilters;
      });
    },
    [getAvailableOptionsFor],
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
      gestion: null,
      grupo: null,
      paralelo: null,
      turno: null,
      materia: null,
      carrera: null,
    });
  };

  const hasActiveFilters =
    Object.values(filters).some((v) => v !== null) || query !== "";

  // Opciones del modal actual, filtradas por búsqueda interna
  const filteredModalOptions = useMemo(() => {
    if (!activeFilterModal) return [] as string[];
    const options = getAvailableOptionsFor(activeFilterModal);
    if (!filterSearchQuery.trim()) return options;
    return options.filter((opt) =>
      opt.toLowerCase().includes(filterSearchQuery.toLowerCase()),
    );
  }, [activeFilterModal, filterSearchQuery, getAvailableOptionsFor]);

  // Medir ancho del contenedor para el grid
  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const getGridConfig = (): {
    numColumns: number;
    itemWidth: DimensionValue;
    gap: number;
  } => {
    if (containerWidth === 0)
      return { numColumns: 1, itemWidth: "100%", gap: 0 };
    const gap = 16;
    const numColumns = containerWidth < 768 ? 1 : containerWidth < 1024 ? 2 : 3;
    const totalPadding = 32;
    const availableWidth = containerWidth - totalPadding;
    const totalGapWidth = gap * (numColumns - 1);
    const itemWidth = (availableWidth - totalGapWidth) / numColumns;
    return { numColumns, itemWidth, gap };
  };

  const { numColumns, itemWidth, gap } = getGridConfig();

  // Datos finales filtrados (para las tarjetas)
  const filtered = useMemo(() => {
    return grupos.filter((g) => {
      if (query.trim()) {
        const lower = query.toLowerCase();
        const matchMain =
          g.grupo.toLowerCase().includes(lower) ||
          g.materia.toLowerCase().includes(lower) ||
          (g.paralelo && g.paralelo.toLowerCase().includes(lower)) ||
          (g.turno && g.turno.toLowerCase().includes(lower));
        if (!matchMain) return false;
      }
      if (filters.gestion && g.gestion !== filters.gestion) return false;
      if (filters.grupo && g.grupo !== filters.grupo) return false;
      if (filters.paralelo && g.paralelo !== filters.paralelo) return false;
      if (filters.turno && g.turno !== filters.turno) return false;
      if (filters.materia && g.materia !== filters.materia) return false;
      if (filters.carrera && !(g.carreras ?? []).includes(filters.carrera))
        return false;
      return true;
    });
  }, [grupos, query, filters]);

  // Píldora de filtro
  const FilterPill = ({ type, label }: { type: FilterType; label: string }) => {
    const value = filters[type];
    const isActive = value !== null;

    return (
      <View
        style={[
          styles.pillContainer,
          isActive && {
            borderColor: c.primary,
            backgroundColor: c.primary + "10",
          },
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
      {/* Barra superior de búsqueda y píldoras de filtro */}
      <View style={styles.filterSection}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: c.input, borderColor: c.inputBorder },
          ]}
        >
          <Search size={18} color={c.textSecondary} />
          <TextInput
            placeholder="Buscar por grupo, materia..."
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
                Limpiar todo
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <FilterPill type="gestion" label="Gestión" />
          <FilterPill type="carrera" label="Carrera" />
          <FilterPill type="materia" label="Materia" />
          <FilterPill type="grupo" label="Grupo" />
          <FilterPill type="paralelo" label="Paralelo" />
          <FilterPill type="turno" label="Turno" />
        </ScrollView>
      </View>

      {/* Lista de tarjetas */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.empty, { color: c.textSecondary }]}>
            No se encontraron asignaturas con los filtros seleccionados.
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
                  />
                </View>
              )}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Modal de filtro */}
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
              ref={scrollViewRef}
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

const styles = StyleSheet.create({
  container: { flex: 1 },
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
