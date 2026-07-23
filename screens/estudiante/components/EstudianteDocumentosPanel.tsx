import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { BASE_URL, httpClient } from "../../../http/httpClient";
import { useTheme } from "../../../theme/useTheme";
import {
  DocumentoEstudiante,
  EstudianteUsuario,
} from "../types/estudiante.types";

type DocumentoRequerido = {
  key: string;
  titulo: string;
  descripcion: string;
  tipos: string[];
  aliases: string[];
};

type DocumentoLocal = {
  archivoNombre: string | null;
  previewUri: string | null;
  mimeType: string | null;
};

type Props = {
  estudiante: EstudianteUsuario | null;
  onDocumentoSubido: (idUsuario: number) => Promise<void> | void;
};

type DocumentosApiResponse =
  | DocumentoEstudiante[]
  | {
      documentos?: DocumentoEstudiante[];
      data?: DocumentoEstudiante[];
    };

const DOCUMENTOS_REQUERIDOS: DocumentoRequerido[] = [
  {
    key: "carnet_identidad",
    titulo: "Carnet de identidad",
    descripcion: "Documento de identidad del estudiante.",
    tipos: ["carnet_identidad", "documento_identidad", "ci"],
    aliases: [
      "carnet de identidad",
      "carnet identidad",
      "fotocopia de carnet",
      "fotocopia carnet",
      "documento de identidad",
      "documento identidad",
      "ci",
      "carnet",
    ],
  },
  {
    key: "certificado_nacimiento",
    titulo: "Certificado de nacimiento",
    descripcion: "Certificado legal del estudiante.",
    tipos: ["certificado_nacimiento"],
    aliases: [
      "certificado de nacimiento",
      "certificado nacimiento",
      "nacimiento",
    ],
  },
  {
    key: "titulo_bachiller",
    titulo: "Título de bachiller",
    descripcion: "Documento académico requerido.",
    tipos: ["titulo_bachiller", "titulo_de_bachiller"],
    aliases: [
      "titulo de bachiller",
      "título de bachiller",
      "titulo bachiller",
      "título bachiller",
      "bachiller",
      "diploma de bachiller",
      "fotocopia legalizada",
    ],
  },
];

function normalizarTexto(texto?: string | null) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\-.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizarTipo(tipo?: string | null) {
  return String(tipo || "")
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, "_");
}

function resolverUrlPublica(ruta?: string | null) {
  const value = String(ruta || "").trim();

  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  return `${BASE_URL}/${value.replace(/^\/+/, "")}`;
}

function normalizarDocumento(
  documento: DocumentoEstudiante,
): DocumentoEstudiante {
  return {
    ...documento,
    archivoUrl: resolverUrlPublica(
      documento.archivoUrl || documento.ubicacionArchivo,
    ),
  };
}

function documentoEstaEntregado(documento?: DocumentoEstudiante | null) {
  if (!documento) return false;

  const estado = normalizarTexto(documento.estadoDocumento);
  const tieneArchivo = Boolean(
    documento.archivoUrl || documento.ubicacionArchivo,
  );

  if (["debe", "faltante", "pendiente", "rechazado", "0"].includes(estado)) {
    return false;
  }

  if (
    estado === "entregado" ||
    estado === "presentado" ||
    estado === "aprobado" ||
    estado === "activo" ||
    estado === "1"
  ) {
    return true;
  }

  /* Un archivo físicamente registrado también se considera cargado. */
  return tieneArchivo;
}

function documentoCoincide(
  documento: DocumentoEstudiante,
  requerido: DocumentoRequerido,
) {
  if (!documentoEstaEntregado(documento)) return false;

  const tipoDocumento = normalizarTipo(documento.tipo);
  const nombreDocumento = normalizarTexto(documento.nombreDocumento);

  const tiposPermitidos = requerido.tipos.map(normalizarTipo);
  const aliasesPermitidos = [
    requerido.titulo,
    requerido.key,
    ...requerido.aliases,
  ].map(normalizarTexto);

  /*
   * Si el documento tiene un tipo explícito, ese tipo es la fuente de verdad.
   * No se debe intentar hacerlo coincidir por nombre con otra categoría.
   */
  if (tipoDocumento) {
    return tiposPermitidos.includes(tipoDocumento);
  }

  if (!nombreDocumento) return false;

  /*
   * Los documentos antiguos no tienen tipo. Para ellos usamos coincidencia
   * exacta con los nombres históricos conocidos. No usamos includes porque
   * el alias corto "ci" también aparece dentro de "nacimiento".
   */
  return aliasesPermitidos.includes(nombreDocumento);
}

