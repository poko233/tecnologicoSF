// screens/auth/components/background/WebBackground.tsx
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../../../theme/useTheme";

export const WebBackground: React.FC = () => {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.background }]}>
      {/* Gradiente base sutil */}
      <LinearGradient
        colors={[c.background, c.backgroundSecondary, c.background]}
        style={StyleSheet.absoluteFill}
      />
      {/* Círculo decorativo 1 */}
      <View
        style={[
          styles.blob,
          {
            width: 400,
            height: 400,
            borderRadius: 200,
            backgroundColor: c.primary + "10",
            top: -100,
            left: -100,
            opacity: 0.5,
          },
        ]}
      />
      {/* Círculo decorativo 2 */}
      <View
        style={[
          styles.blob,
          {
            width: 500,
            height: 500,
            borderRadius: 250,
            backgroundColor: c.secondary + "15",
            bottom: -200,
            right: -200,
            opacity: 0.5,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
  },
});
