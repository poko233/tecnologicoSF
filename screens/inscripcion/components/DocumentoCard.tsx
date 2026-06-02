import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
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
  idUsuario: number;
  titulo: string;
  descripcion: string;
  documentoLocal?: DocumentoLocal;
  onDocumentoChange: (documento: DocumentoLocal) => void;
};

export default function DocumentoCard({
  idUsuario,
  titulo,
  descripcion,
  documentoLocal,
  onDocumentoChange,
}: Props) {
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
    } catch (error) {
      console.error(error);

      limpiarDocumentoLocal();

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo subir el documento.",
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
      style={{
        flex: 1,
        minWidth: 280,
        borderWidth: 1,
        borderColor: existeArchivo ? theme.colors.primary : theme.colors.border,
        backgroundColor: theme.colors.card,
        borderRadius: 22,
        padding: 20,
        gap: 18,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: existeArchivo
            ? `${theme.colors.primary}22`
            : theme.colors.background,
          borderWidth: 1,
          borderColor: existeArchivo
            ? `${theme.colors.primary}55`
            : theme.colors.border,
          justifyContent: "center",
          alignItems: "center",
        }}
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
            fontSize: 22,
            fontWeight: "900",
            color: theme.colors.text,
          }}
        >
          {titulo}
        </ThemedText>

        <ThemedText
          style={{
            marginTop: 6,
            color: theme.colors.muted,
            lineHeight: 22,
            fontWeight: "600",
          }}
        >
          {descripcion}
        </ThemedText>
      </View>

      <View
        style={{
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: existeArchivo ? theme.colors.primary : theme.colors.border,
          backgroundColor: existeArchivo
            ? `${theme.colors.primary}12`
            : theme.colors.background,
          borderRadius: 16,
          padding: 18,
          alignItems: "center",
          gap: 10,
        }}
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

      {previewUri && esImagen && (
        <Image
          source={{ uri: previewUri }}
          style={{
            width: "100%",
            height: 240,
            borderRadius: 18,
            resizeMode: "cover",
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        />
      )}

      {previewUri && esPdf && Platform.OS === "web" && (
        <iframe
          src={previewUri}
          style={{
            width: "100%",
            height: 320,
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
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
            borderRadius: 16,
            padding: 18,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Ionicons
            name="document-outline"
            size={24}
            color={theme.colors.primary}
          />

          <View style={{ flex: 1 }}>
            <ThemedText
              style={{
                fontWeight: "900",
                color: theme.colors.text,
              }}
            >
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

      {previewUri && (
        <Pressable
          onPress={abrirArchivoCompleto}
          style={{
            height: 48,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <Ionicons
            name="open-outline"
            size={20}
            color={theme.colors.primary}
          />

          <ThemedText
            style={{
              color: theme.colors.primary,
              fontWeight: "900",
            }}
          >
            Ver archivo completo
          </ThemedText>
        </Pressable>
      )}

      <Pressable
        disabled={subiendo}
        onPress={subirArchivo}
        style={{
          height: 54,
          borderRadius: 16,
          backgroundColor: subiendo ? theme.colors.border : theme.colors.primary,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: 8,
          opacity: subiendo ? 0.7 : 1,
        }}
      >
        {subiendo ? (
          <>
            <ActivityIndicator color="#fff" />

            <ThemedText
              style={{
                color: "#fff",
                fontWeight: "900",
              }}
            >
              Subiendo...
            </ThemedText>
          </>
        ) : (
          <>
            <Ionicons
              name={
                existeArchivo ? "refresh-circle-outline" : "add-circle-outline"
              }
              size={20}
              color="#fff"
            />

            <ThemedText
              style={{
                color: "#fff",
                fontWeight: "900",
              }}
            >
              {existeArchivo ? "Cambiar Archivo" : "Subir Archivo"}
            </ThemedText>
          </>
        )}
      </Pressable>
    </View>
  );
}