function obtenerDocumentoExistente(
  documentos: DocumentoEstudiante[],
  requerido: DocumentoRequerido,
) {
  return (
    [...documentos]
      .sort(
        (a, b) =>
          Number(b.idDocumentoEstudiante || 0) -
          Number(a.idDocumentoEstudiante || 0),
      )
      .find((documento) => documentoCoincide(documento, requerido)) ?? null
  );
}

function obtenerUrlDocumento(documento?: DocumentoEstudiante | null) {
  return resolverUrlPublica(
    documento?.archivoUrl || documento?.ubicacionArchivo,
  );
}

function combinarDocumentos(
  anteriores: DocumentoEstudiante[],
  nuevos: DocumentoEstudiante[],
) {
  const map = new Map<string, DocumentoEstudiante>();

  [...anteriores, ...nuevos].forEach((documento) => {
    const normalizado = normalizarDocumento(documento);
    const key = normalizado.idDocumentoEstudiante
      ? `id-${normalizado.idDocumentoEstudiante}`
      : `${normalizarTipo(normalizado.tipo)}-${normalizarTexto(
          normalizado.nombreDocumento,
        )}-${normalizado.ubicacionArchivo || ""}`;

    map.set(key, normalizado);
  });

  return Array.from(map.values()).sort(
    (a, b) =>
      Number(b.idDocumentoEstudiante || 0) -
      Number(a.idDocumentoEstudiante || 0),
  );
}

function detectarMimeDesdeUrl(url?: string | null) {
  const lower = (url || "").split("?")[0].toLowerCase();

  if (lower.endsWith(".pdf")) return "application/pdf";

  if (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".jfif")
  ) {
    return "image/*";
  }

  return null;
}

function abrirUrl(url?: string | null) {
  if (!url) return;

  if (Platform.OS === "web") {
    window.open(url, "_blank");
    return;
  }

  Linking.openURL(url);
}

function obtenerPdfUrlAjustado(url: string) {
  if (!url) return url;
  if (url.includes("#")) return url;

  return `${url}#toolbar=0&navpanes=0&scrollbar=0&view=Fit&zoom=page-fit`;
}

function obtenerNombreArchivoDesdeRuta(ruta?: string | null) {
  if (!ruta) return null;

  const clean = ruta.split("?")[0];
  const partes = clean.split("/");

  return partes[partes.length - 1] || null;
}

