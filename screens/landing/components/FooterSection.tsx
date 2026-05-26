// screens/landing/components/FooterSection.tsx
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";

export const FooterSection = () => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        width: "100%",
        paddingVertical: 20,
        alignItems: "center",
        backgroundColor: theme.colors.backgroundSecondary,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
      }}
    >
      {/* Ambos textos en una sola fila */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
          © {new Date().getFullYear()} Tecnológico del Sur — Cochabamba, Bolivia
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.textMuted,
            marginHorizontal: 4,
          }}
        >
          ·
        </Text>
        <Pressable
          onPress={() => router.push("/login")}
          accessibilityRole="link"
        >
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.textMuted,
              textDecorationLine: "underline",
            }}
          >
            Ingresar al sistema
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
