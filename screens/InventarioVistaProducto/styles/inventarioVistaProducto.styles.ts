import { StyleSheet } from "react-native";

export function createInventarioVistaProductoStyles(
  colors: any,
  isMobile: boolean,
  isCompact: boolean,
) {
  const primaryForeground =
    colors.primaryForeground ||
    "#FFFFFF";

  const backgroundSecondary =
    colors.backgroundSecondary ||
    colors.background;

  const textMuted =
    colors.textMuted ||
    colors.textSecondary;

  return StyleSheet.create({
    /* =====================================================
       SCREEN
    ===================================================== */

    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    content: {
      width: "100%",

      maxWidth: 1500,

      alignSelf: "center",

      paddingHorizontal:
        isMobile
          ? 12
          : 24,

      paddingTop:
        isMobile
          ? 12
          : 22,

      paddingBottom: 50,

      gap: 18,
    },

    /* =====================================================
       RESUMEN
    ===================================================== */

    summaryGrid: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 12,
    },

    summaryCard: {
      flexGrow: 1,

      flexBasis:
        isMobile
          ? "46%"
          : isCompact
            ? "45%"
            : "22%",

      minWidth:
        isMobile
          ? 145
          : 210,

      minHeight: 100,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        colors.card,

      padding: 16,

      flexDirection: "row",

      alignItems: "center",

      gap: 13,

      shadowColor: "#000",

      shadowOpacity: 0.08,

      shadowRadius: 12,

      elevation: 2,
    },

    summaryIcon: {
      width: 48,

      height: 48,

      borderRadius: 16,

      alignItems: "center",

      justifyContent: "center",
    },

    summaryInfo: {
      flex: 1,

      minWidth: 0,
    },

    summaryLabel: {
      color:
        colors.textSecondary,

      fontSize: 11,

      lineHeight: 15,

      fontWeight: "800",
    },

    summaryValue: {
      marginTop: 2,

      color:
        colors.text,

      fontSize: 24,

      lineHeight: 29,

      fontWeight: "900",
    },

    /* =====================================================
       PANEL PRINCIPAL
    ===================================================== */

    card: {
      width: "100%",

      backgroundColor:
        colors.card,

      borderRadius: 24,

      borderWidth: 1,

      borderColor:
        colors.border,

      padding:
        isMobile
          ? 14
          : 20,

      gap: 16,

      shadowColor: "#000",

      shadowOpacity: 0.12,

      shadowRadius: 16,

      elevation: 3,
    },

    top: {
      width: "100%",

      gap: 18,
    },

    titleRow: {
      width: "100%",

      flexDirection: "row",

      alignItems: "center",

      gap: 12,
    },

    titleIcon: {
      width: 50,

      height: 50,

      borderRadius: 16,

      backgroundColor:
        `${colors.primary}12`,

      borderWidth: 1,

      borderColor:
        `${colors.primary}35`,

      alignItems: "center",

      justifyContent: "center",
    },

    titleTextBox: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      fontSize:
        isMobile
          ? 20
          : 24,

      lineHeight:
        isMobile
          ? 26
          : 31,

      fontWeight: "900",

      color:
        colors.text,
    },

    subtitle: {
      marginTop: 3,

      color:
        colors.textSecondary,

      fontSize: 12.5,

      lineHeight: 18,

      fontWeight: "700",
    },

    /* =====================================================
       FILTROS
    ===================================================== */

    filtersContainer: {
      width: "100%",

      gap: 12,

      paddingTop: 2,
    },

    filtersPrimaryRow: {
      width: "100%",

      flexDirection:
        isMobile
          ? "column"
          : "row",

      alignItems: "stretch",

      gap: 12,
    },

    filterItem: {
      flex:
        isMobile
          ? 0
          : 1,

      width:
        isMobile
          ? "100%"
          : undefined,

      minWidth:
        isMobile
          ? "100%"
          : 220,
    },

    filterBtn: {
      width: "100%",

      minHeight: 58,

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        backgroundSecondary,

      paddingHorizontal: 16,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      gap: 10,
    },

    filterBtnActive: {
      borderColor:
        colors.primary,

      backgroundColor:
        colors.primary,
    },

    filterBtnDisabled: {
      opacity: 0.5,
    },

    filterBtnPressed: {
      opacity: 0.82,
    },

    filterBtnTextBox: {
      flex: 1,

      minWidth: 0,
    },

    filterLabel: {
      fontSize: 10,

      lineHeight: 13,

      fontWeight: "900",

      textTransform:
        "uppercase",

      color:
        colors.textSecondary,
    },

    filterLabelActive: {
      color:
        primaryForeground,
    },

    filterValue: {
      marginTop: 3,

      fontSize: 12.5,

      lineHeight: 17,

      fontWeight: "900",

      color:
        colors.text,
    },

    filterValueActive: {
      color:
        primaryForeground,
    },

    filterIconBox: {
      width: 38,

      height: 38,

      borderRadius: 12,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        colors.card,

      alignItems: "center",

      justifyContent: "center",
    },

    filterIconBoxActive: {
      borderColor:
        "rgba(255,255,255,0.28)",

      backgroundColor:
        "rgba(255,255,255,0.08)",
    },

    filterActionsRow: {
      width: "100%",

      flexDirection: "row",

      /*
       * CORREGIDO:
       * justifyContent no acepta stretch.
       */
      justifyContent:
        isMobile
          ? "flex-start"
          : "flex-end",

      alignItems: "stretch",

      gap: 10,
    },

    clearBtn: {
      flex:
        isMobile
          ? 1
          : 0,

      minHeight: 45,

      minWidth:
        isMobile
          ? 0
          : 110,

      paddingHorizontal: 14,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        backgroundSecondary,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 7,
    },

    clearBtnText: {
      color:
        colors.text,

      fontSize: 12,

      fontWeight: "900",
    },

    refreshBtn: {
      flex:
        isMobile
          ? 1
          : 0,

      minHeight: 45,

      minWidth:
        isMobile
          ? 0
          : 125,

      paddingHorizontal: 15,

      borderRadius: 14,

      backgroundColor:
        colors.primary,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 7,
    },

    refreshBtnText: {
      color:
        primaryForeground,

      fontSize: 12,

      fontWeight: "900",
    },

    /* =====================================================
       DROPDOWN
    ===================================================== */

    dropdownPanel: {
      width: "100%",

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        backgroundSecondary,

      borderRadius: 18,

      padding:
        isMobile
          ? 14
          : 16,

      gap: 14,
    },

    dropdownHeader: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      gap: 10,
    },

    dropdownTitle: {
      flex: 1,

      color:
        colors.text,

      fontSize: 13,

      lineHeight: 18,

      fontWeight: "900",
    },

    dropdownClose: {
      width: 34,

      height: 34,

      borderRadius: 11,

      alignItems: "center",

      justifyContent: "center",

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        colors.card,
    },

    dropdownOptions: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 9,
    },

    dropdownOption: {
      minHeight: 42,

      paddingHorizontal: 16,

      borderRadius: 999,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        colors.card,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 7,
    },

    dropdownOptionActive: {
      borderColor:
        colors.primary,

      backgroundColor:
        colors.primary,
    },

    dropdownOptionText: {
      color:
        colors.text,

      fontSize: 12,

      fontWeight: "900",
    },

    dropdownOptionTextActive: {
      color:
        primaryForeground,
    },

    dropdownEmpty: {
      color:
        textMuted,

      fontSize: 12,

      fontWeight: "700",
    },

    /* =====================================================
       BÚSQUEDA
    ===================================================== */

    searchBox: {
      width: "100%",

      minHeight: 50,

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        backgroundSecondary,

      paddingHorizontal: 15,

      flexDirection: "row",

      alignItems: "center",

      gap: 10,
    },

    searchInput: {
      flex: 1,

      minWidth: 0,

      paddingVertical: 12,

      color:
        colors.text,

      fontSize: 13,

      fontWeight: "600",
    },

    /* =====================================================
       LOADING
    ===================================================== */

    loadingBox: {
      minHeight: 230,

      alignItems: "center",

      justifyContent: "center",

      gap: 12,

      padding: 30,
    },

    loadingText: {
      color:
        colors.textSecondary,

      fontSize: 12,

      fontWeight: "700",
    },

    empty: {
      minHeight: 250,

      alignItems: "center",

      justifyContent: "center",

      padding: 30,
    },

    emptyIcon: {
      width: 66,

      height: 66,

      borderRadius: 21,

      backgroundColor:
        `${colors.primary}12`,

      alignItems: "center",

      justifyContent: "center",

      marginBottom: 12,
    },

    emptyTitle: {
      color:
        colors.text,

      fontSize: 17,

      fontWeight: "900",

      textAlign: "center",
    },

    emptyText: {
      maxWidth: 410,

      color:
        colors.textSecondary,

      fontSize: 12,

      lineHeight: 18,

      fontWeight: "600",

      textAlign: "center",

      marginTop: 5,
    },

    /* =====================================================
       TABLA
    ===================================================== */

    tableShell: {
      width: "100%",

      borderWidth: 1,

      borderColor:
        colors.border,

      borderRadius: 17,

      overflow: "hidden",
    },

    tableHeader: {
      minHeight: 47,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 15,

      backgroundColor:
        backgroundSecondary,

      borderBottomWidth: 1,

      borderBottomColor:
        colors.border,
    },

    headerText: {
      color:
        colors.textSecondary,

      fontSize: 10,

      lineHeight: 14,

      fontWeight: "900",

      textTransform:
        "uppercase",

      letterSpacing: 0.4,
    },

    tableRow: {
      minHeight: 80,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 15,

      borderBottomWidth: 1,

      borderBottomColor:
        colors.border,

      backgroundColor:
        colors.card,
    },

    tableRowAlt: {
      backgroundColor:
        backgroundSecondary,
    },

    tableRowLast: {
      borderBottomWidth: 0,
    },

    colProducto: {
      flex:
        isCompact
          ? 2.7
          : 3.2,

      minWidth: 0,

      paddingRight: 12,
    },

    colSku: {
      flex: 1.2,

      minWidth: 0,

      paddingRight: 10,
    },

    colCategoria: {
      flex: 1.5,

      minWidth: 0,

      paddingRight: 10,
    },

    colUnidad: {
      flex: 1,

      minWidth: 0,

      paddingRight: 10,
    },

    colCantidad: {
      flex: 0.8,

      minWidth: 85,

      paddingRight: 10,
    },

    colExistencia: {
      flex: 1.25,

      minWidth: 125,
    },

    /* =====================================================
       IMAGEN DEL PRODUCTO
    ===================================================== */

    productCell: {
      width: "100%",

      flexDirection: "row",

      alignItems: "center",

      gap: 12,
    },

    productTextBox: {
      flex: 1,

      minWidth: 0,
    },

    productImageContainer: {
      width: 54,

      height: 54,

      borderRadius: 14,

      overflow: "hidden",

      flexShrink: 0,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        backgroundSecondary,
    },

    productImage: {
      width: "100%",

      height: "100%",
    },

    productImagePlaceholder: {
      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        backgroundSecondary,
    },

    productImageMobileContainer: {
      width: 65,

      height: 65,

      borderRadius: 16,

      overflow: "hidden",

      flexShrink: 0,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        colors.card,
    },

    productImageMobile: {
      width: "100%",

      height: "100%",
    },

    productName: {
      color:
        colors.text,

      fontSize: 13,

      lineHeight: 18,

      fontWeight: "900",
    },

    productStatus: {
      marginTop: 3,

      color:
        colors.textSecondary,

      fontSize: 10,

      lineHeight: 14,

      fontWeight: "700",
    },

    cellText: {
      color:
        colors.textSecondary,

      fontSize: 12,

      lineHeight: 17,

      fontWeight: "700",
    },

    skuBadge: {
      alignSelf: "flex-start",

      maxWidth: "100%",

      borderWidth: 1,

      borderColor:
        colors.border,

      borderRadius: 9,

      backgroundColor:
        backgroundSecondary,

      paddingHorizontal: 8,

      paddingVertical: 5,
    },

    skuText: {
      color:
        colors.text,

      fontSize: 10,

      fontWeight: "900",
    },

    quantityValue: {
      color:
        colors.text,

      fontSize: 20,

      lineHeight: 25,

      fontWeight: "900",
    },

    stockBadge: {
      alignSelf: "flex-start",

      minHeight: 32,

      paddingHorizontal: 10,

      borderRadius: 999,

      borderWidth: 1,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 5,
    },

    stockBadgeText: {
      fontSize: 10,

      fontWeight: "900",
    },

    /* =====================================================
       MOBILE
    ===================================================== */

    mobileList: {
      gap: 10,
    },

    mobileCard: {
      width: "100%",

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        backgroundSecondary,

      padding: 14,

      gap: 14,
    },

    mobileHeader: {
      flexDirection: "column",

      alignItems: "stretch",

      gap: 12,
    },

    mobileProductIdentity: {
      width: "100%",

      flexDirection: "row",

      alignItems: "center",

      gap: 12,
    },

    mobileHeaderText: {
      flex: 1,

      minWidth: 0,
    },

    mobileTitle: {
      color:
        colors.text,

      fontSize: 15,

      lineHeight: 20,

      fontWeight: "900",
    },

    mobileSku: {
      marginTop: 4,

      color:
        colors.textSecondary,

      fontSize: 10,

      fontWeight: "800",
    },

    mobileInfoRow: {
      flexDirection: "row",

      gap: 10,
    },

    mobileInfoItem: {
      flex: 1,

      minWidth: 0,
    },

    mobileInfoLabel: {
      color:
        colors.textSecondary,

      fontSize: 10,

      fontWeight: "800",
    },

    mobileInfoValue: {
      marginTop: 2,

      color:
        colors.text,

      fontSize: 12,

      fontWeight: "800",
    },

    mobileQuantity: {
      minHeight: 66,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        colors.card,

      paddingHorizontal: 14,

      paddingVertical: 10,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      gap: 12,
    },

    mobileQuantityText: {
      flex: 1,

      minWidth: 0,
    },

    mobileQuantityLabel: {
      color:
        colors.text,

      fontSize: 12,

      fontWeight: "900",
    },

    mobileQuantitySub: {
      marginTop: 2,

      color:
        colors.textSecondary,

      fontSize: 9,

      fontWeight: "700",
    },

    mobileQuantityValue: {
      color:
        colors.primary,

      fontSize: 27,

      fontWeight: "900",
    },
  });
}

export type InventarioVistaProductoStyles =
  ReturnType<
    typeof createInventarioVistaProductoStyles
  >;