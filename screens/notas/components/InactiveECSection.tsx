import { useTheme } from "@/theme/useTheme";
import { Check } from "lucide-react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { itemEntranceTiming } from "../animations/notas.animations";
import { ElementoCompetencia } from "../types/notas.types";

interface Props {
  ecs: ElementoCompetencia[];
  onReactivate: (ec: ElementoCompetencia) => void;
}

export function InactiveECSection({ ecs, onReactivate }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={{ gap: 8 }}>
      {ecs.map((ec, index) => (
        <InactiveECItem
          key={ec.id}
          ec={ec}
          index={index}
          onReactivate={onReactivate}
        />
      ))}
    </View>
  );
}

function InactiveECItem({
  ec,
  index,
  onReactivate,
}: {
  ec: ElementoCompetencia;
  index: number;
  onReactivate: (ec: ElementoCompetencia) => void;
}) {
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
        onPress={() => onReactivate(ec)}
        style={[
          styles.item,
          {
            backgroundColor: c.backgroundSecondary,
            borderColor: c.border,
          },
        ]}
        animate={({ pressed, hovered }) => {
          "worklet";
          return {
            borderColor: pressed || hovered ? c.primary : c.border,
          };
        }}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
      >
        <View style={styles.info}>
          <Text
            style={[
              styles.name,
              {
                color: c.textSecondary,
                textDecorationLine: "line-through",
              },
            ]}
            numberOfLines={1}
          >
            {ec.nombre}
          </Text>
          <Text style={[styles.status, { color: c.textMuted }]}>
            No promedia
          </Text>
        </View>
        <View
          style={[styles.reactivateContainer, { opacity: hovered ? 1 : 0 }]}
        >
          <MotiPressable
            onPress={() => onReactivate(ec)}
            style={styles.reactivateBtn}
            animate={({ pressed }) => ({
              scale: pressed ? 0.9 : 1,
            })}
          >
            <Check size={18} color={c.primary} />
          </MotiPressable>
        </View>
      </MotiPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    opacity: 0.65,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  status: {
    fontSize: 12,
    marginTop: 2,
  },
  reactivateContainer: {
    opacity: 0,
  },
  reactivateBtn: {
    padding: 8,
    borderRadius: 8,
  },
});
