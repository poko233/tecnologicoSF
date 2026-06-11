import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { Estudiante } from "../types/asignaciones.types";

type EstudianteTabla = Estudiante & {
  matricula?: string | null;
  fechaInscripcion?: string | null;
};

type Props = {
  estudiantes: EstudianteTabla[];
  loading: boolean;
  onInscribir: (estudiante: EstudianteTabla) => void;
  onVerPdf: (estudiante: EstudianteTabla) => void;
};

const ITEMS_PER_PAGE = 10;

export default function EstudiantesTable({
  estudiantes,
  loading,
  onInscribir,
  onVerPdf,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width < 850;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const topScrollRef = useRef<ScrollView | null>(null);
  const tableScrollRef = useRef<ScrollView | null>(null);

  const syncingTop = useRef(false);
  const syncingTable = useRef(false);

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const softCard = isDark ? "rgba(255,255,255,0.045)" : "rgba(15,23,42,0.035)";
  const softHeader = isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.06)";
  const mutedBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.10)";
  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;

  const tableWidth = isMobile ? 1380 : Math.max(width + 420, 1740);

  const formatearFecha = (fecha?: string | null) => {
    if (!fecha) return "Sin fecha";

    const limpia = String(fecha).split("T")[0];

    if (!limpia.includes("-")) return limpia;

    const [year, month, day] = limpia.split("-");

    if (!year || !month || !day) return limpia;

    return `${day}/${month}/${year}`;
  };

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return estudiantes;

    return estudiantes.filter((e) => {
      const nombre = `${e.nombres} ${e.apellidoPaterno} ${
        e.apellidoMaterno ?? ""
      }`;

      return (
        nombre.toLowerCase().includes(q) ||
        String(e.ci ?? "").toLowerCase().includes(q) ||
        String(e.matricula ?? "").toLowerCase().includes(q) ||
        String(e.fechaInscripcion ?? "").toLowerCase().includes(q) ||
        String(e.email ?? "").toLowerCase().includes(q) ||
        String(e.celular ?? "").toLowerCase().includes(q)
      );
    });
  }, [estudiantes, search]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const estudiantesPagina = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return filtrados.slice(start, end);
  }, [filtrados, currentPage]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const limpiarBusqueda = () => {
    setSearch("");
    setPage(1);
  };

  const goPrev = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const goNext = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  const syncHorizontalScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    source: "top" | "table"
  ) => {
    const x = event.nativeEvent.contentOffset.x;

    if (source === "top") {
      if (syncingTable.current) return;

      syncingTop.current = true;
      tableScrollRef.current?.scrollTo({ x, animated: false });

      requestAnimationFrame(() => {
        syncingTop.current = false;
      });
    }

    if (source === "table") {
      if (syncingTop.current) return;

      syncingTable.current = true;
      topScrollRef.current?.scrollTo({ x, animated: false });

      requestAnimationFrame(() => {
        syncingTable.current = false;
      });
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: mutedBorder,
        },
      ]}
    >
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View style={styles.titleBox}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDark
                  ? "rgba(59,130,246,0.18)"
                  : "#DBEAFE",
              },
            ]}
          >
            <Ionicons name="people" size={22} color={theme.colors.primary} />
          </View>

          <View>
            <ThemedText style={[styles.title, { color: strongText }]}>
              Estudiantes
            </ThemedText>

            <ThemedText style={[styles.subtitle, { color: mutedText }]}>
              {filtrados.length} de {estudiantes.length} estudiantes encontrados
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.searchBox,
            {
              borderColor: mutedBorder,
              backgroundColor: softCard,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={mutedText} />

          <TextInput
            placeholder="Buscar por nombre, CI, matrícula, fecha o email"
            placeholderTextColor={mutedText}
            value={search}
            onChangeText={handleSearch}
            style={[styles.searchInput, { color: strongText }]}
          />

          {search.length > 0 && (
            <Pressable onPress={limpiarBusqueda}>
              <Ionicons name="close-circle" size={18} color={mutedText} />
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.colors.primary} />

          <ThemedText style={[styles.loadingText, { color: mutedText }]}>
            Cargando estudiantes...
          </ThemedText>
        </View>
      ) : filtrados.length === 0 ? (
        <View style={styles.emptyBox}>
          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "#F1F5F9",
              },
            ]}
          >
            <Ionicons name="people-outline" size={42} color={mutedText} />
          </View>

          <ThemedText style={[styles.emptyTitle, { color: strongText }]}>
            No hay estudiantes
          </ThemedText>

          <ThemedText style={[styles.emptySubtitle, { color: mutedText }]}>
            Intenta con otro nombre, CI, matrícula o correo.
          </ThemedText>
        </View>
      ) : (
        <>
          <View
            style={[
              styles.tableShell,
              {
                borderColor: mutedBorder,
                backgroundColor: isDark
                  ? "rgba(15,23,42,0.42)"
                  : "rgba(248,250,252,0.65)",
              },
            ]}
          >
            <ScrollView
              ref={topScrollRef}
              horizontal
              showsHorizontalScrollIndicator
              scrollEventThrottle={16}
              onScroll={(event) => syncHorizontalScroll(event, "top")}
              style={styles.topHorizontalScroll}
              contentContainerStyle={styles.topHorizontalContent}
            >
              <View style={{ width: tableWidth, height: 18 }} />
            </ScrollView>

            <ScrollView
              ref={tableScrollRef}
              horizontal
              showsHorizontalScrollIndicator
              scrollEventThrottle={16}
              onScroll={(event) => syncHorizontalScroll(event, "table")}
              contentContainerStyle={styles.horizontalContent}
            >
              <View style={{ width: tableWidth }}>
                <View
                  style={[
                    styles.row,
                    styles.tableHeader,
                    {
                      backgroundColor: softHeader,
                      borderColor: mutedBorder,
                    },
                  ]}
                >
                  <ThemedText style={[styles.th, { flex: 1, color: mutedText }]}>
                    CI
                  </ThemedText>

                  <ThemedText style={[styles.th, { flex: 1.15, color: mutedText }]}>
                    Matrícula
                  </ThemedText>

                  <ThemedText style={[styles.th, { flex: 2.3, color: mutedText }]}>
                    Estudiante
                  </ThemedText>

                  <ThemedText style={[styles.th, { flex: 1.45, color: mutedText }]}>
                    Fecha inscripción
                  </ThemedText>

                  <ThemedText style={[styles.th, { flex: 1.2, color: mutedText }]}>
                    Celular
                  </ThemedText>

                  <ThemedText style={[styles.th, { flex: 2.1, color: mutedText }]}>
                    Email
                  </ThemedText>

                  <ThemedText style={[styles.th, { flex: 2, color: mutedText }]}>
                    Acciones
                  </ThemedText>
                </View>

                <ScrollView
                  style={styles.verticalScroll}
                  contentContainerStyle={styles.rowsBox}
                  showsVerticalScrollIndicator
                  nestedScrollEnabled
                >
                  {estudiantesPagina.map((item) => {
                    const nombreCompleto = `${item.nombres} ${item.apellidoPaterno} ${
                      item.apellidoMaterno ?? ""
                    }`.trim();

                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.row,
                          styles.bodyRow,
                          {
                            backgroundColor: softCard,
                            borderColor: mutedBorder,
                          },
                        ]}
                      >
                        <View style={[styles.cell, { flex: 1 }]}>
                          <ThemedText style={[styles.ciText, { color: strongText }]}>
                            {item.ci || "—"}
                          </ThemedText>

                          {item.expedido && (
                            <ThemedText style={[styles.smallText, { color: mutedText }]}>
                              {item.expedido}
                            </ThemedText>
                          )}
                        </View>

                        <View style={[styles.cell, { flex: 1.15 }]}>
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.matriculaText, { color: strongText }]}
                          >
                            {item.matricula || "Sin matrícula"}
                          </ThemedText>
                        </View>

                        <View style={[styles.cell, { flex: 2.3 }]}>
                          <View style={styles.studentBox}>
                            <View
                              style={[
                                styles.avatar,
                                {
                                  backgroundColor: isDark
                                    ? "rgba(59,130,246,0.18)"
                                    : "#DBEAFE",
                                },
                              ]}
                            >
                              <ThemedText
                                style={[
                                  styles.avatarText,
                                  { color: theme.colors.primary },
                                ]}
                              >
                                {nombreCompleto.charAt(0).toUpperCase() || "E"}
                              </ThemedText>
                            </View>

                            <View style={{ flex: 1 }}>
                              <ThemedText
                                numberOfLines={1}
                                style={[styles.nameText, { color: strongText }]}
                              >
                                {nombreCompleto || "Sin nombre"}
                              </ThemedText>

                              <ThemedText
                                numberOfLines={1}
                                style={[styles.smallText, { color: mutedText }]}
                              >
                              </ThemedText>
                            </View>
                          </View>
                        </View>

                        <View style={[styles.cell, { flex: 1.45 }]}>
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.normalText, { color: strongText }]}
                          >
                            {formatearFecha(item.fechaInscripcion)}
                          </ThemedText>
                        </View>

                        <View style={[styles.cell, { flex: 1.2 }]}>
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.normalText, { color: strongText }]}
                          >
                            {item.celular || "Sin celular"}
                          </ThemedText>
                        </View>

                        <View style={[styles.cell, { flex: 2.1 }]}>
                          <ThemedText
                            numberOfLines={1}
                            style={[styles.normalText, { color: strongText }]}
                          >
                            {item.email || "Sin email"}
                          </ThemedText>
                        </View>

                        <View style={[styles.actions, { flex: 2 }]}>
                          <ActionButton
                            label="Inscribir"
                            icon="school-outline"
                            color={theme.colors.primary}
                            isDark={isDark}
                            onPress={() => onInscribir(item)}
                          />

                          <ActionButton
                            label="Ver PDF"
                            icon="document-text-outline"
                            color="#16A34A"
                            isDark={isDark}
                            onPress={() => onVerPdf(item)}
                          />
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </ScrollView>
          </View>

          <View style={styles.pagination}>
            <View>
              <ThemedText style={[styles.pageText, { color: strongText }]}>
                Página {currentPage} de {totalPages}
              </ThemedText>

              <ThemedText style={[styles.pageSubText, { color: mutedText }]}>
                Mostrando {estudiantesPagina.length} de {filtrados.length}
              </ThemedText>
            </View>

            <View style={styles.pageActions}>
              <Pressable
                onPress={goPrev}
                disabled={currentPage === 1}
                style={({ pressed }) => [
                  styles.pageBtn,
                  {
                    borderColor: mutedBorder,
                    backgroundColor:
                      currentPage === 1 ? softCard : theme.colors.primary,
                    opacity: pressed ? 0.78 : currentPage === 1 ? 0.55 : 1,
                  },
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={currentPage === 1 ? mutedText : "#fff"}
                />

                <ThemedText
                  style={[
                    styles.pageBtnText,
                    { color: currentPage === 1 ? mutedText : "#fff" },
                  ]}
                >
                  Anterior
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={goNext}
                disabled={currentPage === totalPages}
                style={({ pressed }) => [
                  styles.pageBtn,
                  {
                    borderColor: mutedBorder,
                    backgroundColor:
                      currentPage === totalPages
                        ? softCard
                        : theme.colors.primary,
                    opacity: pressed
                      ? 0.78
                      : currentPage === totalPages
                      ? 0.55
                      : 1,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.pageBtnText,
                    { color: currentPage === totalPages ? mutedText : "#fff" },
                  ]}
                >
                  Siguiente
                </ThemedText>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={currentPage === totalPages ? mutedText : "#fff"}
                />
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

function ActionButton({
  label,
  icon,
  color,
  isDark,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isDark: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        {
          backgroundColor: isDark ? `${color}26` : `${color}14`,
          borderColor: isDark ? `${color}66` : `${color}38`,
          opacity: pressed ? 0.78 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <View style={[styles.actionIconBox, { backgroundColor: color }]}>
        <Ionicons name={icon} size={14} color="#fff" />
      </View>

      <ThemedText numberOfLines={1} style={[styles.actionText, { color }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
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
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
  },
  headerMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  titleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 23,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
  },
  searchBox: {
    minWidth: 330,
    maxWidth: 470,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 13,
    gap: 9,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    outlineStyle: "none" as any,
  },
  loadingBox: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontWeight: "700",
  },
  emptyBox: {
    padding: 50,
    alignItems: "center",
  },
  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "900",
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  tableShell: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 10,
  },
  topHorizontalScroll: {
    height: 22,
    marginBottom: 8,
  },
  topHorizontalContent: {
    minHeight: 18,
  },
  horizontalContent: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeader: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  verticalScroll: {
    maxHeight: 650,
  },
  rowsBox: {
    gap: 10,
    paddingBottom: 8,
  },
  bodyRow: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 10,
  },
  th: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 8,
  },
  cell: {
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  ciText: {
    fontSize: 14,
    fontWeight: "900",
  },
  matriculaText: {
    fontSize: 14,
    fontWeight: "900",
  },
  normalText: {
    fontSize: 14,
    fontWeight: "700",
  },
  smallText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  studentBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "900",
    fontSize: 16,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "900",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    flexWrap: "nowrap",
  },
  actionBtn: {
    height: 36,
    minWidth: 112,
    flex: 1,
    maxWidth: 140,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  actionIconBox: {
    width: 23,
    height: 23,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontWeight: "900",
    fontSize: 11.5,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  pageText: {
    fontSize: 14,
    fontWeight: "900",
  },
  pageSubText: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
  },
  pageActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  pageBtn: {
    minHeight: 40,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: "900",
  },
});