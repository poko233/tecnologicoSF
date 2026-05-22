import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { httpClient } from "../../../http/httpClient";
import { useTheme } from "../../../theme/useTheme";
import { ResumenInscripcion } from "../types/inscripcion.types";

type Props = {
  idUsuario: number;
  onDashboard?: () => void;
  onResetForm?: () => void;
};

export default function PasoFinalizar({
  idUsuario,
  onDashboard,
  onResetForm,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width < 900;

  const [loading, setLoading] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [resumen, setResumen] = useState<ResumenInscripcion | null>(null);

  const cargarResumen = async () => {
    try {
      setLoading(true);

      const response = await httpClient.getAuth<ResumenInscripcion>(
        `/api/inscripcion/resumen/${idUsuario}`
      );

      setResumen(response);
    } catch (error) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cargar el resumen.",
      });
    } finally {
      setLoading(false);
    }
  };

  const finalizar = async () => {
    try {
      setFinalizando(true);

      await httpClient.postAuth(`/api/inscripcion/finalizar/${idUsuario}`, {});

      Toast.show({
        type: "success",
        text1: "Inscripción finalizada",
        text2: "Los datos fueron guardados correctamente.",
      });

      onResetForm?.();
    } catch (error) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo finalizar la inscripción.",
      });
    } finally {
      setFinalizando(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, [idUsuario]);

  if (loading) {
    return (
      <View
        style={{
          padding: 40,
          alignItems: "center",
          gap: 12,
        }}
      >
        <ActivityIndicator color={theme.colors.primary} />

        <ThemedText
          style={{
            color: theme.colors.text,
            fontWeight: "700",
          }}
        >
          Cargando resumen...
        </ThemedText>
      </View>
    );
  }

  if (!resumen) {
    return (
      <View
        style={{
          padding: 30,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card,
          borderRadius: 18,
        }}
      >
        <ThemedText
          style={{
            color: theme.colors.text,
            fontWeight: "900",
          }}
        >
          No se encontró información de la inscripción.
        </ThemedText>
      </View>
    );
  }

  const nombreCompleto = `${resumen.usuario.nombres} ${resumen.usuario.apellidoPaterno} ${resumen.usuario.apellidoMaterno}`;
  const gruposResumen = resumen.grupos ?? [];
  const documentosResumen = resumen.documentos ?? [];

  const InfoLabel = ({ children }: { children: React.ReactNode }) => (
    <ThemedText
      style={{
        color: theme.colors.muted,
        fontWeight: "900",
        fontSize: 12,
      }}
    >
      {children}
    </ThemedText>
  );

  const InfoValue = ({ children }: { children: React.ReactNode }) => (
    <ThemedText
      style={{
        color: theme.colors.text,
        fontWeight: "800",
      }}
    >
      {children}
    </ThemedText>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ gap: 24, paddingBottom: 30 }}>
        <View style={{ alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 86,
              height: 86,
              borderRadius: 43,
              backgroundColor: theme.colors.primary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="checkmark" size={46} color="#FFFFFF" />
          </View>

          <ThemedText
            style={{
              fontSize: 24,
              fontWeight: "900",
              color: theme.colors.text,
            }}
          >
            ¡Inscripción Exitosa!
          </ThemedText>

          <ThemedText
            style={{
              color: theme.colors.muted,
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            El proceso de inscripción fue completado correctamente.
          </ThemedText>
        </View>

        <View
          style={{
            flexDirection: isMobile ? "column" : "row",
            gap: 18,
          }}
        >
          <View
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              borderRadius: 20,
              padding: 20,
              gap: 14,
            }}
          >
            <Ionicons
              name="person-outline"
              size={28}
              color={theme.colors.primary}
            />

            <ThemedText
              style={{
                fontSize: 18,
                fontWeight: "900",
                color: theme.colors.text,
              }}
            >
              Datos Personales
            </ThemedText>

            <InfoLabel>NOMBRE COMPLETO</InfoLabel>
            <InfoValue>{nombreCompleto}</InfoValue>

            <InfoLabel>CÉDULA DE IDENTIDAD</InfoLabel>
            <InfoValue>{resumen.usuario.ci}</InfoValue>

            {resumen.usuario.celular ? (
              <>
                <InfoLabel>CELULAR</InfoLabel>
                <InfoValue>{resumen.usuario.celular}</InfoValue>
              </>
            ) : null}

            {resumen.usuario.direccion ? (
              <>
                <InfoLabel>DIRECCIÓN</InfoLabel>
                <InfoValue>{resumen.usuario.direccion}</InfoValue>
              </>
            ) : null}
          </View>

          <View
            style={{
              flex: 2,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              borderRadius: 20,
              padding: 20,
              gap: 14,
            }}
          >
            <Ionicons
              name="school-outline"
              size={28}
              color={theme.colors.primary}
            />

            <ThemedText
              style={{
                fontSize: 18,
                fontWeight: "900",
                color: theme.colors.text,
              }}
            >
              Datos Académicos
            </ThemedText>

            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                gap: 18,
              }}
            >
              <View style={{ flex: 1 }}>
                <InfoLabel>CARRERA ELEGIDA</InfoLabel>

                <InfoValue>
                  {resumen.carrera?.nombreCarrera ?? "Sin carrera"}
                </InfoValue>

                <View style={{ height: 12 }} />

                <InfoLabel>RÉGIMEN</InfoLabel>

                <InfoValue>{resumen.carrera?.regimen ?? "-"}</InfoValue>
              </View>

              <View style={{ flex: 1 }}>
                <InfoLabel>GRUPOS SELECCIONADOS</InfoLabel>

                {gruposResumen.length === 0 ? (
                  <InfoValue>Sin grupos</InfoValue>
                ) : (
                  <View style={{ gap: 10, marginTop: 8 }}>
                    {gruposResumen.map((grupo) => (
                      <View
                        key={grupo.idGrupo}
                        style={{
                          borderWidth: 1,
                          borderColor: theme.colors.border,
                          borderRadius: 14,
                          padding: 12,
                          backgroundColor: theme.colors.background,
                          gap: 4,
                        }}
                      >
                        <ThemedText
                          style={{
                            fontWeight: "900",
                            color: theme.colors.text,
                          }}
                        >
                          {grupo.nombre}
                        </ThemedText>

                        <ThemedText
                          style={{
                            color: theme.colors.muted,
                            fontWeight: "700",
                          }}
                        >
                          Código: {grupo.codigo ?? "-"}
                        </ThemedText>

                        <ThemedText
                          style={{
                            color: theme.colors.muted,
                            fontWeight: "700",
                          }}
                        >
                          Paralelo: {grupo.paralelo ?? "-"}
                        </ThemedText>

                        <ThemedText
                          style={{
                            color: theme.colors.muted,
                            fontWeight: "700",
                          }}
                        >
                          Horario: {grupo.turno ?? "-"} ·{" "}
                          {grupo.horario ?? "-"}
                        </ThemedText>

                        <ThemedText
                          style={{
                            color: theme.colors.muted,
                            fontWeight: "700",
                          }}
                        >
                          Gestión: {grupo.gestion ?? "-"}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.card,
            borderRadius: 20,
            padding: 20,
            gap: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Ionicons
              name="document-text-outline"
              size={26}
              color={theme.colors.primary}
            />

            <ThemedText
              style={{
                fontSize: 18,
                fontWeight: "900",
                color: theme.colors.text,
              }}
            >
              Documentación Verificada
            </ThemedText>
          </View>

          {documentosResumen.length === 0 ? (
            <ThemedText
              style={{
                color: theme.colors.muted,
                fontWeight: "700",
              }}
            >
              No hay documentos registrados.
            </ThemedText>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {documentosResumen.map((doc) => (
                <View
                  key={doc.idDocumentoEstudiante}
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                    borderRadius: 999,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color={theme.colors.primary}
                  />

                  <ThemedText
                    style={{
                      fontWeight: "800",
                      color: theme.colors.text,
                    }}
                  >
                    {doc.nombreDocumento}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>

        <View
          style={{
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <Pressable
            onPress={finalizar}
            disabled={finalizando}
            style={{
              height: 56,
              minWidth: 280,
              borderRadius: 14,
              backgroundColor: theme.colors.primary,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 8,
              opacity: finalizando ? 0.7 : 1,
            }}
          >
            {finalizando ? (
              <>
                <ActivityIndicator color="#FFFFFF" />

                <ThemedText style={{ color: "#FFFFFF", fontWeight: "900" }}>
                  Finalizando...
                </ThemedText>
              </>
            ) : (
              <>
                <Ionicons
                  name="checkmark-done-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <ThemedText style={{ color: "#FFFFFF", fontWeight: "900" }}>
                  Finalizar Inscripción
                </ThemedText>
              </>
            )}
          </Pressable>

          <Pressable
            onPress={onDashboard}
            style={{
              height: 56,
              minWidth: 260,
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
            <Ionicons name="grid-outline" size={20} color={theme.colors.text} />

            <ThemedText
              style={{
                fontWeight: "900",
                color: theme.colors.text,
              }}
            >
              Ir al Dashboard Principal
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}