import { StyleSheet } from "react-native";

export function createEstudiantesTableStyles(
  colors: any,
  isMobile: boolean,
  isCompact: boolean,
) {
  const muted = colors.textMuted || colors.muted || colors.textSecondary;
  const primaryForeground = colors.primaryForeground || "#FFFFFF";

  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: isMobile ? 14 : 18,
      gap: 14,
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 18,
      elevation: 4,
    },

    top: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 14,
    },

    topMobile: {
      flexDirection: "column",
      alignItems: "stretch",
    },

    topTextBox: {
      flex: 1,
      minWidth: 0,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
    },

    titleIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
    },

    titleTextBox: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      fontSize: isMobile ? 20 : 23,
      fontWeight: "900",
      color: colors.text,
    },

    subtitle: {
      marginTop: 3,
      color: colors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
    },

    filterBar: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: isMobile ? "flex-start" : "flex-end",
      gap: 8,
      maxWidth: isMobile ? "100%" : 880,
    },

    filterBtn: {
      minHeight: 42,
      minWidth: isMobile ? "100%" : 150,
      maxWidth: isMobile ? "100%" : 210,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },

    filterBtnActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },

    filterBtnTextBox: {
      flex: 1,
      minWidth: 0,
    },

    filterLabel: {
      fontSize: 9.5,
      fontWeight: "900",
      textTransform: "uppercase",
      color: colors.textSecondary,
    },

    filterLabelActive: {
      color: primaryForeground,
    },

    filterValue: {
      marginTop: 1,
      fontSize: 11.5,
      fontWeight: "900",
      color: colors.text,
    },

    filterValueActive: {
      color: primaryForeground,
    },

    filterClearBtn: {
      minHeight: 42,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    filterClearText: {
      color: colors.text,
      fontWeight: "900",
      fontSize: 12,
    },

    refreshBtn: {
      minHeight: 42,
      backgroundColor: colors.primary,
      paddingHorizontal: isMobile ? 13 : 15,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    refreshText: {
      color: primaryForeground,
      fontWeight: "900",
      fontSize: 13,
    },

    dropdownPanel: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      padding: 12,
      gap: 10,
    },

    dropdownTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    dropdownTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
    },

    dropdownOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    dropdownOption: {
      minHeight: 36,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    dropdownOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },

    dropdownOptionText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "900",
    },

    dropdownOptionTextActive: {
      color: primaryForeground,
    },

    searchBox: {
      minHeight: 46,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.input,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      paddingVertical: 10,
      outlineStyle: "none" as any,
    },

    loadingBox: {
      padding: 50,
      alignItems: "center",
      gap: 10,
    },

    loadingText: {
      color: colors.textSecondary,
      fontWeight: "700",
    },

    tableShell: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      overflow: "hidden",
    },

    headerRow: {
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      backgroundColor: colors.backgroundTertiary || colors.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    headerText: {
      paddingHorizontal: 8,
      fontSize: 10.5,
      fontWeight: "900",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.45,
    },

    headerUsuario: {
      flex: 2.1,
    },

    headerContacto: {
      flex: 1.55,
    },

    headerAcademico: {
      flex: 1.55,
    },

    headerReferencia: {
      flex: 2.05,
    },

    headerEstado: {
      flex: 0.8,
      textAlign: "center",
    },

    headerAccion: {
      flex: 0.7,
      textAlign: "center",
    },

    headerUsuarioCompact: {
      flex: 2.1,
    },

    headerDatosCompact: {
      flex: 2.65,
    },

    headerEstadoCompact: {
      flex: 0.9,
      textAlign: "center",
    },

    headerAccionCompact: {
      flex: 0.65,
      textAlign: "center",
    },

    rowsBox: {
      gap: 1,
      backgroundColor: colors.border,
    },

    row: {
      minHeight: 86,
      paddingHorizontal: 8,
      backgroundColor: colors.card,
      flexDirection: "row",
      alignItems: "center",
    },

    rowAlt: {
      backgroundColor: colors.backgroundSecondary,
    },

    usuarioCell: {
      flex: 2.1,
      paddingHorizontal: 8,
      minWidth: 0,
    },

    contactoCell: {
      flex: 1.55,
      paddingHorizontal: 8,
      minWidth: 0,
    },

    academicoCell: {
      flex: 1.55,
      paddingHorizontal: 8,
      minWidth: 0,
    },

    referenciaCell: {
      flex: 2.05,
      paddingHorizontal: 8,
      minWidth: 0,
    },

    estadoCell: {
      flex: 0.8,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
    },

    accionCell: {
      flex: 0.7,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
    },

    usuarioCompactCell: {
      flex: 2.1,
      paddingHorizontal: 8,
      minWidth: 0,
    },

    datosCompactCell: {
      flex: 2.65,
      paddingHorizontal: 8,
      minWidth: 0,
    },

    estadoCompactCell: {
      flex: 0.9,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
    },

    accionCompactCell: {
      flex: 0.65,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
    },

    usuarioResumen: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      minWidth: 0,
    },

    multimediaBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    avatar: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor: colors.backgroundSecondary,
    },

    avatarEmpty: {
      width: 38,
      height: 38,
      borderRadius: 13,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },

    avatarLetters: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "900",
    },

    qrMini: {
      width: 30,
      height: 30,
      borderRadius: 6,
      backgroundColor: "#FFFFFF",
    },

    qrMiniEmpty: {
      width: 30,
      height: 30,
      borderRadius: 7,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },

    usuarioInfo: {
      flex: 1,
      minWidth: 0,
    },

    nombreText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "900",
    },

    usuarioText: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 11.5,
      fontWeight: "700",
    },

    compactCiText: {
      marginTop: 2,
      color: muted,
      fontSize: 10.5,
      fontWeight: "600",
    },

    contactPrimary: {
      color: colors.text,
      fontSize: 12.2,
      fontWeight: "800",
    },

    contactSecondary: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
    },

    infoPrimary: {
      color: colors.text,
      fontSize: 12.2,
      fontWeight: "900",
    },

    infoSecondary: {
      marginTop: 3,
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "700",
    },

    referenciaText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "800",
    },

    observacionText: {
      marginTop: 3,
      color: colors.textSecondary,
      fontSize: 10.8,
      fontWeight: "600",
      lineHeight: 15,
    },

    docsLine: {
      marginTop: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    docsText: {
      color: colors.primary,
      fontSize: 10.8,
      fontWeight: "900",
    },

    compactPrimary: {
      color: colors.text,
      fontSize: 12.3,
      fontWeight: "900",
    },

    compactSecondary: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 10.8,
      fontWeight: "600",
    },

    observacionCompact: {
      marginTop: 2,
      color: muted,
      fontSize: 10.5,
      fontWeight: "600",
    },

    badge: {
      maxWidth: "100%",
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },

    badgeActive: {
      backgroundColor: colors.success || "#16A34A",
    },

    badgeInactive: {
      backgroundColor: colors.destructive || "#DC2626",
    },

    badgeText: {
      color: primaryForeground,
      fontSize: 10,
      fontWeight: "900",
      textAlign: "center",
    },

    editBtn: {
      minHeight: 34,
      minWidth: 78,
      paddingHorizontal: 10,
      borderRadius: 11,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    editBtnCompact: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    editText: {
      color: primaryForeground,
      fontWeight: "900",
      fontSize: 11.5,
    },

    mobileCard: {
      backgroundColor: colors.card,
      padding: 13,
      gap: 11,
    },

    mobileCardTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
    },

    mobileDivider: {
      height: 1,
      backgroundColor: colors.border,
    },

    mobileInfoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    mobileInfoItem: {
      width: "47%",
      minWidth: 120,
    },

    mobileInfoLabel: {
      color: muted,
      fontSize: 9.5,
      fontWeight: "900",
      textTransform: "uppercase",
    },

    mobileInfoValue: {
      marginTop: 3,
      color: colors.text,
      fontSize: 11.5,
      fontWeight: "700",
      lineHeight: 16,
    },

    mobileEditBtn: {
      minHeight: 40,
      borderRadius: 12,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    empty: {
      padding: 48,
      alignItems: "center",
      gap: 9,
    },

    emptyIcon: {
      width: 74,
      height: 74,
      borderRadius: 22,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
    },

    emptyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "900",
    },

    emptyText: {
      color: colors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
      textAlign: "center",
    },

    pagination: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingTop: 2,
    },

    paginationMobile: {
      flexDirection: "column",
      alignItems: "stretch",
    },

    pageActions: {
      flexDirection: "row",
      gap: 8,
      justifyContent: "flex-end",
    },

    pageBtn: {
      minHeight: 40,
      minWidth: isMobile ? 44 : 114,
      borderRadius: 13,
      backgroundColor: colors.primary,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    pageBtnText: {
      color: primaryForeground,
      fontSize: 12,
      fontWeight: "900",
    },

    disabled: {
      opacity: 0.42,
    },

    pageInfo: {
      flex: isMobile ? 0 : 1,
      alignItems: isMobile ? "center" : "flex-start",
    },

    pageInfoText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "900",
    },

    pageInfoSub: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 11.5,
      fontWeight: "700",
    },
  });
}