// app/(auth)/_layout.tsx
import { Slot } from "expo-router";
import React from "react";
import { ProtectedRoute } from "../../components/ProtectedRoute";

export default function AuthLayout() {
  return (
    <ProtectedRoute requireAuth={false} redirectTo="/">
      <Slot />
    </ProtectedRoute>
  );
}
