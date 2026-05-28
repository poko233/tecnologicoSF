// screens/landing/components/FooterSection.tsx
import { router } from "expo-router";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";

export const FooterSection: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View
      className="w-full items-center py-5 border-t"
      style={{
        backgroundColor: theme.colors.backgroundSecondary,
        borderTopColor: theme.colors.border,
      }}
    >
      <View className="flex-row items-center flex-wrap justify-center">
        <Text className="text-xs" style={{ color: theme.colors.textMuted }}>
          © {new Date().getFullYear()} Tecnológico del Sur — Cochabamba, Bolivia
        </Text>
        <Text
          className="text-xs mx-1"
          style={{ color: theme.colors.textMuted }}
        >
          ·
        </Text>
        <MotiPressable
          onPress={() => router.push("/login")}
          animate={({ hovered }) => {
            "worklet";
            return { opacity: hovered ? 1 : 0.7, scale: hovered ? 1.05 : 1 };
          }}
          transition={{ type: "timing", duration: 200 }}
          accessibilityRole="link"
        >
          <Text
            className="text-xs underline"
            style={{ color: theme.colors.textMuted }}
          >
            Ingresar al sistema
          </Text>
        </MotiPressable>
      </View>
    </View>
  );
};
