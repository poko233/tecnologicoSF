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
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { httpClient } from "../../../http/httpClient";
import { useTheme } from "../../../theme/useTheme";

type DocumentoLocal = {
  nombreDocumento: string;
  archivoNombre: string | null;
  previewUri: string | null;
  mimeType: string | null;
  file?: any;
};

type DocumentoServidor = {
  nombreDocumento?: string;
  archivoNombre?: string;
  archivo?: string;
  ruta?: string;
  url?: string;
  mimeType?: string;
};

type Props = {
  visible: boolean;
  idUsuario: number | null;
  estudianteNombre: string;
  documentosPendientes: string[];
  onClose: () => void;
  onSuccess: (documentosSubidos?: string[]) => void;
};

const normalizar = (texto: string) =>
  texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function SubirDocumentosPendientesModal({
  visible,
  idUsuario,
  estudianteNombre,
  documentosPendientes,
  onClose,
  onSuccess,
}: Props) {
  const { theme } = useTheme();

  const [documentosLocales, setDocumentosLocales] = useState<DocumentoLocal[]>([]);
  const [documentosServidor, setDocumentosServidor] = useState<DocumentoServidor[]>([]);
  const [documentosSubidos, setDocumentosSubidos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);

  const documentosPendientesFiltrados = useMemo(() => {
    return documentosPendientes.filter((pendiente) => {
      const yaExisteServidor = documentosServidor.some(
        (doc) =>
          doc.nombreDocumento &&
          normalizar(doc.nombreDocumento) === normalizar(pendiente)
      );

      return !yaExisteServidor;
    });
  }, [documentosPendientes, documentosServidor]);

  useEffect(() => {
    if (visible) {
      setDocumentosSubidos([]);
      setDocumentosLocales(
        documentosPendientes.map((nombreDocumento) => ({
          nombreDocumento,
          archivoNombre: null,
          previewUri: null,
          mimeType: null,
          file: null,
        }))
      );
    }

    if (visible && idUsuario) {
      cargarDocumentosExistentes();
    }
  }, [visible, idUsuario, documentosPendientes]);

  const cargarDocumentosExistentes = async () => {
    if (!idUsuario) return;

    try {
      setCargando(true);

      const data = await httpClient.getAuth<any>(
        `/api/documentos-estudiante/${idUsuario}`
      );

      const docs = data?.documentos ?? data?.data ?? data ?? [];

      setDocumentosServidor(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error("ERROR CARGANDO DOCUMENTOS EXISTENTES:", error);
      setDocumentosServidor([]);
    } finally {
      setCargando(false);
    }
  };

  const actualizarDocumento = (documento: DocumentoLocal) => {
    setDocumentosLocales((prev) => [
      ...prev.filter(
        (d) => normalizar(d.nombreDocumento) !== normalizar(documento.nombreDocumento)
      ),
      documento,
    ]);
  };

  const marcarComoSubido = (documento: DocumentoLocal) => {
    setDocumentosServidor((prev) => [
      ...prev.filter(
        (d) =>
          !d.nombreDocumento ||
          normalizar(d.nombreDocumento) !== normalizar(documento.nombreDocumento)
      ),
      {
        nombreDocumento: documento.nombreDocumento,
        archivoNombre: documento.archivoNombre ?? undefined,
        url: documento.previewUri ?? undefined,
        mimeType: documento.mimeType ?? undefined,
      },
    ]);

    setDocumentosSubidos((prev) => [
      ...prev.filter((d) => normalizar(d) !== normalizar(documento.nombreDocumento)),
      documento.nombreDocumento,
    ]);
  };

  const finalizar = () => {
    onSuccess(documentosSubidos);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIcon,
                  { backgroundColor: `${theme.colors.primary}22` },
                ]}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={26}
                  color={theme.colors.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.title, { color: theme.colors.text }]}>
                  Subir documentos pendientes
                </ThemedText>

                <ThemedText
                  numberOfLines={1}
                  style={[styles.subtitle, { color: theme.colors.muted }]}
                >
                  {estudianteNombre || "Estudiante"}
                </ThemedText>
              </View>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <View
            style={[
              styles.notice,
              {
                backgroundColor: `${theme.colors.primary}12`,
                borderColor: `${theme.colors.primary}55`,
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={theme.colors.primary}
            />

            <ThemedText style={[styles.noticeText, { color: theme.colors.text }]}>
              Primero selecciona el archivo, revisa la vista previa y luego confirma la subida.
            </ThemedText>
          </View>

          {cargando ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={theme.colors.primary} />
              <ThemedText style={{ marginTop: 10, color: theme.colors.text }}>
                Verificando documentos subidos...
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {documentosPendientesFiltrados.length === 0 ? (
                <View
                  style={[
                    styles.emptyBox,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={40}
                    color={theme.colors.primary}
                  />

                  <ThemedText style={[styles.emptyTitle, { color: theme.colors.text }]}>
                    Ya no hay documentos pendientes
                  </ThemedText>

                  <ThemedText style={[styles.emptySubtitle, { color: theme.colors.muted }]}>
                    Todos los documentos requeridos ya están subidos.
                  </ThemedText>
                </View>
              ) : (
                documentosPendientesFiltrados.map((titulo) => {
                  const documentoLocal = documentosLocales.find(
                    (d) => normalizar(d.nombreDocumento) === normalizar(titulo)
                  );

                  return (
                    <DocumentoPendienteCard
                      key={titulo}
                      idUsuario={idUsuario}
                      titulo={titulo}
                      descripcion="Documento pendiente del estudiante."
                      documentoLocal={documentoLocal}
                      onDocumentoChange={actualizarDocumento}
                      onDocumentoSubido={marcarComoSubido}
                    />
                  );
                })
              )}
            </ScrollView>
          )}

          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <Pressable
              onPress={onClose}
              style={[
                styles.cancelBtn,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <ThemedText style={[styles.cancelText, { color: theme.colors.text }]}>
                Cerrar
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={finalizar}
              style={[styles.doneBtn, { backgroundColor: theme.colors.primary }]}
            >
              <Ionicons name="checkmark-circle-outline" size={19} color="#fff" />

              <ThemedText style={styles.doneText}>
                Finalizar
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DocumentoPendienteCard({
  idUsuario,
  titulo,
  descripcion,
  documentoLocal,
  onDocumentoChange,
  onDocumentoSubido,
}: {
  idUsuario: number | null;
  titulo: string;
  descripcion: string;
  documentoLocal?: DocumentoLocal;
  onDocumentoChange: (documento: DocumentoLocal) => void;
  onDocumentoSubido: (documento: DocumentoLocal) => void;
}) {
  const { theme } = useTheme();

  const [subiendo, setSubiendo] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  const [archivoNombre, setArchivoNombre] = useState<string | null>(
    documentoLocal?.archivoNombre ?? null
  );
  const [previewUri, setPreviewUri] = useState<string | null>(
    documentoLocal?.previewUri ?? null
  );
  const [mimeType, setMimeType] = useState<string | null>(
    documentoLocal?.mimeType ?? null
  );
  const [archivoFile, setArchivoFile] = useState<any>(documentoLocal?.file ?? null);

  useEffect(() => {
    setArchivoNombre(documentoLocal?.archivoNombre ?? null);
    setPreviewUri(documentoLocal?.previewUri ?? null);
    setMimeType(documentoLocal?.mimeType ?? null);
    setArchivoFile(documentoLocal?.file ?? null);
  }, [documentoLocal]);

  const limpiarDocumentoLocal = () => {
    setArchivoNombre(null);
    setPreviewUri(null);
    setMimeType(null);
    setArchivoFile(null);
    setConfirmado(false);

    onDocumentoChange({
      nombreDocumento: titulo,
      archivoNombre: null,
      previewUri: null,
      mimeType: null,
      file: null,
    });
  };

  const abrirArchivoCompleto = () => {
    if (!previewUri) return;

    if (Platform.OS === "web") {
      window.open(previewUri, "_blank");
      return;
    }

    Linking.openURL(previewUri);
  };

  const seleccionarArchivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const archivo = result.assets[0];

      const documentoSeleccionado: DocumentoLocal = {
        nombreDocumento: titulo,
        archivoNombre: archivo.name ?? "documento",
        previewUri: archivo.uri,
        mimeType: archivo.mimeType ?? null,
        file: archivo,
      };

      setArchivoNombre(documentoSeleccionado.archivoNombre);
      setPreviewUri(documentoSeleccionado.previewUri);
      setMimeType(documentoSeleccionado.mimeType);
      setArchivoFile(archivo);
      setConfirmado(false);

      onDocumentoChange(documentoSeleccionado);
    } catch (error) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo seleccionar el archivo.",
      });
    }
  };

  const confirmarYSubir = async () => {
    if (!idUsuario) {
      Toast.show({
        type: "error",
        text1: "No se encontró el estudiante",
      });
      return;
    }

    if (!archivoFile || !archivoNombre || !previewUri) {
      Toast.show({
        type: "info",
        text1: "Selecciona un archivo primero",
      });
      return;
    }

    try {
      const formData = new FormData();

      formData.append("idUsuario", String(idUsuario));
      formData.append("nombreDocumento", titulo);

      if (Platform.OS === "web") {
        const webFile = archivoFile?.file;

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
          uri: archivoFile.uri,
          name: archivoFile.name || "documento.pdf",
          type: archivoFile.mimeType || "application/pdf",
        } as any);
      }

      setSubiendo(true);

      await httpClient.postFormData("/api/documentos-estudiante", formData);

      const documentoSubido: DocumentoLocal = {
        nombreDocumento: titulo,
        archivoNombre,
        previewUri,
        mimeType,
        file: archivoFile,
      };

      setConfirmado(true);
      onDocumentoSubido(documentoSubido);

      Toast.show({
        type: "success",
        text1: "Documento subido",
        text2: titulo,
      });
    } catch (error: any) {
      console.error("ERROR SUBIENDO DOCUMENTO:", error);

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

  const esImagen = mimeType?.startsWith("image/");
  const esPdf = mimeType === "application/pdf";
  const existeArchivo = Boolean(archivoNombre && previewUri);

  return (
    <View
      style={[
        styles.docCard,
        {
          borderColor: confirmado ? "#22C55E" : existeArchivo ? theme.colors.primary : theme.colors.border,
          backgroundColor: theme.colors.card,
        },
      ]}
    >
      <View style={styles.docTop}>
        <View
          style={[
            styles.docIcon,
            {
              backgroundColor: confirmado
                ? "rgba(34,197,94,0.18)"
                : existeArchivo
                ? `${theme.colors.primary}22`
                : theme.colors.background,
              borderColor: confirmado
                ? "rgba(34,197,94,0.55)"
                : existeArchivo
                ? `${theme.colors.primary}55`
                : theme.colors.border,
            },
          ]}
        >
          <Ionicons
            name={
              confirmado
                ? "checkmark-done-circle"
                : existeArchivo
                ? "eye-outline"
                : "document-text-outline"
            }
            size={26}
            color={confirmado ? "#22C55E" : existeArchivo ? theme.colors.primary : theme.colors.muted}
          />
        </View>

        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.docTitle, { color: theme.colors.text }]}>
            {titulo}
          </ThemedText>

          <ThemedText style={[styles.docDescription, { color: theme.colors.muted }]}>
            {descripcion}
          </ThemedText>
        </View>
      </View>

      <Pressable
        onPress={seleccionarArchivo}
        disabled={subiendo || confirmado}
        style={[
          styles.dropZone,
          {
            borderColor: confirmado ? "#22C55E" : existeArchivo ? theme.colors.primary : theme.colors.border,
            backgroundColor: confirmado
              ? "rgba(34,197,94,0.10)"
              : existeArchivo
              ? `${theme.colors.primary}12`
              : theme.colors.background,
          },
        ]}
      >
        <Ionicons
          name={
            confirmado
              ? "checkmark-circle"
              : existeArchivo
              ? "eye-outline"
              : "cloud-upload-outline"
          }
          size={24}
          color={confirmado ? "#22C55E" : existeArchivo ? theme.colors.primary : theme.colors.muted}
        />

        <ThemedText
          style={[
            styles.fileName,
            {
              color: existeArchivo ? theme.colors.text : theme.colors.muted,
            },
          ]}
        >
          {archivoNombre || "Toca para seleccionar PDF, JPG o PNG"}
        </ThemedText>

        {existeArchivo && !confirmado && (
          <ThemedText style={[styles.fileOk, { color: theme.colors.primary }]}>
            Revisa la vista previa antes de confirmar
          </ThemedText>
        )}

        {confirmado && (
          <ThemedText style={[styles.fileOk, { color: "#22C55E" }]}>
            Documento subido correctamente
          </ThemedText>
        )}
      </Pressable>

      {previewUri && esImagen && (
        <Image
          source={{ uri: previewUri }}
          style={[styles.previewImage, { borderColor: theme.colors.border }]}
        />
      )}

      {previewUri && esPdf && Platform.OS === "web" && (
        <iframe
          src={previewUri}
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

      {previewUri && esPdf && Platform.OS !== "web" && (
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
          <Ionicons
            name="document-outline"
            size={24}
            color={theme.colors.primary}
          />

          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.pdfTitle, { color: theme.colors.text }]}>
              Vista previa PDF
            </ThemedText>

            <ThemedText style={[styles.pdfText, { color: theme.colors.muted }]}>
              Toca para abrir el documento completo.
            </ThemedText>
          </View>
        </Pressable>
      )}

      {previewUri && (
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

          <ThemedText style={[styles.openText, { color: theme.colors.primary }]}>
            Ver archivo completo
          </ThemedText>
        </Pressable>
      )}

      <View style={styles.actionRow}>
        {existeArchivo && !confirmado && (
          <Pressable
            disabled={subiendo}
            onPress={limpiarDocumentoLocal}
            style={[
              styles.secondaryBtn,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <ThemedText style={styles.removeText}>Quitar</ThemedText>
          </Pressable>
        )}

        {!confirmado && (
          <Pressable
            disabled={subiendo}
            onPress={existeArchivo ? confirmarYSubir : seleccionarArchivo}
            style={[
              styles.uploadButton,
              {
                backgroundColor: subiendo ? theme.colors.border : theme.colors.primary,
                opacity: subiendo ? 0.7 : 1,
                flex: 1,
              },
            ]}
          >
            {subiendo ? (
              <>
                <ActivityIndicator color="#fff" />
                <ThemedText style={styles.uploadButtonText}>Subiendo...</ThemedText>
              </>
            ) : (
              <>
                <Ionicons
                  name={existeArchivo ? "cloud-upload-outline" : "add-circle-outline"}
                  size={20}
                  color="#fff"
                />

                <ThemedText style={styles.uploadButtonText}>
                  {existeArchivo ? "Confirmar y subir" : "Seleccionar archivo"}
                </ThemedText>
              </>
            )}
          </Pressable>
        )}
      </View>

      {existeArchivo && !confirmado && (
        <Pressable
          disabled={subiendo}
          onPress={seleccionarArchivo}
          style={[
            styles.changeBtn,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <Ionicons name="refresh-outline" size={18} color={theme.colors.primary} />
          <ThemedText style={[styles.changeText, { color: theme.colors.primary }]}>
            Cambiar archivo
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.78)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 920,
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
    fontSize: 23,
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
  notice: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  loadingBox: {
    padding: 50,
    alignItems: "center",
  },
  list: {
    maxHeight: 560,
  },
  listContent: {
    gap: 14,
    paddingBottom: 4,
  },
  emptyBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "900",
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  docCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },
  docTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  docIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  docTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  docDescription: {
    marginTop: 4,
    lineHeight: 20,
    fontWeight: "600",
  },
  dropZone: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 9,
  },
  fileName: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "800",
  },
  fileOk: {
    fontSize: 11,
    textAlign: "center",
    fontWeight: "900",
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
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pdfTitle: {
    fontWeight: "900",
  },
  pdfText: {
    marginTop: 4,
    fontWeight: "600",
  },
  openBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  openText: {
    fontWeight: "900",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  removeText: {
    color: "#EF4444",
    fontWeight: "900",
  },
  uploadButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "900",
  },
  changeBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  changeText: {
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
  doneBtn: {
    minHeight: 46,
    borderRadius: 15,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  doneText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
});