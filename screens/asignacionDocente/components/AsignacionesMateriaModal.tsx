import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import {
    AsignacionDocente,
    Materia,
} from "../types/asignacionDocente.types";

type Props = {
  visible: boolean;
  materia: Materia | null;
  asignaciones: AsignacionDocente[];
  onClose: () => void;
  onEliminar: (idMateria: number, idDocente: number) => Promise<void>;
};

export default function AsignacionesMateriaModal({
  visible,
  materia,
  asignaciones,
  onClose,
  onEliminar,
}: Props) {
  const { theme } = useTheme();

  const [deleting, setDeleting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [docenteAEliminar, setDocenteAEliminar] = useState<any | null>(null);

  const agrupadas = asignaciones.reduce((acc: any[], item) => {
    const existente = acc.find((x) => x.idDocente === item.idDocente);

    if (existente) {
      if (item.grupo) existente.grupos.push(item.grupo);
    } else {
      acc.push({
        idDocente: item.idDocente,
        docente: item.docente,
        grupos: item.grupo ? [item.grupo] : [],
      });
    }

    return acc;
  }, []);

  const pedirConfirmacion = (item: any) => {
    if (deleting) return;

    setDocenteAEliminar(item);
    setConfirmVisible(true);
  };

  const cancelarEliminar = () => {
    if (deleting) return;

    setConfirmVisible(false);
    setDocenteAEliminar(null);
  };

  const confirmarEliminar = async () => {
    if (!materia || !docenteAEliminar || deleting) return;

    try {
      setDeleting(true);

      await onEliminar(materia.idMateria, docenteAEliminar.idDocente);

      setConfirmVisible(false);
      setDocenteAEliminar(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={deleting ? undefined : onClose}
      >
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
                  Docentes asignados
                </ThemedText>

                <ThemedText
                  style={[styles.subtitle, { color: theme.colors.textSecondary }]}
                >
                  {materia?.nombreMateria ?? materia?.nombre ?? "Materia"}
                </ThemedText>
              </View>

              <Pressable
                disabled={deleting}
                onPress={onClose}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: theme.colors.input,
                    borderColor: theme.colors.border,
                    opacity: deleting ? 0.5 : 1,
                  },
                ]}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator persistentScrollbar>
              {agrupadas.length === 0 ? (
                <View style={styles.empty}>
                  <Ionicons
                    name="people-outline"
                    size={42}
                    color={theme.colors.textMuted}
                  />

                  <ThemedText
                    style={[styles.emptyTitle, { color: theme.colors.text }]}
                  >
                    Sin docentes asignados
                  </ThemedText>

                  <ThemedText
                    style={[
                      styles.emptyText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Esta materia todavía no tiene docentes ni grupos asignados.
                  </ThemedText>
                </View>
              ) : (
                agrupadas.map((item) => {
                  const usuario = item.docente?.usuario;

                  const nombre = `${usuario?.nombres ?? ""} ${
                    usuario?.apellidoPaterno ?? ""
                  } ${usuario?.apellidoMaterno ?? ""}`.trim();

                  return (
                    <View
                      key={item.idDocente}
                      style={[
                        styles.card,
                        {
                          backgroundColor: theme.colors.input,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <View style={styles.cardHeader}>
                        <View
                          style={[
                            styles.avatar,
                            { backgroundColor: theme.colors.primarySubtle },
                          ]}
                        >
                          <Ionicons
                            name="person-outline"
                            size={22}
                            color={theme.colors.primary}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <ThemedText
                            style={[styles.name, { color: theme.colors.text }]}
                          >
                            {nombre || `Docente ${item.idDocente}`}
                          </ThemedText>

                          <ThemedText
                            style={[
                              styles.profession,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            {item.docente?.profesion ??
                              "Sin profesión registrada"}
                          </ThemedText>
                        </View>

                        <Pressable
                          disabled={deleting}
                          onPress={() => pedirConfirmacion(item)}
                          style={[
                            styles.deleteButton,
                            {
                              backgroundColor: "#ef4444",
                              borderColor: "#ef4444",
                              opacity: deleting ? 0.5 : 1,
                            },
                          ]}
                        >
                          <Ionicons name="trash-outline" size={17} color="#fff" />
                          <ThemedText style={styles.deleteText}>Borrar</ThemedText>
                        </Pressable>
                      </View>

                      <View style={styles.grupos}>
                        {item.grupos.map((grupo: any) => (
                          <View
                            key={grupo?.idGrupo}
                            style={[
                              styles.grupoChip,
                              {
                                backgroundColor: theme.colors.background,
                                borderColor: theme.colors.border,
                              },
                            ]}
                          >
                            <ThemedText
                              style={[
                                styles.grupoText,
                                { color: theme.colors.text },
                              ]}
                            >
                              {grupo?.nombreGrupo ??
                                grupo?.nombre ??
                                `Grupo ${grupo?.idGrupo}`}
                            </ThemedText>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelarEliminar}
      >
        <View
          style={[
            styles.confirmOverlay,
            { backgroundColor: theme.colors.overlay },
          ]}
        >
          <View
            style={[
              styles.confirmCard,
              {
                backgroundColor: theme.colors.modal,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.warningCircle}>
              <Ionicons name="warning-outline" size={42} color="#ff4b4b" />
            </View>

            <ThemedText style={[styles.confirmTitle, { color: theme.colors.text }]}>
              ¿Eliminar asignación?
            </ThemedText>

            <ThemedText
              style={[styles.confirmText, { color: theme.colors.textSecondary }]}
            >
              Se borrará este docente con todos sus grupos asignados en esta materia.
            </ThemedText>

            <View style={styles.confirmActions}>
              <Pressable
                disabled={deleting}
                onPress={cancelarEliminar}
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: theme.colors.input,
                    borderColor: theme.colors.border,
                    opacity: deleting ? 0.45 : 1,
                  },
                ]}
              >
                <ThemedText
                  style={[styles.cancelText, { color: theme.colors.text }]}
                >
                  Cancelar
                </ThemedText>
              </Pressable>

              <Pressable
                disabled={deleting}
                onPress={confirmarEliminar}
                style={[
                  styles.confirmDeleteButton,
                  { opacity: deleting ? 0.85 : 1 },
                ]}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                    <ThemedText style={styles.confirmDeleteText}>
                      Sí, borrar
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    maxWidth: 760,
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
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "900",
  },
  profession: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "700",
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  grupos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  grupoChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  grupoText: {
    fontSize: 12,
    fontWeight: "900",
  },
  empty: {
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 320,
  },
  confirmOverlay: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCard: {
    width: "100%",
    maxWidth: 480,
    borderWidth: 1,
    borderRadius: 28,
    padding: 26,
    alignItems: "center",
    gap: 14,
  },
  warningCircle: {
    width: 76,
    height: 76,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
  },
  confirmTitle: {
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 360,
  },
  confirmActions: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "900",
  },
  confirmDeleteButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    backgroundColor: "#ef4444",
  },
  confirmDeleteText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
});