import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { httpClient } from "../../../http/httpClient";
import { useTheme } from "../../../theme/useTheme";

type Carrera = {
  idCarrera: number;
  nombreCarrera: string;
  codigo?: string;
  costo?: number;
  costo_matricula?: number;
  costoMatricula?: number;
  numeroCuotas?: number;
  cuotas_por_anio?: number;
};

type EstadoCuota = "Debe" | "Condonado";

type CuotaEditable = {
  numeroCuota: number;
  monto: string;
  fecha_vencimiento: string;
  estadoCuota: EstadoCuota;
};

type Props = {
  idEstudiante: number;
  onFinish?: () => void;
};

export default function PasoCuotas({ idEstudiante, onFinish }: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 800;

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoCuotas, setCargandoCuotas] = useState(false);

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [carrera, setCarrera] = useState<Carrera | null>(null);

  const [montoMatricula, setMontoMatricula] = useState("");
  const [fechaMatricula, setFechaMatricula] = useState("");

  const [cantidadCuotas, setCantidadCuotas] = useState("1");
  const [cuotas, setCuotas] = useState<CuotaEditable[]>([]);

  const totalCarreraFijo = Number(carrera?.costo ?? 0);
  const matriculaNumber = Number(montoMatricula || 0);

  const totalCuotasDebe = useMemo(() => {
    return cuotas.reduce((sum, cuota) => {
      if (cuota.estadoCuota === "Condonado") return sum;
      return sum + Number(cuota.monto || 0);
    }, 0);
  }, [cuotas]);

  const totalCondonado = useMemo(() => {
    return cuotas.reduce((sum, cuota) => {
      if (cuota.estadoCuota !== "Condonado") return sum;
      return sum + Number(cuota.monto || 0);
    }, 0);
  }, [cuotas]);

  const hoy = () => new Date().toISOString().slice(0, 10);

  const limpiarNumero = (value: string) => {
    return value.replace(/[^0-9.]/g, "");
  };
const fechaActual = () => new Date().toISOString().slice(0, 10);

