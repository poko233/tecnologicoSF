import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import {
  Estudiante,
  SeleccionMateriaInscripcion,
} from "../types/asignaciones.types";
import { ordenarMateriasAsignacionPorPlan } from "../utils/ordenPlanEstudios";

type Props = {
  visible: boolean;
  estudiante: Estudiante | null;
  nombreCarrera: string;
  agregar: SeleccionMateriaInscripcion[];
  quitar: SeleccionMateriaInscripcion[];
  guardando: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

function nombreCompleto(estudiante: Estudiante | null): string {
  if (!estudiante) return "";

  return `${estudiante.nombres ?? ""} ${estudiante.apellidoPaterno ?? ""} ${
    estudiante.apellidoMaterno ?? ""
  }`
    .replace(/\s+/g, " ")
    .trim();
}

function ordenar(
  selecciones: SeleccionMateriaInscripcion[],
  nombreCarrera: string,
): SeleccionMateriaInscripcion[] {
  return ordenarMateriasAsignacionPorPlan(selecciones, {
    nombreCarrera,
  });
}

function formatearFechaMateria(value?: string | null): string {
  if (!value) return "Sin fecha";

  const limpia = String(value).split("T")[0].split(" ")[0];
  const partes = limpia.split("-");

  if (partes.length !== 3) return limpia;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export default function ConfirmarInscripcionModal({
  visible,
  estudiante,
  nombreCarrera,
  agregar,
  quitar,
  guardando,
  onClose,
  onConfirm,
}: Props) {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const isMobile = width < 650;
  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const background = isDark ? "#111827" : theme.colors.card;
  const panel = isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.04)";
  const border = isDark
    ? "rgba(255,255,255,0.12)"
    : "rgba(15,23,42,0.12)";

  const agregarOrdenadas = ordenar(agregar, nombreCarrera);
  const quitarOrdenadas = ordenar(quitar, nombreCarrera);
  const total = agregar.length + quitar.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={guardando ? undefined : onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modal,
            isMobile && styles.modalMobile,
            {
              maxHeight: Math.min(height * 0.9, 800),
              backgroundColor: background,
              borderColor: border,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: border }]}>
            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor: isDark
                    ? "rgba(245,158,11,0.16)"
                    : "#FEF3C7",
                },
              ]}
            >
              <Ionicons name="help-circle-outline" size={28} color="#F59E0B" />
            </View>

            <View style={styles.headerText}>
              <ThemedText style={[styles.title, { color: strongText }]}>
                ¿Guardar cambios de inscripción?
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: mutedText }]}>
                Revisa las materias que se agregarán y las que se retirarán.
              </ThemedText>
            </View>

            <Pressable
              disabled={guardando}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                {
                  backgroundColor: panel,
                  opacity: pressed || guardando ? 0.6 : 1,
                },
              ]}
            >
              <Ionicons name="close" size={23} color={strongText} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator
          >
            <View
              style={[
                styles.studentCard,
                { backgroundColor: panel, borderColor: border },
              ]}
            >
              <View
                style={[
                  styles.studentIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(59,130,246,0.16)"
                      : "#DBEAFE",
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={23}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.studentText}>
                <ThemedText style={[styles.studentName, { color: strongText }]}>
                  {nombreCompleto(estudiante)}
                </ThemedText>
                <ThemedText
                  numberOfLines={2}
                  style={[styles.studentMeta, { color: mutedText }]}
                >
                  {nombreCarrera}
                </ThemedText>
              </View>

              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(59,130,246,0.16)"
                      : "#EFF6FF",
                  },
                ]}
              >
                <ThemedText
                  style={[styles.countBadgeText, { color: theme.colors.primary }]}
                >
                  {total} cambio{total === 1 ? "" : "s"}
                </ThemedText>
              </View>
            </View>

            {agregarOrdenadas.length > 0 && (
              <ChangeSection
                title="Materias que se agregarán"
                description="Se crearán nuevas relaciones en InscripcionMateria."
                icon="add-circle-outline"
                color="#16A34A"
                items={agregarOrdenadas}
                panel={panel}
                border={border}
                strongText={strongText}
                mutedText={mutedText}
              />
            )}

            {quitarOrdenadas.length > 0 && (
              <ChangeSection
                title="Materias que se retirarán"
                description="Se eliminarán de la inscripción activa del estudiante."
                icon="remove-circle-outline"
                color="#DC2626"
                items={quitarOrdenadas}
                panel={panel}
                border={border}
                strongText={strongText}
                mutedText={mutedText}
              />
            )}

            <View
              style={[
                styles.warning,
                {
                  backgroundColor: isDark
                    ? "rgba(245,158,11,0.10)"
                    : "#FFFBEB",
                  borderColor: isDark
                    ? "rgba(245,158,11,0.32)"
                    : "#FDE68A",
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={21}
                color="#F59E0B"
              />
              <ThemedText style={[styles.warningText, { color: strongText }]}>
                Si se retira la última materia de un grupo, se elimina esa
                inscripción y se devuelve un cupo. La inscripción podrá volver
                a editarse después.
              </ThemedText>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: border }]}>
            <Pressable
              disabled={guardando}
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelButton,
                {
                  backgroundColor: panel,
                  borderColor: border,
                  opacity: pressed || guardando ? 0.65 : 1,
                },
              ]}
            >
              <ThemedText
                style={[styles.cancelButtonText, { color: strongText }]}
              >
                Volver
              </ThemedText>
            </Pressable>

            <Pressable
              disabled={guardando || total === 0}
              onPress={() => void onConfirm()}
              style={({ pressed }) => [
                styles.confirmButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity:
                    guardando || total === 0 ? 0.55 : pressed ? 0.8 : 1,
                },
              ]}
            >
              {guardando ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="save-outline" size={20} color="#FFFFFF" />
              )}
              <ThemedText style={styles.confirmButtonText}>
                {guardando ? "Guardando..." : "Sí, guardar cambios"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ChangeSection({
  title,
  description,
  icon,
  color,
  items,
  panel,
  border,
  strongText,
  mutedText,
}: {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  items: SeleccionMateriaInscripcion[];
  panel: string;
  border: string;
  strongText: string;
  mutedText: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: `${color}1C` }]}>
          <Ionicons name={icon} size={21} color={color} />
        </View>
        <View style={styles.sectionHeaderText}>
          <ThemedText style={[styles.sectionTitle, { color: strongText }]}>
            {title}
          </ThemedText>
          <ThemedText style={[styles.sectionDescription, { color: mutedText }]}>
            {description}
          </ThemedText>
        </View>
        <View style={[styles.sectionCount, { backgroundColor: `${color}16` }]}>
          <ThemedText style={[styles.sectionCountText, { color }]}>
            {items.length}
          </ThemedText>
        </View>
      </View>

      <View style={styles.list}>
        {items.map((seleccion, index) => (
          <View
            key={`${seleccion.idMateria}-${seleccion.idGrupoMateriaDocente}`}
            style={[
              styles.subjectRow,
              { backgroundColor: panel, borderColor: border },
            ]}
          >
            <View style={[styles.numberBadge, { backgroundColor: color }]}>
              <ThemedText style={styles.numberText}>{index + 1}</ThemedText>
            </View>

            <View style={styles.subjectText}>
              <ThemedText
                numberOfLines={2}
                style={[styles.subjectName, { color: strongText }]}
              >
                {seleccion.nombreMateria}
              </ThemedText>
              <ThemedText style={[styles.subjectCode, { color: mutedText }]}>
                {seleccion.codigoMateria}
              </ThemedText>

              <View style={styles.metaWrap}>
                <MetaPill
                  icon="layers-outline"
                  text={seleccion.nivelLabel}
                  color={color}
                />
                <MetaPill
                  icon="time-outline"
                  text={seleccion.turno}
                  color={color}
                />
                <MetaPill
                  icon="people-outline"
                  text={`${seleccion.nombreGrupo} · Paralelo ${seleccion.paralelo}`}
                  color={color}
                />
                <MetaPill
                  icon="calendar-outline"
                  text={`Inicio materia ${formatearFechaMateria(seleccion.fechaInicio)}`}
                  color={color}
                />
                <MetaPill
                  icon="calendar-number-outline"
                  text={`Fin materia ${formatearFechaMateria(seleccion.fechaFin)}`}
                  color={color}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function MetaPill({
  icon,
  text,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color: string;
}) {
  return (
    <View style={[styles.metaPill, { backgroundColor: `${color}14` }]}>
      <Ionicons name={icon} size={13} color={color} />
      <ThemedText numberOfLines={1} style={[styles.metaPillText, { color }]}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.84)",
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "94%",
    maxWidth: 900,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.34,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 18,
  },
  modalMobile: { width: "100%", borderRadius: 19 },
  header: {
    minHeight: 90,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, minWidth: 0 },
  title: { fontSize: 21, fontWeight: "900" },
  subtitle: { marginTop: 4, fontSize: 11.5, lineHeight: 16, fontWeight: "700" },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flexGrow: 0 },
  content: { padding: 18, gap: 18 },
  studentCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  studentIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  studentText: { flex: 1, minWidth: 0 },
  studentName: { fontSize: 14, fontWeight: "900" },
  studentMeta: { marginTop: 3, fontSize: 11, fontWeight: "700" },
  countBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  countBadgeText: { fontSize: 11, fontWeight: "900" },
  section: { gap: 11 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeaderText: { flex: 1, minWidth: 0 },
  sectionTitle: { fontSize: 14.5, fontWeight: "900" },
  sectionDescription: { marginTop: 2, fontSize: 10.5, fontWeight: "700" },
  sectionCount: {
    minWidth: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCountText: { fontSize: 12, fontWeight: "900" },
  list: { gap: 9 },
  subjectRow: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  subjectText: { flex: 1, minWidth: 0 },
  subjectName: { fontSize: 13.5, lineHeight: 18, fontWeight: "900" },
  subjectCode: { marginTop: 2, fontSize: 10.5, fontWeight: "700" },
  metaWrap: { marginTop: 9, flexDirection: "row", flexWrap: "wrap", gap: 7 },
  metaPill: {
    maxWidth: "100%",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaPillText: { fontSize: 9.5, fontWeight: "900" },
  warning: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  warningText: { flex: 1, fontSize: 10.5, lineHeight: 15, fontWeight: "700" },
  footer: {
    borderTopWidth: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: { fontSize: 12.5, fontWeight: "900" },
  confirmButton: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmButtonText: { color: "#FFFFFF", fontSize: 12.5, fontWeight: "900" },
});