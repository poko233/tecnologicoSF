// screens/notas/components/GroupCard.tsx
import { useTheme } from "@/theme/useTheme";
import { School, Users } from "lucide-react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { cardEntrance } from "../animations/notas.animations";
import { GrupoMateriaDocente } from "../types/notas.types";

interface Props {
  grupo: GrupoMateriaDocente;
  onPress: (id: number) => void;
  index: number;
  itemWidth: number;
  marginRight?: number;
  marginBottom?: number;
}

export function GroupCard({
  grupo,
  onPress,
  index,
  itemWidth,
  marginRight = 0,
  marginBottom = 0,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <MotiView
      from={cardEntrance.from}
      animate={cardEntrance.animate}
      transition={{
        ...cardEntrance.transition,
        delay: index * 60,
      }}
      style={[
        styles.card,
        {
          width: itemWidth,
          marginRight,
          marginBottom,
          // Se ha eliminado flex: 1 para evitar la distorsión horizontal
          backgroundColor: c.card,
          borderColor: c.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        },
      ]}
    >
      <MotiPressable
        onPress={() => onPress(grupo.id_grupo_materia_docente)}
        style={[styles.pressable, { flex: 1, justifyContent: "space-between" }]}
        animate={({ pressed }) => {
          "worklet";
          return {
            scale: pressed ? 0.97 : 1,
          };
        }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[styles.title, { color: c.primary }]}
              numberOfLines={2}
            >
              {grupo.grupo}
              {grupo.paralelo ? ` (${grupo.paralelo})` : ""}
            </Text>
            <School size={24} color={c.primary} />
          </View>

          <Text style={[styles.materia, { color: c.text }]} numberOfLines={1}>
            {grupo.materia}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.row}>
            <Users size={16} color={c.textSecondary} />
            <Text style={[styles.inscritos, { color: c.textSecondary }]}>
              {grupo.inscritos} inscritos
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: c.primary + "15" }]}>
            <Text style={[styles.badgeText, { color: c.primary }]}>
              {grupo.gestion}
            </Text>
          </View>
        </View>
      </MotiPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  pressable: {
    padding: 16,
  },
  content: { gap: 8 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  materia: { fontSize: 14, fontWeight: "500" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  inscritos: { fontSize: 13 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "600" },
});
