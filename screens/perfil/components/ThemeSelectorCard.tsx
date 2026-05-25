import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { themes } from "../../../theme/themes";
import type { ThemeName } from "../../../theme/types";
import { useTheme } from "../../../theme/useTheme";

export const ThemeSelectorCard = () => {
  const { theme, setTheme } = useTheme();
  const themeNames = Object.keys(themes) as ThemeName[];
  const styles = getStyles(theme);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Apariencia</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent} // <-- Aquí ocurre la magia
      >
        {themeNames.map((name) => {
          const isActive = theme.name === name;
          const previewColors = themes[name].colors;

          return (
            <Pressable
              key={name}
              onPress={() => setTheme(name)}
              style={({ pressed }) => [
                styles.themeButton,
                { transform: [{ scale: pressed ? 0.96 : 1 }] },
              ]}
            >
              {/* Vista previa */}
              <View
                style={[
                  styles.previewContainer,
                  {
                    backgroundColor: previewColors.background,
                    borderColor: isActive
                      ? theme.colors.primary
                      : previewColors.border + "60",
                    shadowColor: isActive
                      ? theme.colors.primary
                      : "transparent",
                    shadowOpacity: isActive ? 0.4 : 0,
                    elevation: isActive ? 6 : 1,
                  },
                ]}
              >
                {/* Card simulada */}
                <View
                  style={[
                    styles.mockCard,
                    {
                      backgroundColor: previewColors.card,
                      borderColor: previewColors.border + "80",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.mockLinePrimary,
                      { backgroundColor: previewColors.primary + "40" },
                    ]}
                  />
                  <View
                    style={[
                      styles.mockLineSecondary,
                      { backgroundColor: previewColors.textSecondary + "20" },
                    ]}
                  />
                  <View
                    style={[
                      styles.mockLineShort,
                      { backgroundColor: previewColors.textSecondary + "20" },
                    ]}
                  />
                  <View
                    style={[
                      styles.mockBlock,
                      {
                        backgroundColor: previewColors.card,
                        borderColor: previewColors.border + "40",
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Etiqueta */}
              <Text
                style={[
                  styles.themeLabel,
                  {
                    fontWeight: isActive ? "700" : "500",
                    color: isActive
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {name === "light"
                  ? "Claro"
                  : name === "dark"
                    ? "Oscuro"
                    : "Premium"}
              </Text>

              {/* Check de activo */}
              {isActive && (
                <View style={styles.activeCheckmark}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card + "CC",
      borderRadius: 24,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border + "40",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 16, // Un toque más de separación con los temas
    },
    scrollContent: {
      flexGrow: 1, // Obliga al contenido del scroll a expandirse al 100% del ancho disponible
      flexDirection: "row",
      justifyContent: "space-between", // Distribuye los temas equitativamente llenando el espacio vacío
      gap: 12, // Controla la separación entre ellos limpiamente sin usar marginRight
    },
    themeButton: {
      flex: 1, // Hace que cada opción crezca proporcionalmente para llenar el espacio
      minWidth: 95, // Evita que se colapsen o se vean ultra delgados en pantallas muy pequeñas
      maxWidth: 150, // Evita que se estiren de forma exagerada en pantallas gigantes
      alignItems: "center",
      position: "relative",
    },
    previewContainer: {
      width: "100%", // Ahora se adapta al ancho dinámico del themeButton
      height: 130,
      borderRadius: 16,
      borderWidth: 2,
      overflow: "hidden",
      padding: 8,
      justifyContent: "space-between",
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
    },
    mockCard: {
      borderRadius: 10,
      padding: 6,
      flex: 1,
      borderWidth: 1,
    },
    mockLinePrimary: {
      height: 6,
      width: "50%",
      borderRadius: 3,
      marginBottom: 6,
    },
    mockLineSecondary: {
      height: 4,
      width: "80%",
      borderRadius: 2,
      marginBottom: 4,
    },
    mockLineShort: {
      height: 4,
      width: "60%",
      borderRadius: 2,
      marginBottom: 4,
    },
    mockBlock: { flex: 1, borderRadius: 6, borderWidth: 1, marginTop: 4 },
    themeLabel: {
      fontSize: 13,
      marginTop: 6,
      textAlign: "center",
    },
    activeCheckmark: {
      position: "absolute",
      top: 6,
      right: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      width: 22,
      height: 22,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
  });
