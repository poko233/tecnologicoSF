import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import {
  Carrera,
  GrupoSeleccionado,
  Materia,
} from "../types/inscripcion.types";

type Props = {
  visible: boolean;
  carrera: Carrera | null;
  materias: Materia[];
  loading: boolean;
  gruposSeleccionados: GrupoSeleccionado[];
  onClose: () => void;
  onVerGrupos: (materia: Materia) => void;
};

export default function MateriasModal({
  visible,
  carrera,
  materias,
  loading,
  gruposSeleccionados,
  onClose,
  onVerGrupos,
}: Props) {
  const { theme } = useTheme();

  const regimen = String(carrera?.regimen ?? "").toLowerCase();

  const esAnual = regimen === "anual";
  const esMensual = regimen === "mensual";

  const materiasAgrupadas = materias.reduce<Record<number, Materia[]>>(
    (acc, materia) => {
      const grupo = Number(materia.semestre || 1);

      if (!acc[grupo]) acc[grupo] = [];

      acc[grupo].push(materia);

      return acc;
    },
    {}
  );

  const gruposOrdenados = Object.keys(materiasAgrupadas)
    .map(Number)
    .sort((a, b) => a - b);

  const obtenerTituloGrupo = (numero: number) => {
    if (esAnual) return `Año ${numero}`;
    if (esMensual) return `Mes ${numero}`;
    return `Semestre ${numero}`;
  };

  const obtenerEtiquetaPeriodo = () => {
    if (esAnual) return "Año";
    if (esMensual) return "Mes";
    return "Semestre";
  };

  const estaInscrita = (materia: Materia) => {
    return gruposSeleccionados.some(
      (grupo) => Number(grupo.idMateria) === Number(materia.idMateria)
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.title, { color: theme.colors.text }]}>
                Materias
              </ThemedText>

              <ThemedText
                style={[styles.subtitle, { color: theme.colors.muted }]}
              >
                {carrera?.nombreCarrera ?? "Carrera no seleccionada"}
              </ThemedText>

              <ThemedText style={[styles.note, { color: theme.colors.muted }]}>
                Marca un grupo para inscribirte a una materia.
              </ThemedText>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons name="close" size={26} color={theme.colors.text} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.colors.primary} />

              <ThemedText
                style={{
                  color: theme.colors.text,
                  fontWeight: "700",
                }}
              >
                Cargando materias...
              </ThemedText>
            </View>
          ) : materias.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons
                name="book-outline"
                size={42}
                color={theme.colors.primary}
              />

              <ThemedText
                style={[styles.emptyTitle, { color: theme.colors.text }]}
              >
                No hay materias disponibles
              </ThemedText>

              <ThemedText
                style={[styles.emptyText, { color: theme.colors.muted }]}
              >
                Todas las materias tienen prerequisito o no existen materias
                registradas.
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              {gruposOrdenados.map((grupoNumero) => (
                <View key={grupoNumero} style={styles.groupSection}>
                  <View
                    style={[
                      styles.groupHeader,
                      {
                        backgroundColor: `${theme.colors.primary}22`,
                        borderColor: `${theme.colors.primary}55`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={esAnual ? "calendar-outline" : "layers-outline"}
                      size={20}
                      color={theme.colors.primary}
                    />

                    <ThemedText
                      style={[
                        styles.groupTitle,
                        {
                          color: theme.colors.primary,
                        },
                      ]}
                    >
                      {obtenerTituloGrupo(grupoNumero)}
                    </ThemedText>
                  </View>

                  <View style={styles.list}>
                    {materiasAgrupadas[grupoNumero].map((materia) => {
                      const inscrita = estaInscrita(materia);

                      return (
                        <View
                          key={materia.idMateria}
                          style={[
                            styles.card,
                            {
                              backgroundColor: inscrita
                                ? `${theme.colors.primary}18`
                                : theme.colors.background,
                              borderColor: inscrita
                                ? theme.colors.primary
                                : theme.colors.border,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.iconCircle,
                              {
                                backgroundColor: inscrita
                                  ? `${theme.colors.primary}22`
                                  : `${theme.colors.muted}16`,
                                borderColor: inscrita
                                  ? theme.colors.primary
                                  : theme.colors.border,
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                inscrita
                                  ? "checkmark-done-outline"
                                  : "book-outline"
                              }
                              size={24}
                              color={
                                inscrita
                                  ? theme.colors.primary
                                  : theme.colors.muted
                              }
                            />
                          </View>

                          <View style={styles.infoBox}>
                            <View style={styles.titleRow}>
                              <ThemedText
                                style={[
                                  styles.materiaTitle,
                                  {
                                    color: theme.colors.text,
                                  },
                                ]}
                              >
                                {materia.nombreMateria}
                              </ThemedText>

                              {inscrita && (
                                <View
                                  style={[
                                    styles.badgeInscrita,
                                    {
                                      backgroundColor: `${theme.colors.primary}22`,
                                      borderColor: theme.colors.primary,
                                    },
                                  ]}
                                >
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={15}
                                    color={theme.colors.primary}
                                  />

                                  <ThemedText
                                    style={[
                                      styles.badgeText,
                                      {
                                        color: theme.colors.primary,
                                      },
                                    ]}
                                  >
                                    Ya inscrita
                                  </ThemedText>
                                </View>
                              )}
                            </View>

                            <ThemedText
                              style={[
                                styles.materiaInfo,
                                {
                                  color: theme.colors.muted,
                                },
                              ]}
                            >
                              Código: {materia.codigo}
                            </ThemedText>

                            <ThemedText
                              style={[
                                styles.materiaInfo,
                                {
                                  color: theme.colors.muted,
                                },
                              ]}
                            >
                              {obtenerEtiquetaPeriodo()}: {materia.semestre}
                            </ThemedText>
                          </View>

                          <Pressable
                            onPress={() => onVerGrupos(materia)}
                            style={[
                              styles.button,
                              {
                                backgroundColor: inscrita
                                  ? `${theme.colors.primary}33`
                                  : theme.colors.primary,
                                borderColor: inscrita
                                  ? theme.colors.primary
                                  : theme.colors.primary,
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                inscrita
                                  ? "checkmark-circle-outline"
                                  : "people-outline"
                              }
                              size={18}
                              color="#FFFFFF"
                            />

                            <ThemedText style={styles.buttonText}>
                              {inscrita ? "Ver grupo" : "Ver grupos"}
                            </ThemedText>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },

  modal: {
    width: "100%",
    maxWidth: 920,
    maxHeight: "90%",
    borderWidth: 1,
    borderRadius: 22,
    padding: 22,
    gap: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },

  note: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },

  closeButton: {
    width: 46,
    height: 46,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingBox: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },

  emptyBox: {
    padding: 40,
    alignItems: "center",
    gap: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
  },

  emptyText: {
    textAlign: "center",
    fontWeight: "600",
  },

  content: {
    gap: 20,
    paddingBottom: 8,
  },

  groupSection: {
    gap: 12,
  },

  groupHeader: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },

  groupTitle: {
    fontSize: 15,
    fontWeight: "900",
  },

  list: {
    gap: 12,
  },

  card: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  infoBox: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  materiaTitle: {
    fontSize: 17,
    fontWeight: "900",
  },

  materiaInfo: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },

  badgeInscrita: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "900",
  },

  button: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});