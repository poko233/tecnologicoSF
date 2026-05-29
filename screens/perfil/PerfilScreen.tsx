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
  const { isDesktop } = useResponsive();
  const styles = getStyles(theme, isDesktop);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Header con portada, avatar y chips */}
        <PerfilHeader />

        {/* Bento grid: en escritorio 2 columnas (info + QR), en móvil columna */}
        <View style={styles.bentoGrid}>
          {/* Información personal */}
          <View style={styles.infoColumn}>
            <InformacionPersonal />
          </View>

          {/* QR (Identidad Digital) */}
          <View style={styles.qrColumn}>
            <QrProfileCard />
          </View>
        </View>

        {/* Selector de temas (siempre full width abajo) */}
        <ThemeSelectorCard />
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: any, isDesktop: boolean) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: isDesktop ? 40 : 16,
      paddingTop: 24,
      paddingBottom: 40,
    },
    container: {
      maxWidth: isDesktop ? 1000 : "100%",
      alignSelf: "center",
      width: "100%",
    },
    bentoGrid: {
      flexDirection: isDesktop ? "row" : "column",
      gap: 24,
      marginBottom: 24,
    },
    infoColumn: {
      flex: isDesktop ? 2 : undefined,
    },
    qrColumn: {
      flex: isDesktop ? 1 : undefined,
      minWidth: isDesktop ? 280 : undefined,
    },
  });
