import { StyleSheet } from "react-native";

export function createEstudianteEditModalStyles(colors: any) {
  const muted = colors.textMuted || colors.muted || colors.textSecondary;

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay || "rgba(0,0,0,0.62)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 0,
      paddingVertical: 4,
    },

    modal: {
      width: "100%",
      height: "99%",
      maxWidth: 1920,
      backgroundColor: colors.modal || colors.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.32,
      shadowRadius: 26,
      elevation: 10,
    },

    header: {
      height: 130,
      paddingHorizontal: 30,
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 16,
      backgroundColor: colors.card,
    },

    headerInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
    },

    headerPhoto: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      resizeMode: "cover",
    },

    headerPhotoEmpty: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },

    headerTextBox: {
      flex: 1,
      minWidth: 0,
    },

    headerTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
    },

    headerCareerBadge: {
      maxWidth: 430,
      minHeight: 34,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: `${colors.primary}66`,
      backgroundColor: `${colors.primary}14`,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    headerCareerBadgeText: {
      flexShrink: 1,
      color: colors.primary,
      fontSize: 12,
      fontWeight: "900",
    },

    title: {
      fontSize: 34,
      fontWeight: "900",
      color: colors.text,
    },

    subtitle: {
      marginTop: 6,
      color: colors.textSecondary,
      lineHeight: 22,
      fontSize: 17,
    },

    closeBtn: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },

    tabs: {
      height: 64,
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    tabBtn: {
      flex: 1,
      height: 44,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 10,
    },

    tabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    tabText: {
      color: colors.textSecondary,
      fontWeight: "900",
      fontSize: 14,
      textAlign: "center",
    },

    tabTextActive: {
      color: colors.primaryForeground,
    },

    loadingBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },

    content: {
      padding: 22,
      gap: 18,
      backgroundColor: colors.modal || colors.card,
    },

    documentsBody: {
      flex: 1,
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 10,
      backgroundColor: colors.modal || colors.card,
    },

    statusBox: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 11,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    statusText: {
      flex: 1,
      fontSize: 12,
      fontWeight: "900",
    },

    errorSummary: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 12,
      gap: 6,
    },

    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginBottom: 2,
    },

    summaryTitle: {
      fontSize: 13,
      fontWeight: "900",
    },

    summaryItem: {
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 18,
    },

    block: {
      gap: 12,
      marginBottom: 8,
    },

    blockHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    blockTitle: {
      fontSize: 16,
      fontWeight: "900",
    },

    formGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      alignItems: "flex-start",
    },

    fieldBox: {
      gap: 6,
    },

    inputGroup: {
      gap: 6,
      width: "100%",
    },

    label: {
      fontSize: 12,
      fontWeight: "900",
    },

    helper: {
      fontSize: 11,
      fontWeight: "700",
    },

    input: {
      height: 48,
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 14,
      fontSize: 14,
      outlineStyle: "none" as any,
    },

    textArea: {
      height: 110,
      paddingTop: 12,
      lineHeight: 20,
    },

    dateButton: {
      height: 48,
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    dateText: {
      fontSize: 14,
      fontWeight: "800",
    },

    feedbackRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    errorText: {
      fontSize: 11,
      fontWeight: "800",
    },

    okText: {
      fontSize: 11,
      fontWeight: "800",
    },

    optionsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    option: {
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 13,
      paddingVertical: 8,
    },

    optionText: {
      fontSize: 12,
      fontWeight: "900",
    },

    readOnlySection: {
      gap: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 20,
      padding: 16,
    },

    readOnlyGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },

    readOnlyCard: {
      flex: 1,
      minWidth: 260,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    readOnlyIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },

    readOnlyLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
    },

    readOnlyValue: {
      marginTop: 3,
      color: colors.text,
      fontSize: 15,
      fontWeight: "900",
    },

    careerSelectCard: {
      flex: 1,
      minWidth: 280,
      minHeight: 76,
      borderWidth: 1,
      borderRadius: 16,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    careerSelectIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
    },

    careerSelectText: {
      flex: 1,
      minWidth: 0,
    },

    careerSelectLabel: {
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.35,
    },

    careerSelectValue: {
      marginTop: 3,
      fontSize: 14.5,
      lineHeight: 19,
      fontWeight: "900",
    },

    careerSelectMeta: {
      marginTop: 3,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "700",
    },

    careerChangeNotice: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 12,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },

    careerChangeNoticeText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "700",
    },

    estadoSection: {
      gap: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 20,
      padding: 16,
    },

    estadoTitleBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    estadoTitle: {
      fontSize: 18,
      fontWeight: "900",
    },

    estadoSubtitle: {
      marginTop: 3,
      fontSize: 13,
      fontWeight: "700",
      lineHeight: 18,
    },

    estadoOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    estadoOption: {
      minHeight: 48,
      minWidth: 150,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    estadoOptionText: {
      fontWeight: "900",
      fontSize: 13,
    },

    warningBox: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 14,
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
    },

    warningTitle: {
      fontWeight: "900",
      fontSize: 14,
    },

    warningText: {
      marginTop: 4,
      fontWeight: "700",
      fontSize: 13,
      lineHeight: 19,
    },

    promoSection: {
      gap: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 20,
      padding: 16,
    },

    promoCurrentBox: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },

    promoCurrentIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },

    promoCurrentLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
    },

    promoCurrentText: {
      marginTop: 5,
      color: colors.text,
      fontSize: 14,
      fontWeight: "800",
      lineHeight: 20,
    },

    mediaGrid: {
      flexDirection: "row",
      gap: 16,
      flexWrap: "wrap",
    },

    mediaCard: {
      flex: 1,
      minWidth: 280,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      padding: 18,
      gap: 16,
      alignItems: "center",
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "900",
      color: colors.text,
    },

    userPhoto: {
      width: 190,
      height: 190,
      borderRadius: 95,
      backgroundColor: colors.card,
    },

    userPhotoEmpty: {
      width: 190,
      height: 190,
      borderRadius: 95,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },

    photoActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 10,
    },

    selectPhotoBtn: {
      minHeight: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.primary,
      paddingHorizontal: 14,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },

    selectPhotoText: {
      color: colors.primary,
      fontWeight: "900",
    },

    primaryBtn: {
      minHeight: 44,
      borderRadius: 14,
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },

    primaryBtnText: {
      color: colors.primaryForeground,
      fontWeight: "900",
    },

    qrBox: {
      width: 300,
      maxWidth: "100%",
      aspectRatio: 1,
      backgroundColor: "#FFFFFF",
      borderRadius: 18,
      padding: 12,
    },

    qrImage: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },

    qrActions: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },

    regenerateQrBtn: {
      minHeight: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },

    regenerateQrText: {
      color: colors.primary,
      fontWeight: "900",
    },

    qrHelper: {
      maxWidth: 390,
      color: muted,
      textAlign: "center",
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 18,
    },

    emptyBox: {
      minHeight: 180,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      gap: 10,
    },

    emptyText: {
      color: muted,
      textAlign: "center",
      fontWeight: "700",
    },

    footer: {
      minHeight: 66,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.card,
    },

    cancelBtn: {
      minHeight: 46,
      paddingHorizontal: 16,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
    },

    cancelText: {
      color: colors.text,
      fontWeight: "900",
      fontSize: 14,
    },

    saveBtn: {
      minHeight: 46,
      paddingHorizontal: 16,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    saveText: {
      color: colors.primaryForeground,
      fontWeight: "900",
      fontSize: 14,
    },

    disabled: {
      opacity: 0.7,
    },
  });
}