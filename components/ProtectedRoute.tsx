// components/ProtectedRoute.tsx
import { router, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../theme/useTheme";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  roles?: string[]; // nuevo: solo acceden usuarios con al menos uno de estos roles
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo,
  roles,
}: ProtectedRouteProps) {
  const { user, loading, hasAnyRole } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (!requireAuth && user) {
      router.replace((redirectTo as any) || "/");
    } else if (requireAuth && user && roles && !hasAnyRole(roles)) {
      // Usuario autenticado pero sin el rol requerido
      router.replace("/"); // o una pantalla de "no autorizado"
    }
  }, [loading, user, requireAuth, redirectTo, pathname, roles, hasAnyRole]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // No autorizado por roles
  if (requireAuth && user && roles && !hasAnyRole(roles)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (requireAuth && !user) return null;
  if (!requireAuth && user) return null;

  return <>{children}</>;
}
