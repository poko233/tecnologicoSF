// screens/asistencia/components/GroupSelector.tsx
import { useTheme } from "@/theme/useTheme";
import { Search } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { fadeSlideUp } from "../animations/asistencia.animations";
import { GrupoAsignado } from "../types/asistencia.types";
import { GroupCard } from "./GroupCard";

interface Props {
  grupos: GrupoAsignado[];
  onSelect: (id: number) => void;
}

export function GroupSelector({ grupos, onSelect }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return grupos;
    const lower = query.toLowerCase();
    return grupos.filter((g) => {
      const grupoMatch = g.grupo?.toLowerCase().includes(lower) ?? false;
      const materiaMatch = g.materia?.toLowerCase().includes(lower) ?? false;
      const carreraMatch = g.carrera?.toLowerCase().includes(lower) ?? false;
      return grupoMatch || materiaMatch || carreraMatch;
    });
  }, [grupos, query]);

  const numColumns = width < 768 ? 1 : width < 1024 ? 2 : 3;
  const gap = 12;
  const paddingHorizontal = 16;
  const availableWidth = width - paddingHorizontal * 2 - gap * (numColumns - 1);
  const itemWidth = availableWidth / numColumns;

  return (
    <MotiView style={styles.container} {...fadeSlideUp}>
      <View
        style={[
          styles.searchBox,
          { backgroundColor: c.input, borderColor: c.inputBorder },
        ]}
      >
        <Search size={20} color={c.textSecondary} />
        <TextInput
          placeholder="Nombre de grupo, materia o carrera..."
          placeholderTextColor={c.textMuted}
          style={[styles.input, { color: c.text, outline: "none" } as any]}
          value={query}
          onChangeText={setQuery}
        />
      </View>

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
                columnCount={numColumns}
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
    paddingHorizontal: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 16,
    maxWidth: 400,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  empty: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 15,
  },
});
