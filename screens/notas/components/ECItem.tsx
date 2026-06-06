import { useTheme } from "@/theme/useTheme";
import { Edit, Trash2 } from "lucide-react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { itemEntranceTiming } from "../animations/notas.animations";
import { ElementoCompetencia } from "../types/notas.types";

interface Props {
  ec: ElementoCompetencia;
  index: number;
  onEdit: (ec: ElementoCompetencia) => void;
  onToggleStatus: (ec: ElementoCompetencia) => void;
}

export function ECItem({ ec, index, onEdit, onToggleStatus }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [hovered, setHovered] = useState(false);

  return (
    <MotiView
      from={itemEntranceTiming.from}
      animate={itemEntranceTiming.animate}
      transition={{
        ...itemEntranceTiming.transition,
        delay: index * 40,
      }}
    >
      <MotiPressable
        onPress={() => onEdit(ec)}
        style={[
          styles.container,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
        animate={({ pressed, hovered }) => {
          "worklet";
          return {
            borderColor: pressed || hovered ? c.primary : c.border,
            shadowOpacity: pressed || hovered ? 0.15 : 0,
          };
        }}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
      >
        <View style={styles.content}>
          {/* Badge */}
          <View style={[styles.badge, { backgroundColor: c.primary + "15" }]}>
            <Text style={[styles.badgeText, { color: c.primary }]}>
              {index + 1}
            </Text>
          </View>
          {/* Info */}
          <View style={styles.info}>
            <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
              {ec.nombre}
            </Text>
            {ec.observaciones ? (
              <Text
                style={[styles.obs, { color: c.textSecondary }]}
                numberOfLines={1}
              >
                {ec.observaciones}
              </Text>
            ) : null}
          </View>
          {/* Acciones (visibles en hover) */}
          <View style={[styles.actions, { opacity: hovered ? 1 : 0 }]}>
            <MotiPressable
              onPress={() => onEdit(ec)}
              style={styles.actionBtn}
              animate={({ pressed }) => ({
                scale: pressed ? 0.85 : 1,
              })}
            >
              <Edit size={18} color={c.primary} />
            </MotiPressable>
            <MotiPressable
              onPress={() => onToggleStatus(ec)}
              style={styles.actionBtn}
              animate={({ pressed }) => ({
                scale: pressed ? 0.85 : 1,
              })}
            >
              <Trash2 size={18} color={c.destructive} />
            </MotiPressable>
          </View>
        </View>
      </MotiPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 6,
    elevation: 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  obs: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
});
