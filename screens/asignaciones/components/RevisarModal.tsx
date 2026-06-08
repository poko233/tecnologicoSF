import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { BASE_URL, httpClient } from "../../../http/httpClient";
import { useTheme } from "../../../theme/useTheme";
import {
  DetalleEstudianteResponse,
  Estudiante,
} from "../types/asignaciones.types";

type Props = {
  visible: boolean;
  estudiante: Estudiante | null;
  detalle: DetalleEstudianteResponse | null;
  loading: boolean;
  onClose: () => void;
};

type DocumentoServidor = {
  idDocumento?: number;
  idDocumentoEstudiante?: number;
  idUsuario?: number;
  nombreDocumento?: string;
  estadoDocumento?: string;
  ubicacionArchivo?: string;
  archivoNombre?: string;
  nombreArchivo?: string;
  archivo?: string;
  ruta?: string;
  url?: string;
  mimeType?: string;
  tipoArchivo?: string;
  created_at?: string;
  updated_at?: string;
};

const DOCUMENTOS_REQUERIDOS = [
  "Carnet de identidad",
  "Certificado de nacimiento",
  "Título de bachiller",
];

const normalizar = (texto: string) =>
  texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const resolverUrlDocumento = (doc: DocumentoServidor) => {
  const raw =
    doc.url ||
    doc.ubicacionArchivo ||
    doc.ruta ||
    doc.archivo ||
    "";

  if (!raw) return null;

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  const limpio = raw.startsWith("/") ? raw.substring(1) : raw;

  return `${BASE_URL}/${limpio}`;
};

