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

  selectionGrid: {
    flexDirection: "row",
    gap: 16,
    alignItems: "stretch",
  },
  selectionGridMobile: {
    flexDirection: "column",
  },
  selectionColumn: {
    flex: 1,
    minWidth: 0,
  },
  sameHeightCard: {
    flex: 1,
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
    minHeight: 46,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 16,
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
    marginTop: 3,
    fontSize: 11.5,
    fontWeight: "700",
  },
  listMetaStrong: {
    marginTop: 3,
    fontSize: 11.5,
    fontWeight: "900",
  },

  gestionScroll: {
    maxHeight: 480,
  },
  carrerasScroll: {
    maxHeight: 480,
  },
  carrerasScrollContent: {
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

  loadingPanel: {
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 22,
  },
  loadingPanelCompact: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
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
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 22,
  },
  emptyPanelCompact: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
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
    maxWidth: 220,
    fontSize: 11.5,
    fontWeight: "900",
  },

  resultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  resultBox: {
    minWidth: 160,
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
});