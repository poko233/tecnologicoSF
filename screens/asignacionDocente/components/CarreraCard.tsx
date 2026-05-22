import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import { Carrera } from "../types/asignacionDocente.types";

type Props = {
  carrera: Carrera;
  active: boolean;
  onPress: () => void;
};

function getNombre(carrera: Carrera) {
  return carrera.nombreCarrera ?? carrera.nombre ?? `Carrera ${carrera.idCarrera}`;
}

function getCodigo(carrera: Carrera) {
  return carrera.codigoCarrera ?? carrera.codigo ?? "Sin código";
}

export default function CarreraCard({ carrera, active, onPress }: Props) {
  const { theme } = useTheme();

  const tipo = carrera.tipo ?? "Carrera";
  const regimen = carrera.regimen ?? "Sin régimen";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: active ? theme.colors.primarySubtle : theme.colors.input,
          borderColor: active ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: active ? theme.colors.primary : theme.colors.primarySubtle,
          },
        ]}
      >
        <Ionicons
          name={tipo.toLowerCase() === "carrera" ? "school-outline" : "library-outline"}
          size={23}
          color={active ? theme.colors.primaryForeground : theme.colors.primary}
        />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText numberOfLines={2} style={[styles.name, { color: theme.colors.text }]}>
          {getNombre(carrera)}
        </ThemedText>

        <ThemedText style={[styles.meta, { color: theme.colors.textSecondary }]}>
          {getCodigo(carrera)}
        </ThemedText>

        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <ThemedText style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
              {tipo}
            </ThemedText>
          </View>

          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.colors.primarySubtle,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <ThemedText style={[styles.badgeText, { color: theme.colors.primary }]}>
              {regimen}
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 330,
    minHeight: 124,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 21,
  },
  meta: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "700",
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
  },
});