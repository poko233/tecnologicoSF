import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

type Props = {
  tipo: "carrera" | "curso";
  onChange: (tipo: "carrera" | "curso") => void;
};

export default function TipoInscripcionSelector({ tipo, onChange }: Props) {
  const { theme } = useTheme();

  const renderOption = (
    value: "carrera" | "curso",
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    description: string
  ) => {
    const active = tipo === value;

    return (
      <Pressable
        onPress={() => onChange(value)}
        style={[
          styles.card,
          {
            borderColor: active ? theme.colors.primary : theme.colors.border,
            backgroundColor: active
              ? `${theme.colors.primary}18`
              : theme.colors.background,
          },
        ]}
      >
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: active
                ? theme.colors.primary
                : theme.colors.card,
              borderColor: active ? theme.colors.primary : theme.colors.border,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={24}
            color={active ? "#FFFFFF" : theme.colors.text}
          />
        </View>

        <View style={styles.info}>
          <ThemedText
            style={[
              styles.cardTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            {title}
          </ThemedText>

          <ThemedText
            style={[
              styles.cardText,
              {
                color: theme.colors.muted,
              },
            ]}
          >
            {description}
          </ThemedText>
        </View>

        {active && (
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={theme.colors.primary}
          />
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <ThemedText
        style={[
          styles.title,
          {
            color: theme.colors.text,
          },
        ]}
      >
        Modalidad de Estudio
      </ThemedText>

      <ThemedText
        style={[
          styles.subtitle,
          {
            color: theme.colors.muted,
          },
        ]}
      >
        Selecciona el tipo de programa académico.
      </ThemedText>

      {renderOption(
        "carrera",
        "school-outline",
        "Inscribir a una Carrera",
        "Programas de grado, tecnicaturas o licenciaturas."
      )}

      {renderOption(
        "curso",
        "book-outline",
        "Cursos o Capacitaciones",
        "Talleres, diplomados y certificaciones técnicas."
      )}

      <View
        style={[
          styles.note,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <View style={styles.noteHeader}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={theme.colors.primary}
          />

          <ThemedText
            style={[
              styles.noteTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Requisito previo
          </ThemedText>
        </View>

        <ThemedText
          style={[
            styles.cardText,
            {
              color: theme.colors.muted,
            },
          ]}
        >
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
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  info: {
    flex: 1,
    gap: 4,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
  },

  cardText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  note: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },

  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  noteTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
});