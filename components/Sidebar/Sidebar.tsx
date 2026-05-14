import { Settings } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/useTheme";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarItem } from "./SidebarItem";

// "as const" hace que TypeScript infiera los literales exactos ('/', '/explore', etc.)
const navItems = [
  { name: "Configuraciones", href: "/configuraciones", icon: Settings },
] as const;

// Tipo extraído de las rutas disponibles
export type NavHref = (typeof navItems)[number]["href"];

export const Sidebar = () => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: theme.colors.card,
          borderRightColor: theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.logo, { color: theme.colors.text }]}>
        TECNOLOGICOSF
      </Text>

      {/* ─── PERFIL ─── */}
      <SidebarHeader />
      <View style={styles.nav}>
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            name={item.name}
            href={item.href}
            icon={item.icon}
          />
        ))}
      </View>
      {/* ─── FOOTER ─── */}
      <SidebarFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    justifyContent: "flex-start",
  },
  logo: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 24,
    paddingLeft: 8,
  },
  nav: {
    gap: 4,
  },
});
