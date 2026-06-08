import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
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
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { BASE_URL, httpClient } from "../../../http/httpClient";
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

type DocumentoLocal = {
  nombreDocumento: string;
  archivoNombre: string | null;
  previewUri: string | null;
  mimeType: string | null;
};

const DOCUMENTOS_REQUERIDOS = [
  "Carnet de identidad",
  "Certificado de nacimiento",
  "Título de bachiller",
];

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

const normalizar = (texto: string) =>
  texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const resolverUrlDocumento = (doc: DocumentoServidor) => {
  const raw = doc.url || doc.ubicacionArchivo || doc.ruta || doc.archivo || "";

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
  const [documentos, setDocumentos] = useState<DocumentoServidor[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const e = detalle?.estudiante ?? estudiante;
  const idUsuario = (e as any)?.idUsuario ?? (e as any)?.id ?? null;

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

  const documentosParaMostrar = useMemo(() => {
    const nombres = new Set<string>();

    DOCUMENTOS_REQUERIDOS.forEach((d) => nombres.add(d));

    documentos.forEach((doc) => {
      if (doc.nombreDocumento) nombres.add(doc.nombreDocumento);
    });

    return Array.from(nombres);
  }, [documentos]);

  const obtenerDocumento = (nombreDocumento: string) => {
    return documentos.find(
      (doc) =>
        doc.nombreDocumento &&
        normalizar(doc.nombreDocumento) === normalizar(nombreDocumento)
    );
  };

  const onDocumentoSubido = () => {
    cargarDocumentos();
  };

  const update = (key: keyof EstudianteForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const nombreCompleto =
    `${form.nombres} ${form.apellidoPaterno} ${form.apellidoMaterno}`.trim();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modal, { backgroundColor: modalBg, borderColor: border }]}>
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
                  {nombreCompleto || "Modifica sus datos, materias y documentos."}
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
                <View style={[styles.summaryBox, { backgroundColor: softBg, borderColor: border }]}>
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

                <SectionTitle title="Documentos del estudiante" color={strongText} />

                {loadingDocs ? (
                  <View style={[styles.emptyBox, { backgroundColor: softBg, borderColor: border }]}>
                    <ActivityIndicator color={theme.colors.primary} />
                    <ThemedText style={[styles.emptyText, { color: mutedText }]}>
                      Cargando documentos...
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.documentsGrid}>
                    {documentosParaMostrar.map((nombreDocumento) => {
                      const doc = obtenerDocumento(nombreDocumento);

                      return (
                        <DocumentoEditableCard
                          key={`documento-editable-${nombreDocumento}`}
                          idUsuario={idUsuario}
                          nombreDocumento={nombreDocumento}
                          documento={doc}
                          onDocumentoSubido={onDocumentoSubido}
                        />
                      );
                    })}
                  </View>
                )}

                <SectionTitle title="Materias inscritas" color={strongText} />

                {!detalle || detalle.inscripciones.length === 0 ? (
                  <View style={[styles.emptyBox, { backgroundColor: softBg, borderColor: border }]}>
                    <Ionicons name="library-outline" size={24} color={mutedText} />
                    <ThemedText style={[styles.emptyText, { color: mutedText }]}>
                      Todavía no tiene materias inscritas.
                    </ThemedText>
                  </View>
                ) : (
                  detalle.inscripciones.map((i, index) => (
                    <View
                      key={`inscripcion-edit-${i.idInscripcion}-${i.idGrupo}-${i.idMateria}-${index}`}
                      style={[styles.itemCard, { borderColor: border, backgroundColor: softBg }]}
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

function DocumentoEditableCard({
  idUsuario,
  nombreDocumento,
  documento,
  onDocumentoSubido,
}: {
  idUsuario: number | null;
  nombreDocumento: string;
  documento?: DocumentoServidor;
  onDocumentoSubido: () => void;
}) {
  const { theme } = useTheme();

  const [subiendo, setSubiendo] = useState(false);

  const url = documento ? resolverUrlDocumento(documento) : null;

  const archivoNombre =
    documento?.archivoNombre ||
    documento?.nombreArchivo ||
    documento?.ubicacionArchivo?.split("/").pop() ||
    documento?.archivo?.split("/").pop() ||
    documento?.ruta?.split("/").pop() ||
    null;

  const mimeType = documento?.mimeType || documento?.tipoArchivo || "";

  const existeArchivo = Boolean(archivoNombre && url);

  const esImagen =
    mimeType.startsWith("image/") ||
    archivoNombre?.toLowerCase().endsWith(".jpg") ||
    archivoNombre?.toLowerCase().endsWith(".jpeg") ||
    archivoNombre?.toLowerCase().endsWith(".png");

  const esPdf =
    mimeType === "application/pdf" ||
    archivoNombre?.toLowerCase().endsWith(".pdf");

  const abrirArchivoCompleto = () => {
    if (!url) return;

    if (Platform.OS === "web") {
      window.open(url, "_blank");
      return;
    }

    Linking.openURL(url);
  };

  const subirArchivo = async () => {
    if (!idUsuario) {
      Toast.show({
        type: "error",
        text1: "No se encontró el estudiante",
      });
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const archivo = result.assets[0];

      const formData = new FormData();

      formData.append("idUsuario", String(idUsuario));
      formData.append("nombreDocumento", nombreDocumento);

      if (Platform.OS === "web") {
        const webFile = (archivo as any).file;

        if (!webFile) {
          Toast.show({
            type: "error",
            text1: "Archivo inválido",
            text2: "No se pudo leer el archivo seleccionado.",
          });
          return;
        }

        formData.append("archivo", webFile);
      } else {
        formData.append("archivo", {
          uri: archivo.uri,
          name: archivo.name || "documento.pdf",
          type: archivo.mimeType || "application/pdf",
        } as any);
      }

      setSubiendo(true);

      await httpClient.postFormData("/api/documentos-estudiante", formData);

      Toast.show({
        type: "success",
        text1: existeArchivo ? "Documento actualizado" : "Documento subido",
        text2: nombreDocumento,
      });

      onDocumentoSubido();
    } catch (error: any) {
      console.error("ERROR ACTUALIZANDO DOCUMENTO:", error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo subir el documento.",
      });
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <View
      style={[
        styles.documentCard,
        {
          borderColor: existeArchivo ? theme.colors.primary : theme.colors.border,
          backgroundColor: theme.colors.card,
        },
      ]}
    >
      <View
        style={[
          styles.documentIcon,
          {
            backgroundColor: existeArchivo
              ? `${theme.colors.primary}22`
              : theme.colors.background,
            borderColor: existeArchivo
              ? `${theme.colors.primary}55`
              : theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name={existeArchivo ? "checkmark-circle" : "document-text-outline"}
          size={28}
          color={existeArchivo ? theme.colors.primary : theme.colors.muted}
        />
      </View>

      <View>
        <ThemedText
          style={{
            fontSize: 20,
            fontWeight: "900",
            color: theme.colors.text,
          }}
        >
          {nombreDocumento}
        </ThemedText>

        <ThemedText
          style={{
            marginTop: 5,
            color: theme.colors.muted,
            lineHeight: 20,
            fontWeight: "600",
          }}
        >
          {existeArchivo
            ? "Documento cargado. Puedes verlo o cambiarlo."
            : "Documento pendiente. Puedes subir PDF, JPG o PNG."}
        </ThemedText>
      </View>

      <View
        style={[
          styles.dropZone,
          {
            borderColor: existeArchivo ? theme.colors.primary : theme.colors.border,
            backgroundColor: existeArchivo
              ? `${theme.colors.primary}12`
              : theme.colors.background,
          },
        ]}
      >
        <Ionicons
          name={existeArchivo ? "checkmark-circle" : "cloud-upload-outline"}
          size={24}
          color={existeArchivo ? theme.colors.primary : theme.colors.muted}
        />

        <ThemedText
          style={{
            fontSize: 12,
            color: existeArchivo ? theme.colors.text : theme.colors.muted,
            textAlign: "center",
            fontWeight: "800",
          }}
        >
          {archivoNombre || "PDF, JPG o PNG - máximo 5MB"}
        </ThemedText>

        {existeArchivo && (
          <ThemedText
            style={{
              fontSize: 11,
              color: theme.colors.primary,
              textAlign: "center",
              fontWeight: "900",
            }}
          >
            Documento cargado correctamente
          </ThemedText>
        )}
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
            height: 280,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 18,
            backgroundColor: "#fff",
          }}
          title={archivoNombre || "PDF"}
        />
      )}

      {url && esPdf && Platform.OS !== "web" && (
        <Pressable
          onPress={abrirArchivoCompleto}
          style={[
            styles.pdfBox,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <Ionicons name="document-outline" size={24} color={theme.colors.primary} />

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

      {url && (
        <Pressable
          onPress={abrirArchivoCompleto}
          style={[
            styles.openBtn,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <Ionicons name="open-outline" size={20} color={theme.colors.primary} />

          <ThemedText style={{ color: theme.colors.primary, fontWeight: "900" }}>
            Ver archivo completo
          </ThemedText>
        </Pressable>
      )}

      <Pressable
        disabled={subiendo}
        onPress={subirArchivo}
        style={[
          styles.uploadDocumentBtn,
          {
            backgroundColor: subiendo ? theme.colors.border : theme.colors.primary,
            opacity: subiendo ? 0.7 : 1,
          },
        ]}
      >
        {subiendo ? (
          <>
            <ActivityIndicator color="#fff" />
            <ThemedText style={styles.uploadDocumentText}>Subiendo...</ThemedText>
          </>
        ) : (
          <>
            <Ionicons
              name={existeArchivo ? "refresh-circle-outline" : "add-circle-outline"}
              size={20}
              color="#fff"
            />

            <ThemedText style={styles.uploadDocumentText}>
              {existeArchivo ? "Cambiar documento" : "Subir documento"}
            </ThemedText>
          </>
        )}
      </Pressable>
    </View>
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
    maxWidth: 1080,
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
  dropZone: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    gap: 10,
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
  uploadDocumentBtn: {
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  uploadDocumentText: {
    color: "#fff",
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