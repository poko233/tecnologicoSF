import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { UsuarioRRHH } from "../types/recursosHumanos.types";

type Props = {
  usuarios: UsuarioRRHH[];
  loading: boolean;
  onEditar: (usuario: UsuarioRRHH) => void;
  onRefresh: () => void;
};

const PAGE_SIZE = 10;
const TABLE_WIDTH = 1710;

function obtenerRoles(usuario: UsuarioRRHH) {
  return (
    usuario.roles
      ?.map((r) => r.rol)
      .filter(Boolean)
      .join(", ") || "Sin rol"
  );
}

function nombreCompleto(usuario: UsuarioRRHH) {
  return `${usuario.nombres || ""} ${usuario.apellidoPaterno || ""} ${
    usuario.apellidoMaterno || ""
  }`.trim();
}

export default function UsuariosTable({
  usuarios,
  loading,
  onEditar,
  onRefresh,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { width } = useWindowDimensions();
  const isMobile = width < 850;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const topScrollRef = useRef<ScrollView | null>(null);
  const bottomScrollRef = useRef<ScrollView | null>(null);
  const syncingRef = useRef(false);

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return usuarios;

    return usuarios.filter((u) =>
      [
        u.usuario,
        u.ci,
        u.nombres,
        u.apellidoPaterno,
        u.apellidoMaterno || "",
        u.email || "",
        u.celular || "",
        u.estado,
        obtenerRoles(u),
        u.observacionPromociones || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [usuarios, search]);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const syncHorizontalScroll = (
    source: "top" | "bottom",
    x: number,
  ) => {
    if (syncingRef.current) return;

    syncingRef.current = true;

    if (source === "top") {
      bottomScrollRef.current?.scrollTo({
        x,
        animated: false,
      });
    } else {
      topScrollRef.current?.scrollTo({
        x,
        animated: false,
      });
    }

    setTimeout(() => {
      syncingRef.current = false;
    }, 20);
  };

  const styles = createStyles(colors, isMobile);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.topTextBox}>
          <ThemedText style={styles.title}>Usuarios del sistema</ThemedText>

          <ThemedText style={styles.subtitle}>
            {data.length} usuario(s) encontrados
          </ThemedText>
        </View>

        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons
            name="refresh-outline"
            size={18}
            color={colors.primaryForeground}
          />

          {!isMobile && (
            <ThemedText style={styles.refreshText}>Actualizar</ThemedText>
          )}
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre, CI, email, rol, estado u observación..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} size="large" />

          <ThemedText style={styles.loadingText}>
            Cargando usuarios...
          </ThemedText>
        </View>
      ) : (
        <>
          <ScrollView
            ref={topScrollRef}
            horizontal
            showsHorizontalScrollIndicator
            scrollEventThrottle={16}
            onScroll={(event) =>
              syncHorizontalScroll("top", event.nativeEvent.contentOffset.x)
            }
            style={styles.topHorizontalScroll}
          >
            <View style={styles.topScrollContent} />
          </ScrollView>

          <ScrollView
            ref={bottomScrollRef}
            horizontal
            showsHorizontalScrollIndicator
            scrollEventThrottle={16}
            onScroll={(event) =>
              syncHorizontalScroll("bottom", event.nativeEvent.contentOffset.x)
            }
          >
            <View style={styles.tableWrapper}>
              <ScrollView
                showsVerticalScrollIndicator
                nestedScrollEnabled
                style={styles.verticalScroll}
              >
                <View style={styles.table}>
                  <View style={[styles.row, styles.headerRow]}>
                    <Cell text="Foto" header width={90} center />
                    <Cell text="QR" header width={90} center />
                    <Cell text="Usuario" header width={130} />
                    <Cell text="Nombre completo" header width={260} />
                    <Cell text="CI" header width={120} />
                    <Cell text="Email" header width={220} />
                    <Cell text="Celular" header width={130} />
                    <Cell text="Roles" header width={180} />
                    <Cell text="Observaciones" header width={260} />
                    <Cell text="Estado" header width={130} />
                    <Cell text="Acción" header width={130} center />
                  </View>

                  {paginatedData.map((u, index) => (
                    <View
                      key={u.id}
                      style={[styles.row, index % 2 === 1 && styles.rowAlt]}
                    >
                      <View style={[styles.cell, styles.center, { width: 90 }]}>
                        {u.fotoUrl ? (
                          <Image
                            source={{ uri: u.fotoUrl }}
                            style={styles.avatar}
                          />
                        ) : (
                          <View style={styles.avatarEmpty}>
                            <Ionicons
                              name="person-outline"
                              size={22}
                              color={colors.textMuted}
                            />
                          </View>
                        )}
                      </View>

                      <View style={[styles.cell, styles.center, { width: 90 }]}>
                        {u.qrUrl ? (
                          <Image source={{ uri: u.qrUrl }} style={styles.qr} />
                        ) : (
                          <View style={styles.qrEmpty}>
                            <Ionicons
                              name="qr-code-outline"
                              size={24}
                              color={colors.textMuted}
                            />
                          </View>
                        )}
                      </View>

                      <Cell text={u.usuario || "-"} width={130} />
                      <Cell text={nombreCompleto(u) || "-"} width={260} />
                      <Cell
                        text={`${u.ci || "-"} ${u.expedido || ""}`}
                        width={120}
                      />
                      <Cell text={u.email || "Sin email"} width={220} />
                      <Cell text={u.celular || "Sin celular"} width={130} />
                      <Cell text={obtenerRoles(u)} width={180} />
                      <Cell
                        text={u.observacionPromociones || "Sin observaciones"}
                        width={260}
                      />

                      <View style={[styles.cell, { width: 130 }]}>
                        <View
                          style={[
                            styles.badge,
                            u.estado === "ACTIVO"
                              ? styles.badgeActive
                              : styles.badgeInactive,
                          ]}
                        >
                          <ThemedText style={styles.badgeText}>
                            {u.estado || "-"}
                          </ThemedText>
                        </View>
                      </View>

                      <View
                        style={[styles.cell, styles.actions, { width: 130 }]}
                      >
                        <Pressable
                          style={styles.editBtn}
                          onPress={() => onEditar(u)}
                        >
                          <Ionicons
                            name="create-outline"
                            size={17}
                            color={colors.primaryForeground}
                          />

                          <ThemedText style={styles.editText}>
                            Editar
                          </ThemedText>
                        </Pressable>
                      </View>
                    </View>
                  ))}

                  {!data.length && (
                    <View style={styles.empty}>
                      <Ionicons
                        name="people-outline"
                        size={38}
                        color={colors.textMuted}
                      />

                      <ThemedText style={styles.emptyText}>
                        No se encontraron usuarios.
                      </ThemedText>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </ScrollView>

          <View style={styles.pagination}>
            <Pressable
              style={[styles.pageBtn, page <= 1 && styles.disabled]}
              disabled={page <= 1}
              onPress={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <Ionicons
                name="chevron-back-outline"
                size={18}
                color={colors.primaryForeground}
              />

              {!isMobile && (
                <ThemedText style={styles.pageBtnText}>Anterior</ThemedText>
              )}
            </Pressable>

            <View style={styles.pageInfo}>
              <ThemedText style={styles.pageInfoText}>
                Página {page} de {totalPages}
              </ThemedText>

              <ThemedText style={styles.pageInfoSub}>
                Mostrando {paginatedData.length} de {data.length}
              </ThemedText>
            </View>

            <Pressable
              style={[styles.pageBtn, page >= totalPages && styles.disabled]}
              disabled={page >= totalPages}
              onPress={() =>
                setPage((prev) => Math.min(totalPages, prev + 1))
              }
            >
              {!isMobile && (
                <ThemedText style={styles.pageBtnText}>Siguiente</ThemedText>
              )}

              <Ionicons
                name="chevron-forward-outline"
                size={18}
                color={colors.primaryForeground}
              />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );

  function Cell({
    text,
    width,
    header,
    center,
  }: {
    text: string;
    width: number;
    header?: boolean;
    center?: boolean;
  }) {
    return (
      <View style={[styles.cell, center && styles.center, { width }]}>
        <ThemedText
          numberOfLines={3}
          style={header ? styles.headerText : styles.cellText}
        >
          {text}
        </ThemedText>
      </View>
    );
  }
}

function createStyles(colors: any, isMobile: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: isMobile ? 14 : 20,
      gap: 16,
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 18,
      elevation: 4,
    },
    top: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 14,
    },
    topTextBox: {
      flex: 1,
    },
    title: {
      fontSize: isMobile ? 20 : 24,
      fontWeight: "900",
      color: colors.text,
    },
    subtitle: {
      marginTop: 4,
      color: colors.textSecondary,
    },
    refreshBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    refreshText: {
      color: colors.primaryForeground,
      fontWeight: "900",
    },
    searchBox: {
      minHeight: 48,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.input,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
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
    topHorizontalScroll: {
      maxHeight: 18,
      borderRadius: 8,
    },
    topScrollContent: {
      width: TABLE_WIDTH,
      height: 1,
    },
    tableWrapper: {
      width: TABLE_WIDTH,
    },
    verticalScroll: {
      maxHeight: 620,
      borderRadius: 18,
    },
    table: {
      width: TABLE_WIDTH,
      borderRadius: 18,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    row: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowAlt: {
      backgroundColor: colors.backgroundSecondary,
    },
    headerRow: {
      backgroundColor: colors.backgroundTertiary,
    },
    cell: {
      minHeight: 72,
      paddingHorizontal: 12,
      justifyContent: "center",
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    center: {
      alignItems: "center",
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    headerText: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.text,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    cellText: {
      fontSize: 13,
      color: colors.text,
      fontWeight: "600",
      lineHeight: 18,
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.backgroundSecondary,
    },
    avatarEmpty: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    qr: {
      width: 48,
      height: 48,
      borderRadius: 8,
      backgroundColor: "#FFFFFF",
    },
    qrEmpty: {
      width: 48,
      height: 48,
      borderRadius: 8,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    badgeActive: {
      backgroundColor: colors.success,
    },
    badgeInactive: {
      backgroundColor: colors.destructive,
    },
    badgeText: {
      color: colors.successForeground,
      fontSize: 11,
      fontWeight: "900",
    },
    editBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    editText: {
      color: colors.primaryForeground,
      fontWeight: "900",
      fontSize: 12,
    },
    empty: {
      padding: 42,
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.card,
    },
    emptyText: {
      color: colors.textSecondary,
      fontWeight: "700",
    },
    pagination: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingTop: 4,
    },
    pageBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minWidth: isMobile ? 44 : 120,
    },
    pageBtnText: {
      color: colors.primaryForeground,
      fontWeight: "900",
      fontSize: 13,
    },
    disabled: {
      opacity: 0.45,
    },
    pageInfo: {
      flex: 1,
      alignItems: "center",
    },
    pageInfoText: {
      color: colors.text,
      fontWeight: "900",
      fontSize: 14,
    },
    pageInfoSub: {
      color: colors.textSecondary,
      fontWeight: "700",
      fontSize: 12,
      marginTop: 2,
    },
  });
}