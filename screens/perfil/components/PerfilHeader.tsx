import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { usePerfilData } from "../hooks/usePerfilData";

export const PerfilHeader = () => {
  const { theme } = useTheme();
  const { nombre, roles, foto } = usePerfilData();
  const rolPrincipal = roles.length > 0 ? roles[0] : "Usuario";
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {foto ? (
          <Image
            source={{ uri: foto }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Ionicons
            name="person"
            size={48}
            color={theme.colors.textSecondary}
          />
        )}
      </View>

      <Text style={styles.nameText}>{nombre}</Text>
      <Text style={styles.roleText}>{rolPrincipal}</Text>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      marginBottom: 24,
    },
    avatarContainer: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 3,
      borderColor: theme.colors.primary + "40",
      overflow: "hidden",
      marginBottom: 16,
      backgroundColor: theme.colors.card,
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: 55,
    },
    nameText: {
      fontSize: 26,
      fontWeight: "800",
      color: theme.colors.text,
      textAlign: "center",
    },
    roleText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: 4,
      fontWeight: "500",
    },
  });
