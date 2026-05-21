// components/AppLayout.tsx
import React from "react";
import { View } from "react-native";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../theme/useTheme";
import { MobileHeader } from "./MobileHeader";
import { Sidebar } from "./Sidebar/Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout común para todas las pantallas de la app:
 * - Escritorio: Sidebar fijo + contenido a la derecha.
 * - Móvil: MobileHeader + contenido.
 *
 * El drawer móvil se maneja desde el root _layout.tsx.
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isDesktop } = useResponsive();
  const { theme } = useTheme();

  if (isDesktop) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          backgroundColor: theme.colors.background,
        }}
      >
        <Sidebar />
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.backgroundSecondary,
          }}
        >
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <MobileHeader />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};
