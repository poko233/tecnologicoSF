import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { Carrera } from "../types/inscripcion.types";

type Props = {
  carreras: Carrera[];
  loading: boolean;
  onVerMaterias: (carrera: Carrera) => void;
};

export default function CarrerasTable({
  carreras,
  loading,
  onVerMaterias,
}: Props) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} />
        <ThemedText>Cargando ofertas académicas...</ThemedText>
      </View>
    );
  }

  if (carreras.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: theme.colors.border }]}>
        <ThemedText>No hay carreras disponibles.</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.colors.secondary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <ThemedText style={styles.th}>Nombre</ThemedText>
          <ThemedText style={styles.th}>Código</ThemedText>
          <ThemedText style={styles.th}>Duración</ThemedText>
          <ThemedText style={styles.th}>Carga Horaria</ThemedText>
          <ThemedText style={styles.th}>Costo</ThemedText>
          <ThemedText style={styles.th}>Régimen</ThemedText>
          <ThemedText style={styles.th}>Acciones</ThemedText>
        </View>

        {carreras.map((item) => (
          <View
            key={item.idCarrera}
            style={[
              styles.row,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.card,
              },
            ]}
          >
            <ThemedText style={styles.td}>{item.nombreCarrera}</ThemedText>
            <ThemedText style={styles.td}>{item.codigo}</ThemedText>
            <ThemedText style={styles.td}>{item.duracionMeses} meses</ThemedText>
            <ThemedText style={styles.td}>{item.cargaHoraria}</ThemedText>
            <ThemedText style={styles.td}>
              Bs. {Number(item.costo).toFixed(2)}
            </ThemedText>
            <ThemedText style={styles.td}>{item.regimen}</ThemedText>

            <View style={styles.td}>
              <Pressable
                onPress={() => onVerMaterias(item)}
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Ionicons name="book-outline" size={16} color="#fff" />
                <ThemedText style={styles.actionText}>Ver materias</ThemedText>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    padding: 30,
    alignItems: "center",
    gap: 10,
  },
  empty: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  table: {
    minWidth: 1050,
  },
  header: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    alignItems: "center",
  },
  th: {
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  td: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  actionButton: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
});