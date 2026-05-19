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

  return (
    <View style={{ gap: 24 }}>
      <View>
        <ThemedText style={{ fontSize: 28, fontWeight: "900" }}>
          Carga de Documentos
        </ThemedText>

        <ThemedText style={{ marginTop: 6, opacity: 0.75 }}>
          Sube los documentos requeridos para completar la inscripción.
        </ThemedText>
      </View>

      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          gap: 18,
        }}
      >
        <DocumentoCard
          idUsuario={idUsuario}
          titulo="Fotocopia de carnet"
          descripcion="Copia legible de ambos lados del documento de identidad vigente."
          documentoLocal={documentosLocales["Fotocopia de carnet"]}
          onDocumentoChange={(doc) =>
            setDocumentosLocales((prev) => ({
              ...prev,
              ["Fotocopia de carnet"]: doc,
            }))
          }
        />

        <DocumentoCard
          idUsuario={idUsuario}
          titulo="Certificado de nacimiento"
          descripcion="Certificado original o copia legalizada reciente."
          documentoLocal={documentosLocales["Certificado de nacimiento"]}
          onDocumentoChange={(doc) =>
            setDocumentosLocales((prev) => ({
              ...prev,
              ["Certificado de nacimiento"]: doc,
            }))
          }
        />

        <DocumentoCard
          idUsuario={idUsuario}
          titulo="Fotocopia legalizada"
          descripcion="Diploma de bachiller o título previo debidamente legalizado."
          documentoLocal={documentosLocales["Fotocopia legalizada"]}
          onDocumentoChange={(doc) =>
            setDocumentosLocales((prev) => ({
              ...prev,
              ["Fotocopia legalizada"]: doc,
            }))
          }
        />
      </View>

      <View
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondary,
          borderRadius: 16,
          padding: 18,
        }}
      >
        <ThemedText style={{ fontWeight: "900" }}>
          Validación Institucional
        </ThemedText>

        <ThemedText style={{ marginTop: 6, opacity: 0.75 }}>
          Una vez finalizada la carga, el departamento de control escolar revisará los documentos.
        </ThemedText>
      </View>

      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <Pressable onPress={onBack}>
          <ThemedText style={{ fontWeight: "900", color: theme.colors.primary }}>
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
          }}
        >
          <ThemedText style={{ color: "#fff", fontWeight: "900" }}>
            Finalizar Inscripción
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}