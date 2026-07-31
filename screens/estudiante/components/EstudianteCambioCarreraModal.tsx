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
    CarreraEstudiante,
    ImpactoCambioCarreraEstudiante,
} from "../types/estudiante.types";

type Props = {
  visible: boolean;
  carreraActual: CarreraEstudiante | null;
  carreraNueva: CarreraEstudiante | null;
  impacto: ImpactoCambioCarreraEstudiante | null;
  guardando: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

type ThemePalette = {
  background: string;
  modal: string;
  card: string;
  elevated: string;
  soft: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryForeground: string;
  warning: string;
  destructive: string;
  success: string;
  overlay: string;
};

function isHexColor(value?: string | null): boolean {
  return /^#[0-9a-f]{6}$/i.test(String(value ?? "").trim());
}

function colorWithAlpha(
  value: string | undefined,
  alphaHex: string,
  fallback: string,
): string {
  return isHexColor(value) ? `${value}${alphaHex}` : fallback;
}

function buildPalette(colors: any): ThemePalette {
  const rawBackground = String(colors.background ?? "#0B1220");
  const rawCard = String(colors.card ?? "#111827");

  const isDark =
    colors.scheme === "dark" ||
    colors.isDark === true ||
    rawBackground.toLowerCase().includes("0b") ||
    rawBackground.toLowerCase().includes("0f") ||
    rawCard.toLowerCase().includes("11") ||
    rawCard.toLowerCase().includes("1e");

  const primary = colors.primary || "#EF4444";
  const warning = colors.warning || "#F59E0B";
  const destructive = colors.destructive || "#F43F5E";
  const success = colors.success || "#22C55E";

  if (isDark) {
    return {
      background: "#08101F",
      modal: colors.modal || "#111C30",
      card: colors.card || "#17243A",
      elevated: "#0B162A",
      soft: "rgba(255,255,255,0.055)",
      border: "rgba(148,163,184,0.24)",
      borderStrong: "rgba(148,163,184,0.38)",
      text: "#F8FAFC",
      textSecondary: "#CBD5E1",
      textMuted: "#94A3B8",
      primary,
      primaryForeground: colors.primaryForeground || "#FFFFFF",
      warning,
      destructive,
      success,
      overlay: colors.overlay || "rgba(2,6,23,0.88)",
    };
  }

  return {
    background: colors.background || "#F8FAFC",
    modal: colors.modal || "#FFFFFF",
    card: colors.card || "#FFFFFF",
    elevated: "#F8FAFC",
    soft: "rgba(15,23,42,0.045)",
    border: colors.border || "#E2E8F0",
    borderStrong: "#CBD5E1",
    text: colors.text || "#0F172A",
    textSecondary: colors.textSecondary || "#475569",
    textMuted: colors.textMuted || colors.muted || "#64748B",
    primary,
    primaryForeground: colors.primaryForeground || "#FFFFFF",
    warning,
    destructive,
    success,
    overlay: colors.overlay || "rgba(15,23,42,0.72)",
  };
}

export default function EstudianteCambioCarreraModal({
  visible,
  carreraActual,
  carreraNueva,
  impacto,
  guardando,
  onClose,
  onConfirm,
}: Props) {
  const { theme } = useTheme();
  const palette = buildPalette(theme.colors as any);
  const { width, height } = useWindowDimensions();

  const isMobile = width < 680;
  const hasActiveEnrollment = Boolean(
    impacto?.tieneInscripcionGestionActiva ||
      Number(impacto?.totalMateriasActivas ?? 0) > 0,
  );

  const gestiones = Array.isArray(impacto?.gestionesActivas)
    ? impacto.gestionesActivas
    : [];

  const close = () => {
    if (guardando) return;
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={guardando ? undefined : close}
    >
      <View style={[styles.overlay, { backgroundColor: palette.overlay }]}> 
        <View
          style={[
            styles.modal,
            isMobile && styles.modalMobile,
            {
              maxHeight: Math.min(height * 0.94, 860),
              backgroundColor: palette.modal,
              borderColor: colorWithAlpha(
                palette.destructive,
                "B8",
                "rgba(244,63,94,0.72)",
              ),
            },
          ]}
        >
          <View
            style={[
              styles.header,
              {
                backgroundColor: palette.card,
                borderBottomColor: palette.border,
              },
            ]}
          >
            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor: colorWithAlpha(
                    palette.destructive,
                    "18",
                    "rgba(244,63,94,0.14)",
                  ),
                  borderColor: colorWithAlpha(
                    palette.destructive,
                    "55",
                    "rgba(244,63,94,0.34)",
                  ),
                },
              ]}
            >
              <Ionicons
                name="warning-outline"
                size={29}
                color={palette.destructive}
              />
            </View>

            <View style={styles.headerText}>
              <ThemedText style={[styles.title, { color: palette.text }]}> 
                Confirmar cambio de carrera
              </ThemedText>

              <ThemedText
                style={[styles.subtitle, { color: palette.textSecondary }]}
              >
                Esta operación modifica la inscripción académica actual del
                estudiante.
              </ThemedText>
            </View>

            <Pressable
              disabled={guardando}
              onPress={close}
              style={({ pressed }) => [
                styles.closeButton,
                {
                  backgroundColor: palette.elevated,
                  borderColor: palette.border,
                  opacity: guardando ? 0.45 : pressed ? 0.72 : 1,
                },
              ]}
            >
              <Ionicons name="close" size={23} color={palette.text} />
            </Pressable>
          </View>

          <ScrollView
            style={[styles.scroll, { backgroundColor: palette.modal }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator
            persistentScrollbar
          >
            <View
              style={[
                styles.routeCard,
                {
                  backgroundColor: palette.elevated,
                  borderColor: palette.borderStrong,
                },
              ]}
            >
              <CareerBox
                label="Carrera actual"
                value={carreraActual?.nombreCarrera || "Sin carrera"}
                icon="school-outline"
                accent={palette.destructive}
                text={palette.text}
                muted={palette.textMuted}
              />

              <View
                style={[
                  styles.arrowBox,
                  {
                    backgroundColor: colorWithAlpha(
                      palette.warning,
                      "16",
                      "rgba(245,158,11,0.12)",
                    ),
                    borderColor: colorWithAlpha(
                      palette.warning,
                      "55",
                      "rgba(245,158,11,0.34)",
                    ),
                  },
                ]}
              >
                <Ionicons
                  name={isMobile ? "arrow-down" : "arrow-forward"}
                  size={25}
                  color={palette.warning}
                />
              </View>

              <CareerBox
                label="Nueva carrera"
                value={carreraNueva?.nombreCarrera || "Sin seleccionar"}
                icon="flag-outline"
                accent={palette.primary}
                text={palette.text}
                muted={palette.textMuted}
              />
            </View>

            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: colorWithAlpha(
                    palette.warning,
                    "12",
                    "rgba(245,158,11,0.10)",
                  ),
                  borderColor: colorWithAlpha(
                    palette.warning,
                    "88",
                    "rgba(245,158,11,0.52)",
                  ),
                },
              ]}
            >
              <View
                style={[
                  styles.warningIcon,
                  {
                    backgroundColor: colorWithAlpha(
                      palette.warning,
                      "20",
                      "rgba(245,158,11,0.16)",
                    ),
                  },
                ]}
              >
                <Ionicons
                  name="alert-circle"
                  size={23}
                  color={palette.warning}
                />
              </View>

              <View style={styles.warningTextBox}>
                <ThemedText
                  style={[styles.warningTitle, { color: palette.text }]}
                >
                  {hasActiveEnrollment
                    ? "El estudiante tiene materias en una gestión activa"
                    : "Se cambiará la carrera principal del estudiante"}
                </ThemedText>

                <ThemedText
                  style={[
                    styles.warningText,
                    { color: palette.textSecondary },
                  ]}
                >
                  {hasActiveEnrollment
                    ? "Al continuar, se devolverán los cupos ocupados y se depurará la información académica asociada a la carrera anterior."
                    : "No se encontraron materias activas, pero se depurará la información académica vinculada únicamente a la carrera anterior."}
                </ThemedText>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <StatCard
                icon="book-outline"
                label="Materias activas"
                value={impacto?.totalMateriasActivas ?? 0}
                accent={palette.destructive}
                palette={palette}
              />

              <StatCard
                icon="people-outline"
                label="Cupos a devolver"
                value={impacto?.cuposADevolver ?? 0}
                accent={palette.warning}
                palette={palette}
              />

              <StatCard
                icon="create-outline"
                label="Notas actuales"
                value={impacto?.totalNotasActuales ?? 0}
                accent={palette.destructive}
                palette={palette}
              />

              <StatCard
                icon="archive-outline"
                label="Historial académico"
                value={impacto?.totalRegistrosHistorial ?? 0}
                accent={palette.destructive}
                palette={palette}
              />
            </View>

            {gestiones.length > 0 && (
              <View
                style={[
                  styles.gestionBox,
                  {
                    backgroundColor: palette.elevated,
                    borderColor: palette.borderStrong,
                  },
                ]}
              >
                <ThemedText
                  style={[styles.sectionLabel, { color: palette.textMuted }]}
                >
                  GESTIÓN ACTIVA AFECTADA
                </ThemedText>

                {gestiones.map((gestion) => (
                  <View
                    key={gestion.idGestion}
                    style={[
                      styles.gestionRow,
                      { borderTopColor: palette.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.gestionIcon,
                        {
                          backgroundColor: colorWithAlpha(
                            palette.warning,
                            "18",
                            "rgba(245,158,11,0.14)",
                          ),
                        },
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={palette.warning}
                      />
                    </View>

                    <ThemedText
                      style={[styles.gestionText, { color: palette.text }]}
                    >
                      {gestion.nombre || `Gestión ${gestion.idGestion}`}
                      {gestion.anio ? ` · ${gestion.anio}` : ""}
                      {gestion.periodo ? ` · ${gestion.periodo}` : ""}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}

            <View
              style={[
                styles.deleteList,
                {
                  backgroundColor: colorWithAlpha(
                    palette.destructive,
                    "0D",
                    "rgba(244,63,94,0.08)",
                  ),
                  borderColor: colorWithAlpha(
                    palette.destructive,
                    "55",
                    "rgba(244,63,94,0.34)",
                  ),
                },
              ]}
            >
              <View style={styles.deleteHeader}>
                <View
                  style={[
                    styles.deleteHeaderIcon,
                    {
                      backgroundColor: colorWithAlpha(
                        palette.destructive,
                        "18",
                        "rgba(244,63,94,0.14)",
                      ),
                    },
                  ]}
                >
                  <Ionicons
                    name="trash-bin-outline"
                    size={19}
                    color={palette.destructive}
                  />
                </View>

                <ThemedText
                  style={[
                    styles.deleteTitle,
                    { color: palette.destructive },
                  ]}
                >
                  Se depurará de la carrera anterior
                </ThemedText>
              </View>

              <DeleteItem
                text="Inscripciones y materias registradas"
                accent={palette.destructive}
                textColor={palette.textSecondary}
              />
              <DeleteItem
                text="Notas finales, evaluaciones y asistencias"
                accent={palette.destructive}
                textColor={palette.textSecondary}
              />
              <DeleteItem
                text="Historial académico de esa carrera"
                accent={palette.destructive}
                textColor={palette.textSecondary}
              />
              <DeleteItem
                text="Convalidaciones vinculadas a esa carrera"
                accent={palette.destructive}
                textColor={palette.textSecondary}
              />
              <DeleteItem
                text="Turno preferido de la carrera anterior"
                accent={palette.destructive}
                textColor={palette.textSecondary}
              />
            </View>

            <View
              style={[
                styles.keepBox,
                {
                  backgroundColor: colorWithAlpha(
                    palette.success,
                    "10",
                    "rgba(34,197,94,0.08)",
                  ),
                  borderColor: colorWithAlpha(
                    palette.success,
                    "55",
                    "rgba(34,197,94,0.34)",
                  ),
                },
              ]}
            >
              <View
                style={[
                  styles.keepIcon,
                  {
                    backgroundColor: colorWithAlpha(
                      palette.success,
                      "18",
                      "rgba(34,197,94,0.14)",
                    ),
                  },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={21}
                  color={palette.success}
                />
              </View>

              <View style={styles.keepTextBox}>
                <ThemedText
                  style={[styles.keepTitle, { color: palette.text }]}
                >
                  Información financiera protegida
                </ThemedText>

                <ThemedText
                  style={[styles.keepText, { color: palette.textSecondary }]}
                >
                  Los pagos, recibos y cuotas no se eliminan. Permanecen
                  guardados como historial financiero de la carrera anterior.
                </ThemedText>
              </View>
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                backgroundColor: palette.card,
                borderTopColor: palette.border,
              },
              isMobile && styles.footerMobile,
            ]}
          >
            <Pressable
              disabled={guardando}
              onPress={close}
              style={({ pressed }) => [
                styles.cancelButton,
                isMobile && styles.footerButtonMobile,
                {
                  backgroundColor: palette.elevated,
                  borderColor: palette.borderStrong,
                  opacity: guardando ? 0.45 : pressed ? 0.74 : 1,
                },
              ]}
            >
              <Ionicons
                name="arrow-back-outline"
                size={18}
                color={palette.text}
              />
              <ThemedText
                style={[styles.cancelText, { color: palette.text }]}
              >
                No, volver
              </ThemedText>
            </Pressable>

            <Pressable
              disabled={guardando || !carreraNueva}
              onPress={() => void onConfirm()}
              style={({ pressed }) => [
                styles.confirmButton,
                isMobile && styles.footerButtonMobile,
                {
                  backgroundColor: palette.destructive,
                  opacity:
                    guardando || !carreraNueva
                      ? 0.5
                      : pressed
                        ? 0.78
                        : 1,
                },
              ]}
            >
              {guardando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons
                  name="swap-horizontal-outline"
                  size={20}
                  color="#FFFFFF"
                />
              )}

              <ThemedText style={styles.confirmText}>
                {guardando ? "Cambiando carrera..." : "Sí, cambiar y depurar"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function CareerBox({
  label,
  value,
  icon,
  accent,
  text,
  muted,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  text: string;
  muted: string;
}) {
  return (
    <View style={styles.careerBox}>
      <View
        style={[
          styles.careerIcon,
          {
            backgroundColor: colorWithAlpha(
              accent,
              "18",
              "rgba(148,163,184,0.12)",
            ),
            borderColor: colorWithAlpha(
              accent,
              "44",
              "rgba(148,163,184,0.28)",
            ),
          },
        ]}
      >
        <Ionicons name={icon} size={22} color={accent} />
      </View>

      <View style={styles.careerText}>
        <ThemedText style={[styles.careerLabel, { color: accent }]}> 
          {label}
        </ThemedText>

        <ThemedText
          numberOfLines={3}
          style={[styles.careerValue, { color: text }]}
        >
          {value}
        </ThemedText>

        <ThemedText style={[styles.careerHint, { color: muted }]}> 
          {label === "Carrera actual"
            ? "Relación académica vigente"
            : "Nueva relación seleccionada"}
        </ThemedText>
      </View>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  palette,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  accent: string;
  palette: ThemePalette;
}) {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: palette.elevated,
          borderColor: palette.borderStrong,
        },
      ]}
    >
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor: colorWithAlpha(
              accent,
              "18",
              "rgba(148,163,184,0.12)",
            ),
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={accent} />
      </View>

      <ThemedText style={[styles.statValue, { color: palette.text }]}> 
        {value}
      </ThemedText>

      <ThemedText
        numberOfLines={2}
        style={[styles.statLabel, { color: palette.textMuted }]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

function DeleteItem({
  text,
  accent,
  textColor,
}: {
  text: string;
  accent: string;
  textColor: string;
}) {
  return (
    <View style={styles.deleteItem}>
      <Ionicons name="remove-circle-outline" size={17} color={accent} />
      <ThemedText style={[styles.deleteText, { color: textColor }]}> 
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "95%",
    maxWidth: 1120,
    borderRadius: 26,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.38,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 20,
  },
  modalMobile: {
    width: "100%",
    borderRadius: 20,
  },
  header: {
    minHeight: 104,
    paddingHorizontal: 22,
    paddingVertical: 17,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flexShrink: 1,
  },
  content: {
    padding: 22,
    gap: 16,
  },
  routeCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  careerBox: {
    flex: 1,
    minWidth: 250,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  careerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  careerText: {
    flex: 1,
    minWidth: 0,
  },
  careerLabel: {
    fontSize: 10.5,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.45,
  },
  careerValue: {
    marginTop: 3,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  careerHint: {
    marginTop: 3,
    fontSize: 10.5,
    fontWeight: "700",
  },
  arrowBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  warningBox: {
    borderRadius: 19,
    borderWidth: 1,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  warningIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  warningTextBox: {
    flex: 1,
    minWidth: 0,
  },
  warningTitle: {
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: "900",
  },
  warningText: {
    marginTop: 4,
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
  },
  statCard: {
    flex: 1,
    minWidth: 165,
    minHeight: 124,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    justifyContent: "center",
    gap: 5,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 27,
    lineHeight: 31,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.25,
  },
  gestionBox: {
    borderRadius: 19,
    borderWidth: 1,
    padding: 15,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 0.45,
  },
  gestionRow: {
    minHeight: 46,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  gestionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  gestionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  deleteList: {
    borderRadius: 19,
    borderWidth: 1,
    padding: 15,
    gap: 10,
  },
  deleteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 2,
  },
  deleteHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  deleteItem: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  deleteText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "700",
  },
  keepBox: {
    borderRadius: 19,
    borderWidth: 1,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },
  keepIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  keepTextBox: {
    flex: 1,
    minWidth: 0,
  },
  keepTitle: {
    fontSize: 13.5,
    fontWeight: "900",
  },
  keepText: {
    marginTop: 4,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "700",
  },
  footer: {
    minHeight: 82,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 11,
  },
  footerMobile: {
    alignItems: "stretch",
  },
  footerButtonMobile: {
    flex: 1,
    minWidth: "100%",
  },
  cancelButton: {
    minHeight: 50,
    minWidth: 170,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cancelText: {
    fontSize: 13.5,
    fontWeight: "900",
  },
  confirmButton: {
    minHeight: 50,
    minWidth: 260,
    borderRadius: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "900",
  },
});