import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { usePerfilData } from "../hooks/usePerfilData";

type IconName = keyof typeof Ionicons.glyphMap;

export const InformacionPersonal = () => {
  const { theme } = useTheme();
  const { correo, telefono, direccion } = usePerfilData();
  const styles = getStyles(theme);

  const rows: {
    icon: IconName;
    label: string;
    value: string;
    onPress?: () => void;
  }[] = [
    {
      icon: "mail-outline",
      label: "Correo electrónico",
      value: correo || "No registrado",
      onPress: () => correo && Linking.openURL(`mailto:${correo}`),
    },
    {
      icon: "call-outline",
      label: "Teléfono",
      value: telefono || "No registrado",
      onPress: () => telefono && Linking.openURL(`tel:${telefono}`),
    },
    {
      icon: "location-outline",
      label: "Dirección",
      value: direccion || "No registrada",
      onPress: undefined,
    },
  ];

  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[
            styles.rowContainer,
            index < rows.length - 1 && styles.borderBottom,
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={row.icon} size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value} onPress={row.onPress}>
              {row.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card + "CC",
      borderRadius: 24,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.border + "40",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    rowContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
    },
    borderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + "20",
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + "10",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    label: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    value: {
      fontSize: 15,
      color: theme.colors.text,
      marginTop: 2,
    },
  });
