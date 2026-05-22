import { StyleSheet, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import { Docente } from "../types/docente.types";

type Props = {
  docentes: Docente[];
  isMobile: boolean;
};

export default function DocenteStats({ docentes, isMobile }: Props) {
  const { theme } = useTheme();

  const activos = docentes.filter((d) => d.estadoDocente === "activo").length;
  const inactivos = docentes.filter((d) => d.estadoDocente === "inactivo").length;

  return (
    <View style={[styles.row, { flexDirection: isMobile ? "column" : "row" }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <ThemedText style={[styles.number, { color: theme.colors.text }]}>
          {docentes.length}
        </ThemedText>
        <ThemedText style={[styles.label, { color: theme.colors.textSecondary }]}>
          Total docentes
        </ThemedText>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <ThemedText style={[styles.number, { color: theme.colors.text }]}>
          {activos}
        </ThemedText>
        <ThemedText style={[styles.label, { color: theme.colors.textSecondary }]}>
          Activos
        </ThemedText>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <ThemedText style={[styles.number, { color: theme.colors.text }]}>
          {inactivos}
        </ThemedText>
        <ThemedText style={[styles.label, { color: theme.colors.textSecondary }]}>
          Inactivos
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  number: {
    fontSize: 26,
    fontWeight: "900",
  },
  label: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },
});