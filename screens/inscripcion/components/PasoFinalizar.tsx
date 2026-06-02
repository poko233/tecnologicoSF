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

type Props = {
  idUsuario: number;
  onDashboard?: () => void;
  onResetForm?: () => void;
};

type CuotaResumen = {
  idCuota?: number;
  numeroCuota?: number;
  monto: number | string;
  descuento?: number | string;
  fecha_vencimiento?: string;
  estadoCuota?: string;
  tipo?: "MATRICULA" | "MENSUAL" | string;
};

type ResumenFinal = {
  usuario: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    ci: string;
    email?: string;
    celular?: string;
    direccion?: string;
  };
  carrera?: {
    idCarrera: number;
    nombreCarrera: string;
    codigo?: string;
    regimen?: string;
    costo?: number;
  } | null;
  cuotas: CuotaResumen[];
  planPago?: {
    matricula: CuotaResumen | null;
    cuotasMensuales: CuotaResumen[];
    totalMatricula: number;
    totalCuotas: number;
    totalCondonado: number;
    totalPlan: number;
    cantidadCuotas: number;
  };
  documentos: {
    idDocumentoEstudiante: number;
    nombreDocumento: string;
  }[];
  validacion?: {
    datosPersonales: boolean;
    datosAcademicos: boolean;
    cuotasGeneradas: boolean;
    documentosCargados: boolean;
  };
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
  const [resumen, setResumen] = useState<ResumenFinal | null>(null);

  const cargarResumen = async () => {
    try {
      setLoading(true);

      const response = await httpClient.getAuth<ResumenFinal>(
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

  const documentosResumen = resumen?.documentos ?? [];
  const planPago = resumen?.planPago;
  const cuotasMensuales = planPago?.cuotasMensuales ?? [];

  const nombreCompleto = useMemo(() => {
    if (!resumen) return "";

    return `${resumen.usuario.nombres} ${resumen.usuario.apellidoPaterno} ${resumen.usuario.apellidoMaterno}`;
  }, [resumen]);

  const formatoBs = (value: number | string | undefined | null) => {
    return `Bs ${Number(value ?? 0).toFixed(2)}`;
  };

  const formatoFecha = (fecha?: string) => {
    if (!fecha) return "-";
    return String(fecha).slice(0, 10);
  };

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
    color,
  }: {
    label: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color?: string;
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
      <Ionicons name={icon} size={20} color={color ?? theme.colors.primary} />

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
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
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
                Revisa los datos personales, el plan de pago y los documentos
                antes de finalizar.
              </ThemedText>
            </View>
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
              icon="cash-outline"
              label="Matrícula"
              value={formatoBs(planPago?.totalMatricula)}
            />

            <StatBox
              icon="calendar-number-outline"
              label="Cuotas"
              value={planPago?.cantidadCuotas ?? cuotasMensuales.length}
            />

            <StatBox
              icon="wallet-outline"
              label="Total plan"
              value={formatoBs(planPago?.totalPlan)}
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
                  name="card-outline"
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
                Plan de Pago
              </ThemedText>
            </View>

            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                flexWrap: "wrap",
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
                icon="cash-outline"
                label="Matrícula"
                value={formatoBs(planPago?.totalMatricula)}
              />

              <StatBox
                icon="calendar-number-outline"
                label="Cantidad cuotas"
                value={planPago?.cantidadCuotas ?? cuotasMensuales.length}
              />

              <StatBox
                icon="wallet-outline"
                label="Total cuotas"
                value={formatoBs(planPago?.totalCuotas)}
              />

              <StatBox
                icon="checkmark-done-outline"
                label="Condonado"
                value={formatoBs(planPago?.totalCondonado)}
                color="#16A34A"
              />

              <StatBox
                icon="calculator-outline"
                label="Total plan"
                value={formatoBs(planPago?.totalPlan)}
              />
            </View>

            {planPago?.matricula ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                  borderRadius: 18,
                  padding: 14,
                  gap: 8,
                }}
              >
                <ThemedText
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    fontSize: 16,
                  }}
                >
                  Matrícula
                </ThemedText>

                <View
                  style={{
                    flexDirection: isMobile ? "column" : "row",
                    gap: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Label>Monto</Label>
                    <Value>{formatoBs(planPago.matricula.monto)}</Value>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Label>Fecha vencimiento</Label>
                    <Value>
                      {formatoFecha(planPago.matricula.fecha_vencimiento)}
                    </Value>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Label>Estado</Label>
                    <Value>{planPago.matricula.estadoCuota ?? "Debe"}</Value>
                  </View>
                </View>
              </View>
            ) : null}
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
                  name="receipt-outline"
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
                Detalle de Cuotas
              </ThemedText>
            </View>

            <ThemedText
              style={{
                color: theme.colors.muted,
                fontWeight: "900",
              }}
            >
              {cuotasMensuales.length} cuota(s)
            </ThemedText>
          </View>

          {cuotasMensuales.length === 0 ? (
            <ThemedText
              style={{
                color: theme.colors.muted,
                fontWeight: "800",
              }}
            >
              No hay cuotas registradas.
            </ThemedText>
          ) : (
            <View style={{ gap: 10 }}>
              {cuotasMensuales.map((cuota, index) => {
                const condonado = cuota.estadoCuota === "Condonado";

                return (
                  <View
                    key={`${cuota.numeroCuota}-${index}`}
                    style={{
                      borderWidth: 1,
                      borderColor: condonado ? "#16A34A" : theme.colors.border,
                      backgroundColor: condonado
                        ? "#16A34A18"
                        : theme.colors.background,
                      borderRadius: 18,
                      padding: 14,
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: isMobile ? "flex-start" : "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 16,
                        backgroundColor: condonado
                          ? "#16A34A"
                          : theme.colors.primary,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <ThemedText
                        style={{
                          color: "#fff",
                          fontWeight: "900",
                        }}
                      >
                        #{cuota.numeroCuota ?? index + 1}
                      </ThemedText>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Label>Monto</Label>
                      <Value>{formatoBs(cuota.monto)}</Value>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Label>Fecha vencimiento</Label>
                      <Value>{formatoFecha(cuota.fecha_vencimiento)}</Value>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Label>Estado</Label>
                      <Value>{cuota.estadoCuota ?? "Debe"}</Value>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Label>Descuento</Label>
                      <Value>{formatoBs(cuota.descuento ?? 0)}</Value>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
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
                Documentación
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