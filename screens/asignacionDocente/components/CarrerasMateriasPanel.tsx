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
import {
    AsignacionDocente,
    Carrera,
    Materia,
} from "../types/asignacionDocente.types";
import CarreraCard from "./CarreraCard";
import MateriasCarreraModal from "./MateriasCarreraModal";

type TabTipo = "carreras" | "otros";

type Props = {
  carreras: Carrera[];
  materiasPorSemestre: { semestre: number; materias: Materia[] }[];
  asignaciones: AsignacionDocente[];
  carreraSeleccionada: Carrera | null;
  materiaSeleccionada: Materia | null;
  searchCarrera: string;
  searchMateria: string;
  onSearchCarreraChange: (value: string) => void;
  onSearchMateriaChange: (value: string) => void;
  onSelectCarrera: (carrera: Carrera) => void;
  onSelectMateria: (materia: Materia) => void;
  onVerAsignaciones: (materia: Materia) => void;
  onAsignarDocente: (materia: Materia) => void;
};

function esCarrera(carrera: Carrera) {
  return String(carrera.tipo ?? "").trim().toLowerCase() === "carrera";
}

export default function CarrerasMateriasPanel({
  carreras,
  materiasPorSemestre,
  asignaciones,
  carreraSeleccionada,
  materiaSeleccionada,
  searchCarrera,
  searchMateria,
  onSearchCarreraChange,
  onSearchMateriaChange,
  onSelectCarrera,
  onSelectMateria,
  onVerAsignaciones,
  onAsignarDocente,
}: Props) {
  const { theme } = useTheme();

  const [tab, setTab] = useState<TabTipo>("carreras");
  const [materiasModalVisible, setMateriasModalVisible] = useState(false);

  const carrerasMostradas = useMemo(() => {
    if (tab === "carreras") {
      return carreras.filter(esCarrera);
    }

    return carreras.filter((item) => !esCarrera(item));
  }, [carreras, tab]);

  return (
    <>
      <View
        style={[
          styles.panel,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>
            Carreras y programas
          </ThemedText>

          <ThemedText
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Filtra por tipo y selecciona una carrera para ver sus materias.
          </ThemedText>
        </View>

        <View style={styles.tabs}>
          <Pressable
            onPress={() => setTab("carreras")}
            style={[
              styles.tab,
              {
                backgroundColor:
                  tab === "carreras"
                    ? theme.colors.primary
                    : theme.colors.input,
                borderColor:
                  tab === "carreras"
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name="school-outline"
              size={18}
              color={
                tab === "carreras"
                  ? theme.colors.primaryForeground
                  : theme.colors.text
              }
            />

            <ThemedText
              style={[
                styles.tabText,
                {
                  color:
                    tab === "carreras"
                      ? theme.colors.primaryForeground
                      : theme.colors.text,
                },
              ]}
            >
              Carreras
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setTab("otros")}
            style={[
              styles.tab,
              {
                backgroundColor:
                  tab === "otros"
                    ? theme.colors.primary
                    : theme.colors.input,
                borderColor:
                  tab === "otros"
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name="albums-outline"
              size={18}
              color={
                tab === "otros"
                  ? theme.colors.primaryForeground
                  : theme.colors.text
              }
            />

            <ThemedText
              style={[
                styles.tabText,
                {
                  color:
                    tab === "otros"
                      ? theme.colors.primaryForeground
                      : theme.colors.text,
                },
              ]}
            >
              Otros
            </ThemedText>
          </Pressable>
        </View>

        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.colors.input,
              borderColor: theme.colors.inputBorder,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.text}
          />

          <TextInput
            value={searchCarrera}
            onChangeText={onSearchCarreraChange}
            placeholder={
              tab === "carreras"
                ? "Buscar carrera..."
                : "Buscar curso/programa..."
            }
            placeholderTextColor={theme.colors.textTertiary}
            style={[styles.input, { color: theme.colors.text }]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          persistentScrollbar
          contentContainerStyle={styles.horizontalContent}
        >
          {carrerasMostradas.map((carrera) => (
            <CarreraCard
              key={carrera.idCarrera}
              carrera={carrera}
              active={
                carreraSeleccionada?.idCarrera === carrera.idCarrera
              }
              onPress={() => {
                onSelectCarrera(carrera);
                setMateriasModalVisible(true);
              }}
            />
          ))}
        </ScrollView>
      </View>

      <MateriasCarreraModal
        visible={materiasModalVisible}
        carrera={carreraSeleccionada}
        materiasPorSemestre={materiasPorSemestre}
        asignaciones={asignaciones}
        materiaSeleccionada={materiaSeleccionada}
        searchMateria={searchMateria}
        onSearchMateriaChange={onSearchMateriaChange}
        onSelectMateria={onSelectMateria}
        onVerAsignaciones={onVerAsignaciones}
        onAsignarDocente={onAsignarDocente}
        onClose={() => setMateriasModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    minHeight: 300,
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

  tabs: {
    flexDirection: "row",
    gap: 10,
  },

  tab: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "900",
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