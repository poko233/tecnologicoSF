// app/index.tsx
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { ThemeSelector } from "../components/ThemeSelector";
import { useTheme } from "../theme/useTheme";

export default function IndexScreen() {
  const { theme } = useTheme();

  const content = (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.appName, { color: theme.colors.text }]}>
              TECNOLOGICOSF
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Showcase del sistema de temas
            </Text>
          </View>

          {/* Navegación a otras pantallas (sidebar, etc.) */}
          <TouchableOpacity onPress={() => router.push("/configuraciones")}>
            <Text style={{ color: theme.colors.primary, padding: 16 }}>
              Ir a Configuraciones
            </Text>
          </TouchableOpacity>

          {/* Selector de temas */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Themes
          </Text>
          <ThemeSelector />
        </ScrollView>
      </SafeAreaView>
    </View>
  );

  // Envolvemos con ProtectedRoute (sin Sidebar ni layout de escritorio)
  return <ProtectedRoute>{content}</ProtectedRoute>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
});
