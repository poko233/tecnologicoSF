// screens/asistencia/components/GroupCard.tsx
import { useTheme } from "@/theme/useTheme";
import { Calendar, Clock, School } from "lucide-react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { cardEntrance } from "../animations/asistencia.animations";
import { GrupoAsignado } from "../types/asistencia.types";

interface Props {
  grupo: GrupoAsignado;
  onPress: (id: number) => void;
  index: number;
  columnCount: number;
  itemWidth: number;
}

export function GroupCard({ grupo, onPress, index, itemWidth }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <MotiView
      from={cardEntrance.from}
      animate={cardEntrance.animate}
      transition={{
        ...cardEntrance.transition,
        delay: index * 50,
      }}
      style={[
        styles.card,
        {
          width: itemWidth,
          flex: 1, // <-- OBLIGA A LA TARJETA A ESTIRARSE AL ALTO DE LA FILA
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
        // DISTRIBUYE EL ESPACIO: El título arriba y los detalles empujados al fondo
        style={[styles.pressable, { flex: 1, justifyContent: "space-between" }]}
        animate={({ pressed }) => {
          "worklet";
          return {
            scale: pressed ? 0.98 : 1,
          };
        }}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.primary }]} numberOfLines={3}>
            {grupo.grupo} - {grupo.materia}
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.row}>
            <School size={16} color={c.textSecondary} />
            <Text style={[styles.detailText, { color: c.textSecondary }]}>
              Carrera: {grupo.carrera}
            </Text>
          </View>
          <View style={styles.row}>
            <Clock size={16} color={c.textSecondary} />
            <Text style={[styles.detailText, { color: c.textSecondary }]}>
              Turno: {grupo.turno}
            </Text>
          </View>
          <View style={styles.row}>
            <Calendar size={16} color={c.textSecondary} />
            <Text style={[styles.detailText, { color: c.textSecondary }]}>
              Régimen: {grupo.regimen}
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
  },
  pressable: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  details: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
