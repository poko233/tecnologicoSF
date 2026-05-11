import { StatusBar } from "expo-status-bar";
import React from "react";
import DesktopLayout from "../components/DesktopLayout";
import MobileLayout from "../components/MobileLayout";
import { ThemeProvider } from "../contexts/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../theme/useTheme";

function AppContent() {
  const { isDesktop } = useResponsive();
  const { theme } = useTheme();

  return (
    <>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
