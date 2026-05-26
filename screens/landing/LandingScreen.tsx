import React, { useCallback } from "react";
import { Linking, ScrollView, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useResponsive } from "../../hooks/useResponsive";
import { useTheme } from "../../theme/useTheme";
import { BenefitsSection } from "./components/BenefitsSection";
import { CareersSection } from "./components/CareersSection";
import { ContactSection } from "./components/ContactSection";
import { FloatingParticles } from "./components/FloatingParticles";
import { FooterSection } from "./components/FooterSection";
import { HeroSection } from "./components/HeroSection";

export default function LandingScreen() {
  const { theme } = useTheme();
  const { isDesktop } = useResponsive();
  const mouseX = useSharedValue(-1000);
  const mouseY = useSharedValue(-1000);

  const handleMouseMove = useCallback(
    (e: any) => {
      mouseX.value = e.nativeEvent.pageX;
      mouseY.value = e.nativeEvent.pageY;
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.value = -1000;
    mouseY.value = -1000;
  }, [mouseX, mouseY]);

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/59169781846");
  };

  const ViewWithMouse = View as any;

  return (
    <ViewWithMouse
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <FloatingParticles mouseX={mouseX} mouseY={mouseY} />
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection onCtaPress={handleWhatsApp} />
        <CareersSection />
        <BenefitsSection />
        <ContactSection onWhatsApp={handleWhatsApp} />
        <FooterSection />
      </ScrollView>
    </ViewWithMouse>
  );
}
