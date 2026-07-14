import { StyleSheet } from "react-native";

export function createEstudianteScreenStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      flexGrow: 1,
      padding: 20,
      gap: 18,
      backgroundColor: colors.background,
    },

    hero: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 2,
    },

    heroTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },

    kicker: {
      color: colors.primary,
      fontWeight: "900",
      textTransform: "uppercase",
      fontSize: 12,
      letterSpacing: 1,
    },

    title: {
      marginTop: 8,
      fontSize: 30,
      fontWeight: "900",
      color: colors.text,
    },

    subtitle: {
      marginTop: 8,
      color: colors.textSecondary,
      maxWidth: 850,
      lineHeight: 21,
      fontSize: 15,
      fontWeight: "600",
    },

    reportBtn: {
      minHeight: 48,
      borderRadius: 16,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    reportBtnText: {
      color: colors.primaryForeground,
      fontSize: 13,
      fontWeight: "900",
    },
  });
}