import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { Estudiante, MateriaSemestreUno } from "../types/asignaciones.types";

type Props = {
  visible: boolean;
  estudiante: Estudiante | null;
  materias: MateriaSemestreUno[];
  loading: boolean;
  inscribiendo: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function InscribirModal({
  visible,
  estudiante,
  materias,
  loading,
  inscribiendo,
  onClose,
  onConfirm,
}: Props) {
  const { theme } = useTheme();

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const modalBg = isDark ? "#111827" : theme.colors.card;
  const softBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(15,23,42,0.035)";
  const softBgStrong = isDark
    ? "rgba(255,255,255,0.075)"
    : "rgba(15,23,42,0.055)";
  const border = isDark ? "rgba(255,255,255,0.11)" : "rgba(15,23,42,0.11)";

  const cargandoDatos = loading || !estudiante;

  const materiasPendientes = materias.filter((m) => !m.yaInscrito);
  const materiasYaInscritas = materias.filter((m) => m.yaInscrito);

  const nombre = estudiante
    ? `${estudiante.nombres} ${estudiante.apellidoPaterno} ${
        estudiante.apellidoMaterno ?? ""
      }`.trim()
    : "";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={inscribiendo ? undefined : onClose}
    >
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
                <Ionicons
                  name="school-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.title, { color: strongText }]}>
                  Inscribir semestre 1
                </ThemedText>

                <ThemedText
                  numberOfLines={1}
                  style={[styles.studentName, { color: mutedText }]}
                >
                  {cargandoDatos ? "Preparando datos..." : nombre}
                </ThemedText>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              disabled={inscribiendo}
              style={({ pressed }) => [
                styles.closeBtn,
                {
                  backgroundColor: softBgStrong,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Ionicons name="close" size={22} color={strongText} />
            </Pressable>
          </View>

          {cargandoDatos ? (
            <View style={styles.loadingBox}>
              <View
                style={[
                  styles.loadingCircle,
                  { backgroundColor: softBgStrong },
                ]}
              >
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>

              <ThemedText style={[styles.loadingTitle, { color: strongText }]}>
                Cargando datos
              </ThemedText>

              <ThemedText
                style={[styles.loadingSubtitle, { color: mutedText }]}
              >
                Espera un momento...
              </ThemedText>
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.resumeBox,
                  {
                    backgroundColor: softBg,
                    borderColor: border,
                  },
                ]}
              >
                <View style={styles.resumeItem}>
                  <ThemedText
                    style={[
                      styles.resumeNumber,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {materiasPendientes.length}
                  </ThemedText>
                  <ThemedText
                    style={[styles.resumeLabel, { color: mutedText }]}
                  >
                    pendientes
                  </ThemedText>
                </View>

                <View
                  style={[styles.resumeDivider, { backgroundColor: border }]}
                />

                <View style={styles.resumeItem}>
                  <ThemedText
                    style={[styles.resumeNumber, { color: "#22C55E" }]}
                  >
                    {materiasYaInscritas.length}
                  </ThemedText>
                  <ThemedText
                    style={[styles.resumeLabel, { color: mutedText }]}
                  >
                    ya inscritas
                  </ThemedText>
                </View>

                <View
                  style={[styles.resumeDivider, { backgroundColor: border }]}
                />

                <View style={styles.resumeTextBox}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <ThemedText style={[styles.resumeText, { color: mutedText }]}>
                    Se inscribirá automáticamente a materias activas con grupo
                    activo.
                  </ThemedText>
                </View>
              </View>

              <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.sectionHeader}>
                  <ThemedText
                    style={[styles.sectionTitle, { color: strongText }]}
                  >
                    Materias que se van a inscribir
                  </ThemedText>

                  <View
                    style={[
                      styles.countBadge,
                      {
                        backgroundColor: isDark
                          ? "rgba(59,130,246,0.18)"
                          : "#DBEAFE",
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.countBadgeText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {materiasPendientes.length}
                    </ThemedText>
                  </View>
                </View>

                {materiasPendientes.length === 0 ? (
                  <View
                    style={[
                      styles.emptyState,
                      {
                        backgroundColor: softBg,
                        borderColor: border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-done-circle-outline"
                      size={38}
                      color="#22C55E"
                    />
                    <ThemedText
                      style={[styles.emptyTitle, { color: strongText }]}
                    >
                      No hay materias pendientes
                    </ThemedText>
                    <ThemedText
                      style={[styles.emptyText, { color: mutedText }]}
                    >
                      Ya está inscrito o no hay grupos activos disponibles.
                    </ThemedText>
                  </View>
                ) : (
                  materiasPendientes.map((m) => (
                    <MateriaCard
                      key={m.idMateria}
                      materia={m}
                      status="Pendiente"
                      statusColor={theme.colors.primary}
                      backgroundColor={softBg}
                      borderColor={border}
                      strongText={strongText}
                      mutedText={mutedText}
                    />
                  ))
                )}

                {materiasYaInscritas.length > 0 && (
                  <>
                    <View style={[styles.sectionHeader, { marginTop: 12 }]}>
                      <ThemedText
                        style={[styles.sectionTitle, { color: strongText }]}
                      >
                        Ya inscritas
                      </ThemedText>

                      <View
                        style={[
                          styles.countBadge,
                          {
                            backgroundColor: isDark
                              ? "rgba(34,197,94,0.16)"
                              : "#DCFCE7",
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.countBadgeText,
                            { color: "#22C55E" },
                          ]}
                        >
                          {materiasYaInscritas.length}
                        </ThemedText>
                      </View>
                    </View>

                    {materiasYaInscritas.map((m) => (
                      <MateriaCard
                        key={`ya-${m.idMateria}`}
                        materia={m}
                        status="Inscrita"
                        statusColor="#22C55E"
                        backgroundColor={softBg}
                        borderColor={border}
                        strongText={strongText}
                        mutedText={mutedText}
                      />
                    ))}
                  </>
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
                  disabled={inscribiendo}
                >
                  <ThemedText
                    style={[styles.cancelText, { color: strongText }]}
                  >
                    Cancelar
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.confirmBtn,
                    {
                      backgroundColor:
                        materiasPendientes.length === 0 || inscribiendo
                          ? isDark
                            ? "rgba(255,255,255,0.12)"
                            : "#CBD5E1"
                          : theme.colors.primary,
                      opacity: pressed ? 0.82 : 1,
                    },
                  ]}
                  onPress={onConfirm}
                  disabled={materiasPendientes.length === 0 || inscribiendo}
                >
                  {inscribiendo ? (
                    <>
                      <ActivityIndicator color="#fff" />
                      <ThemedText style={styles.confirmText}>
                        Inscribiendo...
                      </ThemedText>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={19}
                        color="#fff"
                      />
                      <ThemedText style={styles.confirmText}>
                        Aceptar e inscribir
                      </ThemedText>
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

function MateriaCard({
  materia,
  status,
  statusColor,
  backgroundColor,
  borderColor,
  strongText,
  mutedText,
}: {
  materia: MateriaSemestreUno;
  status: string;
  statusColor: string;
  backgroundColor: string;
  borderColor: string;
  strongText: string;
  mutedText: string;
}) {
  return (
    <View
      style={[
        styles.materiaCard,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <View style={[styles.materiaIcon, { backgroundColor: `${statusColor}22` }]}>
        <Ionicons
          name={status === "Inscrita" ? "checkmark-done-outline" : "book-outline"}
          size={20}
          color={statusColor}
        />
      </View>

      <View style={styles.materiaContent}>
        <ThemedText
          numberOfLines={1}
          style={[styles.materiaTitle, { color: strongText }]}
        >
          {materia.nombreMateria}
        </ThemedText>

        <ThemedText
          numberOfLines={1}
          style={[styles.materiaSubtitle, { color: mutedText }]}
        >
          {materia.codigoMateria} · {materia.nombreCarrera}
        </ThemedText>

        {!materia.yaInscrito && materia.grupoSeleccionado && (
          <View style={styles.groupInfo}>
            <View style={styles.groupChip}>
              <Ionicons name="people-outline" size={13} color={mutedText} />
              <ThemedText
                numberOfLines={1}
                style={[styles.groupText, { color: mutedText }]}
              >
                {materia.grupoSeleccionado.nombreGrupo}
              </ThemedText>
            </View>

            <View style={styles.groupChip}>
              <Ionicons name="albums-outline" size={13} color={mutedText} />
              <ThemedText style={[styles.groupText, { color: mutedText }]}>
                Paralelo {materia.grupoSeleccionado.paralelo}
              </ThemedText>
            </View>

            <View style={styles.groupChip}>
              <Ionicons name="time-outline" size={13} color={mutedText} />
              <ThemedText style={[styles.groupText, { color: mutedText }]}>
                {materia.grupoSeleccionado.turno}
              </ThemedText>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
        <ThemedText style={[styles.statusText, { color: statusColor }]}>
          {status}
        </ThemedText>
      </View>
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
    maxWidth: 860,
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
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
  },
  studentName: {
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
    minHeight: 430,
    paddingVertical: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCircle: {
    width: 68,
    height: 68,
    borderRadius: 24,
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
  resumeBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  resumeItem: {
    minWidth: 82,
    alignItems: "center",
  },
  resumeNumber: {
    fontSize: 24,
    fontWeight: "900",
  },
  resumeLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 1,
    textTransform: "uppercase",
  },
  resumeDivider: {
    width: 1,
    height: 38,
  },
  resumeTextBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    minWidth: 0,
  },
  resumeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  list: {
    maxHeight: 430,
  },
  listContent: {
    paddingBottom: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
  },
  countBadge: {
    minWidth: 34,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: "900",
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 10,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  materiaCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  materiaIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  materiaContent: {
    flex: 1,
    minWidth: 0,
  },
  materiaTitle: {
    fontSize: 15.5,
    fontWeight: "900",
  },
  materiaSubtitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "700",
  },
  groupInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 9,
  },
  groupChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: 210,
  },
  groupText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "900",
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
  confirmBtn: {
    minHeight: 46,
    borderRadius: 15,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
});