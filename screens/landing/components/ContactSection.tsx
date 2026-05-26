import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Linking,
    Platform,
    Text,
    View
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTheme } from "../../../theme/useTheme";

export const ContactSection = ({ onWhatsApp }: { onWhatsApp?: () => void }) => {
  const { theme } = useTheme();
  const { isMobile, isDesktop } = useResponsive();

  const openMaps = () => {
    const address =
      "Av. San Martín entre Brasil y Montes N° 930, Cochabamba, Bolivia";
    const url = Platform.select({
      ios: `maps://app?daddr=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    });
    Linking.openURL(url);
  };

  const openEmail = () => Linking.openURL("mailto:d.gomeztecsur@gmail.com");

  return (
    <View
      style={{
        width: "100%",
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: isMobile ? 24 : 32,
          fontWeight: "800",
          color: theme.colors.text,
          marginBottom: 24,
        }}
      >
        Contacto
      </Text>
      <Animated.View
        entering={FadeIn.duration(600).springify()}
        style={{ width: "100%", maxWidth: 600, gap: 16 }}
      >
        {/* Dirección */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Ionicons
            name="location-outline"
            size={24}
            color={theme.colors.primary}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.textSecondary,
              }}
            >
              Dirección
            </Text>
            <Text
              style={{ fontSize: 15, color: theme.colors.text, lineHeight: 20 }}
              onPress={openMaps}
            >
              Av. San Martín entre Brasil y Montes N° 930, Cochabamba, Bolivia
            </Text>
          </View>
        </View>

        {/* Teléfonos */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Ionicons
            name="call-outline"
            size={24}
            color={theme.colors.primary}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.textSecondary,
              }}
            >
              Teléfonos
            </Text>
            <Text style={{ fontSize: 15, color: theme.colors.text }}>
              62777077
            </Text>
            <Text style={{ fontSize: 15, color: theme.colors.text }}>
              +591 69781846
            </Text>
          </View>
        </View>

        {/* Email */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Ionicons
            name="mail-outline"
            size={24}
            color={theme.colors.primary}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.textSecondary,
              }}
            >
              Email
            </Text>
            <Text
              style={{ fontSize: 15, color: theme.colors.text }}
              onPress={openEmail}
            >
              d.gomeztecsur@gmail.com
            </Text>
          </View>
        </View>

        {/* WhatsApp CTA */}
        <View style={{ marginTop: 8, alignItems: "center" }}>
          <View
            style={{
              backgroundColor: "#25D366",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 30,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text
              style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}
              onPress={onWhatsApp}
            >
              Escríbenos por WhatsApp
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};
