// components/MobileHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { useMobileDrawer } from "../contexts/MobileDrawerContext";
import { useTheme } from "../theme/useTheme";

export const MobileHeader: React.FC = () => {
  const { theme } = useTheme();
  const c = theme.colors;
  const { toggleDrawer } = useMobileDrawer();

  const hamburgerScale = useSharedValue(1);
  const bellScale = useSharedValue(1);

  const hamburgerAnim = useAnimatedStyle(() => ({
    transform: [{ scale: hamburgerScale.value }],
  }));
  const bellAnim = useAnimatedStyle(() => ({
    transform: [{ scale: bellScale.value }],
  }));

  const showToast = () => {
    Toast.show({
      type: "info",
      text1: "Función en desarrollo",
      text2: "Pronto podrás ver tus notificaciones.",
      visibilityTime: 3000,
    });
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: c.background,
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      {/* Botón menú con fondo circular */}
      <Animated.View style={hamburgerAnim}>
        <Pressable
          onPress={() => toggleDrawer()}
          onPressIn={() => {
            hamburgerScale.value = withTiming(0.9, { duration: 150 });
          }}
          onPressOut={() => {
            hamburgerScale.value = withTiming(1, { duration: 150 });
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: c.backgroundSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
          accessibilityLabel="Abrir menú lateral"
        >
          <Ionicons name="menu" size={24} color={c.text} />
        </Pressable>
      </Animated.View>

      {/* Icono de notificaciones */}
      <Animated.View style={bellAnim}>
        <Pressable
          onPress={showToast}
          onPressIn={() => {
            bellScale.value = withTiming(0.9, { duration: 150 });
          }}
          onPressOut={() => {
            bellScale.value = withTiming(1, { duration: 150 });
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: c.backgroundSecondary,
            alignItems: "center",
            justifyContent: "center",
          }}
          accessibilityLabel="Notificaciones"
        >
          <Ionicons name="notifications-outline" size={24} color={c.text} />
        </Pressable>
      </Animated.View>
    </View>
  );
};
