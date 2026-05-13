// components/ProtectedRoute.tsx
import { router, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../theme/useTheme";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Si es true (por defecto), la ruta requiere autenticación. Si es false, es ruta de auth (login/register). */
  requireAuth?: boolean;
  /** Ruta a la que redirigir cuando no se cumple la condición */
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      // No autenticado → redirigir a login con redirect
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (!requireAuth && user) {
      // Ya autenticado en ruta de auth → redirigir a home (o destino elegido)
      router.replace((redirectTo as any) || "/");
    }
  }, [loading, user, requireAuth, redirectTo, pathname]);

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

  // Renderiza children solo si se cumple la condición:
  // - requireAuth && user → lo necesita y lo tiene
  // - !requireAuth && !user → ruta de auth sin sesión
  if (requireAuth && !user) return null;
  if (!requireAuth && user) return null;

  return <>{children}</>;
}
