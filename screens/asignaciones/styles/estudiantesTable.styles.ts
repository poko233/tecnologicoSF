import { StyleSheet } from "react-native";

export function createEstudiantesTableStyles() {
  return StyleSheet.create({
    card: {
      borderWidth: 1,
      borderRadius: 24,
      padding: 18,
      gap: 16,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
    },
    headerMobile: {
      alignItems: "stretch",
      flexDirection: "column",
    },
    titleBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    },
    titleContent: {
      flex: 1,
      minWidth: 0,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 22,
      fontWeight: "900",
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12.5,
      fontWeight: "600",
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },

    changeCareerButton: {
      minHeight: 42,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      alignSelf: "flex-start",
    },
    changeCareerText: {
      fontSize: 12,
      fontWeight: "900",
    },

    selectedCareerPill: {
      borderWidth: 1,
      minHeight: 42,
      borderRadius: 14,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    selectedCareerText: {
      flex: 1,
      fontSize: 12.5,
      fontWeight: "800",
    },

    searchBox: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 15,
      paddingHorizontal: 12,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 11,
      fontSize: 13,
      outlineStyle: "none" as any,
    },

    requiredCareerBox: {
      minHeight: 310,
      borderWidth: 1,
      borderColor: "transparent",
      borderRadius: 20,
      padding: 30,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    requiredCareerIcon: {
      width: 78,
      height: 78,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    requiredCareerTitle: {
      textAlign: "center",
      fontSize: 22,
      fontWeight: "900",
    },
    requiredCareerSubtitle: {
      maxWidth: 560,
      textAlign: "center",
      fontSize: 13,
      fontWeight: "700",
      lineHeight: 20,
    },
    requiredActions: {
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 10,
    },
    primaryBtn: {
      minHeight: 46,
      borderRadius: 15,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    primaryBtnText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "900",
    },
    secondaryBtn: {
      minHeight: 46,
      borderRadius: 15,
      borderWidth: 1,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    secondaryBtnText: {
      fontSize: 13,
      fontWeight: "900",
    },

    loadingBox: {
      minHeight: 260,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    loadingText: {
      fontWeight: "700",
      textAlign: "center",
    },
    emptyBox: {
      minHeight: 260,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: 24,
    },
    emptyIcon: {
      width: 78,
      height: 78,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "900",
      textAlign: "center",
    },
    emptyText: {
      maxWidth: 460,
      fontSize: 13,
      fontWeight: "700",
      lineHeight: 19,
      textAlign: "center",
    },

    tableShell: {
      borderWidth: 1,
      borderRadius: 18,
      overflow: "hidden",
    },
    tableHeader: {
      minHeight: 48,
      borderBottomWidth: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    th: {
      fontSize: 10.5,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.3,
      paddingHorizontal: 8,
    },
    rowsBox: {},

    row: {
      minHeight: 72,
      borderBottomWidth: 1,
      flexDirection: "row",
      alignItems: "stretch",
    },

    thCi: { flex: 0.85 },
    thMatricula: { flex: 0.95 },
    thStudent: { flex: 2 },
    thNivel: { flex: 1.1 },
    thYear: { flex: 0.65, textAlign: "center" },
    thContact: { flex: 1.25 },
    thActions: { flex: 1.3, textAlign: "right" },

    ciCell: {
      flex: 0.85,
      paddingHorizontal: 8,
      justifyContent: "center",
    },
    matriculaCell: {
      flex: 0.95,
      paddingHorizontal: 8,
      justifyContent: "center",
    },
    studentCell: {
      flex: 2,
      paddingHorizontal: 8,
      justifyContent: "center",
    },
    nivelCell: {
      flex: 1.1,
      paddingHorizontal: 8,
      justifyContent: "center",
    },
    yearCell: {
      flex: 0.65,
      paddingHorizontal: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    contactCell: {
      flex: 1.25,
      paddingHorizontal: 8,
      justifyContent: "center",
    },
    actionsCell: {
      flex: 1.3,
      paddingHorizontal: 8,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 7,
    },

    thStudentCompact: { flex: 1.35 },
    thDataCompact: { flex: 1.45 },
    thActionsCompact: { flex: 0.95, textAlign: "right" },

    studentCompactCell: {
      flex: 1.35,
      paddingHorizontal: 8,
      justifyContent: "center",
    },
    dataCompactCell: {
      flex: 1.45,
      paddingHorizontal: 8,
      justifyContent: "center",
    },
    actionsCompactCell: {
      flex: 0.95,
      paddingHorizontal: 8,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 6,
    },

    ciText: {
      fontSize: 13,
      fontWeight: "900",
    },
    matriculaText: {
      fontSize: 12.5,
      fontWeight: "800",
    },
    normalText: {
      fontSize: 12,
      fontWeight: "800",
    },
    smallText: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: "600",
    },
    compactDataPrimary: {
      fontSize: 12.5,
      fontWeight: "900",
    },
    compactDataText: {
      marginTop: 2,
      fontSize: 11.25,
      fontWeight: "600",
    },

    studentBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      minWidth: 0,
    },
    studentIdentityText: {
      flex: 1,
      minWidth: 0,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      fontWeight: "900",
      fontSize: 15,
    },
    nameText: {
      fontSize: 13,
      fontWeight: "900",
    },
    enrolledBadge: {
      alignSelf: "flex-start",
      marginTop: 4,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 3,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    enrolledBadgeText: {
      fontSize: 10,
      fontWeight: "900",
    },

    actionBtn: {
      minHeight: 36,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },
    actionBtnCompact: {
      width: 38,
      paddingHorizontal: 0,
    },
    actionText: {
      fontWeight: "900",
      fontSize: 10.5,
    },

    mobileCard: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 13,
      gap: 12,
    },
    mobileDivider: {
      height: 1,
      width: "100%",
    },
    mobileInfoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    mobileInfoItem: {
      width: "47%",
    },
    mobileInfoLabel: {
      fontSize: 10,
      fontWeight: "900",
      textTransform: "uppercase",
    },
    mobileInfoValue: {
      marginTop: 3,
      fontSize: 12.5,
      fontWeight: "800",
    },
    mobileActions: {
      flexDirection: "row",
      gap: 8,
    },

    pagination: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    paginationMobile: {
      alignItems: "stretch",
    },
    pageText: {
      fontSize: 13.5,
      fontWeight: "900",
    },
    pageSubText: {
      marginTop: 2,
      fontSize: 11.5,
      fontWeight: "700",
    },
    pageActions: {
      flexDirection: "row",
      gap: 8,
    },
    pageBtn: {
      minHeight: 38,
      borderRadius: 13,
      borderWidth: 1,
      paddingHorizontal: 13,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 5,
    },
    pageBtnText: {
      fontSize: 12,
      fontWeight: "900",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(2,6,23,0.62)",
      justifyContent: "center",
      alignItems: "center",
      padding: 18,
    },
    modalDismissArea: {
      ...StyleSheet.absoluteFillObject,
    },
    modalCard: {
      width: "100%",
      maxWidth: 620,
      maxHeight: "80%",
      borderWidth: 1,
      borderRadius: 22,
      padding: 16,
      gap: 14,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    modalTitle: {
      fontSize: 21,
      fontWeight: "900",
    },
    modalSubtitle: {
      marginTop: 3,
      fontSize: 12.5,
      fontWeight: "600",
      lineHeight: 18,
    },
    closeModalButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    modalLoading: {
      minHeight: 180,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    modalLoadingText: {
      textAlign: "center",
      fontSize: 13,
      fontWeight: "700",
    },
    carrerasScroll: {
      maxHeight: 440,
    },
    carrerasContent: {
      gap: 9,
      paddingBottom: 2,
    },
    carreraOption: {
      minHeight: 66,
      borderRadius: 15,
      borderWidth: 1,
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    carreraOptionIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    carreraOptionTitle: {
      fontSize: 13.5,
      fontWeight: "900",
    },
    carreraOptionCode: {
      marginTop: 3,
      fontSize: 11.5,
      fontWeight: "600",
    },
  });
}