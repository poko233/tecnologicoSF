import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
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
};

type Props = {
  visible: boolean;
  idUsuario: number | null;
  estudianteNombre: string;
  documentosPendientes: string[];
  onClose: () => void;
  onSuccess: () => void;
};

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

  useEffect(() => {
    if (visible) {
      setDocumentosLocales(
        documentosPendientes.map((nombreDocumento) => ({
          nombreDocumento,
          archivoNombre: null,
          previewUri: null,
          mimeType: null,
        }))
      );
    }
  }, [visible, documentosPendientes]);

  const actualizarDocumento = (documento: DocumentoLocal) => {
    setDocumentosLocales((prev) => [
      ...prev.filter((d) => d.nombreDocumento !== documento.nombreDocumento),
      documento,
    ]);
  };

  const totalSubidos = documentosLocales.filter(
    (d) => d.archivoNombre && d.previewUri
  ).length;

  const finalizar = () => {
    Toast.show({
      type: "success",
      text1: "Documentos actualizados",
    });

    onSuccess();
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
              Puedes subir solo los documentos que tengas ahora. No es obligatorio subir todos.
            </ThemedText>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {documentosPendientes.length === 0 ? (
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
                  No hay documentos pendientes
                </ThemedText>
              </View>
            ) : (
              documentosPendientes.map((titulo) => {
                const documentoLocal = documentosLocales.find(
                  (d) => d.nombreDocumento === titulo
                );

                return (
                  <DocumentoPendienteCard
                    key={titulo}
                    idUsuario={idUsuario}
                    titulo={titulo}
                    descripcion="Documento pendiente del estudiante."
                    documentoLocal={documentoLocal}
                    onDocumentoChange={actualizarDocumento}
                  />
                );
              })
            )}
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                borderTopColor: theme.colors.border,
              },
            ]}
          >
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
              disabled={totalSubidos === 0}
              style={[
                styles.doneBtn,
                {
                  backgroundColor:
                    totalSubidos === 0 ? theme.colors.border : theme.colors.primary,
                  opacity: totalSubidos === 0 ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons name="checkmark-circle-outline" size={19} color="#fff" />

              <ThemedText style={styles.doneText}>
                Finalizar ({totalSubidos})
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
}: {
  idUsuario: number | null;
  titulo: string;
  descripcion: string;
  documentoLocal?: DocumentoLocal;
  onDocumentoChange: (documento: DocumentoLocal) => void;
}) {
  const { theme } = useTheme();

  const [subiendo, setSubiendo] = useState(false);
  const [archivoNombre, setArchivoNombre] = useState<string | null>(
    documentoLocal?.archivoNombre ?? null
  );
  const [previewUri, setPreviewUri] = useState<string | null>(
    documentoLocal?.previewUri ?? null
  );
  const [mimeType, setMimeType] = useState<string | null>(
    documentoLocal?.mimeType ?? null
  );

  useEffect(() => {
    setArchivoNombre(documentoLocal?.archivoNombre ?? null);
    setPreviewUri(documentoLocal?.previewUri ?? null);
    setMimeType(documentoLocal?.mimeType ?? null);
  }, [documentoLocal]);

  const limpiarDocumentoLocal = () => {
    setArchivoNombre(null);
    setPreviewUri(null);
    setMimeType(null);

    onDocumentoChange({
      nombreDocumento: titulo,
      archivoNombre: null,
      previewUri: null,
      mimeType: null,
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

      limpiarDocumentoLocal();

      const archivo = result.assets[0];

      const documentoGuardado: DocumentoLocal = {
        nombreDocumento: titulo,
        archivoNombre: archivo.name ?? "documento",
        previewUri: archivo.uri,
        mimeType: archivo.mimeType ?? null,
      };

      const formData = new FormData();

      formData.append("idUsuario", String(idUsuario));
      formData.append("nombreDocumento", titulo);

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

      setArchivoNombre(documentoGuardado.archivoNombre);
      setPreviewUri(documentoGuardado.previewUri);
      setMimeType(documentoGuardado.mimeType);

      onDocumentoChange(documentoGuardado);

      Toast.show({
        type: "success",
        text1: "Documento subido",
        text2: titulo,
      });
    } catch (error: any) {
      console.error("ERROR SUBIENDO DOCUMENTO PENDIENTE:", error);

      limpiarDocumentoLocal();

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
          borderColor: existeArchivo ? theme.colors.primary : theme.colors.border,
          backgroundColor: theme.colors.card,
        },
      ]}
    >
      <View style={styles.docTop}>
        <View
          style={[
            styles.docIcon,
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
            size={26}
            color={existeArchivo ? theme.colors.primary : theme.colors.muted}
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
          style={[
            styles.fileName,
            {
              color: existeArchivo ? theme.colors.text : theme.colors.muted,
            },
          ]}
        >
          {archivoNombre || "PDF, JPG o PNG - máximo 5MB"}
        </ThemedText>

        {existeArchivo && (
          <ThemedText style={[styles.fileOk, { color: theme.colors.primary }]}>
            Documento cargado correctamente
          </ThemedText>
        )}
      </View>

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
            height: 260,
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

      <View style={styles.docActions}>
        {existeArchivo && (
          <Pressable
            disabled={subiendo}
            onPress={limpiarDocumentoLocal}
            style={[
              styles.removeLocalBtn,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />

            <ThemedText style={styles.removeLocalText}>Quitar</ThemedText>
          </Pressable>
        )}

        <Pressable
          disabled={subiendo}
          onPress={subirArchivo}
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
                name={existeArchivo ? "refresh-circle-outline" : "add-circle-outline"}
                size={20}
                color="#fff"
              />

              <ThemedText style={styles.uploadButtonText}>
                {existeArchivo ? "Cambiar Archivo" : "Subir Archivo"}
              </ThemedText>
            </>
          )}
        </Pressable>
      </View>
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
  docActions: {
    flexDirection: "row",
    gap: 10,
  },
  removeLocalBtn: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  removeLocalText: {
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