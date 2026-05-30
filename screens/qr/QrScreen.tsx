import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/theme/useTheme";
import { AnimatePresence } from "moti";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View
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

  const handleVerify = (mode: InputMode, value: string) => {
    verify(mode, value);
  };

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

        {/* Input */}
        <CredentialInput onVerify={handleVerify} loading={loading} />

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text
              style={[styles.errorText, { color: theme.colors.destructive }]}
            >
              {error}
            </Text>
            <Text
              onPress={reset}
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
            onDismiss={reset}
          />
        )}
      </AnimatePresence>
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
});
