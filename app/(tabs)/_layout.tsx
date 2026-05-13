// app/(tabs)/_layout.tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Tabs } from "expo-router/tabs";
import { Settings } from "lucide-react-native";
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
    { name: "configuraciones", title: "Configuraciones", icon: Settings },
  ];

  if (isDesktop) {
    return (
      <ProtectedRoute>
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
      </ProtectedRoute>
    );
  }

  // Mobile: tabs inferiores normales
  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}
