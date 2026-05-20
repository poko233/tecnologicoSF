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
      <View style={{ padding: 40, alignItems: "center", gap: 12 }}>
        <ActivityIndicator color={theme.colors.primary} />
        <ThemedText>Cargando resumen...</ThemedText>
      </View>
    );
  }

  if (!resumen) {
    return (
      <View>
        <ThemedText>No se encontró información de la inscripción.</ThemedText>
      </View>
    );
  }

  const nombreCompleto = `${resumen.usuario.nombres} ${resumen.usuario.apellidoPaterno} ${resumen.usuario.apellidoMaterno}`;
  const gruposResumen = resumen.grupos ?? [];
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
            <Ionicons name="checkmark" size={46} color="#fff" />
          </View>

          <ThemedText style={{ fontSize: 24, fontWeight: "900" }}>
            ¡Inscripción Exitosa!
          </ThemedText>

          <ThemedText style={{ opacity: 0.75, textAlign: "center" }}>
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

            <ThemedText style={{ fontSize: 18, fontWeight: "900" }}>
              Datos Personales
            </ThemedText>

            <ThemedText style={{ opacity: 0.6, fontWeight: "900" }}>
              NOMBRE COMPLETO
            </ThemedText>
            <ThemedText style={{ fontWeight: "800" }}>
              {nombreCompleto}
            </ThemedText>

            <ThemedText style={{ opacity: 0.6, fontWeight: "900" }}>
              CÉDULA DE IDENTIDAD
            </ThemedText>
            <ThemedText style={{ fontWeight: "800" }}>
              {resumen.usuario.ci}
            </ThemedText>
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

            <ThemedText style={{ fontSize: 18, fontWeight: "900" }}>
              Datos Académicos
            </ThemedText>

            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                gap: 18,
              }}
            >
              <View style={{ flex: 1 }}>
                <ThemedText style={{ opacity: 0.6, fontWeight: "900" }}>
                  CARRERA ELEGIDA
                </ThemedText>

                <ThemedText style={{ fontWeight: "800" }}>
                  {resumen.carrera?.nombreCarrera ?? "Sin carrera"}
                </ThemedText>

                <ThemedText
                  style={{ opacity: 0.6, fontWeight: "900", marginTop: 12 }}
                >
                  RÉGIMEN
                </ThemedText>

                <ThemedText style={{ fontWeight: "800" }}>
                  {resumen.carrera?.regimen ?? "-"}
                </ThemedText>
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText style={{ opacity: 0.6, fontWeight: "900" }}>
                  GRUPOS SELECCIONADOS
                </ThemedText>

               {gruposResumen.length === 0 ? (
                  <ThemedText style={{ fontWeight: "800" }}>
                    Sin grupos
                  </ThemedText>
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
                        <ThemedText style={{ fontWeight: "900" }}>
                          {grupo.nombre}
                        </ThemedText>

                        <ThemedText style={{ opacity: 0.75 }}>
                          Código: {grupo.codigo ?? "-"}
                        </ThemedText>

                        <ThemedText style={{ opacity: 0.75 }}>
                          Paralelo: {grupo.paralelo ?? "-"}
                        </ThemedText>

                        <ThemedText style={{ opacity: 0.75 }}>
                          Horario: {grupo.turno ?? "-"} ·{" "}
                          {grupo.horario ?? "-"}
                        </ThemedText>

                        <ThemedText style={{ opacity: 0.75 }}>
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons
              name="document-text-outline"
              size={26}
              color={theme.colors.primary}
            />

            <ThemedText style={{ fontSize: 18, fontWeight: "900" }}>
              Documentación Verificada
            </ThemedText>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {resumen.documentos.map((doc) => (
              <View
                key={doc.idDocumentoEstudiante}
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
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

                <ThemedText style={{ fontWeight: "800" }}>
                  {doc.nombreDocumento}
                </ThemedText>
              </View>
            ))}
          </View>
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
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-done-outline"
                  size={20}
                  color="#fff"
                />
                <ThemedText style={{ color: "#fff", fontWeight: "900" }}>
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
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Ionicons name="grid-outline" size={20} color={theme.colors.text} />

            <ThemedText style={{ fontWeight: "900" }}>
              Ir al Dashboard Principal
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}