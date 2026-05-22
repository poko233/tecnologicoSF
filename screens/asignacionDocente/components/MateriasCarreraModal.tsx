import { Ionicons } from "@expo/vector-icons";
import {
    Modal,
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
import MateriaCard from "./MateriaCard";

type Props = {
  visible: boolean;
  carrera: Carrera | null;
  materiasPorSemestre: { semestre: number; materias: Materia[] }[];
  asignaciones: AsignacionDocente[];
  materiaSeleccionada: Materia | null;
  searchMateria: string;
  onSearchMateriaChange: (value: string) => void;
  onSelectMateria: (materia: Materia) => void;
  onVerAsignaciones: (materia: Materia) => void;
  onAsignarDocente: (materia: Materia) => void;
  onClose: () => void;
};

function getCarreraNombre(carrera: Carrera | null) {
  if (!carrera) return "Materias";
  return carrera.nombreCarrera ?? carrera.nombre ?? `Carrera ${carrera.idCarrera}`;
}

function getPeriodoLabel(carrera: Carrera | null, numero: number) {
  const regimen = String(carrera?.regimen ?? "").toLowerCase();

  if (regimen.includes("anual")) return `Año ${numero}`;
  if (regimen.includes("mensual")) return `Mes ${numero}`;

  return `Semestre ${numero}`;
}

export default function MateriasCarreraModal({
  visible,
  carrera,
  materiasPorSemestre,
  asignaciones,
  materiaSeleccionada,
  searchMateria,
  onSearchMateriaChange,
  onSelectMateria,
  onVerAsignaciones,
  onAsignarDocente,
  onClose,
}: Props) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: theme.colors.modal,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.title, { color: theme.colors.text }]}>
                {getCarreraNombre(carrera)}
              </ThemedText>

              <ThemedText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {carrera?.tipo ?? "Carrera"} · {carrera?.regimen ?? "Sin régimen"}
              </ThemedText>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.colors.input,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
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
            <Ionicons name="search" size={20} color={theme.colors.text} />

            <TextInput
              value={searchMateria}
              onChangeText={onSearchMateriaChange}
              placeholder="Buscar materia..."
              placeholderTextColor={theme.colors.textTertiary}
              style={[styles.input, { color: theme.colors.text }]}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator persistentScrollbar>
            {materiasPorSemestre.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="book-outline" size={42} color={theme.colors.textMuted} />
                <ThemedText style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  No hay materias
                </ThemedText>
                <ThemedText style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No hay materias registradas para esta selección.
                </ThemedText>
              </View>
            ) : (
              materiasPorSemestre.map((grupo) => (
                <View key={grupo.semestre} style={styles.periodoBlock}>
                  <View style={styles.periodoHeader}>
                    <View
                      style={[
                        styles.periodoIcon,
                        { backgroundColor: theme.colors.primarySubtle },
                      ]}
                    >
                      <ThemedText style={[styles.periodoNumber, { color: theme.colors.primary }]}>
                        {grupo.semestre}
                      </ThemedText>
                    </View>

                    <View>
                      <ThemedText style={[styles.periodoTitle, { color: theme.colors.text }]}>
                        {getPeriodoLabel(carrera, grupo.semestre)}
                      </ThemedText>

                      <ThemedText
                        style={[styles.periodoSubtitle, { color: theme.colors.textSecondary }]}
                      >
                        {grupo.materias.length} materia(s)
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.materiasGrid}>
                    {grupo.materias.map((materia) => {
                      const asignacionesMateria = asignaciones.filter(
                        (item) => item.idMateria === materia.idMateria
                      );

                      const totalGruposAsignados = asignacionesMateria.length;

                      const totalDocentesAsignados = new Set(
                        asignacionesMateria.map((item) => item.idDocente)
                      ).size;

                      return (
                        <MateriaCard
                          key={materia.idMateria}
                          materia={materia}
                          totalGruposAsignados={totalGruposAsignados}
                          totalDocentesAsignados={totalDocentesAsignados}
                          active={materiaSeleccionada?.idMateria === materia.idMateria}
                          onVerAsignaciones={() => {
                            onSelectMateria(materia);
                            onVerAsignaciones(materia);
                            onClose();
                          }}
                          onAsignarDocente={() => {
                            onSelectMateria(materia);
                            onAsignarDocente(materia);
                            onClose();
                          }}
                        />
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "100%",
    maxWidth: 960,
    maxHeight: "88%",
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: "700",
  },
  closeButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    borderWidth: 1,
    borderRadius: 16,
    height: 50,
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
  periodoBlock: {
    gap: 12,
    marginBottom: 20,
  },
  periodoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  periodoIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  periodoNumber: {
    fontSize: 17,
    fontWeight: "900",
  },
  periodoTitle: {
    fontSize: 17,
    fontWeight: "900",
  },
  periodoSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
  materiasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  empty: {
    minHeight: 230,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});