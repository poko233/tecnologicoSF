import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
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

type Props = {
  estudiantes: Estudiante[];
  loading: boolean;
  onInscribir: (estudiante: Estudiante) => void;
  onRevisar: (estudiante: Estudiante) => void;
  onEditar: (estudiante: Estudiante) => void;
};

export default function EstudiantesTable({
  estudiantes,
  loading,
  onInscribir,
  onRevisar,
  onEditar,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width < 850;
  const isCompact = width < 1180;

  const [search, setSearch] = useState("");

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const softCard = isDark ? "rgba(255,255,255,0.045)" : "rgba(15,23,42,0.035)";
  const softHeader = isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.06)";
  const mutedBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.10)";
  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return estudiantes;

    return estudiantes.filter((e) => {
      const nombre = `${e.nombres} ${e.apellidoPaterno} ${
        e.apellidoMaterno ?? ""
      }`;

      return (
        nombre.toLowerCase().includes(q) ||
        e.ci?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.matricula?.toLowerCase().includes(q) ||
        e.celular?.toLowerCase().includes(q)
      );
    });
  }, [estudiantes, search]);

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
              { backgroundColor: isDark ? "rgba(59,130,246,0.18)" : "#DBEAFE" },
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
            placeholder="Buscar por nombre, CI, email o matrícula"
            placeholderTextColor={mutedText}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: strongText }]}
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
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
              { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9" },
            ]}
          >
            <Ionicons name="people-outline" size={42} color={mutedText} />
          </View>
          <ThemedText style={[styles.emptyTitle, { color: strongText }]}>
            No hay estudiantes
          </ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: mutedText }]}>
            Intenta con otro nombre, CI o correo.
          </ThemedText>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: isMobile ? 920 : "100%" }}>
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
              <ThemedText style={[styles.th, { flex: 2.5, color: mutedText }]}>
                Estudiante
              </ThemedText>
              <ThemedText style={[styles.th, { flex: 1.35, color: mutedText }]}>
                Celular
              </ThemedText>
              <ThemedText style={[styles.th, { flex: 2.25, color: mutedText }]}>
                Email
              </ThemedText>
              <ThemedText style={[styles.th, { flex: 2.7, color: mutedText }]}>
                Acciones
              </ThemedText>
            </View>

            <View style={styles.rowsBox}>
              {filtrados.map((item) => {
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

                    <View style={[styles.cell, { flex: 2.5 }]}>
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
                            Matrícula: {item.matricula || "Sin matrícula"}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    <View style={[styles.cell, { flex: 1.35 }]}>
                      <ThemedText
                        numberOfLines={1}
                        style={[styles.normalText, { color: strongText }]}
                      >
                        {item.celular || "Sin celular"}
                      </ThemedText>
                    </View>

                    <View style={[styles.cell, { flex: 2.25 }]}>
                      <ThemedText
                        numberOfLines={1}
                        style={[styles.normalText, { color: strongText }]}
                      >
                        {item.email || "Sin email"}
                      </ThemedText>
                    </View>

                    <View style={[styles.actions, { flex: 2.7 }]}>
                      <ActionButton
                        label={isCompact ? "Inscribir" : "Inscribir"}
                        icon="school-outline"
                        color={theme.colors.primary}
                        isDark={isDark}
                        onPress={() => onInscribir(item)}
                      />

                      <ActionButton
                        label="Revisar"
                        icon="eye-outline"
                        color="#16A34A"
                        isDark={isDark}
                        onPress={() => onRevisar(item)}
                      />

                      <ActionButton
                        label="Editar"
                        icon="create-outline"
                        color="#F59E0B"
                        isDark={isDark}
                        onPress={() => onEditar(item)}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
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
  rowsBox: {
    gap: 10,
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
    gap: 7,
    paddingHorizontal: 8,
    flexWrap: "nowrap",
  },
  actionBtn: {
    height: 34,
    minWidth: 88,
    flex: 1,
    maxWidth: 108,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 7,
  },
  actionIconBox: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontWeight: "900",
    fontSize: 11.5,
  },
});