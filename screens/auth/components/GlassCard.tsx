// screens/auth/components/GlassCard.tsx
import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";

interface GlassCardProps {
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children }) => {
  const { theme } = useTheme();
  const tint = theme.dark ? "dark" : "light";

  return (
    <View style={styles.container}>
      <BlurView
        intensity={20}
        tint={tint}
        style={[
          styles.blur,
          {
            backgroundColor: theme.dark
              ? "rgba(255,255,255,0.05)"
              : "rgba(255,255,255,0.7)",
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 32,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  blur: {
    paddingVertical: 16, // antes 20
    paddingHorizontal: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
});
