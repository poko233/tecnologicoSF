import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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
import { DetalleEstudianteResponse, Estudiante } from "../types/asignaciones.types";
import SubirDocumentosPendientesModal from "./SubirDocumentosPendientesModal";

type Props = {
  visible: boolean;
  estudiante: Estudiante | null;
  detalle: DetalleEstudianteResponse | null;
  loading: boolean;
  onClose: () => void;
  onDocumentosSubidos?: () => void;
};

export default function RevisarModal({
  visible,
  estudiante,
  detalle,
  loading,
  onClose,
  onDocumentosSubidos,
}: Props) {
  const { theme } = useTheme();
  const [docsVisible, setDocsVisible] = useState(false);

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const modalBg = isDark ? "#111827" : theme.colors.card;
  const softBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(15,23,42,0.035)";
  const softStrong = isDark ? "rgba(255,255,255,0.075)" : "rgba(15,23,42,0.055)";
  const border = isDark ? "rgba(255,255,255,0.11)" : "rgba(15,23,42,0.11)";

  const e = detalle?.estudiante ?? estudiante;

  const nombre = e
    ? `${e.nombres} ${e.apellidoPaterno} ${e.apellidoMaterno ?? ""}`.trim()
    : "";

  const documentosPendientes = detalle?.documentosPendientes ?? [];

  return (
    <>
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
                  <Ionicons name="person-circle-outline" size={27} color={theme.colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.title, { color: strongText }]}>
                    Revisar estudiante
                  </ThemedText>
                  <ThemedText numberOfLines={1} style={[styles.subtitle, { color: mutedText }]}>
                    {nombre || "Sin estudiante seleccionado"}
                  </ThemedText>
                </View>
              </View>

              <Pressable
                onPress={onClose}
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
            ) : !detalle || !e ? (
              <View style={styles.loadingBox}>
                <Ionicons name="alert-circle-outline" size={42} color="#EF4444" />
                <ThemedText style={[styles.loadingTitle, { color: strongText, marginTop: 10 }]}>
                  No se pudo cargar el estudiante
                </ThemedText>
              </View>
            ) : (
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Pressable
                  disabled={!detalle.debeDocumentos}
                  onPress={() => detalle.debeDocumentos && setDocsVisible(true)}
                  style={({ pressed }) => [
                    styles.documentAlert,
                    {
                      backgroundColor: detalle.debeDocumentos
                        ? isDark
                          ? "rgba(245,158,11,0.14)"
                          : "#FEF3C7"
                        : isDark
                        ? "rgba(34,197,94,0.14)"
                        : "#DCFCE7",
                      borderColor: detalle.debeDocumentos
                        ? "rgba(245,158,11,0.65)"
                        : "rgba(34,197,94,0.65)",
                      opacity: pressed ? 0.82 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.alertIcon,
                      {
                        backgroundColor: detalle.debeDocumentos
                          ? "rgba(245,158,11,0.22)"
                          : "rgba(34,197,94,0.22)",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        detalle.debeDocumentos
                          ? "cloud-upload-outline"
                          : "checkmark-circle-outline"
                      }
                      size={25}
                      color={detalle.debeDocumentos ? "#F59E0B" : "#22C55E"}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.alertTitle, { color: strongText }]}>
                      {detalle.debeDocumentos
                        ? "Debe documentos"
                        : "Documentación completa"}
                    </ThemedText>

                    <ThemedText style={[styles.alertText, { color: mutedText }]}>
                      {detalle.debeDocumentos
                        ? `Pendientes: ${documentosPendientes.join(", ")}`
                        : "El estudiante no tiene documentos pendientes."}
                    </ThemedText>
                  </View>

                  {detalle.debeDocumentos && (
                    <View style={styles.uploadPill}>
                      <Ionicons name="add-circle-outline" size={17} color="#F59E0B" />
                      <ThemedText style={styles.uploadPillText}>Subir</ThemedText>
                    </View>
                  )}
                </Pressable>

                <View style={styles.summaryGrid}>
                  <SummaryCard
                    icon="briefcase-outline"
                    label="Carreras"
                    value={String(detalle.carreras.length)}
                    color={theme.colors.primary}
                    bg={softBg}
                    border={border}
                    strongText={strongText}
                    mutedText={mutedText}
                  />

                  <SummaryCard
                    icon="book-outline"
                    label="Materias"
                    value={String(detalle.inscripciones.length)}
                    color="#22C55E"
                    bg={softBg}
                    border={border}
                    strongText={strongText}
                    mutedText={mutedText}
                  />

                  <SummaryCard
                    icon="document-text-outline"
                    label="Documentos"
                    value={detalle.debeDocumentos ? "Pendiente" : "Completo"}
                    color={detalle.debeDocumentos ? "#F59E0B" : "#22C55E"}
                    bg={softBg}
                    border={border}
                    strongText={strongText}
                    mutedText={mutedText}
                  />
                </View>

                <SectionTitle title="Datos personales" color={strongText} />

                <View style={styles.grid}>
                  <Info label="CI" value={`${e.ci} ${e.expedido ?? ""}`} />
                  <Info label="Nombre completo" value={nombre} big />
                  <Info label="Género" value={e.genero || "Sin dato"} />
                  <Info label="Fecha nacimiento" value={e.fecha_nac || "Sin dato"} />
                  <Info label="Email" value={e.email || "Sin email"} big />
                  <Info label="Celular" value={e.celular || "Sin celular"} />
                  <Info label="Teléfono" value={e.telefono || "Sin teléfono"} />
                  <Info label="Dirección" value={e.direccion || "Sin dirección"} />
                  <Info label="Matrícula" value={e.matricula || "Sin matrícula"} />
                  <Info label="Estado" value={e.estado || "Sin estado"} />
                </View>

                <SectionTitle title="Carreras" color={strongText} />

                {detalle.carreras.length === 0 ? (
                  <EmptyBox
                    icon="school-outline"
                    text="No tiene carrera registrada."
                    bg={softBg}
                    border={border}
                    mutedText={mutedText}
                  />
                ) : (
                  detalle.carreras.map((c) => (
                    <View
                      key={c.idCarrera}
                      style={[
                        styles.itemCard,
                        {
                          borderColor: border,
                          backgroundColor: softBg,
                        },
                      ]}
                    >
                      <View style={[styles.itemIcon, { backgroundColor: "rgba(59,130,246,0.18)" }]}>
                        <Ionicons name="school-outline" size={20} color={theme.colors.primary} />
                      </View>

                      <View style={{ flex: 1 }}>
                        <ThemedText style={[styles.itemTitle, { color: strongText }]}>
                          {c.nombreCarrera}
                        </ThemedText>
                        <ThemedText style={[styles.itemText, { color: mutedText }]}>
                          Código: {c.codigo} · Régimen: {c.regimen}
                        </ThemedText>
                      </View>
                    </View>
                  ))
                )}

                <SectionTitle title="Materias inscritas" color={strongText} />

                {detalle.inscripciones.length === 0 ? (
                  <EmptyBox
                    icon="library-outline"
                    text="Todavía no tiene materias inscritas."
                    bg={softBg}
                    border={border}
                    mutedText={mutedText}
                  />
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
            )}
          </View>
        </View>
      </Modal>

      <SubirDocumentosPendientesModal
        visible={docsVisible}
        idUsuario={e?.id ?? null}
        estudianteNombre={nombre}
        documentosPendientes={documentosPendientes}
        onClose={() => setDocsVisible(false)}
        onSuccess={() => {
          setDocsVisible(false);
          onDocumentosSubidos?.();
        }}
      />
    </>
  );
}

