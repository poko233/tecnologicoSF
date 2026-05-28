// screens/perfil/components/QrProfileCard.tsx
import { QrCode } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTheme } from "../../../theme/useTheme";
import { usePerfilData } from "../hooks/usePerfilData";

export const QrProfileCard = () => {
  const { theme } = useTheme();
  const { isDesktop } = useResponsive();
  const { codigoQr } = usePerfilData();
  const styles = getStyles(theme, isDesktop);

  if (!codigoQr) return null;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9, translateY: 20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 180 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <QrCode size={20} color={theme.colors.primary} />
        <Text style={styles.title}>Mi código QR</Text>
      </View>

      <View style={styles.qrContainer}>
        <Image
          source={{ uri: codigoQr }}
          style={styles.qrImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.hint}>
        Presenta este código en los puntos de acceso o al docente para registrar
        tu asistencia.
      </Text>
    </MotiView>
  );
};

const getStyles = (theme: any, isDesktop: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card + "CC",
      borderRadius: 24,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.border + "40",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
      alignItems: "center",
      width: "100%",
      maxWidth: isDesktop ? 400 : undefined,
      alignSelf: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    qrContainer: {
      padding: 12,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border + "30",
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    qrImage: {
      width: 200,
      height: 200,
    },
    hint: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: "center",
      paddingHorizontal: 12,
      lineHeight: 18,
    },
  });
