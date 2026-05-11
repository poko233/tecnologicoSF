import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { themes } from "../theme/themes";
import { ThemeName } from "../theme/types";
import { useTheme } from "../theme/useTheme";

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const themeNames = Object.keys(themes) as ThemeName[];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {themeNames.map((name) => {
        const isActive = theme.name === name;
        return (
          <Animated.View
            key={name}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
          >
            <Pressable
              onPress={() => setTheme(name)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive
                    ? theme.colors.primary
                    : theme.colors.secondary,
                  borderColor: theme.colors.border,
                  borderRadius: 12,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isActive
                      ? theme.colors.primaryForeground
                      : theme.colors.text,
                  },
                ]}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: "500",
    fontSize: 14,
  },
});
