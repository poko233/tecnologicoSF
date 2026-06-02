import { Ionicons } from "@expo/vector-icons";
import { Dispatch, SetStateAction } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import DocumentoCard from "./DocumentoCard";

type DocumentoLocal = {
  nombreDocumento: string;
  archivoNombre: string | null;
  previewUri: string | null;
  mimeType: string | null;
};

type Props = {
  idUsuario: number;
  documentosLocales: Record<string, DocumentoLocal>;
  setDocumentosLocales: Dispatch<SetStateAction<Record<string, DocumentoLocal>>>;
  onBack: () => void;
  onFinish: () => void;
};

const DOCUMENTOS_REQUERIDOS = [
  {
    titulo: "Fotocopia de carnet",
    descripcion:
      "Copia legible de ambos lados del documento de identidad vigente.",
  },
  {
    titulo: "Certificado de nacimiento",
    descripcion: "Certificado original o copia legalizada reciente.",
  },
  {
    titulo: "Fotocopia legalizada",
    descripcion:
      "Diploma de bachiller o título previo debidamente legalizado.",
  },
];

export default function PasoDocumentacion({
  idUsuario,
  documentosLocales,
  setDocumentosLocales,
  onBack,
  onFinish,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width < 900;

  const documentosCargados = DOCUMENTOS_REQUERIDOS.filter(
    (doc) => documentosLocales[doc.titulo]?.previewUri
  ).length;

  const totalDocumentos = DOCUMENTOS_REQUERIDOS.length;

  const todosCargados = documentosCargados === totalDocumentos;
  const algunoCargado = documentosCargados > 0;

  return (
    <View style={{ gap: 24 }}>
      <View>
        <ThemedText
          style={{
            fontSize: 28,
            fontWeight: "900",
            color: theme.colors.text,
          }}
        >
          Carga de Documentos
        </ThemedText>

        <ThemedText
          style={{
            marginTop: 6,
            color: theme.colors.muted,
            fontWeight: "600",
          }}
        >
          Sube los documentos disponibles. Puedes finalizar la inscripción aunque
          falten documentos.
        </ThemedText>
      </View>

      <View
        style={{
          borderWidth: 1,
          borderColor: todosCargados
            ? theme.colors.primary
            : theme.colors.border,
          backgroundColor: todosCargados
            ? `${theme.colors.primary}14`
            : theme.colors.card,
          borderRadius: 18,
          padding: 16,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons
            name={
              todosCargados
                ? "checkmark-circle"
                : algunoCargado
                ? "cloud-done-outline"
                : "document-text-outline"
            }
            size={24}
            color={
              todosCargados || algunoCargado
                ? theme.colors.primary
                : theme.colors.muted
            }
          />

          <View>
            <ThemedText
              style={{
                fontWeight: "900",
                color: theme.colors.text,
              }}
            >
              Documentos cargados: {documentosCargados}/{totalDocumentos}
            </ThemedText>

            <ThemedText
              style={{
                marginTop: 3,
                color: theme.colors.muted,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {todosCargados
                ? "Todos los documentos fueron cargados."
                : "La inscripción puede finalizarse y los documentos faltantes pueden completarse después."}
            </ThemedText>
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          gap: 18,
        }}
      >
        {DOCUMENTOS_REQUERIDOS.map((documento) => (
          <DocumentoCard
            key={documento.titulo}
            idUsuario={idUsuario}
            titulo={documento.titulo}
            descripcion={documento.descripcion}
            documentoLocal={documentosLocales[documento.titulo]}
            onDocumentoChange={(doc) =>
              setDocumentosLocales((prev) => ({
                ...prev,
                [documento.titulo]: doc,
              }))
            }
          />
        ))}
      </View>

      <View
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card,
          borderRadius: 16,
          padding: 18,
        }}
      >
        <ThemedText
          style={{
            fontWeight: "900",
            color: theme.colors.text,
          }}
        >
          Validación Institucional
        </ThemedText>

        <ThemedText
          style={{
            marginTop: 6,
            color: theme.colors.muted,
            fontWeight: "600",
            lineHeight: 20,
          }}
        >
          El departamento de control escolar podrá revisar los documentos
          cargados y solicitar los faltantes posteriormente.
        </ThemedText>
      </View>

      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <Pressable
          onPress={onBack}
          style={{
            height: 52,
            paddingHorizontal: 24,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.card,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />

          <ThemedText
            style={{
              fontWeight: "900",
              color: theme.colors.primary,
            }}
          >
            Atrás
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={onFinish}
          style={{
            height: 52,
            paddingHorizontal: 24,
            borderRadius: 14,
            backgroundColor: theme.colors.primary,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
            opacity: 1,
          }}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />

          <ThemedText style={{ color: "#fff", fontWeight: "900" }}>
            Finalizar Inscripción
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}