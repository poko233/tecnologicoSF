// screens/qr/QrScreen.tsx
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/theme/useTheme";
import { useRouter } from "expo-router";
import { AnimatePresence } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessResultPanel } from "./components/AccessResultPanel";
import { CredentialInput } from "./components/CredentialInput";
import { useManualVerification } from "./hooks/useManualVerification";
import { InputMode } from "./types/qr.types";

export const QrScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isDesktop } = useResponsive();
  const { result, error, loading, verify, reset } = useManualVerification();
  const router = useRouter();

  // Contador para forzar remontaje del input y limpiar sus campos
  const [resetKey, setResetKey] = useState(0);
  const [countdown, setCountdown] = useState(5);

  const handleVerify = (mode: InputMode, value: string) => {
    verify(mode, value);
  };

  const handleReset = useCallback(() => {
    reset(); // limpia resultado y error
    setResetKey((prev) => prev + 1); // provoca que CredentialInput se monte de nuevo
  }, [reset]);
  // Auto‑cierre del error con contador visual
  useEffect(() => {
    if (!error) {
      setCountdown(5);
      return;
    }

    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleReset();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      setCountdown(5);
    };
  }, [error, handleReset]);
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            maxWidth: 700,
            alignSelf: "center",
            width: "100%",
            paddingHorizontal: isDesktop ? 40 : 20,
          },
        ]}
      >
        {/* Título */}
        <View style={styles.header}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>
            Validación de Credenciales
          </Text>
          <Text
            style={[styles.subheading, { color: theme.colors.textSecondary }]}
          >
            Seleccione el método de ingreso para verificar el estatus
            institucional.
          </Text>
        </View>

        {/* Input que se reinicia al cerrar el resultado */}
        <CredentialInput
          key={resetKey}
          onVerify={handleVerify}
          loading={loading}
        />

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text
              style={[styles.errorText, { color: theme.colors.destructive }]}
            >
              {error}
            </Text>
            {error.includes("Permiso de ubicación denegado") && (
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  marginTop: 4,
                }}
              >
                Para habilitar la ubicación, haz clic en el candado de la barra
                de direcciones y permite el acceso a la ubicación.
              </Text>
            )}
            <Text
              onPress={handleReset}
              style={[styles.retryText, { color: theme.colors.primary }]}
            >
              Intentar de nuevo
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Panel de resultado con animación de entrada y salida */}
      <AnimatePresence>
        {result && (
          <AccessResultPanel
            key={result.registro_id}
            data={result}
            onDismiss={handleReset}
          />
        )}
      </AnimatePresence>

      {/* Botón "Iniciar Sesión" en la esquina superior derecha */}
      <TouchableOpacity
        style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push("/login")}
        activeOpacity={0.8}
      >
        <Text
          style={{
            color: theme.colors.primaryForeground,
            fontWeight: "700",
            fontSize: 13,
          }}
        >
          Iniciar Sesión
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  header: {
    textAlign: "center",
    marginBottom: 32,
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subheading: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
  },
  errorBox: {
    marginTop: 24,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "700",
  },
  loginButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});
