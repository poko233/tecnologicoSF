// screens/asistencia/components/GroupSelector.tsx
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
  const [query, setQuery] = useState("");

  // Estado para guardar el ancho real del FlatList
  const [containerWidth, setContainerWidth] = useState(0);

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

  // Capturar el ancho real del contenedor
  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  // Calcular columnas y ancho basado en el espacio REAL
  const getGridConfig = (): {
    numColumns: number;
    itemWidth: DimensionValue;
    gap: number;
  } => {
    // Si aún no hemos medido, evitamos renderizar mal
    if (containerWidth === 0)
      return { numColumns: 1, itemWidth: "100%", gap: 0 };

    const gap = 12;
    // Decidir columnas basado en el ancho real del contenedor, no de la pantalla
    const numColumns = containerWidth < 768 ? 1 : containerWidth < 1024 ? 2 : 3;

    // Ancho total disponible menos los espacios entre columnas
    const totalGapWidth = gap * (numColumns - 1);
    const itemWidth = (containerWidth - totalGapWidth) / numColumns;

    return { numColumns, itemWidth, gap };
  };

  const { numColumns, itemWidth, gap } = getGridConfig();

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
        <View style={styles.listContainer} onLayout={onLayout}>
          {containerWidth > 0 && (
            <FlatList
              data={filtered}
              key={numColumns}
              keyExtractor={(item) => item.id_grupo_materia_docente.toString()}
              numColumns={numColumns}
              // ESTO ES CLAVE: Hace que todas las celdas de una misma fila tengan la misma altura
              columnWrapperStyle={
                numColumns > 1 ? { alignItems: "stretch" } : undefined
              }
              renderItem={({ item, index }) => (
                <View
                  style={{
                    width: itemWidth,
                    marginRight: index % numColumns < numColumns - 1 ? gap : 0,
                    marginBottom: gap, // <-- AQUÍ CORREGIMOS EL ESPACIO VERTICAL
                  }}
                >
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
  listContainer: {
    flex: 1,
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