const primerDiaDelMes = (fechaBase: string, mesesAdelante: number) => {
  const base = fechaBase || fechaActual();
  const [year, month] = base.split("-").map(Number);

  const date = new Date(year, month - 1, 1);
  date.setMonth(date.getMonth() + mesesAdelante);

  return date.toISOString().slice(0, 10);
};
  const redondear2 = (value: number) => {
    return Math.round(value * 100) / 100;
  };

  const formatoBs = (value: number) => {
    return `Bs ${redondear2(value).toFixed(2)}`;
  };

  const sumarMesesDesdeFecha = (fechaBase: string, meses: number) => {
    const base = fechaBase || hoy();
    const [year, month, day] = base.split("-").map(Number);

    const date = new Date(year, month - 1, day || 1);
    date.setMonth(date.getMonth() + meses);

    return date.toISOString().slice(0, 10);
  };

  const generarCuotasRepartidas = (
  cantidad: number,
  totalCarrera: number,
  matricula: number,
  fechaBase: string,
  cuotasPrevias: CuotaEditable[] = []
): CuotaEditable[] => {
  const cantidadFinal = Math.max(Number(cantidad || 1), 1);
  const saldo = redondear2(Math.max(totalCarrera - matricula, 0));

  const montoBase = redondear2(saldo / cantidadFinal);

  const nuevasCuotas = Array.from({ length: cantidadFinal }, (_, index) => {
    const cuotaPrevia = cuotasPrevias[index];

    return {
      numeroCuota: index + 1,
      monto: montoBase.toFixed(2),
      fecha_vencimiento:
        cuotaPrevia?.fecha_vencimiento ||
        (index === 0
          ? fechaBase || fechaActual()
          : primerDiaDelMes(fechaBase, index)),
      estadoCuota: cuotaPrevia?.estadoCuota ?? "Debe",
    };
  });

  const sumaActual = nuevasCuotas.reduce(
    (sum, cuota) => sum + Number(cuota.monto || 0),
    0
  );

  const diferencia = redondear2(saldo - sumaActual);

  if (nuevasCuotas.length > 0) {
    const ultima = nuevasCuotas.length - 1;

    nuevasCuotas[ultima].monto = redondear2(
      Number(nuevasCuotas[ultima].monto || 0) + diferencia
    ).toFixed(2);
  }

  return nuevasCuotas;
};

  const cargarCarreras = async () => {
    try {
      setLoading(true);

      const response = await httpClient.getAuth<any>("/api/carreras");

      const data = Array.isArray(response)
        ? response
        : response.carreras ?? response.data ?? response.resultado ?? [];

      setCarreras(data);
    } catch (error) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar las carreras.",
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarCuotasExistentes = async (idCarrera: number) => {
    try {
      setCargandoCuotas(true);

      const response = await httpClient.getAuth<any[]>(
        `/api/estudiantes/${idEstudiante}/carreras/${idCarrera}/cuotas`
      );

      const data = Array.isArray(response) ? response : [];

      const matricula = data.find(
        (item) => String(item.tipo).toUpperCase() === "MATRICULA"
      );

      const mensuales = data
        .filter((item) => String(item.tipo).toUpperCase() === "MENSUAL")
        .sort((a, b) => Number(a.numeroCuota) - Number(b.numeroCuota));

      if (matricula) {
        setMontoMatricula(String(matricula.monto ?? "0"));
        setFechaMatricula(
          String(matricula.fecha_vencimiento ?? hoy()).slice(0, 10)
        );
      }

      if (mensuales.length > 0) {
        setCantidadCuotas(String(mensuales.length));

        setCuotas(
          mensuales.map((item, index) => ({
            numeroCuota: index + 1,
            monto: Number(item.monto ?? 0).toFixed(2),
            fecha_vencimiento: String(
              item.fecha_vencimiento ?? hoy()
            ).slice(0, 10),
            estadoCuota:
              item.estadoCuota === "Condonado" ? "Condonado" : "Debe",
          }))
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargandoCuotas(false);
    }
  };

  const seleccionarCarrera = async (item: Carrera) => {
    setCarrera(item);

    const total = Number(item.costo ?? 0);
    const matricula = Number(item.costo_matricula ?? item.costoMatricula ?? 0);
    const numeroCuotas = Math.max(
      Number(item.numeroCuotas ?? item.cuotas_por_anio ?? 1),
      1
    );
    const fecha = hoy();

    setMontoMatricula(String(matricula));
    setFechaMatricula(fecha);
    setCantidadCuotas(String(numeroCuotas));

    setCuotas(generarCuotasRepartidas(numeroCuotas, total, matricula, fecha));

    await cargarCuotasExistentes(item.idCarrera);
  };

  const cambiarMatricula = (value: string) => {
    const limpio = limpiarNumero(value);
    const nuevaMatricula = Number(limpio || 0);
    const cantidad = Number(cantidadCuotas || 1);

    setMontoMatricula(limpio);

    setCuotas((prev) =>
      generarCuotasRepartidas(
        cantidad,
        totalCarreraFijo,
        nuevaMatricula,
        fechaMatricula,
        prev
      )
    );
  };

 const cambiarFechaMatricula = (value: string) => {
  setFechaMatricula(value);

  setCuotas((prev) =>
    prev.map((cuota, index) => ({
      ...cuota,
      fecha_vencimiento:
        index === 0 ? value : primerDiaDelMes(value, index),
    }))
  );
};

  const cambiarCantidadCuotas = (value: string) => {
    const limpio = value.replace(/\D/g, "");
    const cantidad = Math.max(Number(limpio || 1), 1);

    setCantidadCuotas(String(cantidad));

    setCuotas((prev) =>
      generarCuotasRepartidas(
        cantidad,
        totalCarreraFijo,
        matriculaNumber,
        fechaMatricula,
        prev
      )
    );
  };

  const sumarCuota = () => {
    cambiarCantidadCuotas(String(Number(cantidadCuotas || 1) + 1));
  };

  const restarCuota = () => {
    const actual = Number(cantidadCuotas || 1);
    if (actual <= 1) return;

    cambiarCantidadCuotas(String(actual - 1));
  };

  const actualizarCuota = (
    index: number,
    field: keyof CuotaEditable,
    value: string
  ) => {
    const finalValue = field === "monto" ? limpiarNumero(value) : value;

    setCuotas((prev) =>
      prev.map((cuota, i) =>
        i === index
          ? {
              ...cuota,
              [field]: finalValue,
            }
          : cuota
      )
    );
  };

  const validar = () => {
    if (!carrera) {
      Toast.show({
        type: "error",
        text1: "Selecciona una carrera",
      });
      return false;
    }

    if (!fechaMatricula) {
      Toast.show({
        type: "error",
        text1: "Fecha requerida",
        text2: "Ingresa la fecha de matrícula.",
      });
      return false;
    }

    if (cuotas.some((cuota) => !cuota.fecha_vencimiento)) {
      Toast.show({
        type: "error",
        text1: "Fechas incompletas",
        text2: "Todas las cuotas deben tener fecha.",
      });
      return false;
    }

    return true;
  };

  const guardarCuotas = async () => {
    if (!validar()) return;

    try {
      setGuardando(true);

      const response = await httpClient.postAuth<any>(
        "/api/inscripcion/pago-cuotas",
        {
          idUsuario: idEstudiante,
          idCarrera: carrera?.idCarrera,
          matricula: {
            monto: Number(montoMatricula || 0),
            descuento: 0,
            fecha_vencimiento: fechaMatricula,
          },
          cuotas: cuotas.map((cuota) => ({
            numeroCuota: cuota.numeroCuota,
            monto: Number(cuota.monto || 0),
            descuento: 0,
            fecha_vencimiento: cuota.fecha_vencimiento,
            estadoCuota: cuota.estadoCuota,
          })),
        }
      );

      if (!response?.guardado) {
        Toast.show({
          type: "error",
          text1: "No se guardaron las cuotas",
          text2: response?.message ?? "El backend no confirmó el guardado.",
        });

        return;
      }

      onFinish?.();
    } catch (error: any) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message ?? "No se pudo guardar el plan de cuotas.",
      });
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    cargarCarreras();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.loadingCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <ActivityIndicator color={theme.colors.primary} />
        <ThemedText style={{ color: theme.colors.muted, fontWeight: "800" }}>
          Cargando carreras...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.panel,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <ThemedText style={[styles.title, { color: theme.colors.text }]}>
          Plan de pago
        </ThemedText>

        <ThemedText style={[styles.subtitle, { color: theme.colors.muted }]}>
          Elige la carrera y edita cada cuota individualmente.
        </ThemedText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.carrerasRow}>
            {carreras.map((item) => {
              const active = carrera?.idCarrera === item.idCarrera;

              return (
                <Pressable
                  key={item.idCarrera}
                  onPress={() => seleccionarCarrera(item)}
                  style={[
                    styles.carreraButton,
                    {
                      backgroundColor: active
                        ? theme.colors.primary
                        : theme.colors.background,
                      borderColor: active
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                >
                  <ThemedText
                    numberOfLines={1}
                    style={{
                      color: active ? "#fff" : theme.colors.text,
                      fontWeight: "900",
                    }}
                  >
                    {item.nombreCarrera}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {carrera && (
        <>
          <View
            style={[
              styles.totalBar,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                flexDirection: isMobile ? "column" : "row",
              },
            ]}
          >
            <MiniTotal
              label="Total carrera"
              value={formatoBs(totalCarreraFijo)}
              color={theme.colors.primary}
            />

            <MiniTotal label="Matrícula" value={formatoBs(matriculaNumber)} />

            <MiniTotal
              label="Cuotas a cobrar"
              value={formatoBs(totalCuotasDebe)}
            />

            <MiniTotal
              label="Condonado"
              value={formatoBs(totalCondonado)}
              color="#16A34A"
            />
          </View>

          <View
            style={[
              styles.panel,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {cargandoCuotas && (
              <View style={styles.loadingInline}>
                <ActivityIndicator color={theme.colors.primary} />
                <ThemedText
                  style={{
                    color: theme.colors.muted,
                    fontWeight: "800",
                  }}
                >
                  Cargando cuotas guardadas...
                </ThemedText>
              </View>
            )}

            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                gap: 12,
              }}
            >
              <Input
                label="Matrícula"
                value={montoMatricula}
                onChangeText={cambiarMatricula}
                keyboardType="numeric"
              />

              <Input
                label="Fecha matrícula"
                value={fechaMatricula}
                onChangeText={cambiarFechaMatricula}
                placeholder="yyyy-mm-dd"
              />
            </View>

            <View
              style={[
                styles.controls,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  flexDirection: isMobile ? "column" : "row",
                },
              ]}
            >
              <Input
                label="Cantidad cuotas"
                value={cantidadCuotas}
                onChangeText={cambiarCantidadCuotas}
                keyboardType="numeric"
              />

              <View style={styles.stepperRow}>
                <Pressable
                  onPress={restarCuota}
                  style={[
                    styles.stepperButton,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      fontSize: 18,
                    }}
                  >
                    -
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={sumarCuota}
                  style={[
                    styles.stepperButton,
                    {
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: "#fff",
                      fontWeight: "900",
                      fontSize: 18,
                    }}
                  >
                    +
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            <View style={styles.cuotasList}>
              {cuotas.map((cuota, index) => {
                const condonado = cuota.estadoCuota === "Condonado";

                return (
                  <View
                    key={`cuota-${cuota.numeroCuota}`}
                    style={[
                      styles.cuotaRow,
                      {
                        backgroundColor: condonado
                          ? "#16A34A22"
                          : theme.colors.background,
                        borderColor: condonado ? "#16A34A" : theme.colors.border,
                        shadowColor: condonado ? "#16A34A" : "#000",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.cuotaNumber,
                        {
                          backgroundColor: condonado
                            ? "#16A34A"
                            : theme.colors.card,
                          borderColor: condonado
                            ? "#16A34A"
                            : theme.colors.border,
                        },
                      ]}
                    >
                      <ThemedText
                        style={{
                          color: condonado ? "#fff" : theme.colors.text,
                          fontWeight: "900",
                        }}
                      >
                        #{cuota.numeroCuota}
                      </ThemedText>
                    </View>

                    <View style={{ flex: 1.2 }}>
                      <Input
                        label="Monto"
                        value={cuota.monto}
                        onChangeText={(value) =>
                          actualizarCuota(index, "monto", value)
                        }
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={{ flex: 1.2 }}>
                      <Input
                        label="Fecha"
                        value={cuota.fecha_vencimiento}
                        onChangeText={(value) =>
                          actualizarCuota(index, "fecha_vencimiento", value)
                        }
                        placeholder="yyyy-mm-dd"
                      />
                    </View>

                    <View style={styles.estadoRow}>
                      {(["Debe", "Condonado"] as const).map((estado) => {
                        const active = cuota.estadoCuota === estado;
                        const isCondonado = estado === "Condonado";

                        return (
                          <Pressable
                            key={estado}
                            onPress={() =>
                              actualizarCuota(index, "estadoCuota", estado)
                            }
                            style={[
                              styles.estadoButton,
                              {
                                backgroundColor: active
                                  ? isCondonado
                                    ? "#16A34A"
                                    : theme.colors.primary
                                  : theme.colors.card,
                                borderColor: active
                                  ? isCondonado
                                    ? "#16A34A"
                                    : theme.colors.primary
                                  : theme.colors.border,
                              },
                            ]}
                          >
                            <ThemedText
                              style={{
                                color: active ? "#fff" : theme.colors.text,
                                fontWeight: "900",
                                fontSize: 12,
                              }}
                            >
                              {estado}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>

            <Pressable
              onPress={guardarCuotas}
              disabled={guardando || cargandoCuotas}
              style={[
                styles.saveButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: guardando || cargandoCuotas ? 0.6 : 1,
                },
              ]}
            >
              <ThemedText
                style={{
                  color: "#fff",
                  fontWeight: "900",
                }}
              >
                {guardando ? "Guardando..." : "Guardar cuotas y continuar"}
              </ThemedText>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
}) {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, gap: 5 }}>
      <ThemedText
        style={{
          color: theme.colors.muted,
          fontWeight: "900",
          fontSize: 11,
        }}
      >
        {label}
      </ThemedText>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        keyboardType={keyboardType}
        style={{
          height: 42,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          paddingHorizontal: 12,
          fontWeight: "800",
          outlineStyle: "none" as any,
        }}
      />
    </View>
  );
}

function MiniTotal({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.miniTotal}>
      <ThemedText
        style={{
          color: theme.colors.muted,
          fontWeight: "900",
          fontSize: 12,
        }}
      >
        {label}
      </ThemedText>

      <ThemedText
        style={{
          color: color ?? theme.colors.text,
          fontWeight: "900",
          fontSize: 18,
        }}
      >
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  loadingCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 28,
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  panel: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "700",
  },

  carrerasRow: {
    flexDirection: "row",
    gap: 10,
  },

  carreraButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 210,
  },

  totalBar: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    gap: 10,
  },

  miniTotal: {
    flex: 1,
    gap: 3,
  },

  loadingInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  controls: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 12,
    alignItems: "center",
  },

  stepperRow: {
    flexDirection: "row",
    gap: 8,
  },

  stepperButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  cuotasList: {
    gap: 8,
  },

  cuotaRow: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  cuotaNumber: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  estadoRow: {
    flexDirection: "row",
    gap: 8,
  },

  estadoButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  saveButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});