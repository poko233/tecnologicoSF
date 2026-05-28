import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useResponsive } from "../../hooks/useResponsive";
import { useTheme } from "../../theme/useTheme";
import { InformacionPersonal } from "./components/InformacionPersonal";
import { PerfilHeader } from "./components/PerfilHeader";
import { QrProfileCard } from "./components/QrProfileCard";
import { ThemeSelectorCard } from "./components/ThemeSelectorCard";

export default function PerfilScreen() {
  const { theme } = useTheme();
  const { isMobile, isDesktop } = useResponsive();
  const styles = getStyles(theme, isDesktop);

  return (
    <ScrollView
      style={styles.scrollMain}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mainWrapper}>
        {/* 1. El encabezado ahora ocupa la parte superior central */}
        <View style={styles.headerSection}>
          <PerfilHeader />
        </View>
        {/* 2. Las tarjetas se alinean debajo, en fila (escritorio) o columna (móvil) */}
        <View style={styles.cardsContainer}>
          <View style={styles.column}>
            <InformacionPersonal />
          </View>
          <QrProfileCard />

          <View style={styles.column}>
            <ThemeSelectorCard />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: any, isDesktop: boolean) =>
  StyleSheet.create({
    scrollMain: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: isDesktop ? 40 : 20,
      paddingTop: 40, // Un poco más de espacio arriba
      paddingBottom: 40,
      alignItems: "center",
    },
    mainWrapper: {
      width: "100%",
      maxWidth: isDesktop ? 900 : 500, // Un poco más ancho para dar respiro a las tarjetas
      alignItems: "center",
    },
    headerSection: {
      width: "100%",
      alignItems: "center",
      marginBottom: 32, // Espacio generoso entre el perfil y las tarjetas
    },
    cardsContainer: {
      width: "100%",
      flexDirection: isDesktop ? "row" : "column",
      justifyContent: "space-between",
      alignItems: "flex-start", // Alinea las tarjetas por arriba
      gap: 24, // Espacio entre las columnas
    },
    column: {
      flex: isDesktop ? 1 : undefined,
      width: "100%",
    },
  });
