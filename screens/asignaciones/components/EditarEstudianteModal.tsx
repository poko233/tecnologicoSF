import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import {
    DetalleEstudianteResponse,
    Estudiante,
    EstudianteForm,
} from "../types/asignaciones.types";

type Props = {
  visible: boolean;
  estudiante: Estudiante | null;
  detalle: DetalleEstudianteResponse | null;
  loading: boolean;
  guardando: boolean;
  onClose: () => void;
  onSave: (form: EstudianteForm) => void;
};

const initialForm: EstudianteForm = {
  apellidoPaterno: "",
  apellidoMaterno: "",
  nombres: "",
  genero: "MASCULINO",
  ci: "",
  expedido: "",
  fecha_nac: "",
  email: "",
  telefono: "",
  celular: "",
  direccion: "",
  estado: "ACTIVO",
};

export default function EditarEstudianteModal({
  visible,
  estudiante,
  detalle,
  loading,
  guardando,
  onClose,
  onSave,
}: Props) {
  const { theme } = useTheme();

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const modalBg = isDark ? "#111827" : theme.colors.card;
  const softBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(15,23,42,0.035)";
  const softStrong = isDark ? "rgba(255,255,255,0.075)" : "rgba(15,23,42,0.055)";
  const border = isDark ? "rgba(255,255,255,0.11)" : "rgba(15,23,42,0.11)";

  const [form, setForm] = useState<EstudianteForm>(initialForm);

  const e = detalle?.estudiante ?? estudiante;

  useEffect(() => {
    if (visible && e) {
      setForm({
        apellidoPaterno: e.apellidoPaterno ?? "",
        apellidoMaterno: e.apellidoMaterno ?? "",
        nombres: e.nombres ?? "",
        genero:
          e.genero === "Femenino" || e.genero === "FEMENINO"
            ? "FEMENINO"
            : "MASCULINO",
        ci: e.ci ?? "",
        expedido: e.expedido ?? "",
        fecha_nac: e.fecha_nac ?? "",
        email: e.email ?? "",
        telefono: e.telefono ?? "",
        celular: e.celular ?? "",
        direccion: e.direccion ?? "",
        estado: e.estado ?? "ACTIVO",
      });
    }
  }, [visible, e]);

  const update = (key: keyof EstudianteForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const nombreCompleto = `${form.nombres} ${form.apellidoPaterno} ${form.apellidoMaterno}`.trim();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: modalBg,
              borderColor: border,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(59,130,246,0.18)"
                      : "#DBEAFE",
                  },
                ]}
              >
                <Ionicons name="create-outline" size={25} color={theme.colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.title, { color: strongText }]}>
                  Editar estudiante
                </ThemedText>
                <ThemedText numberOfLines={1} style={[styles.subtitle, { color: mutedText }]}>
                  {nombreCompleto || "Modifica sus datos y revisa sus materias inscritas."}
                </ThemedText>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              disabled={guardando}
              style={({ pressed }) => [
                styles.closeBtn,
                {
                  backgroundColor: softStrong,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Ionicons name="close" size={23} color={strongText} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <View style={[styles.loadingCircle, { backgroundColor: softStrong }]}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
              <ThemedText style={[styles.loadingTitle, { color: strongText }]}>
                Cargando datos
              </ThemedText>
              <ThemedText style={[styles.loadingSubtitle, { color: mutedText }]}>
                Espera un momento...
              </ThemedText>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={[
                    styles.summaryBox,
                    {
                      backgroundColor: softBg,
                      borderColor: border,
                    },
                  ]}
                >
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
                    <ThemedText style={[styles.avatarText, { color: theme.colors.primary }]}>
                      {(form.nombres || "E").charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <ThemedText numberOfLines={1} style={[styles.summaryName, { color: strongText }]}>
                      {nombreCompleto || "Sin nombre"}
                    </ThemedText>
                    <ThemedText numberOfLines={1} style={[styles.summaryText, { color: mutedText }]}>
                      CI: {form.ci || "Sin CI"} · {form.email || "Sin email"}
                    </ThemedText>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          form.estado === "ACTIVO"
                            ? "rgba(34,197,94,0.18)"
                            : "rgba(239,68,68,0.18)",
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.statusText,
                        {
                          color: form.estado === "ACTIVO" ? "#22C55E" : "#EF4444",
                        },
                      ]}
                    >
                      {form.estado || "Sin estado"}
                    </ThemedText>
                  </View>
                </View>

                <SectionTitle title="Datos del estudiante" color={strongText} />

                <View style={styles.formGrid}>
                  <Input label="Nombres" value={form.nombres} onChangeText={(v) => update("nombres", v)} />
                  <Input label="Apellido paterno" value={form.apellidoPaterno} onChangeText={(v) => update("apellidoPaterno", v)} />
                  <Input label="Apellido materno" value={form.apellidoMaterno} onChangeText={(v) => update("apellidoMaterno", v)} />
                  <Input label="CI" value={form.ci} onChangeText={(v) => update("ci", v)} />
                  <Input label="Expedido" value={form.expedido} onChangeText={(v) => update("expedido", v)} />
                  <Input label="Fecha nacimiento" value={form.fecha_nac} onChangeText={(v) => update("fecha_nac", v)} />
                  <Input label="Email" value={form.email} onChangeText={(v) => update("email", v)} />
                  <Input label="Celular" value={form.celular} onChangeText={(v) => update("celular", v)} />
                  <Input label="Teléfono" value={form.telefono} onChangeText={(v) => update("telefono", v)} />
                  <Input label="Dirección" value={form.direccion} onChangeText={(v) => update("direccion", v)} full />
                </View>

                <View style={styles.selectorRow}>
                  <GenderButton
                    label="Masculino"
                    icon="male-outline"
                    active={form.genero === "MASCULINO"}
                    onPress={() => update("genero", "MASCULINO")}
                    color={theme.colors.primary}
                    border={border}
                    bg={softBg}
                    strongText={strongText}
                  />

                  <GenderButton
                    label="Femenino"
                    icon="female-outline"
                    active={form.genero === "FEMENINO"}
                    onPress={() => update("genero", "FEMENINO")}
                    color="#EC4899"
                    border={border}
                    bg={softBg}
                    strongText={strongText}
                  />
                </View>

                <SectionTitle title="Materias inscritas" color={strongText} />

                {!detalle || detalle.inscripciones.length === 0 ? (
                  <View
                    style={[
                      styles.emptyBox,
                      {
                        backgroundColor: softBg,
                        borderColor: border,
                      },
                    ]}
                  >
                    <Ionicons name="library-outline" size={24} color={mutedText} />
                    <ThemedText style={[styles.emptyText, { color: mutedText }]}>
                      Todavía no tiene materias inscritas.
                    </ThemedText>
                  </View>
                ) : (
                  detalle.inscripciones.map((i) => (
                    <View
                      key={i.idInscripcion}
                      style={[
                        styles.itemCard,
                        {
                          borderColor: border,
                          backgroundColor: softBg,
                        },
                      ]}
                    >
                      <View style={[styles.itemIcon, { backgroundColor: "rgba(34,197,94,0.16)" }]}>
                        <Ionicons name="book-outline" size={20} color="#22C55E" />
                      </View>

                      <View style={{ flex: 1 }}>
                        <ThemedText style={[styles.itemTitle, { color: strongText }]}>
                          {i.nombreMateria ?? "Materia sin dato"}
                        </ThemedText>

                        <ThemedText style={[styles.itemText, { color: mutedText }]}>
                          Grupo: {i.nombreGrupo} · Paralelo {i.paralelo} · Turno {i.turno}
                        </ThemedText>

                        <ThemedText style={[styles.itemText, { color: mutedText }]}>
                          Semestre {i.semestre} · {i.nombreCarrera ?? "Sin carrera"}
                        </ThemedText>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>

              <View style={[styles.footer, { borderTopColor: border }]}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    {
                      borderColor: border,
                      backgroundColor: softBg,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                  onPress={onClose}
                  disabled={guardando}
                >
                  <ThemedText style={[styles.cancelText, { color: strongText }]}>
                    Cancelar
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.saveBtn,
                    {
                      backgroundColor: theme.colors.primary,
                      opacity: pressed || guardando ? 0.82 : 1,
                    },
                  ]}
                  onPress={() => onSave(form)}
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <ActivityIndicator color="#fff" />
                      <ThemedText style={styles.saveText}>Guardando...</ThemedText>
                    </>
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={18} color="#fff" />
                      <ThemedText style={styles.saveText}>Guardar cambios</ThemedText>
                    </>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Input({
  label,
  value,
  onChangeText,
  full = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  full?: boolean;
}) {
  const { theme } = useTheme();

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const bg = isDark ? "rgba(15,23,42,0.72)" : "#F8FAFC";
  const border = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)";

  return (
    <View style={[styles.inputBox, full && styles.inputBoxFull]}>
      <ThemedText style={[styles.inputLabel, { color: mutedText }]}>
        {label}
      </ThemedText>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={mutedText}
        style={[
          styles.input,
          {
            color: strongText,
            borderColor: border,
            backgroundColor: bg,
          },
        ]}
      />
    </View>
  );
}

function GenderButton({
  label,
  icon,
  active,
  onPress,
  color,
  border,
  bg,
  strongText,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
  color: string;
  border: string;
  bg: string;
  strongText: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.genderBtn,
        {
          backgroundColor: active ? color : bg,
          borderColor: active ? color : border,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={active ? "#fff" : color} />
      <ThemedText
        style={[
          styles.genderText,
          {
            color: active ? "#fff" : strongText,
          },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

function SectionTitle({ title, color }: { title: string; color: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionDot} />
      <ThemedText style={[styles.sectionTitle, { color }]}>{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.72)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 980,
    maxHeight: "92%",
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 25,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "700",
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingBox: {
    paddingVertical: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  loadingTitle: {
    fontSize: 17,
    fontWeight: "900",
  },
  loadingSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
  },
  scroll: {
    maxHeight: 650,
  },
  scrollContent: {
    paddingBottom: 6,
  },
  summaryBox: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "900",
  },
  summaryName: {
    fontSize: 17,
    fontWeight: "900",
  },
  summaryText: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "900",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionDot: {
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: "#3B82F6",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  inputBox: {
    minWidth: 230,
    flexGrow: 1,
    flexBasis: "31%",
  },
  inputBoxFull: {
    flexBasis: "100%",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 7,
    textTransform: "uppercase",
    letterSpacing: 0.35,
  },
  input: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: "700",
    outlineStyle: "none" as any,
  },
  selectorRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  genderBtn: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  genderText: {
    fontSize: 14,
    fontWeight: "900",
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  itemText: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "700",
  },
  emptyBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
  cancelBtn: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "900",
  },
  saveBtn: {
    minHeight: 46,
    borderRadius: 15,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
});