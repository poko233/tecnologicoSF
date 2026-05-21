// app/(tabs)/_layout.tsx
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/tabs";
import { useAuth } from "../../contexts/AuthContext";
import { useResponsive } from "../../hooks/useResponsive";
import { useTheme } from "../../theme/useTheme";
import { getTabsForRoles } from "../../utils/roleBasedTabs";

export default function TabsLayout() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isDesktop } = useResponsive();
  const tabs = getTabsForRoles(user?.roles ?? []);

  return (
    <ProtectedRoute>
      <AppLayout>
        <Tabs
          tabBar={isDesktop ? () => null : undefined}
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.muted,
            tabBarStyle: {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.border,
              paddingBottom: 12,
              paddingTop: 10,
              height: 79, // Más alto para que el texto respire
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "700",
              marginTop: 4,
              paddingBottom: 2,
            },
          }}
        >
          {tabs.map((tab) => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: tab.title,
                tabBarIcon: ({ color, size }) => (
                  <Ionicons
                    name={tab.icon as keyof typeof Ionicons.glyphMap}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
          ))}
        </Tabs>
      </AppLayout>
    </ProtectedRoute>
  );
}
