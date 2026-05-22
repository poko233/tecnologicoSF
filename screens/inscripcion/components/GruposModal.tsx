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
  Grupo,
  GrupoSeleccionado,
  Materia,
} from "../types/inscripcion.types";

type Props = {
  visible: boolean;
  materia: Materia | null;
  grupos: Grupo[];
  loading: boolean;
  inscribiendo: boolean;
  gruposSeleccionados: GrupoSeleccionado[];
  onClose: () => void;
  onToggleGrupo: (grupo: Grupo) => void;
};

export default function GruposModal({
  visible,
  materia,
  grupos,
  loading,
  inscribiendo,
  gruposSeleccionados,
  onClose,
  onToggleGrupo,
}: Props) {
  const { theme } = useTheme();

  const estaSeleccionado = (idGrupo: number) => {
    return gruposSeleccionados.some((grupo) => grupo.idGrupo === idGrupo);
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
                Grupos disponibles
              </ThemedText>

              <ThemedText
                style={[
                  styles.subtitle,
                  {
                    color: theme.colors.muted,
                  },
                ]}
              >
                {materia?.nombreMateria ?? "Materia no seleccionada"}
              </ThemedText>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}
            >
              <Ionicons name="close" size={22} color={theme.colors.text} />
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
                Cargando grupos...
              </ThemedText>
            </View>
          ) : grupos.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons
                name="albums-outline"
                size={42}
                color={theme.colors.primary}
              />

              <ThemedText
                style={[
                  styles.emptyTitle,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                No hay grupos disponibles
              </ThemedText>

              <ThemedText
                style={[
                  styles.emptyText,
                  {
                    color: theme.colors.muted,
                  },
                ]}
              >
                Esta materia todavía no tiene grupos registrados.
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            >
              {grupos.map((grupo) => {
                const selected = estaSeleccionado(grupo.idGrupo);

                return (
                  <Pressable
                    key={grupo.idGrupo}
                    disabled={inscribiendo}
                    onPress={() => onToggleGrupo(grupo)}
                    style={[
                      styles.card,
                      {
                        backgroundColor: selected
                          ? `${theme.colors.primary}22`
                          : theme.colors.background,
                        borderColor: selected
                          ? theme.colors.primary
                          : theme.colors.border,
                        opacity: inscribiendo ? 0.6 : 1,
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <ThemedText
                          style={[
                            styles.groupName,
                            {
                              color: theme.colors.text,
                            },
                          ]}
                        >
                          {grupo.nombre}
                        </ThemedText>

                        <ThemedText
                          style={[
                            styles.groupCode,
                            {
                              color: theme.colors.muted,
                            },
                          ]}
                        >
                          Código: {grupo.codigo ?? "-"}
                        </ThemedText>
                      </View>

                      <Ionicons
                        name={selected ? "checkbox" : "square-outline"}
                        size={28}
                        color={selected ? theme.colors.primary : theme.colors.muted}
                      />
                    </View>

                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <ThemedText
                          style={[
                            styles.label,
                            {
                              color: theme.colors.muted,
                            },
                          ]}
                        >
                          PARALELO
                        </ThemedText>

                        <ThemedText
                          style={[
                            styles.value,
                            {
                              color: theme.colors.text,
                            },
                          ]}
                        >
                          {grupo.paralelo ?? "-"}
                        </ThemedText>
                      </View>

                      <View style={styles.infoItem}>
                        <ThemedText
                          style={[
                            styles.label,
                            {
                              color: theme.colors.muted,
                            },
                          ]}
                        >
                          TURNO
                        </ThemedText>

                        <ThemedText
                          style={[
                            styles.value,
                            {
                              color: theme.colors.text,
                            },
                          ]}
                        >
                          {grupo.turno ?? "-"}
                        </ThemedText>
                      </View>

                      <View style={styles.infoItem}>
                        <ThemedText
                          style={[
                            styles.label,
                            {
                              color: theme.colors.muted,
                            },
                          ]}
                        >
                          HORARIO
                        </ThemedText>

                        <ThemedText
                          style={[
                            styles.value,
                            {
                              color: theme.colors.text,
                            },
                          ]}
                        >
                          {grupo.horario ?? "-"}
                        </ThemedText>
                      </View>

                      <View style={styles.infoItem}>
                        <ThemedText
                          style={[
                            styles.label,
                            {
                              color: theme.colors.muted,
                            },
                          ]}
                        >
                          CUPOS
                        </ThemedText>

                        <ThemedText
                          style={[
                            styles.value,
                            {
                              color: theme.colors.text,
                            },
                          ]}
                        >
                          {grupo.cupos ?? "-"}
                        </ThemedText>
                      </View>

                      <View style={styles.infoItem}>
                        <ThemedText
                          style={[
                            styles.label,
                            {
                              color: theme.colors.muted,
                            },
                          ]}
                        >
                          GESTIÓN
                        </ThemedText>

                        <ThemedText
                          style={[
                            styles.value,
                            {
                              color: theme.colors.text,
                            },
                          ]}
                        >
                          {grupo.gestion ?? "-"}
                        </ThemedText>
                      </View>

                      <View style={styles.infoItem}>
                        <ThemedText
                          style={[
                            styles.label,
                            {
                              color: theme.colors.muted,
                            },
                          ]}
                        >
                          TIPO
                        </ThemedText>

                        <ThemedText
                          style={[
                            styles.value,
                            {
                              color: theme.colors.text,
                            },
                          ]}
                        >
                          {grupo.tipo ?? "-"}
                        </ThemedText>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <View
            style={[
              styles.footer,
              {
                borderColor: theme.colors.border,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.footerText,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              Seleccionados: {gruposSeleccionados.length}
            </ThemedText>

            <Pressable
              onPress={onClose}
              style={[
                styles.doneButton,
                {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <ThemedText style={styles.doneText}>Aceptar</ThemedText>
            </Pressable>
          </View>
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
    maxWidth: 850,
    maxHeight: "90%",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },

  closeButton: {
    width: 42,
    height: 42,
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
    padding: 36,
    alignItems: "center",
    gap: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
  },

  emptyText: {
    textAlign: "center",
    fontWeight: "600",
  },

  list: {
    gap: 12,
    paddingBottom: 8,
  },

  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  groupName: {
    fontSize: 17,
    fontWeight: "900",
  },

  groupCode: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  infoItem: {
    minWidth: 120,
    flex: 1,
  },

  label: {
    fontSize: 11,
    fontWeight: "900",
  },

  value: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },

  footer: {
    borderTopWidth: 1,
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  footerText: {
    fontWeight: "900",
  },

  doneButton: {
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  doneText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});