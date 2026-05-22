import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import { Grupo } from "../types/asignacionDocente.types";

type Props = {
  grupo: Grupo;
  selected: boolean;
  onPress: () => void;
};

function getGrupoNombre(grupo: Grupo) {
  return grupo.nombreGrupo ?? grupo.nombre ?? `Grupo ${grupo.idGrupo}`;
}

export default function GrupoChip({ grupo, selected, onPress }: Props) {
  const { theme } = useTheme();

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
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 250,
    minHeight: 86,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  check: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: "900",
  },
  meta: {
    fontSize: 13,
    fontWeight: "700",
  },
});