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
              <ThemedText style={styles.title}>Grupos disponibles</ThemedText>

              <ThemedText style={styles.subtitle}>
                {materia?.nombreMateria ?? "Materia no seleccionada"}
              </ThemedText>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                { borderColor: theme.colors.border },
              ]}
            >
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.colors.primary} />
              <ThemedText>Cargando grupos...</ThemedText>
            </View>
          ) : grupos.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons
                name="albums-outline"
                size={42}
                color={theme.colors.primary}
              />
              <ThemedText style={styles.emptyTitle}>
                No hay grupos disponibles
              </ThemedText>
              <ThemedText style={styles.emptyText}>
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
                          ? `${theme.colors.primary}20`
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
                        <ThemedText style={styles.groupName}>
                          {grupo.nombre}
                        </ThemedText>

                        <ThemedText style={styles.groupCode}>
                          Código: {grupo.codigo ?? "-"}
                        </ThemedText>
                      </View>

                      <Ionicons
                        name={selected ? "checkbox" : "square-outline"}
                        size={28}
                        color={
                          selected ? theme.colors.primary : theme.colors.text
                        }
                      />
                    </View>

                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <ThemedText style={styles.label}>PARALELO</ThemedText>
                        <ThemedText style={styles.value}>
                          {grupo.paralelo ?? "-"}
                        </ThemedText>
                      </View>

                      <View style={styles.infoItem}>
                        <ThemedText style={styles.label}>TURNO</ThemedText>
                        <ThemedText style={styles.value}>
                          {grupo.turno ?? "-"}
                        </ThemedText>
                      </View>

                      <View style={styles.infoItem}>
                        <ThemedText style={styles.label}>HORARIO</ThemedText>
                        <ThemedText style={styles.value}>
                          {grupo.horario ?? "-"}
                        </ThemedText>
                      </View>

                      <View style={styles.infoItem}>
                        <ThemedText style={styles.label}>CUPOS</ThemedText>
                        <ThemedText style={styles.value}>
                          {grupo.cupos ?? "-"}
                        </ThemedText>
                      </View>

                      <View style={styles.infoItem}>
                        <ThemedText style={styles.label}>GESTIÓN</ThemedText>
                        <ThemedText style={styles.value}>
                          {grupo.gestion ?? "-"}
                        </ThemedText>
                      </View>

                      <View style={styles.infoItem}>
                        <ThemedText style={styles.label}>TIPO</ThemedText>
                        <ThemedText style={styles.value}>
                          {grupo.tipo ?? "-"}
                        </ThemedText>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Seleccionados: {gruposSeleccionados.length}
            </ThemedText>

            <Pressable
              onPress={onClose}
              style={[
                styles.doneButton,
                { backgroundColor: theme.colors.primary },
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
    backgroundColor: "rgba(0,0,0,0.55)",
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
    opacity: 0.7,
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
    opacity: 0.7,
    textAlign: "center",
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
    opacity: 0.7,
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
    opacity: 0.55,
  },
  value: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: "rgba(150,150,150,0.25)",
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
    color: "#fff",
    fontWeight: "900",
  },
});