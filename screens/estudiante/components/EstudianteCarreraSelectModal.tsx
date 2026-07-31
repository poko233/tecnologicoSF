import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { CarreraEstudiante } from "../types/estudiante.types";

type Props = {
  visible: boolean;
  carreras: CarreraEstudiante[];
  value: number | null;
  idCarreraActual?: number | null;
  onClose: () => void;
  onChange: (idCarrera: number) => void;
};

function normalizar(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function EstudianteCarreraSelectModal({
  visible,
  carreras,
  value,
  idCarreraActual,
  onClose,
  onChange,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { width, height } = useWindowDimensions();
  const [search, setSearch] = useState("");

  const isMobile = width < 640;
  const muted = colors.textMuted || colors.muted || colors.textSecondary;
  const modalBg = colors.modal || colors.card;
  const surface = colors.input || colors.backgroundSecondary;

  const filtradas = useMemo(() => {
    const q = normalizar(search);

    return carreras
      .filter(
        (carrera) =>
          String(carrera.estadoCarrera ?? "activo").toLowerCase() ===
          "activo",
      )
      .filter((carrera) => {
        if (!q) return true;

        return normalizar(
          [
            carrera.nombreCarrera,
            carrera.codigo,
            carrera.regimen,
            carrera.tipo,
          ].join(" "),
        ).includes(q);
      })
      .sort((a, b) =>
        String(a.nombreCarrera).localeCompare(String(b.nombreCarrera), "es", {
          numeric: true,
          sensitivity: "base",
        }),
      );
  }, [carreras, search]);

  const cerrar = () => {
    setSearch("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cerrar}
    >
      <View
        style={[
          styles.overlay,
          { backgroundColor: colors.overlay || "rgba(2,6,23,0.82)" },
        ]}
      >
        <View
          style={[
            styles.modal,
            isMobile && styles.modalMobile,
            {
              maxHeight: Math.min(height * 0.88, 760),
              backgroundColor: modalBg,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}> 
            <View style={styles.headerIcon}>
              <Ionicons name="school-outline" size={24} color={colors.primary} />
            </View>

            <View style={styles.headerText}>
              <ThemedText style={[styles.title, { color: colors.text }]}> 
                Seleccionar carrera
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: muted }]}> 
                Elige la nueva carrera académica del estudiante.
              </ThemedText>
            </View>

            <Pressable
              onPress={cerrar}
              style={[
                styles.closeButton,
                { backgroundColor: surface, borderColor: colors.border },
              ]}
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <View
              style={[
                styles.searchBox,
                { backgroundColor: surface, borderColor: colors.border },
              ]}
            >
              <Ionicons name="search-outline" size={19} color={muted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por nombre, código o régimen..."
                placeholderTextColor={muted}
                style={[styles.searchInput, { color: colors.text }]}
              />
              {!!search && (
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={20} color={muted} />
                </Pressable>
              )}
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
            >
              {filtradas.length === 0 ? (
                <View
                  style={[
                    styles.empty,
                    { backgroundColor: surface, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="search-outline" size={34} color={muted} />
                  <ThemedText style={[styles.emptyTitle, { color: colors.text }]}> 
                    No se encontraron carreras
                  </ThemedText>
                </View>
              ) : (
                filtradas.map((carrera) => {
                  const id = Number(carrera.idCarrera);
                  const selected = Number(value) === id;
                  const actual = Number(idCarreraActual) === id;

                  return (
                    <Pressable
                      key={String(carrera.idCarrera)}
                      onPress={() => {
                        onChange(id);
                        cerrar();
                      }}
                      style={({ pressed }) => [
                        styles.option,
                        {
                          backgroundColor: selected
                            ? `${colors.primary}16`
                            : surface,
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                          opacity: pressed ? 0.76 : 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.optionIcon,
                          {
                            backgroundColor: selected
                              ? colors.primary
                              : colors.card,
                            borderColor: selected
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                      >
                        <Ionicons
                          name={selected ? "checkmark" : "school-outline"}
                          size={20}
                          color={selected ? colors.primaryForeground : colors.primary}
                        />
                      </View>

                      <View style={styles.optionText}>
                        <View style={styles.optionTitleRow}>
                          <ThemedText
                            numberOfLines={2}
                            style={[styles.optionTitle, { color: colors.text }]}
                          >
                            {carrera.nombreCarrera}
                          </ThemedText>

                          {actual && (
                            <View
                              style={[
                                styles.currentBadge,
                                { backgroundColor: `${colors.primary}18` },
                              ]}
                            >
                              <ThemedText
                                style={[
                                  styles.currentBadgeText,
                                  { color: colors.primary },
                                ]}
                              >
                                Actual
                              </ThemedText>
                            </View>
                          )}
                        </View>

                        <ThemedText style={[styles.optionMeta, { color: muted }]}> 
                          {carrera.codigo || "Sin código"} · {carrera.regimen || "Sin régimen"}
                          {carrera.tipo ? ` · ${carrera.tipo}` : ""}
                        </ThemedText>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={selected ? colors.primary : muted}
                      />
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "94%",
    maxWidth: 760,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  modalMobile: {
    width: "100%",
    borderRadius: 18,
  },
  header: {
    minHeight: 88,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.14)",
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "700",
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexShrink: 1,
    minHeight: 0,
    padding: 16,
    gap: 12,
  },
  searchBox: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    fontSize: 13,
    outlineStyle: "none" as any,
  },
  scroll: {
    flexGrow: 0,
  },
  list: {
    gap: 9,
    paddingBottom: 2,
  },
  option: {
    minHeight: 74,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    minWidth: 0,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  optionTitle: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "900",
  },
  optionMeta: {
    marginTop: 4,
    fontSize: 11.5,
    fontWeight: "700",
  },
  currentBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  empty: {
    minHeight: 180,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
});
