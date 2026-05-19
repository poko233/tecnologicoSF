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
import { Grupo, Materia } from "../types/inscripcion.types";

type Props = {
  visible: boolean;
  materia: Materia | null;
  grupos: Grupo[];
  loading: boolean;
  inscribiendo: boolean;
  onClose: () => void;
  onInscribir: (grupo: Grupo) => void;
};

export default function GruposModal({
  visible,
  materia,
  grupos,
  loading,
  inscribiendo,
  onClose,
  onInscribir,
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
              <ThemedText style={styles.title}>Grupos disponibles</ThemedText>
              <ThemedText style={styles.subtitle}>
                {materia?.nombreMateria ?? ""}
              </ThemedText>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={theme.colors.primary} />
              <ThemedText>Cargando grupos...</ThemedText>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {grupos.length === 0 ? (
                <View style={[styles.empty, { borderColor: theme.colors.border }]}>
                  <ThemedText>No hay grupos disponibles.</ThemedText>
                </View>
              ) : (
                grupos.map((item) => (
                  <View
                    key={item.idGrupo}
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
                        {item.nombre} · Paralelo {item.paralelo}
                      </ThemedText>

                      <ThemedText style={styles.detail}>
                        Código: {item.codigo}
                      </ThemedText>

                      <ThemedText style={styles.detail}>
                        Turno: {item.turno} · Horario: {item.horario} · Cupos:{" "}
                        {item.cupos}
                      </ThemedText>

                      <ThemedText style={styles.detail}>
                        Gestión: {item.gestion} · Tipo: {item.tipo}
                      </ThemedText>
                    </View>

                    <Pressable
                      disabled={inscribiendo}
                      onPress={() => onInscribir(item)}
                      style={[
                        styles.button,
                        {
                          backgroundColor: inscribiendo
                            ? theme.colors.border
                            : theme.colors.primary,
                        },
                      ]}
                    >
                      {inscribiendo ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <ThemedText style={styles.buttonText}>Inscribir</ThemedText>
                      )}
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
    opacity: 0.72,
  },
  button: {
    minWidth: 110,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
});