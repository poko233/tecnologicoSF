import { Slot } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { Sidebar } from "./Sidebar/Sidebar";

export default function DesktopLayout() {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Sidebar />
      <View
        style={[
          styles.content,
          { backgroundColor: theme.colors.backgroundSecondary },
        ]}
      >
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
    overflow: "hidden",
  },
});
