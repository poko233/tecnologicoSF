import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { ThemeSelector } from "../../../components/ThemeSelector";
import { useTheme } from "../../../theme/useTheme";

type Props = {
  tipo: "carrera" | "curso";
  onChange: (tipo: "carrera" | "curso") => void;
};

export default function TipoInscripcionSelector({ tipo, onChange }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ThemeSelector />

      <ThemedText style={styles.title}>Modalidad de Estudio</ThemedText>

      <ThemedText style={[styles.subtitle, { color: theme.colors.text }]}>
        Selecciona el tipo de programa académico.
      </ThemedText>

      <Pressable
        onPress={() => onChange("carrera")}
        style={[
          styles.card,
          {
            borderColor: tipo === "carrera" ? theme.colors.primary : theme.colors.border,
            backgroundColor: theme.colors.card,
          },
        ]}
      >
        <Ionicons
          name="school-outline"
          size={24}
          color={tipo === "carrera" ? theme.colors.primary : theme.colors.text}
        />

        <View style={styles.info}>
          <ThemedText style={styles.cardTitle}>Inscribir a una Carrera</ThemedText>
          <ThemedText style={styles.cardText}>
            Programas de grado, tecnicaturas o licenciaturas.
          </ThemedText>
        </View>
      </Pressable>

      <Pressable
        onPress={() => onChange("curso")}
        style={[
          styles.card,
          {
            borderColor: tipo === "curso" ? theme.colors.primary : theme.colors.border,
            backgroundColor: theme.colors.card,
          },
        ]}
      >
        <Ionicons
          name="book-outline"
          size={24}
          color={tipo === "curso" ? theme.colors.primary : theme.colors.text}
        />

        <View style={styles.info}>
          <ThemedText style={styles.cardTitle}>Cursos o Capacitaciones</ThemedText>
          <ThemedText style={styles.cardText}>
            Talleres, diplomados y certificaciones técnicas.
          </ThemedText>
        </View>
      </Pressable>

      <View
        style={[
          styles.note,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.secondary,
          },
        ]}
      >
        <ThemedText style={styles.noteTitle}>Requisito previo</ThemedText>
        <ThemedText style={styles.cardText}>
          Debes tener registrado al estudiante antes de inscribirlo.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  cardText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.75,
  },
  note: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
});