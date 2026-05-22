import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import { Materia } from "../types/asignacionDocente.types";

type Props = {
  materia: Materia;
  active: boolean;
  totalGruposAsignados: number;
  totalDocentesAsignados: number;
  onVerAsignaciones: () => void;
  onAsignarDocente: () => void;
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
  totalDocentesAsignados,
  onVerAsignaciones,
  onAsignarDocente,
}: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: active ? theme.colors.primarySubtle : theme.colors.input,
          borderColor: active ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <View style={styles.top}>
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
      </View>

      <View style={styles.infoRow}>
        <ThemedText style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          {totalDocentesAsignados} docente(s) · {totalGruposAsignados} grupo(s)
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onVerAsignaciones}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons name="people-outline" size={17} color={theme.colors.text} />
          <ThemedText style={[styles.buttonText, { color: theme.colors.text }]}>
            Ver docentes
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={onAsignarDocente}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Ionicons
            name="person-add-outline"
            size={17}
            color={theme.colors.primaryForeground}
          />
          <ThemedText
            style={[styles.buttonText, { color: theme.colors.primaryForeground }]}
          >
            Asignar
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 330,
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
    gap: 12,
  },
  top: {
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
  infoRow: {
    marginTop: 2,
  },
  infoText: {
    fontSize: 12,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "900",
  },
});