import { useTheme } from "@/theme/useTheme";
import { Search } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
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
  const { width } = useWindowDimensions();

  const [query, setQuery] = useState("");
  const [selectedGestion, setSelectedGestion] = useState<string | null>(null);
  const [showGestionPicker, setShowGestionPicker] = useState(false);

  // Obtener gestiones únicas
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

  const numColumns = width < 768 ? 1 : width < 1024 ? 2 : 3;
  const gap = 12;
  const paddingHorizontal = 16;
  const availableWidth = width - paddingHorizontal * 2 - gap * (numColumns - 1);
  const itemWidth = availableWidth / numColumns;

  return (
    <MotiView style={styles.container} {...fadeSlideUp}>
      {/* Filtros */}
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
            style={[
              styles.input,
              { color: c.text, outlineStyle: "none" as any },
            ]}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Selector de gestión */}
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
        <FlatList
          data={filtered}
          key={numColumns}
          keyExtractor={(item) => item.id_grupo_materia_docente.toString()}
          numColumns={numColumns}
          renderItem={({ item, index }) => (
            <View
              style={{
                width: itemWidth,
                marginRight: index % numColumns < numColumns - 1 ? gap : 0,
              }}
            >
              <GroupCard
                grupo={item}
                onPress={onSelect}
                index={index}
                itemWidth={itemWidth}
              />
            </View>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  empty: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 15,
  },
});
