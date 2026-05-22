// app/_layout.tsx
import { Slot, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MobileDrawer } from "../components/MobileDrawer";
import { Toaster } from "../components/Toaster";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { MobileDrawerProvider } from "../contexts/MobileDrawerContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import "../global.css";
import { useTheme } from "../theme/useTheme";

function AppContent() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const { user } = useAuth();

  const showDrawer = !!user && pathname !== "/";

  return (
    <>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      <MobileDrawerProvider>
        <Slot />
        {showDrawer && <MobileDrawer />}
      </MobileDrawerProvider>
      <Toaster />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
