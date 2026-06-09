// screens/notas/components/GroupList.tsx
import { useTheme } from "@/theme/useTheme";
import { Search } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useMemo, useState } from "react";
import {
  DimensionValue,
  FlatList,
  LayoutChangeEvent,
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

export function GroupList({ grupos, onSelect }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [query, setQuery] = useState("");
  const [selectedGestion, setSelectedGestion] = useState<string | null>(null);
  const [showGestionPicker, setShowGestionPicker] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const gestionesUnicas = useMemo(() => {
    const gestiones = new Set(grupos.map((g) => g.gestion));
    return Array.from(gestiones).sort();
  }, [grupos]);

  const filtered = useMemo(() => {
    let result = grupos;
    if (query.trim()) {
      const lower = query.toLowerCase();
      result = result.filter(
        (g) =>
          g.grupo.toLowerCase().includes(lower) ||
          g.materia.toLowerCase().includes(lower) ||
          (g.paralelo && g.paralelo.toLowerCase().includes(lower)),
      );
    }
    if (selectedGestion) {
      result = result.filter((g) => g.gestion === selectedGestion);
    }
    return result;
  }, [grupos, query, selectedGestion]);

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

    const gap = 12;
    const numColumns = containerWidth < 768 ? 1 : containerWidth < 1024 ? 2 : 3;

    // CORRECCIÓN: Restar el padding horizontal total (16 de la izquierda + 16 de la derecha)
    const totalPadding = 32;
    const availableWidth = containerWidth - totalPadding;

    const totalGapWidth = gap * (numColumns - 1);
    const itemWidth = (availableWidth - totalGapWidth) / numColumns;

    return { numColumns, itemWidth, gap };
  };

  const { numColumns, itemWidth, gap } = getGridConfig();

  return (
    <MotiView style={styles.container} {...fadeSlideUp}>
      <View style={styles.filters}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: c.input, borderColor: c.inputBorder },
          ]}
        >
          <Search size={18} color={c.textSecondary} />
          <TextInput
            placeholder="Buscar grupo o materia..."
            placeholderTextColor={c.textMuted}
            style={[styles.input, { color: c.text }]}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.gestionButton,
            { backgroundColor: c.input, borderColor: c.inputBorder },
          ]}
          onPress={() => setShowGestionPicker(!showGestionPicker)}
        >
          <Text
            style={{
              color: selectedGestion ? c.text : c.textMuted,
              fontSize: 14,
              textAlign: "center",
              width: "100%",
            }}
          >
            {selectedGestion || "Gestión"}
          </Text>
        </TouchableOpacity>
      </View>

      {showGestionPicker && (
        <View
          style={[
            styles.pickerDropdown,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <TouchableOpacity
            style={styles.pickerOption}
            onPress={() => {
              setSelectedGestion(null);
              setShowGestionPicker(false);
            }}
          >
            <Text style={{ color: c.text }}>Todas</Text>
          </TouchableOpacity>
          {gestionesUnicas.map((gestion) => (
            <TouchableOpacity
              key={gestion}
              style={styles.pickerOption}
              onPress={() => {
                setSelectedGestion(gestion);
                setShowGestionPicker(false);
              }}
            >
              <Text style={{ color: c.text }}>{gestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {filtered.length === 0 ? (
        <Text style={[styles.empty, { color: c.textSecondary }]}>
          No se encontraron grupos.
        </Text>
      ) : (
        <View style={styles.listContainer} onLayout={onLayout}>
          {containerWidth > 0 && (
            <FlatList
              data={filtered}
              key={numColumns}
              keyExtractor={(item) => item.id_grupo_materia_docente.toString()}
              numColumns={numColumns}
              columnWrapperStyle={
                numColumns > 1
                  ? { alignItems: "stretch", justifyContent: "flex-start" }
                  : undefined
              }
              renderItem={({ item, index }) => (
                <GroupCard
                  grupo={item}
                  onPress={onSelect}
                  index={index}
                  itemWidth={Number(itemWidth)}
                  marginRight={index % numColumns < numColumns - 1 ? gap : 0}
                  marginBottom={gap}
                />
              )}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    fontSize: 14,
  },
  gestionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 120,
  },
  pickerDropdown: {
    position: "absolute",
    top: 50,
    right: 16,
    zIndex: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  listContainer: { flex: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  empty: { textAlign: "center", marginTop: 24, fontSize: 15 },
});
