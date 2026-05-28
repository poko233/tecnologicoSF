// screens/landing/components/ContactSection.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import React, { useMemo } from "react";
import { Linking, Platform, Text, View } from "react-native";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTheme } from "../../../theme/useTheme";
import { CARD_ANIMATION } from "../animations/landing.animations";

export const ContactSection: React.FC<{ onWhatsApp?: () => void }> = ({
  onWhatsApp,
}) => {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();

  const openMaps = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const address =
      "Av. San Martín entre Brasil y Montes N° 930, Cochabamba, Bolivia";
    const url = Platform.select({
      ios: `maps://app?daddr=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    });
    Linking.openURL(url);
  };

  const openEmail = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL("mailto:d.gomeztecsur@gmail.com");
  };

  const handleWhatsAppPress = () => {
    if (Platform.OS !== "web")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onWhatsApp?.();
  };

  const animatePress = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return { scale: pressed ? 0.95 : 1 };
      },
    [],
  );

  return (
    <View className="w-full items-center py-10 px-5">
      <MotiView {...CARD_ANIMATION}>
        <Text
          className="text-2xl md:text-3xl font-extrabold mb-6"
          style={{ color: theme.colors.text }}
        >
          Contacto
        </Text>
      </MotiView>

      <MotiView {...CARD_ANIMATION} className="w-full max-w-lg gap-4">
        {/* Dirección */}
        <MotiPressable
          onPress={openMaps}
          animate={animatePress}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
        >
          <View className="flex-row items-center gap-3 p-3 rounded-xl">
            <Ionicons
              name="location-outline"
              size={24}
              color={theme.colors.primary}
            />
            <View className="flex-1">
              <Text
                className="text-sm font-semibold"
                style={{ color: theme.colors.textSecondary }}
              >
                Dirección
              </Text>
              <Text className="text-base" style={{ color: theme.colors.text }}>
                Av. San Martín entre Brasil y Montes N° 930, Cochabamba, Bolivia
              </Text>
            </View>
          </View>
        </MotiPressable>

        {/* Teléfonos */}
        <View className="flex-row items-center gap-3 p-3 rounded-xl">
          <Ionicons
            name="call-outline"
            size={24}
            color={theme.colors.primary}
          />
          <View className="flex-1">
            <Text
              className="text-sm font-semibold"
              style={{ color: theme.colors.textSecondary }}
            >
              Teléfonos
            </Text>
            <Text className="text-base" style={{ color: theme.colors.text }}>
              62777077
            </Text>
            <Text className="text-base" style={{ color: theme.colors.text }}>
              +591 69781846
            </Text>
          </View>
        </View>

        {/* Email */}
        <MotiPressable
          onPress={openEmail}
          animate={animatePress}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
        >
          <View className="flex-row items-center gap-3 p-3 rounded-xl">
            <Ionicons
              name="mail-outline"
              size={24}
              color={theme.colors.primary}
            />
            <View className="flex-1">
              <Text
                className="text-sm font-semibold"
                style={{ color: theme.colors.textSecondary }}
              >
                Email
              </Text>
              <Text className="text-base" style={{ color: theme.colors.text }}>
                d.gomeztecsur@gmail.com
              </Text>
            </View>
          </View>
        </MotiPressable>

        {/* WhatsApp CTA */}
        <View className="mt-4 items-center">
          <MotiPressable
            onPress={handleWhatsAppPress}
            animate={({ pressed }) => {
              "worklet";
              return { scale: pressed ? 0.9 : 1 };
            }}
            transition={{ type: "spring", damping: 10, stiffness: 250 }}
          >
            <View
              className="flex-row items-center gap-2 px-6 py-3 rounded-full"
              style={{ backgroundColor: theme.colors.success }}
            >
              <Ionicons name="logo-whatsapp" size={22} color="white" />
              <Text
                className="text-white font-bold text-base"
                style={{ color: theme.colors.successForeground }}
              >
                Escríbenos por WhatsApp
              </Text>
            </View>
          </MotiPressable>
        </View>
      </MotiView>
    </View>
  );
};
