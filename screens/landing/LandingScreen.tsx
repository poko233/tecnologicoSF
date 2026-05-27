// screens/landing/LandingScreen.tsx
import React, { useCallback } from "react";
import { Linking, Platform, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useTheme } from "../../theme/useTheme";
import { BenefitsSection } from "./components/BenefitsSection";
import { CareersSection } from "./components/CareersSection";
import { ContactSection } from "./components/ContactSection";
import { FloatingParticles } from "./components/FloatingParticles";
import { FooterSection } from "./components/FooterSection";
import { HeroSection } from "./components/HeroSection";

export default function LandingScreen() {
  const { theme } = useTheme();
  const scrollY = useSharedValue(0);
  const mouseX = useSharedValue(-1000);
  const mouseY = useSharedValue(-1000);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

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
      onMouseMove={Platform.OS === "web" ? handleMouseMove : undefined}
      onMouseLeave={Platform.OS === "web" ? handleMouseLeave : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <FloatingParticles mouseX={mouseX} mouseY={mouseY} />
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
      >
        <HeroSection onCtaPress={handleWhatsApp} scrollY={scrollY} />
        <CareersSection />
        <BenefitsSection />
        <ContactSection onWhatsApp={handleWhatsApp} />
        <FooterSection />
      </Animated.ScrollView>
    </ViewWithMouse>
  );
}
