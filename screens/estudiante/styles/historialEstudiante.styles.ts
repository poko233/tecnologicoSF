import { StyleSheet } from "react-native";

function color(colors: any, key: string, fallback: string) {
  return colors?.[key] ?? fallback;
}

export function createHistorialEstudianteStyles(colors: any) {
  const background = color(colors, "background", "#F8FAFC");
  const backgroundSecondary = color(
    colors,
    "backgroundSecondary",
    "#EEF2F7",
  );
  const card = color(colors, "card", "#FFFFFF");
  const modal = color(colors, "modal", card);
  const text = color(colors, "text", "#0F172A");
  const textSecondary = color(colors, "textSecondary", "#475569");
  const border = color(colors, "border", "#E2E8F0");
  /*
   * Evitamos usar colors.muted porque en este tema produce el bloque gris
   * azulado de las capturas. Las superficies secundarias utilizan el color
   * real de los inputs o el fondo del sistema.
   */
  const surfaceSoft = color(colors, "input", background);
  const mutedText = color(
    colors,
    "mutedForeground",
    color(colors, "textMuted", "#64748B"),
  );
  const primary = color(colors, "primary", "#2563EB");
  const primaryForeground = color(
    colors,
    "primaryForeground",
    "#FFFFFF",
  );

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(2, 6, 23, 0.78)",
      padding: 16,
      justifyContent: "center",
    },

    modalCard: {
      width: "100%",
      maxWidth: 1440,
      height: "94%",
      maxHeight: 940,
      alignSelf: "center",
      backgroundColor: modal,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: border,
      overflow: "hidden",
      shadowColor: "#000000",
      shadowOpacity: 0.26,
      shadowRadius: 28,
      elevation: 12,
    },

    header: {
      minHeight: 104,
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      paddingHorizontal: 22,
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: border,
      backgroundColor: card,
    },

    avatar: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}18`,
      borderWidth: 1,
      borderColor: `${primary}88`,
      overflow: "hidden",
    },

    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: 19,
    },

    avatarText: {
      color: primaryForeground,
      fontWeight: "900",
      fontSize: 25,
    },

    headerInfo: {
      flex: 1,
      minWidth: 0,
    },

    kicker: {
      fontSize: 12,
      fontWeight: "900",
      color: primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },

    title: {
      marginTop: 3,
      fontSize: 25,
      lineHeight: 31,
      fontWeight: "900",
      color: text,
    },

    subtitle: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 18,
      color: textSecondary,
      fontWeight: "700",
    },

    iconClose: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}18`,
      borderWidth: 1,
      borderColor: `${primary}55`,
    },

    loadingBox: {
      flex: 1,
      minHeight: 420,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 28,
      backgroundColor: modal,
    },

    loadingIconBox: {
      width: 86,
      height: 86,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}12`,
      borderWidth: 1,
      borderColor: `${primary}44`,
    },

    loadingTitle: {
      marginTop: 4,
      fontSize: 19,
      fontWeight: "900",
      color: text,
      textAlign: "center",
    },

    loadingText: {
      maxWidth: 520,
      fontSize: 13,
      lineHeight: 19,
      color: textSecondary,
      fontWeight: "700",
      textAlign: "center",
    },

    loadingCancelButton: {
      minHeight: 46,
      marginTop: 8,
      borderRadius: 15,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: primary,
      borderWidth: 1,
      borderColor: primary,
    },

    loadingCancelButtonText: {
      color: primaryForeground,
      fontSize: 13,
      fontWeight: "900",
    },

    mainScroll: {
      flex: 1,
      backgroundColor: modal,
    },

    mainScrollContent: {
      paddingBottom: 24,
    },

    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 12,
    },

    summaryCard: {
      flexGrow: 1,
      flexBasis: 180,
      minWidth: 150,
      minHeight: 92,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 18,
      backgroundColor: card,
      borderWidth: 1,
      borderColor: border,
      justifyContent: "center",
    },

    summaryCardPrimary: {
      borderColor: `${primary}88`,
      backgroundColor: `${primary}0E`,
    },

    summaryValue: {
      fontSize: 27,
      lineHeight: 31,
      fontWeight: "900",
      color: text,
    },

    summaryLabel: {
      marginTop: 5,
      fontSize: 11.5,
      color: mutedText,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },

    controlsPanel: {
      marginHorizontal: 20,
      marginBottom: 14,
      padding: 14,
      borderRadius: 20,
      backgroundColor: card,
      borderWidth: 1,
      borderColor: border,
      gap: 12,
    },

    controlsTop: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 12,
    },

    controlsTitleBox: {
      flex: 1,
      minWidth: 230,
    },

    controlsTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: text,
    },

    controlsSubtitle: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "700",
      color: textSecondary,
    },

    resultBadge: {
      minHeight: 38,
      borderRadius: 999,
      paddingHorizontal: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}16`,
      borderWidth: 1,
      borderColor: `${primary}66`,
    },

    resultBadgeText: {
      fontSize: 12,
      fontWeight: "900",
      color: primary,
    },

    searchBox: {
      minHeight: 48,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: background,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    searchInput: {
      flex: 1,
      minWidth: 0,
      minHeight: 46,
      color: text,
      fontSize: 13.5,
      fontWeight: "700",
      outlineStyle: "none" as any,
    },

    filtersBlock: {
      gap: 8,
    },

    filtersLabel: {
      fontSize: 11,
      fontWeight: "900",
      color: mutedText,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    chipsScroll: {
      width: "100%",
    },

    chipsContent: {
      flexDirection: "row",
      gap: 8,
      paddingRight: 10,
      paddingBottom: 4,
    },

    filterChip: {
      minHeight: 39,
      borderRadius: 999,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: background,
    },

    filterChipActive: {
      borderColor: primary,
      backgroundColor: primary,
    },

    filterChipText: {
      fontSize: 12,
      fontWeight: "900",
      color: textSecondary,
    },

    filterChipTextActive: {
      color: primaryForeground,
    },

    legend: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 20,
      paddingBottom: 14,
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 11,
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
      fontSize: 11.5,
      color: textSecondary,
      fontWeight: "800",
    },

    carreraBlock: {
      marginHorizontal: 20,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: border,
      borderRadius: 22,
      overflow: "hidden",
      backgroundColor: card,
    },

    carreraHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: border,
      backgroundColor: card,
    },

    carreraIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}18`,
      borderWidth: 1,
      borderColor: `${primary}44`,
    },

    carreraTitle: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "900",
      color: text,
    },

    carreraMeta: {
      marginTop: 3,
      fontSize: 12,
      color: textSecondary,
      fontWeight: "700",
    },

    carreraCount: {
      minWidth: 40,
      height: 34,
      borderRadius: 999,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: card,
      borderWidth: 1,
      borderColor: border,
    },

    carreraCountText: {
      fontSize: 12,
      fontWeight: "900",
      color: text,
    },

    scrollHint: {
      paddingHorizontal: 16,
      paddingTop: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    scrollHintText: {
      fontSize: 11.5,
      fontWeight: "700",
      color: mutedText,
    },

    topScrollArea: {
      marginHorizontal: 14,
      marginTop: 8,
      marginBottom: 2,
      paddingHorizontal: 10,
      paddingTop: 8,
      paddingBottom: 5,
      borderRadius: 14,
      backgroundColor: surfaceSoft,
      borderWidth: 1,
      borderColor: border,
    },

    topScrollHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 3,
    },

    topScrollHeaderText: {
      color: textSecondary,
      fontSize: 10.5,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.35,
    },

    topMallaScroll: {
      width: "100%",
      height: 18,
    },

    topMallaScrollContent: {
      minHeight: 1,
      alignItems: "flex-start",
    },

    topScrollSpacer: {
      height: 1,
    },

    mallaScroll: {
      width: "100%",
    },

    mallaContent: {
      padding: 14,
      paddingBottom: 18,
      gap: 14,
      alignItems: "flex-start",
    },

    nivelColumn: {
      width: 265,
      gap: 10,
    },

    nivelHeader: {
      minHeight: 46,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 15,
      backgroundColor: primary,
      justifyContent: "center",
    },

    nivelTitle: {
      color: primaryForeground,
      fontWeight: "900",
      fontSize: 13,
      textAlign: "center",
    },

    materiaCard: {
      minHeight: 122,
      borderWidth: 1.5,
      borderRadius: 17,
      padding: 13,
      justifyContent: "space-between",
      gap: 8,
    },

    materiaCardTop: {
      gap: 5,
    },

    materiaTitle: {
      fontSize: 13,
      fontWeight: "900",
      lineHeight: 18,
      textTransform: "uppercase",
    },

    materiaCode: {
      fontSize: 11,
      color: mutedText,
      fontWeight: "800",
    },

    materiaMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap",
    },

    activePill: {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: `${primary}16`,
      borderWidth: 1,
      borderColor: `${primary}55`,
    },

    activePillText: {
      color: primary,
      fontSize: 9.5,
      fontWeight: "900",
      textTransform: "uppercase",
    },

    materiaFooter: {
      marginTop: 4,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },

    materiaEstado: {
      fontSize: 10.5,
      fontWeight: "900",
      textTransform: "uppercase",
    },

    materiaNota: {
      fontSize: 12,
      fontWeight: "900",
      color: text,
    },

    emptyBox: {
      margin: 20,
      minHeight: 230,
      padding: 30,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: card,
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight: "900",
      color: text,
    },

    emptyText: {
      maxWidth: 460,
      textAlign: "center",
      fontSize: 13,
      lineHeight: 19,
      color: mutedText,
      fontWeight: "700",
    },

    detailOverlay: {
      flex: 1,
      backgroundColor: "rgba(2, 6, 23, 0.86)",
      padding: 16,
      justifyContent: "center",
    },

    detailCard: {
      width: "100%",
      maxWidth: 940,
      height: "92%",
      maxHeight: 860,
      alignSelf: "center",
      backgroundColor: modal,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: border,
      overflow: "hidden",
      shadowColor: "#000000",
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 14,
    },

    detailHeader: {
      minHeight: 88,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: border,
      backgroundColor: card,
    },

    detailHeaderInfo: {
      flex: 1,
      minWidth: 0,
    },

    detailKicker: {
      fontSize: 11.5,
      fontWeight: "900",
      textTransform: "uppercase",
      color: primary,
      letterSpacing: 0.6,
    },

    detailTitle: {
      marginTop: 3,
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "900",
      color: text,
    },

    detailBody: {
      flex: 1,
      backgroundColor: modal,
    },

    detailScrollContent: {
      padding: 18,
      paddingBottom: 28,
      gap: 16,
    },

    bigNotaBox: {
      minHeight: 190,
      padding: 20,
      borderRadius: 22,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },

    bigNotaLabel: {
      fontSize: 12,
      color: mutedText,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },

    bigNotaValue: {
      fontSize: 44,
      lineHeight: 52,
      fontWeight: "900",
      textAlign: "center",
    },

    estadoBadge: {
      paddingHorizontal: 13,
      paddingVertical: 7,
      borderRadius: 999,
    },

    estadoBadgeText: {
      color: "#FFFFFF",
      fontSize: 11.5,
      fontWeight: "900",
      textTransform: "uppercase",
    },

    detailSection: {
      padding: 16,
      borderRadius: 19,
      backgroundColor: card,
      borderWidth: 1,
      borderColor: border,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 13,
    },

    sectionTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: text,
    },

    detailGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    infoCard: {
      flexGrow: 1,
      flexBasis: 230,
      minWidth: 210,
      minHeight: 76,
      borderRadius: 15,
      padding: 12,
      backgroundColor: surfaceSoft,
      borderWidth: 1,
      borderColor: border,
      justifyContent: "center",
    },

    infoLabel: {
      fontSize: 10.5,
      color: mutedText,
      fontWeight: "800",
      textTransform: "uppercase",
    },

    infoValue: {
      marginTop: 5,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "900",
      color: text,
    },

    observacionText: {
      fontSize: 13,
      color: text,
      lineHeight: 20,
      fontWeight: "700",
    },

    detailFooter: {
      minHeight: 72,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: border,
      backgroundColor: card,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
    },

    detailCloseButton: {
      minWidth: 150,
      minHeight: 46,
      borderRadius: 15,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: primary,
    },

    detailCloseButtonText: {
      color: primaryForeground,
      fontSize: 13,
      fontWeight: "900",
    },
  });
}