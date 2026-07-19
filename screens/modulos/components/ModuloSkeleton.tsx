import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";

export function ModuloSkeleton() {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.card,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          {/* Badge posicion */}
          <View
            style={[
              styles.posicionBadge,
              { backgroundColor: c.muted, opacity: 0.3 },
            ]}
          />

          {/* Drag handle */}
          <View style={styles.dragHandle}>
            <View style={[styles.line, { backgroundColor: c.muted }]} />
            <View style={[styles.line, { backgroundColor: c.muted }]} />
          </View>

          {/* Icon skeleton */}
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: c.muted, opacity: 0.2 },
            ]}
          />

          {/* Info skeleton */}
          <View style={styles.info}>
            <View
              style={[
                styles.titleSkeleton,
                { backgroundColor: c.muted, opacity: 0.3 },
              ]}
            />
            <View
              style={[
                styles.descSkeleton,
                { backgroundColor: c.muted, opacity: 0.2 },
              ]}
            />
            <View
              style={[
                styles.badgeSkeleton,
                { backgroundColor: c.muted, opacity: 0.2 },
              ]}
            />
          </View>

          {/* Actions skeleton */}
          <View style={styles.actions}>
            <View
              style={[
                styles.actionBtn,
                { backgroundColor: c.muted, opacity: 0.2 },
              ]}
            />
            <View
              style={[
                styles.actionBtn,
                { backgroundColor: c.muted, opacity: 0.2 },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    position: "relative",
  },
  posicionBadge: {
    position: "absolute",
    top: -8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  dragHandle: {
    width: 24,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  line: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  titleSkeleton: {
    height: 14,
    width: "60%",
    borderRadius: 4,
  },
  descSkeleton: {
    height: 12,
    width: "90%",
    borderRadius: 4,
  },
  badgeSkeleton: {
    height: 11,
    width: "40%",
    borderRadius: 4,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
});