function Info({
  label,
  value,
  big = false,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  const { theme } = useTheme();

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const bg = isDark ? "rgba(255,255,255,0.045)" : "rgba(15,23,42,0.035)";
  const border = isDark ? "rgba(255,255,255,0.11)" : "rgba(15,23,42,0.11)";

  return (
    <View
      style={[
        styles.infoBox,
        {
          borderColor: border,
          backgroundColor: bg,
          flexBasis: big ? "48%" : "23%",
        },
      ]}
    >
      <ThemedText style={[styles.infoLabel, { color: mutedText }]}>
        {label}
      </ThemedText>
      <ThemedText numberOfLines={2} style={[styles.infoValue, { color: strongText }]}>
        {value}
      </ThemedText>
    </View>
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

function SummaryCard({
  icon,
  label,
  value,
  color,
  bg,
  border,
  strongText,
  mutedText,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  bg: string;
  border: string;
  strongText: string;
  mutedText: string;
}) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText style={[styles.summaryLabel, { color: mutedText }]}>
          {label}
        </ThemedText>
        <ThemedText numberOfLines={1} style={[styles.summaryValue, { color: strongText }]}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

function EmptyBox({
  icon,
  text,
  bg,
  border,
  mutedText,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  bg: string;
  border: string;
  mutedText: string;
}) {
  return (
    <View style={[styles.emptyBox, { backgroundColor: bg, borderColor: border }]}>
      <Ionicons name={icon} size={22} color={mutedText} />
      <ThemedText style={[styles.emptyText, { color: mutedText }]}>
        {text}
      </ThemedText>
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
    maxWidth: 960,
    maxHeight: "92%",
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
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
  scroll: {
    maxHeight: 650,
  },
  scrollContent: {
    paddingBottom: 4,
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
  documentAlert: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    alignItems: "center",
  },
  alertIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  alertText: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  uploadPill: {
    borderRadius: 999,
    backgroundColor: "rgba(245,158,11,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  uploadPillText: {
    color: "#F59E0B",
    fontWeight: "900",
    fontSize: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: 210,
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  summaryValue: {
    marginTop: 2,
    fontSize: 16,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 13,
    minWidth: 170,
    flexGrow: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19,
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
});