export default function EstudianteDocumentosPanel({
  estudiante,
  onDocumentoSubido,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const documentosIniciales = useMemo(
    () =>
      (Array.isArray(estudiante?.documentos)
        ? estudiante?.documentos
        : []
      ).map(normalizarDocumento),
    [estudiante?.id, estudiante?.documentos],
  );

  const [documentos, setDocumentos] = useState<DocumentoEstudiante[]>(
    documentosIniciales,
  );
  const [cargandoDocumentos, setCargandoDocumentos] = useState(false);

  const cargarDocumentosServidor = useCallback(async () => {
    if (!estudiante?.id) return [];

    try {
      setCargandoDocumentos(true);

      const response = await httpClient.getAuth<DocumentosApiResponse>(
        `/api/documentos-estudiante/${estudiante.id}`,
        "No se pudieron cargar los documentos del estudiante",
      );

      const lista = Array.isArray(response)
        ? response
        : response.documentos ?? response.data ?? [];

      const normalizados = Array.isArray(lista)
        ? lista.map(normalizarDocumento)
        : [];

      setDocumentos((actuales) =>
        combinarDocumentos(documentosIniciales, [
          ...actuales,
          ...normalizados,
        ]),
      );

      return normalizados;
    } catch {
      /* Se mantiene lo recibido por el detalle para evitar el parpadeo. */
      setDocumentos((actuales) =>
        combinarDocumentos(documentosIniciales, actuales),
      );

      return [];
    } finally {
      setCargandoDocumentos(false);
    }
  }, [estudiante?.id, documentosIniciales]);

  useEffect(() => {
    setDocumentos(documentosIniciales);

    if (estudiante?.id) {
      void cargarDocumentosServidor();
    }
  }, [estudiante?.id, cargarDocumentosServidor, documentosIniciales]);

  if (!estudiante) return null;

  return (
    <View style={styles.container}>
      {cargandoDocumentos && documentos.length === 0 && (
        <View style={styles.loadingDocuments}>
          <ActivityIndicator color={colors.primary} size="small" />
          <ThemedText style={styles.loadingDocumentsText}>
            Verificando documentos registrados...
          </ThemedText>
        </View>
      )}

      <View style={styles.grid}>
        {DOCUMENTOS_REQUERIDOS.map((doc) => {
          const documentoExistente = obtenerDocumentoExistente(documentos, doc);

          return (
            <DocumentoEstadoCard
              key={`${estudiante.id}-${doc.key}`}
              idUsuario={estudiante.id}
              documentoRequerido={doc}
              documentoExistente={documentoExistente}
              onDocumentoSubido={async () => {
                await onDocumentoSubido(estudiante.id);
                await cargarDocumentosServidor();
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function DocumentoEstadoCard({
  idUsuario,
  documentoRequerido,
  documentoExistente,
  onDocumentoSubido,
}: {
  idUsuario: number;
  documentoRequerido: DocumentoRequerido;
  documentoExistente?: DocumentoEstudiante | null;
  onDocumentoSubido: () => Promise<void> | void;
}) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [subiendo, setSubiendo] = useState(false);
  const [local, setLocal] = useState<DocumentoLocal>({
    archivoNombre: null,
    previewUri: null,
    mimeType: null,
  });

  const urlExistente = obtenerUrlDocumento(documentoExistente);
  const mimeExistente = detectarMimeDesdeUrl(urlExistente);

  const previewUri = local.previewUri || urlExistente;

  const archivoNombre =
    local.archivoNombre ||
    documentoExistente?.nombreDocumento ||
    obtenerNombreArchivoDesdeRuta(documentoExistente?.ubicacionArchivo) ||
    documentoRequerido.titulo;

  const mimeType = local.mimeType || mimeExistente;
  const existeArchivo = Boolean(previewUri);

  const esImagen =
    mimeType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|jfif)$/i.test(previewUri || "");

  const esPdf =
    mimeType === "application/pdf" || /\.pdf$/i.test(previewUri || "");

  useEffect(() => {
    setLocal({
      archivoNombre: null,
      previewUri: null,
      mimeType: null,
    });
  }, [documentoExistente?.idDocumentoEstudiante]);

  const subirArchivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const archivo = result.assets[0];

      const formData = new FormData();

      formData.append("idUsuario", String(idUsuario));
      formData.append("nombreDocumento", documentoRequerido.titulo);
      formData.append("tipo", documentoRequerido.key);

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

        formData.append("archivo", webFile, archivo.name);
      } else {
        formData.append("archivo", {
          uri: archivo.uri,
          name: archivo.name || "documento.pdf",
          type: archivo.mimeType || "application/pdf",
        } as any);
      }

      setSubiendo(true);

      await httpClient.postFormData("/api/documentos-estudiante", formData);

      setLocal({
        archivoNombre: archivo.name || documentoRequerido.titulo,
        previewUri: archivo.uri,
        mimeType: archivo.mimeType || null,
      });

      Toast.show({
        type: "success",
        text1: "Documento subido",
        text2: documentoRequerido.titulo,
      });

      await onDocumentoSubido();
    } catch (error) {

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo subir el documento.",
      });
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <View
      style={[
        styles.docCard,
        existeArchivo ? styles.docCardOk : styles.docCardMissing,
      ]}
    >
      <View style={styles.topArea}>
        <View style={styles.cardTop}>
          <View
            style={[
              styles.docIcon,
              existeArchivo ? styles.docIconOk : styles.docIconMissing,
            ]}
          >
            <Ionicons
              name={
                existeArchivo ? "checkmark-circle" : "document-text-outline"
              }
              size={20}
              color={existeArchivo ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={styles.docTitleBox}>
            <ThemedText style={styles.docTitle} numberOfLines={1}>
              {documentoRequerido.titulo}
            </ThemedText>

            <View
              style={[
                styles.statusPill,
                existeArchivo ? styles.statusOk : styles.statusMissing,
              ]}
            >
              <ThemedText style={styles.statusText}>
                {existeArchivo ? "Cargado" : "Faltante"}
              </ThemedText>
            </View>
          </View>
        </View>

        <ThemedText style={styles.docDescription} numberOfLines={1}>
          {documentoRequerido.descripcion}
        </ThemedText>

        <View
          style={[
            styles.dropBox,
            existeArchivo ? styles.dropBoxOk : styles.dropBoxMissing,
          ]}
        >
          <Ionicons
            name={existeArchivo ? "checkmark-circle" : "cloud-upload-outline"}
            size={15}
            color={existeArchivo ? colors.primary : colors.textMuted}
          />

          <View style={styles.fileInfo}>
            <ThemedText style={styles.fileName} numberOfLines={1}>
              {archivoNombre || "PDF, JPG o PNG - máximo 5MB"}
            </ThemedText>

            {existeArchivo && (
              <ThemedText style={styles.fileOk} numberOfLines={1}>
                Documento cargado correctamente
              </ThemedText>
            )}
          </View>
        </View>
      </View>

      <View style={styles.previewArea}>
        {previewUri && esImagen && (
          <Image source={{ uri: previewUri }} style={styles.previewImage} />
        )}

        {previewUri && esPdf && Platform.OS === "web" && (
          <PdfPreview
            uri={previewUri}
            title={archivoNombre || documentoRequerido.titulo}
          />
        )}

        {previewUri && esPdf && Platform.OS !== "web" && (
          <Pressable
            onPress={() => abrirUrl(previewUri)}
            style={styles.pdfPreviewNative}
          >
            <Ionicons
              name="document-outline"
              size={34}
              color={colors.primary}
            />

            <ThemedText style={styles.pdfTitle}>Documento PDF</ThemedText>

            <ThemedText style={styles.pdfSub}>
              Toca para abrir el archivo completo.
            </ThemedText>
          </Pressable>
        )}

        {!previewUri && (
          <View style={styles.emptyPreview}>
            <Ionicons
              name="document-attach-outline"
              size={38}
              color={colors.textMuted}
            />

            <ThemedText style={styles.emptyPreviewText}>
              Documento pendiente
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        {previewUri && (
          <Pressable
            onPress={() => abrirUrl(previewUri)}
            style={styles.secondaryBtn}
          >
            <Ionicons name="open-outline" size={16} color={colors.primary} />

            <ThemedText style={styles.secondaryBtnText}>Ver</ThemedText>
          </Pressable>
        )}

        <Pressable
          disabled={subiendo}
          onPress={subirArchivo}
          style={[
            styles.uploadBtn,
            !previewUri && styles.uploadBtnFull,
            subiendo && styles.disabled,
          ]}
        >
          {subiendo ? (
            <>
              <ActivityIndicator color={colors.primaryForeground} />

              <ThemedText style={styles.uploadText}>Subiendo...</ThemedText>
            </>
          ) : (
            <>
              <Ionicons
                name={
                  existeArchivo
                    ? "refresh-circle-outline"
                    : "add-circle-outline"
                }
                size={17}
                color={colors.primaryForeground}
              />

              <ThemedText style={styles.uploadText}>
                {existeArchivo ? "Cambiar" : "Subir archivo"}
              </ThemedText>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function PdfPreview({ uri, title }: { uri: string; title: string }) {
  const Iframe = "iframe" as any;

  return (
    <Iframe
      src={obtenerPdfUrlAjustado(uri)}
      title={title}
      scrolling="no"
      style={{
        width: "100%",
        height: "100%",
        border: "0",
        backgroundColor: "#fff",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    />
  );
}

function createStyles(colors: any) {
  const muted = colors.textMuted || colors.muted || colors.textSecondary;

  return StyleSheet.create({
    container: {
      flex: 1,
      minHeight: 0,
      gap: 8,
    },

    loadingDocuments: {
      minHeight: 34,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    loadingDocumentsText: {
      color: colors.textSecondary,
      fontSize: 11.5,
      fontWeight: "800",
    },

    grid: {
      flex: 1,
      minHeight: 0,
      flexDirection: "row",
      flexWrap: "nowrap",
      gap: 12,
    },

    docCard: {
      flex: 1,
      minWidth: 0,
      height: "100%",
      borderWidth: 1,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 14,
      gap: 9,
      overflow: "hidden",
    },

    docCardOk: {
      borderColor: colors.primary,
    },

    docCardMissing: {
      borderColor: colors.border,
    },

    topArea: {
      gap: 7,
    },

    cardTop: {
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      minHeight: 44,
    },

    docIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    docIconOk: {
      backgroundColor: `${colors.primary}22`,
      borderColor: `${colors.primary}55`,
    },

    docIconMissing: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.border,
    },

    docTitleBox: {
      flex: 1,
      minWidth: 0,
    },

    docTitle: {
      fontSize: 17,
      fontWeight: "900",
      color: colors.text,
      lineHeight: 20,
    },

    statusPill: {
      marginTop: 3,
      alignSelf: "flex-start",
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },

    statusOk: {
      backgroundColor: colors.primary,
    },

    statusMissing: {
      backgroundColor: colors.destructive || "#DC2626",
    },

    statusText: {
      color: colors.primaryForeground,
      fontWeight: "900",
      fontSize: 10,
    },

    docDescription: {
      color: colors.textSecondary,
      lineHeight: 17,
      fontWeight: "700",
      fontSize: 12.5,
    },

    dropBox: {
      height: 50,
      borderWidth: 1,
      borderStyle: "dashed",
      borderRadius: 13,
      paddingHorizontal: 11,
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },

    dropBoxOk: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}12`,
    },

    dropBoxMissing: {
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
    },

    fileInfo: {
      flex: 1,
      minWidth: 0,
    },

    fileName: {
      fontSize: 11.5,
      color: colors.text,
      fontWeight: "900",
    },

    fileOk: {
      marginTop: 2,
      fontSize: 10,
      color: colors.primary,
      fontWeight: "900",
    },

    previewArea: {
      flex: 1,
      minHeight: 0,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "#FFFFFF",
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },

    previewImage: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
      backgroundColor: "#FFFFFF",
    },

    emptyPreview: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      gap: 10,
    },

    emptyPreviewText: {
      color: muted,
      fontWeight: "900",
      fontSize: 13,
    },

    pdfPreviewNative: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      gap: 8,
      padding: 16,
    },

    pdfTitle: {
      fontWeight: "900",
      color: colors.text,
      fontSize: 15,
    },

    pdfSub: {
      color: muted,
      fontWeight: "700",
      fontSize: 12,
      textAlign: "center",
    },

    actionsRow: {
      height: 42,
      flexDirection: "row",
      gap: 8,
    },

    secondaryBtn: {
      height: 42,
      minWidth: 84,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 6,
      paddingHorizontal: 10,
    },

    secondaryBtnText: {
      color: colors.primary,
      fontWeight: "900",
      fontSize: 12,
    },

    uploadBtn: {
      flex: 1,
      height: 42,
      borderRadius: 13,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 7,
      paddingHorizontal: 10,
    },

    uploadBtnFull: {
      flex: 1,
    },

    uploadText: {
      color: colors.primaryForeground,
      fontWeight: "900",
      fontSize: 12,
    },

    disabled: {
      opacity: 0.7,
    },
  });
}