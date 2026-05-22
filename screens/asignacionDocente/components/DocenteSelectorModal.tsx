import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import { Docente } from "../types/asignacionDocente.types";

type Props = {
  visible: boolean;
  docentes: Docente[];
  idDocenteSeleccionado: number | null;
  onClose: () => void;
  onSelect: (docente: Docente) => void;
};

function getNombreCompleto(docente: Docente) {
  const u = docente.usuario;

  const nombre = `${u?.nombres ?? ""} ${u?.apellidoPaterno ?? ""} ${
    u?.apellidoMaterno ?? ""
  }`.trim();

  return nombre || `Docente ${docente.idDocente}`;
}

function getTituloProfesional(docente: Docente) {
  const abreviatura =
    docente.abreviaturaProfesional ?? docente.abreviaturaProfesion ?? "";

  const profesion = docente.profesion ?? "Sin profesión";

  return abreviatura ? `${abreviatura}. ${profesion}` : profesion;
}

export default function DocenteSelectorModal({
  visible,
  docentes,
  idDocenteSeleccionado,
  onClose,
  onSelect,
}: Props) {
  const { theme } = useTheme();

  const docentesActivos = docentes.filter(
    (docente) => docente.estadoDocente === "activo"
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.modal,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.title, { color: theme.colors.text }]}>
                Seleccionar docente
              </ThemedText>

              <ThemedText
                style={[styles.subtitle, { color: theme.colors.textSecondary }]}
              >
                Solo aparecen docentes activos disponibles para asignación.
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

          <ScrollView showsVerticalScrollIndicator persistentScrollbar>
            {docentesActivos.map((docente) => {
              const active = docente.idDocente === idDocenteSeleccionado;

              return (
                <Pressable
                  key={docente.idDocente}
                  onPress={() => onSelect(docente)}
                  style={[
                    styles.item,
                    {
                      backgroundColor: active
                        ? theme.colors.primarySubtle
                        : theme.colors.input,
                      borderColor: active
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: active
                          ? theme.colors.primary
                          : theme.colors.primarySubtle,
                      },
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={22}
                      color={
                        active
                          ? theme.colors.primaryForeground
                          : theme.colors.primary
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <ThemedText
                      style={[styles.name, { color: theme.colors.text }]}
                    >
                      {getNombreCompleto(docente)}
                    </ThemedText>

                    <ThemedText
                      style={[
                        styles.profession,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {getTituloProfesional(docente)}
                    </ThemedText>

                    <ThemedText
                      style={[styles.meta, { color: theme.colors.textTertiary }]}
                    >
                      CI: {docente.usuario?.ci ?? "-"} · Estado:{" "}
                      {docente.estadoDocente ?? "-"}
                    </ThemedText>
                  </View>

                  {active && (
                    <Ionicons
                      name="checkmark-circle"
                      size={26}
                      color={theme.colors.primary}
                    />
                  )}
                </Pressable>
              );
            })}
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
  card: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "82%",
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    gap: 14,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: "600",
  },
  closeButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
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
    fontWeight: "900",
    marginTop: 3,
  },
  meta: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "700",
  },
});