export default function RevisarModal({
  visible,
  estudiante,
  detalle,
  loading,
  onClose,
}: Props) {
  const { theme } = useTheme();

  const [documentos, setDocumentos] = useState<DocumentoServidor[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const modalBg = isDark ? "#111827" : theme.colors.card;
  const softBg = isDark ? "rgba(255,255,255,0.045)" : "rgba(15,23,42,0.035)";
  const softStrong = isDark
    ? "rgba(255,255,255,0.075)"
    : "rgba(15,23,42,0.055)";
  const border = isDark
    ? "rgba(255,255,255,0.11)"
    : "rgba(15,23,42,0.11)";

  const e = detalle?.estudiante ?? estudiante;
  const idUsuario = (e as any)?.idUsuario ?? (e as any)?.id ?? null;

  const nombre = e
    ? `${e.nombres} ${e.apellidoPaterno} ${e.apellidoMaterno ?? ""}`.trim()
    : "";

  useEffect(() => {
    if (visible && idUsuario) {
      cargarDocumentos();
    }

    if (!visible) {
      setDocumentos([]);
    }
  }, [visible, idUsuario]);

  const cargarDocumentos = async () => {
    if (!idUsuario) return;

    try {
      setLoadingDocs(true);

      const data = await httpClient.getAuth<any>(
        `/api/documentos-estudiante/${idUsuario}`
      );

      const docs = data?.documentos ?? data?.data ?? data ?? [];

      const documentosUnicos = Array.isArray(docs)
        ? docs
            .sort(
              (a, b) =>
                (b.idDocumentoEstudiante ?? 0) -
                (a.idDocumentoEstudiante ?? 0)
            )
            .filter(
              (doc, index, arr) =>
                index ===
                arr.findIndex(
                  (d) =>
                    normalizar(d.nombreDocumento ?? "") ===
                    normalizar(doc.nombreDocumento ?? "")
                )
            )
        : [];

      setDocumentos(documentosUnicos);
    } catch (error) {
      console.error("ERROR CARGANDO DOCUMENTOS:", error);
      setDocumentos([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const documentosSubidosNormalizados = useMemo(() => {
    return documentos
      .map((doc) => doc.nombreDocumento)
      .filter(Boolean)
      .map((nombre) => normalizar(String(nombre)));
  }, [documentos]);

  const documentosPendientes = useMemo(() => {
    return DOCUMENTOS_REQUERIDOS.filter(
      (req) => !documentosSubidosNormalizados.includes(normalizar(req))
    );
  }, [documentosSubidosNormalizados]);

  const debeDocumentos = documentosPendientes.length > 0;

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
                <Ionicons
                  name="person-circle-outline"
                  size={27}
                  color={theme.colors.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.title, { color: strongText }]}>
                  Revisar estudiante
                </ThemedText>

                <ThemedText
                  numberOfLines={1}
                  style={[styles.subtitle, { color: mutedText }]}
                >
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

              <ThemedText
                style={[styles.loadingTitle, { color: strongText, marginTop: 10 }]}
              >
                No se pudo cargar el estudiante
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.documentAlert,
                  {
                    backgroundColor: debeDocumentos
                      ? isDark
                        ? "rgba(245,158,11,0.14)"
                        : "#FEF3C7"
                      : isDark
                      ? "rgba(34,197,94,0.14)"
                      : "#DCFCE7",
                    borderColor: debeDocumentos
                      ? "rgba(245,158,11,0.65)"
                      : "rgba(34,197,94,0.65)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.alertIcon,
                    {
                      backgroundColor: debeDocumentos
                        ? "rgba(245,158,11,0.22)"
                        : "rgba(34,197,94,0.22)",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      debeDocumentos
                        ? "warning-outline"
                        : "checkmark-circle-outline"
                    }
                    size={25}
                    color={debeDocumentos ? "#F59E0B" : "#22C55E"}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.alertTitle, { color: strongText }]}>
                    {debeDocumentos
                      ? "Debe documentos"
                      : "Documentación completa"}
                  </ThemedText>

                  <ThemedText style={[styles.alertText, { color: mutedText }]}>
                    {debeDocumentos
                      ? `Pendientes: ${documentosPendientes.join(", ")}`
                      : "El estudiante no tiene documentos pendientes."}
                  </ThemedText>
                </View>
              </View>

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
                  value={debeDocumentos ? "Pendiente" : "Completo"}
                  color={debeDocumentos ? "#F59E0B" : "#22C55E"}
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

              <SectionTitle title="Documentos subidos" color={strongText} />

              {loadingDocs ? (
                <EmptyBox
                  icon="hourglass-outline"
                  text="Cargando documentos..."
                  bg={softBg}
                  border={border}
                  mutedText={mutedText}
                />
              ) : documentos.length === 0 ? (
                <EmptyBox
                  icon="document-text-outline"
                  text="No tiene documentos subidos todavía."
                  bg={softBg}
                  border={border}
                  mutedText={mutedText}
                />
              ) : (
                <View style={styles.documentsGrid}>
                  {documentos.map((doc, index) => (
                    <DocumentoVistaCard
                      key={`documento-${
                        doc.idDocumentoEstudiante ?? doc.idDocumento ?? index
                      }`}
                      documento={doc}
                    />
                  ))}
                </View>
              )}

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
                    key={`carrera-${c.idCarrera}`}
                    style={[
                      styles.itemCard,
                      {
                        borderColor: border,
                        backgroundColor: softBg,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.itemIcon,
                        { backgroundColor: "rgba(59,130,246,0.18)" },
                      ]}
                    >
                      <Ionicons
                        name="school-outline"
                        size={20}
                        color={theme.colors.primary}
                      />
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
                detalle.inscripciones.map((i, index) => (
                  <View
                    key={`inscripcion-${i.idInscripcion}-${i.idGrupo}-${i.idMateria}-${index}`}
                    style={[
                      styles.itemCard,
                      {
                        borderColor: border,
                        backgroundColor: softBg,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.itemIcon,
                        { backgroundColor: "rgba(34,197,94,0.16)" },
                      ]}
                    >
                      <Ionicons name="book-outline" size={20} color="#22C55E" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.itemTitle, { color: strongText }]}>
                        {i.nombreMateria ?? "Materia sin dato"}
                      </ThemedText>

                      <ThemedText style={[styles.itemText, { color: mutedText }]}>
                        Grupo: {i.nombreGrupo} · Paralelo {i.paralelo} · Turno{" "}
                        {i.turno}
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
  );
}

function DocumentoVistaCard({ documento }: { documento: DocumentoServidor }) {
  const { theme } = useTheme();

  const url = resolverUrlDocumento(documento);

  const archivoNombre =
    documento.archivoNombre ||
    documento.nombreArchivo ||
    documento.ubicacionArchivo?.split("/").pop() ||
    documento.archivo?.split("/").pop() ||
    documento.ruta?.split("/").pop() ||
    "Documento";

  const mimeType = documento.mimeType || documento.tipoArchivo || "";

  const esImagen =
    mimeType.startsWith("image/") ||
    archivoNombre.toLowerCase().endsWith(".jpg") ||
    archivoNombre.toLowerCase().endsWith(".jpeg") ||
    archivoNombre.toLowerCase().endsWith(".png");

  const esPdf =
    mimeType === "application/pdf" ||
    archivoNombre.toLowerCase().endsWith(".pdf");

  const abrirArchivo = () => {
    if (!url) return;

    if (Platform.OS === "web") {
      window.open(url, "_blank");
      return;
    }

    Linking.openURL(url);
  };

  return (
    <View
      style={[
        styles.documentCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: url ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.documentIcon,
          {
            backgroundColor: url
              ? `${theme.colors.primary}22`
              : theme.colors.background,
            borderColor: url ? `${theme.colors.primary}55` : theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name={url ? "checkmark-circle" : "alert-circle-outline"}
          size={28}
          color={url ? theme.colors.primary : theme.colors.muted}
        />
      </View>

      <View>
        <ThemedText style={[styles.documentTitle, { color: theme.colors.text }]}>
          {documento.nombreDocumento || "Documento"}
        </ThemedText>

        <ThemedText
          numberOfLines={1}
          style={[styles.documentSubtitle, { color: theme.colors.muted }]}
        >
          {archivoNombre}
        </ThemedText>
      </View>

      {url && esImagen && (
        <Image
          source={{ uri: url }}
          style={[styles.previewImage, { borderColor: theme.colors.border }]}
        />
      )}

      {url && esPdf && Platform.OS === "web" && (
        <iframe
          src={url}
          style={{
            width: "100%",
            height: 260,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 18,
            backgroundColor: "#fff",
          }}
          title={archivoNombre}
        />
      )}

      {url && esPdf && Platform.OS !== "web" && (
        <Pressable
          onPress={abrirArchivo}
          style={[
            styles.pdfBox,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <Ionicons
            name="document-outline"
            size={24}
            color={theme.colors.primary}
          />

          <View style={{ flex: 1 }}>
            <ThemedText style={{ fontWeight: "900", color: theme.colors.text }}>
              Vista previa PDF
            </ThemedText>

            <ThemedText
              style={{
                color: theme.colors.muted,
                marginTop: 4,
                fontWeight: "600",
              }}
            >
              Toca para abrir el documento completo.
            </ThemedText>
          </View>
        </Pressable>
      )}

      <Pressable
        onPress={abrirArchivo}
        disabled={!url}
        style={[
          styles.openBtn,
          {
            borderColor: url ? theme.colors.primary : theme.colors.border,
            backgroundColor: theme.colors.background,
            opacity: url ? 1 : 0.5,
          },
        ]}
      >
        <Ionicons
          name="open-outline"
          size={20}
          color={url ? theme.colors.primary : theme.colors.muted}
        />

        <ThemedText
          style={{
            color: url ? theme.colors.primary : theme.colors.muted,
            fontWeight: "900",
          }}
        >
          {url ? "Ver en otra pestaña" : "Sin archivo disponible"}
        </ThemedText>
      </Pressable>
    </View>
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
    maxWidth: 1080,
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
  documentsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  documentCard: {
    flexGrow: 1,
    flexBasis: 300,
    minWidth: 280,
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },
  documentIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  documentSubtitle: {
    marginTop: 5,
    lineHeight: 20,
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    resizeMode: "cover",
    borderWidth: 1,
  },
  pdfBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  openBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
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