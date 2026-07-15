import { StyleSheet } from "react-native";

function color(colors: any, key: string, fallback: string) {
  return colors?.[key] ?? fallback;
}

export function createHistorialEstudianteStyles(colors: any) {
  const background = color(colors, "background", "#F8FAFC");
  const card = color(colors, "card", "#FFFFFF");
  const text = color(colors, "text", "#0F172A");
  const border = color(colors, "border", "#E2E8F0");
  const muted = color(colors, "muted", "#F1F5F9");
  const mutedText = color(colors, "mutedForeground", "#64748B");
  const primary = color(colors, "primary", "#2563EB");
  const primaryForeground = color(colors, "primaryForeground", "#FFFFFF");

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(15, 23, 42, 0.62)",
      padding: 18,
      justifyContent: "center",
    },

    modalCard: {
      width: "100%",
      maxWidth: 1180,
      maxHeight: "92%",
      alignSelf: "center",
      backgroundColor: card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: border,
      overflow: "hidden",
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 18,
      borderBottomWidth: 1,
      borderBottomColor: border,
      backgroundColor: card,
    },

    avatar: {
      width: 52,
      height: 52,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: primary,
    },

    avatarText: {
      color: primaryForeground,
      fontWeight: "900",
      fontSize: 21,
    },

    kicker: {
      fontSize: 12,
      fontWeight: "900",
      color: primary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },

    title: {
      fontSize: 22,
      fontWeight: "900",
      color: text,
    },

    subtitle: {
      marginTop: 3,
      fontSize: 13,
      color: mutedText,
      fontWeight: "600",
    },

    iconClose: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: muted,
      borderWidth: 1,
      borderColor: border,
    },

    loadingBox: {
      minHeight: 360,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      backgroundColor: background,
    },

    loadingText: {
      fontSize: 14,
      color: mutedText,
      fontWeight: "700",
    },

    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      padding: 16,
      backgroundColor: background,
    },

    summaryCard: {
      flexGrow: 1,
      minWidth: 150,
      padding: 14,
      borderRadius: 18,
      backgroundColor: card,
      borderWidth: 1,
      borderColor: border,
    },

    summaryValue: {
      fontSize: 24,
      fontWeight: "900",
      color: text,
    },

    summaryLabel: {
      marginTop: 4,
      fontSize: 12,
      color: mutedText,
      fontWeight: "800",
      textTransform: "uppercase",
    },

    legend: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: background,
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: card,
      borderWidth: 1,
      borderColor: border,
    },

    legendDot: {
      width: 9,
      height: 9,
      borderRadius: 999,
    },

    legendText: {
      fontSize: 12,
      color: mutedText,
      fontWeight: "800",
    },

    carreraBlock: {
      marginHorizontal: 16,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: border,
      borderRadius: 20,
      overflow: "hidden",
      backgroundColor: card,
    },

    carreraHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: border,
      backgroundColor: muted,
    },

    carreraTitle: {
      fontSize: 17,
      fontWeight: "900",
      color: text,
    },

    carreraMeta: {
      marginTop: 2,
      fontSize: 12,
      color: mutedText,
      fontWeight: "700",
    },

    mallaContent: {
      padding: 14,
      gap: 12,
      alignItems: "flex-start",
    },

    nivelColumn: {
      width: 210,
      gap: 10,
    },

    nivelHeader: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: primary,
    },

    nivelTitle: {
      color: primaryForeground,
      fontWeight: "900",
      fontSize: 13,
      textAlign: "center",
    },

    materiaCard: {
      minHeight: 106,
      borderWidth: 1.5,
      borderRadius: 17,
      padding: 12,
      justifyContent: "space-between",
    },

    materiaTitle: {
      fontSize: 13,
      fontWeight: "900",
      lineHeight: 17,
      textTransform: "uppercase",
    },

    materiaCode: {
      marginTop: 5,
      fontSize: 11,
      color: mutedText,
      fontWeight: "700",
    },

    materiaFooter: {
      marginTop: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },

    materiaEstado: {
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
    },

    materiaNota: {
      fontSize: 12,
      fontWeight: "900",
      color: text,
    },

    emptyBox: {
      margin: 16,
      padding: 30,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: card,
      alignItems: "center",
      gap: 8,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight: "900",
      color: text,
    },

    emptyText: {
      textAlign: "center",
      fontSize: 13,
      color: mutedText,
      fontWeight: "600",
    },

    detailOverlay: {
      flex: 1,
      backgroundColor: "rgba(15, 23, 42, 0.72)",
      padding: 18,
      justifyContent: "center",
    },

    detailCard: {
      width: "100%",
      maxWidth: 650,
      maxHeight: "90%",
      alignSelf: "center",
      backgroundColor: card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: border,
      overflow: "hidden",
    },

    detailHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 18,
      borderBottomWidth: 1,
      borderBottomColor: border,
    },

    detailKicker: {
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      color: primary,
    },

    detailTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: text,
    },

    bigNotaBox: {
      margin: 16,
      padding: 18,
      borderRadius: 22,
      borderWidth: 1.5,
      alignItems: "center",
      gap: 8,
    },

    bigNotaLabel: {
      fontSize: 12,
      color: mutedText,
      fontWeight: "900",
      textTransform: "uppercase",
    },

    bigNotaValue: {
      fontSize: 42,
      fontWeight: "900",
    },

    estadoBadge: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
    },

    estadoBadgeText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
    },

    detailSection: {
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 14,
      borderRadius: 18,
      backgroundColor: muted,
      borderWidth: 1,
      borderColor: border,
    },

    sectionTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: text,
      marginBottom: 12,
    },

    detailGrid: {
      gap: 12,
    },

    observacionText: {
      fontSize: 13,
      color: text,
      lineHeight: 19,
      fontWeight: "600",
    },
  });
}