// components/Sidebar/SidebarFooter.tsx
import { Image } from "expo-image";
import { LogOut } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import logoImg from "../../assets/images/logo_texto.png";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../theme/useTheme";

export const SidebarFooter = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      Toast.show({
        type: "success",
        text1: "Sesión cerrada",
        text2: "Has salido correctamente.",
        visibilityTime: 3000,
      });
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const hoverHandlers =
    Platform.OS === "web"
      ? {
          onMouseEnter: () => setHovered(true),
          onMouseLeave: () => setHovered(false),
        }
      : {};

  return (
    <View
      style={{
        marginTop: "auto",
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      {/* Logo más grande */}
      <Image
        source={logoImg}
        style={{ flex: 1, height: 35 }}
        contentFit="contain"
        contentPosition="left center"
      />

      {/* Botón logout con borde, ícono + texto */}
      <Pressable
        onPress={handleLogout}
        disabled={loading}
        {...(hoverHandlers as any)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 8,
          borderWidth: 1,
          borderColor:
            hovered || pressed ? theme.colors.destructive : theme.colors.border,
          backgroundColor:
            hovered || pressed
              ? theme.colors.destructive + "12"
              : "transparent",
          opacity: loading ? 0.6 : 1,
        })}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.destructive} />
        ) : (
          <>
            <LogOut size={13} color={theme.colors.destructive} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: theme.colors.destructive,
              }}
            >
              Salir
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
};
