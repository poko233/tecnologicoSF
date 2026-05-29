import { Image } from "expo-image";
import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTheme } from "../../../theme/useTheme";
import { usePerfilData } from "../hooks/usePerfilData";

export const PerfilHeader = () => {
  const { theme } = useTheme();
  const { isDesktop } = useResponsive();
  const { nombreCompleto, roles, foto } = usePerfilData();
  const rolPrincipal = roles.length > 0 ? roles[0] : "Usuario";
  const styles = getStyles(theme, isDesktop);

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 180 }}
      style={styles.container}
    >
      {/* Portada */}
      <View style={styles.cover}>
        <View style={styles.coverGradient} />
      </View>

      {/* Contenido inferior */}
      <View style={styles.content}>
        {/* Avatar superpuesto */}
        <View style={styles.avatarContainer}>
          {foto ? (
            <Image
              source={{ uri: foto }}
              style={styles.avatar}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
            >
              <Text
                style={[styles.avatarInitial, { color: theme.colors.primary }]}
              >
                {nombreCompleto?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </View>

        {/* Nombre y roles */}
        <View style={styles.info}>
          <Text style={styles.name}>{nombreCompleto}</Text>
          <View style={styles.chipsRow}>
            {roles.map((rol, index) => (
              <View
                key={rol}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      index === 0
                        ? theme.colors.primary + "20"
                        : theme.colors.info + "20",
                    borderColor:
                      index === 0
                        ? theme.colors.primary + "40"
                        : theme.colors.info + "40",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        index === 0 ? theme.colors.primary : theme.colors.info,
                    },
                  ]}
                >
                  {rol}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </MotiView>
  );
};

const getStyles = (theme: any, isDesktop: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border + "40",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
      marginBottom: 24,
    },
    cover: {
      height: 100,
      backgroundColor: theme.colors.primary + "15",
    },
    coverGradient: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.primary + "10",
    },
    content: {
      flexDirection: isDesktop ? "row" : "column",
      alignItems: isDesktop ? "flex-end" : "center",
      paddingHorizontal: 20,
      paddingBottom: 20,
      marginTop: -40,
    },
    avatarContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 4,
      borderColor: theme.colors.card,
      overflow: "hidden",
      backgroundColor: theme.colors.background,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
      marginBottom: isDesktop ? 0 : 12,
      marginRight: isDesktop ? 20 : 0,
    },
    avatar: {
      width: "100%",
      height: "100%",
    },
    avatarPlaceholder: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    avatarInitial: {
      fontSize: 36,
      fontWeight: "800",
    },
    info: {
      flex: 1,
      alignItems: isDesktop ? "flex-start" : "center",
      paddingBottom: 8,
    },
    name: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: isDesktop ? "left" : "center",
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      justifyContent: isDesktop ? "flex-start" : "center",
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
    },
    chipText: {
      fontSize: 12,
      fontWeight: "600",
    },
  });
