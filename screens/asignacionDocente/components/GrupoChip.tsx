import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import { Grupo, Horario } from "../types/asignacionDocente.types";

type Props = {
  grupo: Grupo;
  selected: boolean;
  onPress: () => void;
};

function getGrupoNombre(grupo: Grupo) {
  return grupo.nombreGrupo ?? grupo.nombre ?? `Grupo ${grupo.idGrupo}`;
}

function formatearHora(value?: string) {
  if (!value) return "";
  return value.substring(0, 5);
}

function getHorarioTexto(horario: Horario) {
  return `${horario.dia} ${formatearHora(horario.horaInicio)} - ${formatearHora(
    horario.horaFin
  )}`;
}

export default function GrupoChip({ grupo, selected, onPress }: Props) {
  const { theme } = useTheme();
  const horarios = grupo.horarios ?? [];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: selected
            ? theme.colors.primarySubtle
            : theme.colors.input,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.check,
          {
            backgroundColor: selected ? theme.colors.primary : "transparent",
            borderColor: selected ? theme.colors.primary : theme.colors.borderHover,
          },
        ]}
      >
        {selected && (
          <Ionicons
            name="checkmark"
            size={17}
            color={theme.colors.primaryForeground}
          />
        )}
      </View>

      <View style={styles.info}>
        <ThemedText
          numberOfLines={1}
          style={[styles.name, { color: theme.colors.text }]}
        >
          {getGrupoNombre(grupo)}
        </ThemedText>

        <ThemedText style={[styles.meta, { color: theme.colors.textSecondary }]}>
          ID: {grupo.idGrupo}
          {grupo.turno ? ` · ${grupo.turno}` : ""}
        </ThemedText>

        <View style={styles.horariosContainer}>
          {horarios.length > 0 ? (
            horarios.map((horario) => (
              <View
                key={horario.idHorario}
                style={[
                  styles.horarioChip,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: selected
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={13}
                  color={selected ? theme.colors.primary : theme.colors.textSecondary}
                />

                <ThemedText
                  numberOfLines={1}
                  style={[
                    styles.horarioText,
                    {
                      color: selected
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {getHorarioTexto(horario)}
                </ThemedText>
              </View>
            ))
          ) : (
            <View
              style={[
                styles.horarioChip,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={13}
                color={theme.colors.textTertiary}
              />

              <ThemedText
                style={[styles.horarioText, { color: theme.colors.textTertiary }]}
              >
                Sin horario asignado
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 330,
    minHeight: 132,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  check: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  name: {
    fontSize: 15,
    fontWeight: "900",
  },
  meta: {
    fontSize: 13,
    fontWeight: "700",
  },
  horariosContainer: {
    marginTop: 6,
    gap: 6,
  },
  horarioChip: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  horarioText: {
    fontSize: 11,
    fontWeight: "800",
  },
});