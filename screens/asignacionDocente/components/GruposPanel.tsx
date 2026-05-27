import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import { Grupo } from "../types/asignacionDocente.types";
import GrupoChip from "./GrupoChip";

type Props = {
  grupos: Grupo[];
  gruposSeleccionados: number[];
  onToggleGrupo: (idGrupo: number) => void;
};

function getGrupoNombre(grupo: Grupo) {
  return grupo.nombreGrupo ?? grupo.nombre ?? `Grupo ${grupo.idGrupo}`;
}

function getHorariosSearch(grupo: Grupo) {
  return (grupo.horarios ?? [])
    .map((h) => `${h.dia} ${h.horaInicio} ${h.horaFin}`)
    .join(" ")
    .toLowerCase();
}

export default function GruposPanel({
  grupos,
  gruposSeleccionados,
  onToggleGrupo,
}: Props) {
  const { theme } = useTheme();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "seleccionados" | "libres">(
    "todos"
  );

  const gruposFiltrados = useMemo(() => {
    const text = search.trim().toLowerCase();

    return grupos.filter((grupo) => {
      const selected = gruposSeleccionados.includes(grupo.idGrupo);

      if (filter === "seleccionados" && !selected) return false;
      if (filter === "libres" && selected) return false;

      const nombre = getGrupoNombre(grupo).toLowerCase();
      const turno = grupo.turno?.toLowerCase() ?? "";
      const horarios = getHorariosSearch(grupo);

      return (
        !text ||
        nombre.includes(text) ||
        turno.includes(text) ||
        horarios.includes(text) ||
        String(grupo.idGrupo).includes(text)
      );
    });
  }, [grupos, gruposSeleccionados, search, filter]);

  const filters = [
    { key: "todos", label: "Todos" },
    { key: "seleccionados", label: "Seleccionados" },
    { key: "libres", label: "Sin seleccionar" },
  ] as const;

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>
            Grupos
          </ThemedText>

          <ThemedText
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Busca, filtra y marca los grupos que dictará el docente. Los horarios
            salen debajo de cada grupo.
          </ThemedText>
        </View>

        <View
          style={[
            styles.counter,
            {
              backgroundColor: theme.colors.primarySubtle,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <ThemedText style={[styles.counterText, { color: theme.colors.primary }]}>
            {gruposSeleccionados.length}
          </ThemedText>
        </View>
      </View>

      <View style={styles.tools}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.colors.input,
              borderColor: theme.colors.inputBorder,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={theme.colors.text} />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por grupo, turno, ID, día u hora..."
            placeholderTextColor={theme.colors.textTertiary}
            style={[styles.input, { color: theme.colors.text }]}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filters}>
            {filters.map((item) => {
              const active = filter === item.key;

              return (
                <Pressable
                  key={item.key}
                  onPress={() => setFilter(item.key)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active
                        ? theme.colors.primary
                        : theme.colors.input,
                      borderColor: active
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.filterText,
                      {
                        color: active
                          ? theme.colors.primaryForeground
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.gruposScroll}
        showsVerticalScrollIndicator
        persistentScrollbar
      >
        <View style={styles.gruposGrid}>
          {gruposFiltrados.map((grupo) => (
            <GrupoChip
              key={grupo.idGrupo}
              grupo={grupo}
              selected={gruposSeleccionados.includes(grupo.idGrupo)}
              onPress={() => onToggleGrupo(grupo.idGrupo)}
            />
          ))}

          {gruposFiltrados.length === 0 && (
            <View
              style={[
                styles.emptyBox,
                {
                  backgroundColor: theme.colors.input,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={26}
                color={theme.colors.textSecondary}
              />

              <ThemedText
                style={[styles.emptyText, { color: theme.colors.textSecondary }]}
              >
                No se encontraron grupos.
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  counter: {
    minWidth: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: {
    fontSize: 16,
    fontWeight: "900",
  },
  tools: {
    gap: 10,
  },
  searchBox: {
    height: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  input: {
    flex: 1,
    fontSize: 14,
    outlineStyle: "none" as any,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "900",
  },
  gruposScroll: {
    maxHeight: 430,
  },
  gruposGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 10,
  },
  emptyBox: {
    width: "100%",
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "800",
  },
});