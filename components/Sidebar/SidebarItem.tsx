import { Href, usePathname, useRouter } from "expo-router"; // 👈 importamos Href
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../../theme/useTheme";
import type { NavHref } from "./Sidebar";

interface SidebarItemProps {
  name: string;
  href: NavHref;
  icon: React.ComponentType<{ color: string; size: number }>;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  href,
  icon: Icon,
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === href;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: isActive ? theme.colors.primary : "transparent",
    borderRadius: 12,
  }));

  const handlePress = () => {
    // Type assertion a Href: seguro porque href es una ruta válida
    router.push(href as Href);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 180 });
        }}
        style={({ pressed }) => [
          styles.navItem,
          {
            backgroundColor: isActive
              ? theme.colors.primary
              : pressed
                ? theme.colors.secondary
                : "transparent",
            borderRadius: 12,
          },
        ]}
      >
        <Icon
          color={isActive ? theme.colors.primaryForeground : theme.colors.text}
          size={20}
        />
        <Text
          style={[
            styles.label,
            {
              color: isActive
                ? theme.colors.primaryForeground
                : theme.colors.text,
              fontWeight: isActive ? "700" : "500",
            },
          ]}
        >
          {name}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  label: {
    fontSize: 16,
  },
});
