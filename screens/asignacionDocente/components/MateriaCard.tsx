import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import { Materia } from "../types/asignacionDocente.types";

type Props = {
  materia: Materia;
  active: boolean;
  totalGruposAsignados: number;
  onPress: () => void;
};

function getMateriaNombre(materia: Materia) {
  return materia.nombreMateria ?? materia.nombre ?? `Materia ${materia.idMateria}`;
}

function getMateriaCodigo(materia: Materia) {
  return materia.codigo ?? materia.sigla ?? "Sin código";
}

export default function MateriaCard({
  materia,
  active,
  totalGruposAsignados,
  onPress,
}: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: active
            ? theme.colors.primarySubtle
            : theme.colors.input,
          borderColor: active ? theme.colors.primary : theme.colors.border,
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
          name="book-outline"
          size={22}
          color={active ? theme.colors.primaryForeground : theme.colors.primary}
        />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText
          numberOfLines={2}
          style={[styles.name, { color: theme.colors.text }]}
        >
          {getMateriaNombre(materia)}
        </ThemedText>

        <ThemedText style={[styles.meta, { color: theme.colors.textSecondary }]}>
          {getMateriaCodigo(materia)}
          {materia.semestre ? ` · Semestre ${materia.semestre}` : ""}
        </ThemedText>
      </View>

      {totalGruposAsignados > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <ThemedText
            style={[styles.badgeText, { color: theme.colors.primaryForeground }]}
          >
            {totalGruposAsignados}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  meta: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },
  badge: {
    minWidth: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "900",
  },
});