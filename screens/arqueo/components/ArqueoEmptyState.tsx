// screens/arqueo/components/ArqueoEmptyState.tsx
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/useTheme";
import { Circle } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

interface ArqueoEmptyStateProps {
  onOpenArqueo: () => void;
}

export function ArqueoEmptyState({ onOpenArqueo }: ArqueoEmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.content}>
          {/* Puedes reemplazar esta URL con tu ilustración local o SVG */}
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2830/2830303.png",
            }}
            style={{ width: 120, height: 120, marginBottom: 16, opacity: 0.7 }}
            resizeMode="contain"
          />
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>
            No hay un arqueo activo
          </ThemedText>
          <ThemedText
            style={[
              styles.description,
              { color: theme.colors.textSecondary, textAlign: "center" },
            ]}
          >
            Actualmente no hay ninguna sesión de caja abierta. Inicie un nuevo
            arqueo para comenzar a registrar transacciones.
          </ThemedText>
          <MotiPressable
            onPress={onOpenArqueo}
            animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
          >
            <Circle size={20} color={theme.colors.primaryForeground} />
            <ThemedText style={styles.buttonText}>
              Abrir Nuevo Arqueo
            </ThemedText>
          </MotiPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 600,
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    maxWidth: 400,
    marginBottom: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
