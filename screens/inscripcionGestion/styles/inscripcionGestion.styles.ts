import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 22,
    gap: 16,
  },
  contentMobile: {
    padding: 14,
  },

  hero: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  heroTopMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  titleBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minWidth: 0,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },

  heroCounters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  counterPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
  },
  counterText: {
    fontSize: 12.5,
    fontWeight: "900",
  },

  selectionGrid: {
    flexDirection: "row",
    gap: 16,
    alignItems: "stretch",
  },
  selectionGridMobile: {
    flexDirection: "column",
  },
  selectionColumnGestion: {
    width: 410,
    minWidth: 320,
  },
  selectionColumnGestionMobile: {
    width: "100%",
    minWidth: 0,
  },
  selectionColumnCarreras: {
    flex: 1,
    minWidth: 0,
  },

  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 18,
  },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  toolbarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  button: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  buttonPrimary: {
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 12.5,
    fontWeight: "900",
  },

  list: {
    gap: 10,
  },
  listRow: {
    minHeight: 88,
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  carreraRow: {
    minHeight: 112,
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  listInfo: {
    flex: 1,
    minWidth: 0,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  listMeta: {
    marginTop: 4,
    fontSize: 11.5,
    fontWeight: "700",
    lineHeight: 16,
  },
  listMetaStrong: {
    marginTop: 5,
    fontSize: 11.5,
    fontWeight: "900",
    lineHeight: 16,
  },

  progressTrack: {
    marginTop: 8,
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  gestionScroll: {
    maxHeight: 590,
  },
  carrerasScroll: {
    maxHeight: 590,
  },
  scrollContent: {
    gap: 10,
    paddingRight: 6,
    paddingBottom: 2,
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: "900",
  },

  summaryStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryBox: {
    minWidth: 150,
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: "900",
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 11.5,
    fontWeight: "800",
  },

  loadingPanel: {
    minHeight: 310,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 22,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 520,
  },

  emptyPanel: {
    minHeight: 310,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 22,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 560,
  },

  selectedList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedItem: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  selectedItemText: {
    maxWidth: 250,
    fontSize: 11.5,
    fontWeight: "900",
  },

  resultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  resultBox: {
    minWidth: 170,
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  resultNumber: {
    fontSize: 24,
    fontWeight: "900",
  },
  resultLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "800",
  },

  noteBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 18,
  },


  carreraActionColumn: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
  },
  viewGroupsButton: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  viewGroupsButtonText: {
    fontSize: 10.5,
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.78)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 1240,
    maxHeight: "94%",
    borderWidth: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  modalHeader: {
    minHeight: 88,
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  modalHeaderTitleBox: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  modalSubtitle: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 17,
  },
  modalCloseButton: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  modalLoadingPanel: {
    minHeight: 430,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  modalSummary: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  modalSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalSummaryBox: {
    minWidth: 135,
    flex: 1,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  modalSummaryNumber: {
    fontSize: 20,
    fontWeight: "900",
  },
  modalSummaryLabel: {
    marginTop: 1,
    fontSize: 10.5,
    fontWeight: "900",
  },
  modalFilters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 8,
  },
  modalFilterButton: {
    minHeight: 36,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  modalFilterText: {
    fontSize: 10.5,
    fontWeight: "900",
  },
  modalBodyScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  modalBodyContent: {
    padding: 16,
    gap: 12,
  },
  modalEmptyPanel: {
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    gap: 9,
  },
  modalFooter: {
    minHeight: 72,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  modalFooterText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: "700",
    lineHeight: 16,
  },

  groupDetailCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  groupDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  groupDetailHeaderMobile: {
    alignItems: "flex-start",
    flexDirection: "column",
  },
  groupDetailTitleBox: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  groupDetailIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  groupDetailTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  groupDetailMeta: {
    marginTop: 3,
    fontSize: 11.5,
    fontWeight: "700",
    lineHeight: 16,
  },
  groupStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  groupStatusText: {
    fontSize: 10.5,
    fontWeight: "900",
  },
  groupManagementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  groupManagementBox: {
    minWidth: 230,
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
  },
  groupManagementLabel: {
    fontSize: 9.5,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  groupManagementValue: {
    marginTop: 3,
    fontSize: 11.5,
    fontWeight: "900",
    lineHeight: 16,
  },
  groupReasonBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  groupReasonText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: "800",
    lineHeight: 16,
  },
  groupSection: {
    gap: 7,
  },
  groupSectionTitle: {
    fontSize: 11.5,
    fontWeight: "900",
  },
  groupChipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  groupChip: {
    maxWidth: "100%",
    minHeight: 31,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  groupChipText: {
    maxWidth: 310,
    fontSize: 9.8,
    fontWeight: "900",
  },
});
