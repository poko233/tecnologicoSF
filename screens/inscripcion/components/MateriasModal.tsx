import { Ionicons } from "@expo/vector-icons";
import React from "react";
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
import { Carrera, Materia } from "../types/inscripcion.types";

type Props = {
  visible: boolean;
  carrera: Carrera | null;
  materias: Materia[];
  loading: boolean;
  onClose: () => void;
  onVerGrupos: (materia: Materia) => void;
};

export default function MateriasModal({
  visible,
  carrera,
  materias,
  loading,
  onClose,
  onVerGrupos,
}: Props) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.titleBox}>
              <ThemedText style={styles.title}>Materias</ThemedText>
              <ThemedText style={styles.subtitle}>
                {carrera?.nombreCarrera ?? ""}
              </ThemedText>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={theme.colors.primary} />
              <ThemedText>Cargando materias...</ThemedText>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {materias.length === 0 ? (
                <View style={[styles.empty, { borderColor: theme.colors.border }]}>
                  <ThemedText>No hay materias asignadas.</ThemedText>
                </View>
              ) : (
                materias.map((item) => (
                  <View
                    key={item.idMateria}
                    style={[
                      styles.row,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <View style={styles.info}>
                      <ThemedText style={styles.name}>
                        {item.nombreMateria}
                      </ThemedText>

                      <ThemedText style={styles.detail}>
                        Código: {item.codigo} · Semestre: {item.semestre}
                      </ThemedText>
                    </View>

                    <Pressable
                      onPress={() => onVerGrupos(item)}
                      style={[
                        styles.button,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <ThemedText style={styles.buttonText}>Ver grupos</ThemedText>
                    </Pressable>
                  </View>
                ))
              )}
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
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  modal: {
    width: "100%",
    maxWidth: 850,
    maxHeight: "85%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBox: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.75,
    marginTop: 4,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    padding: 30,
    alignItems: "center",
    gap: 10,
  },
  empty: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
  },
  row: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
  },
  detail: {
    fontSize: 13,
    opacity: 0.7,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
});