import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
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
import HorarioSeleccionadoModal from "./HorarioSeleccionadoModal";

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
  const [showHorario, setShowHorario] = useState(false);

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

  const gruposResumen = resumen?.grupos ?? [];
  const documentosResumen = resumen?.documentos ?? [];

  const nombreCompleto = useMemo(() => {
    if (!resumen) return "";

    return `${resumen.usuario.nombres} ${resumen.usuario.apellidoPaterno} ${resumen.usuario.apellidoMaterno}`;
  }, [resumen]);

  const Label = ({ children }: { children: React.ReactNode }) => (
    <ThemedText
      style={{
        color: theme.colors.muted,
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.4,
      }}
    >
      {children}
    </ThemedText>
  );

  const Value = ({ children }: { children: React.ReactNode }) => (
    <ThemedText
      style={{
        color: theme.colors.text,
        fontSize: 15,
        fontWeight: "900",
        lineHeight: 20,
      }}
    >
      {children}
    </ThemedText>
  );

  const StatBox = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <View
      style={{
        flex: 1,
        minWidth: isMobile ? "100%" : 150,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        borderRadius: 18,
        padding: 14,
        gap: 8,
      }}
    >
      <Ionicons name={icon} size={20} color={theme.colors.primary} />
      <Label>{label}</Label>
      <Value>{value}</Value>
    </View>
  );

  if (loading) {
    return (
      <View
        style={{
          padding: 50,
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <ActivityIndicator color={theme.colors.primary} size="large" />

        <ThemedText
          style={{
            color: theme.colors.text,
            fontWeight: "900",
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
          borderRadius: 22,
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

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 22, paddingBottom: 34 }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              borderRadius: 28,
              padding: isMobile ? 20 : 26,
              gap: 18,
            }}
          >
            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: "space-between",
                gap: 18,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  flex: 1,
                }}
              >
                <View
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 24,
                    backgroundColor: `${theme.colors.primary}20`,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={42}
                    color={theme.colors.primary}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{
                      fontSize: isMobile ? 24 : 32,
                      fontWeight: "900",
                      color: theme.colors.text,
                    }}
                  >
                    Resumen de Inscripción
                  </ThemedText>

                  <ThemedText
                    style={{
                      marginTop: 4,
                      color: theme.colors.muted,
                      fontWeight: "700",
                    }}
                  >
                    Revisa los datos antes de finalizar el registro.
                  </ThemedText>
                </View>
              </View>

              <Pressable
                onPress={() => setShowHorario(true)}
                disabled={gruposResumen.length === 0}
                style={{
                  height: 48,
                  paddingHorizontal: 18,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: 8,
                  opacity: gruposResumen.length === 0 ? 0.5 : 1,
                }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color={theme.colors.primary}
                />

                <ThemedText
                  style={{
                    color: theme.colors.primary,
                    fontWeight: "900",
                  }}
                >
                  Ver horario completo
                </ThemedText>
              </Pressable>
            </View>

            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                gap: 12,
              }}
            >
              <StatBox
                icon="school-outline"
                label="Carrera"
                value={resumen.carrera?.nombreCarrera ?? "Sin carrera"}
              />

              <StatBox
                icon="layers-outline"
                label="Régimen"
                value={resumen.carrera?.regimen ?? "-"}
              />

              <StatBox
                icon="people-outline"
                label="Grupos"
                value={gruposResumen.length}
              />

              <StatBox
                icon="document-text-outline"
                label="Documentos"
                value={documentosResumen.length}
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: isMobile ? "column" : "row",
              gap: 18,
              alignItems: "stretch",
            }}
          >
            <View
              style={{
                flex: 0.85,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.card,
                borderRadius: 26,
                padding: 22,
                gap: 18,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 18,
                    backgroundColor: `${theme.colors.primary}18`,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="person-outline"
                    size={28}
                    color={theme.colors.primary}
                  />
                </View>

                <ThemedText
                  style={{
                    fontSize: 22,
                    fontWeight: "900",
                    color: theme.colors.text,
                  }}
                >
                  Datos Personales
                </ThemedText>
              </View>

              <View style={{ gap: 14 }}>
                <View style={{ gap: 5 }}>
                  <Label>Nombre completo</Label>
                  <Value>{nombreCompleto}</Value>
                </View>

                <View style={{ gap: 5 }}>
                  <Label>Cédula de identidad</Label>
                  <Value>{resumen.usuario.ci}</Value>
                </View>

                {resumen.usuario.email ? (
                  <View style={{ gap: 5 }}>
                    <Label>Correo electrónico</Label>
                    <Value>{resumen.usuario.email}</Value>
                  </View>
                ) : null}

                {resumen.usuario.celular ? (
                  <View style={{ gap: 5 }}>
                    <Label>Celular</Label>
                    <Value>{resumen.usuario.celular}</Value>
                  </View>
                ) : null}

                {resumen.usuario.direccion ? (
                  <View style={{ gap: 5 }}>
                    <Label>Dirección</Label>
                    <Value>{resumen.usuario.direccion}</Value>
                  </View>
                ) : null}
              </View>
            </View>

            <View
              style={{
                flex: 1.6,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.card,
                borderRadius: 26,
                padding: 22,
                gap: 18,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 18,
                    backgroundColor: `${theme.colors.primary}18`,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="school-outline"
                    size={28}
                    color={theme.colors.primary}
                  />
                </View>

                <ThemedText
                  style={{
                    fontSize: 22,
                    fontWeight: "900",
                    color: theme.colors.text,
                  }}
                >
                  Datos Académicos
                </ThemedText>
              </View>

              {gruposResumen.length === 0 ? (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                    borderRadius: 18,
                    padding: 18,
                  }}
                >
                  <Value>Sin grupos seleccionados</Value>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: isMobile ? "column" : "row",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  {gruposResumen.map((grupo, index) => (
                    <View
                      key={`${grupo.idGrupo}-${index}`}
                      style={{
                        width: isMobile ? "100%" : "48.8%",
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 22,
                        padding: 14,
                        backgroundColor: theme.colors.background,
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 10,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <ThemedText
                            style={{
                              fontSize: 17,
                              fontWeight: "900",
                              color: theme.colors.text,
                            }}
                          >
                            {grupo.nombre}
                          </ThemedText>

                          <ThemedText
                            style={{
                              marginTop: 3,
                              color: theme.colors.muted,
                              fontWeight: "800",
                              fontSize: 13,
                            }}
                          >
                            {grupo.nombreMateria ?? "-"}
                          </ThemedText>
                        </View>

                        <View
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 999,
                            backgroundColor: `${theme.colors.primary}20`,
                          }}
                        >
                          <ThemedText
                            style={{
                              color: theme.colors.primary,
                              fontWeight: "900",
                              fontSize: 12,
                            }}
                          >
                            {grupo.turno ?? "-"}
                          </ThemedText>
                        </View>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 7,
                        }}
                      >
                        {[
                          `Grupo: ${grupo.codigo ?? "-"}`,
                          `Paralelo: ${grupo.paralelo ?? "-"}`,
                          `Materia: ${grupo.codigoMateria ?? "-"}`,
                          `Sem: ${grupo.semestre ?? "-"}`,
                          `Gestión: ${grupo.gestion ?? "-"}`,
                        ].map((item) => (
                          <View
                            key={item}
                            style={{
                              borderWidth: 1,
                              borderColor: theme.colors.border,
                              borderRadius: 999,
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              backgroundColor: theme.colors.card,
                            }}
                          >
                            <ThemedText
                              style={{
                                color: theme.colors.muted,
                                fontWeight: "800",
                                fontSize: 11,
                              }}
                            >
                              {item}
                            </ThemedText>
                          </View>
                        ))}
                      </View>

                      <View
                        style={{
                          borderRadius: 16,
                          padding: 10,
                          backgroundColor: theme.colors.card,
                          gap: 8,
                        }}
                      >
                        <ThemedText
                          style={{
                            color: theme.colors.text,
                            fontWeight: "900",
                            fontSize: 13,
                          }}
                        >
                          Horarios
                        </ThemedText>

                        {grupo.horarios?.length ? (
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              gap: 7,
                            }}
                          >
                            {grupo.horarios.map((horario) => (
                              <View
                                key={horario.idHorario}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 5,
                                  borderWidth: 1,
                                  borderColor: theme.colors.border,
                                  borderRadius: 999,
                                  paddingVertical: 6,
                                  paddingHorizontal: 9,
                                  backgroundColor: theme.colors.background,
                                }}
                              >
                                <Ionicons
                                  name="time-outline"
                                  size={14}
                                  color={theme.colors.primary}
                                />

                                <ThemedText
                                  style={{
                                    color: theme.colors.muted,
                                    fontWeight: "800",
                                    fontSize: 11,
                                  }}
                                >
                                  {horario.dia.slice(0, 3)}{" "}
                                  {horario.horaInicio?.slice(0, 5)}-
                                  {horario.horaFin?.slice(0, 5)}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <ThemedText
                            style={{
                              color: theme.colors.muted,
                              fontWeight: "800",
                              fontSize: 12,
                            }}
                          >
                            Sin horario registrado
                          </ThemedText>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              borderRadius: 26,
              padding: 22,
              gap: 18,
            }}
          >
            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: `${theme.colors.primary}18`,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={26}
                    color={theme.colors.primary}
                  />
                </View>

                <ThemedText
                  style={{
                    fontSize: 22,
                    fontWeight: "900",
                    color: theme.colors.text,
                  }}
                >
                  Documentación Verificada
                </ThemedText>
              </View>

              <ThemedText
                style={{
                  color: theme.colors.muted,
                  fontWeight: "900",
                }}
              >
                {documentosResumen.length} documento(s)
              </ThemedText>
            </View>

            {documentosResumen.length === 0 ? (
              <ThemedText
                style={{
                  color: theme.colors.muted,
                  fontWeight: "800",
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
                        fontWeight: "900",
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
                height: 58,
                minWidth: 280,
                borderRadius: 16,
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
                height: 58,
                minWidth: 260,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.card,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                gap: 8,
              }}
            >
              <Ionicons
                name="grid-outline"
                size={20}
                color={theme.colors.text}
              />

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

      <HorarioSeleccionadoModal
        visible={showHorario}
        gruposSeleccionados={gruposResumen as any}
        onClose={() => setShowHorario(false)}
      />
    </>
  );
}