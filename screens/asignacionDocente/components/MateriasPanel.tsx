import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import {
    AsignacionDocente,
    Materia,
} from "../types/asignacionDocente.types";
import EmptyState from "./EmptyState";
import MateriaCard from "./MateriaCard";

type Props = {
  materias: Materia[];
  asignaciones: AsignacionDocente[];
  materiaSeleccionada: Materia | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectMateria: (materia: Materia) => void;
  onVerAsignaciones: (materia: Materia) => void;
  onAsignarDocente: (materia: Materia) => void;
};

export default function MateriasPanel({
  materias,
  asignaciones,
  materiaSeleccionada,
  search,
  onSearchChange,
  onSelectMateria,
  onVerAsignaciones,
  onAsignarDocente,
}: Props) {
  const { theme } = useTheme();

  const materiasFiltradas = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) return materias;

    return materias.filter((materia) => {
      const nombre =
        materia.nombreMateria ??
        materia.nombre ??
        "";

      const codigo =
        materia.codigo ??
        materia.sigla ??
        "";

      return (
        nombre
          .toLowerCase()
          .includes(text) ||
        codigo
          .toLowerCase()
          .includes(text)
      );
    });
  }, [materias, search]);

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor:
            theme.colors.card,
          borderColor:
            theme.colors.border,
        },
      ]}
    >
      <View>
        <ThemedText
          style={[
            styles.title,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Materias
        </ThemedText>

        <ThemedText
          style={[
            styles.subtitle,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Selecciona una materia
          para ver docentes o
          asignar nuevos.
        </ThemedText>
      </View>

      <View
        style={[
          styles.searchBox,
          {
            backgroundColor:
              theme.colors.input,
            borderColor:
              theme.colors
                .inputBorder,
          },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={theme.colors.text}
        />

        <TextInput
          value={search}
          onChangeText={
            onSearchChange
          }
          placeholder="Buscar materia..."
          placeholderTextColor={
            theme.colors
              .textTertiary
          }
          style={[
            styles.input,
            {
              color:
                theme.colors
                  .text,
            },
          ]}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        persistentScrollbar
        contentContainerStyle={
          styles.horizontalContent
        }
      >
        {materiasFiltradas.length ===
        0 ? (
          <View
            style={{ width: 360 }}
          >
            <EmptyState
              icon="search-outline"
              title="No hay materias"
              subtitle="No se encontró ninguna materia con ese texto."
            />
          </View>
        ) : (
          materiasFiltradas.map(
            (materia) => {
              const asignacionesMateria =
                asignaciones.filter(
                  (item) =>
                    item.idMateria ===
                    materia.idMateria
                );

              const totalGruposAsignados =
                asignacionesMateria.length;

              const totalDocentesAsignados =
                new Set(
                  asignacionesMateria.map(
                    (item) =>
                      item.idDocente
                  )
                ).size;

              return (
                <MateriaCard
                  key={
                    materia.idMateria
                  }
                  materia={materia}
                  totalGruposAsignados={
                    totalGruposAsignados
                  }
                  totalDocentesAsignados={
                    totalDocentesAsignados
                  }
                  active={
                    materiaSeleccionada?.idMateria ===
                    materia.idMateria
                  }
                  onVerAsignaciones={() => {
                    onSelectMateria(
                      materia
                    );

                    onVerAsignaciones(
                      materia
                    );
                  }}
                  onAsignarDocente={() => {
                    onSelectMateria(
                      materia
                    );

                    onAsignarDocente(
                      materia
                    );
                  }}
                />
              );
            }
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    minHeight: 230,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: "600",
  },

  searchBox: {
    borderWidth: 1,
    borderRadius: 16,
    height: 48,
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

  horizontalContent: {
    gap: 12,
    paddingBottom: 8,
  },
});