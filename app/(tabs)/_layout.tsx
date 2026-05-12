// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router/tabs";
import { Home, Search, Settings, User } from "lucide-react-native";
import { View } from "react-native";
import { Sidebar } from "../../components/Sidebar/Sidebar";
import { useResponsive } from "../../hooks/useResponsive";
import { useTheme } from "../../theme/useTheme";

export default function TabsLayout() {
  const { isDesktop } = useResponsive();
  const { theme } = useTheme();

  // Definición común de las pantallas del grupo
  const screenOptions = {
    headerShown: false,
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.muted,
    tabBarStyle: {
      backgroundColor: theme.colors.background,
      borderTopColor: theme.colors.border,
      paddingBottom: 12,
      paddingTop: 12,
      height: 60,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: "600" as const,
    },
  };

  // Icons helper (puede estar fuera)
  const tabs = [
    { name: "index", title: "Home", icon: Home },
    { name: "explore", title: "Explorar", icon: Search },
    { name: "Rol", title: "Roles", icon: Settings }, // ejemplo
    { name: "settings", title: "Ajustes", icon: Settings },
    { name: "profile", title: "Perfil", icon: User },
  ];

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
          style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}
        >
          <Tabs
            tabBar={() => null} // sin barra inferior
            screenOptions={{ headerShown: false }}
          >
            {tabs.map((tab) => (
              <Tabs.Screen
                key={tab.name}
                name={tab.name}
                options={{ title: tab.title }}
              />
            ))}
          </Tabs>
        </View>
      </View>
    );
  }

  // Mobile: tabs inferiores normales
  return (
    <Tabs screenOptions={screenOptions}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <tab.icon color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
