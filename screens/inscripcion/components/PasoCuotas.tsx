import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
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

type TurnoPreferido = "Mañana" | "Tarde" | "Noche";

type Carrera = {
  idCarrera: number;
  nombreCarrera: string;
  codigo?: string | null;
  tipo?: string | null;
  regimen?: string | null;
  estadoCarrera?: string | null;
  costo?: number | string | null;
  costo_matricula?: number | string | null;
  costoMatricula?: number | string | null;
  numeroCuotas?: number | string | null;
  cuotas_por_anio?: number | string | null;
  cuota_mensual?: number | string | null;
  duracionMeses?: number | string | null;
  duracion_meses?: number | string | null;
};

type CarreraActual = {
  idCarreraUsuario: number;
  idCarrera: number;
  idUsuario: number;
  turnoPreferido?: TurnoPreferido | null;
  nombreCarrera?: string | null;
  codigo?: string | null;
  regimen?: string | null;
  tipo?: string | null;
  estadoCarrera?: string | null;
};

type DatosCuotasResponse = {
  carreras?: Carrera[];
  carreraActual?: CarreraActual | null;
  totalRelacionesCarrera?: number;
  advertencia?: string | null;
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

type TurnoOption = {
  value: TurnoPreferido;
  icon: keyof typeof Ionicons.glyphMap;
  descripcion: string;
};

const TURNOS: TurnoOption[] = [
  {
    value: "Mañana",
    icon: "sunny-outline",
    descripcion: "Preferencia para grupos del turno mañana.",
  },
  {
    value: "Tarde",
    icon: "partly-sunny-outline",
    descripcion: "Preferencia para grupos del turno tarde.",
  },
  {
    value: "Noche",
    icon: "moon-outline",
    descripcion: "Preferencia para grupos del turno noche.",
  },
];

export default function PasoCuotas({ idEstudiante, onFinish }: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width < 760;
  const isTablet = width >= 760 && width < 1180;

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cargandoCuotas, setCargandoCuotas] = useState(false);

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [carrera, setCarrera] = useState<Carrera | null>(null);
  const [idCarreraOriginal, setIdCarreraOriginal] = useState<number | null>(
    null,
  );
  const [nombreCarreraOriginal, setNombreCarreraOriginal] = useState("");
  const [turnoPreferido, setTurnoPreferido] =
    useState<TurnoPreferido | null>(null);
  const [busquedaCarrera, setBusquedaCarrera] = useState("");

  const [montoMatricula, setMontoMatricula] = useState("");
  const [fechaMatricula, setFechaMatricula] = useState("");

  const [cantidadCuotas, setCantidadCuotas] = useState("1");
  const [cuotas, setCuotas] = useState<CuotaEditable[]>([]);

  const [totalCuotasEditable, setTotalCuotasEditable] = useState("0");
  const [montoTodasCuotas, setMontoTodasCuotas] = useState("");

  const solicitudCuotasRef = useRef(0);

  const totalCarreraFijo = Number(carrera?.costo ?? 0);
  const matriculaNumber = Number(montoMatricula || 0);

  const carreraCambioPendiente =
    idCarreraOriginal !== null &&
    carrera !== null &&
    Number(carrera.idCarrera) !== Number(idCarreraOriginal);

  const carrerasFiltradas = useMemo(() => {
    const texto = busquedaCarrera.trim().toLowerCase();

    if (!texto) {
      return carreras;
    }

    return carreras.filter((item) => {
      const contenido = [
        item.nombreCarrera,
        item.codigo,
        item.regimen,
        item.tipo,
      ]
        .join(" ")
        .toLowerCase();

      return contenido.includes(texto);
    });
  }, [busquedaCarrera, carreras]);

  const totalCondonado = useMemo(() => {
    return cuotas.reduce((sum, cuota) => {
      if (cuota.estadoCuota !== "Condonado") {
        return sum;
      }

      return sum + Number(cuota.monto || 0);
    }, 0);
  }, [cuotas]);

  const fechaActual = () => {
    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  };

  const limpiarNumero = (value: string) => {
    const limpio = value.replace(/[^0-9.]/g, "");
    const partes = limpio.split(".");

    if (partes.length <= 2) {
      return limpio;
    }

    return `${partes.shift()}.${partes.join("")}`;
  };

  const redondear2 = (value: number) => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  };

  const formatoBs = (value: number) => {
    return `Bs ${redondear2(value).toFixed(2)}`;
  };

  const decimoDiaDelMes = (fechaBase: string, mesesAdelante: number) => {
    const base = fechaBase || fechaActual();
    const [year, month] = base.slice(0, 10).split("-").map(Number);

    if (!year || !month) {
      return decimoDiaDelMes(fechaActual(), mesesAdelante);
    }

    const fecha = new Date(year, month - 1 + mesesAdelante, 10);

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");

    return `${anio}-${mes}-10`;
  };

  const fechaVencimientoPorIndice = (
    fechaBase: string,
    index: number,
  ): string => {
    if (index === 0) {
      return fechaActual();
    }

    return decimoDiaDelMes(fechaBase, index);
  };

  const repartirMontoEnCuotas = (
    total: number,
    cuotasActuales: CuotaEditable[],
  ) => {
    const cuotasDebe = cuotasActuales.filter(
      (cuota) => cuota.estadoCuota !== "Condonado",
    );

    if (cuotasDebe.length === 0) {
      return cuotasActuales;
    }

    const montoBase = redondear2(total / cuotasDebe.length);
    let acumulado = 0;

    return cuotasActuales.map((cuota) => {
      if (cuota.estadoCuota === "Condonado") {
        return cuota;
      }

      const esUltimaCuotaDebe =
        cuota.numeroCuota === cuotasDebe[cuotasDebe.length - 1].numeroCuota;

      const monto = esUltimaCuotaDebe
        ? redondear2(total - acumulado)
        : montoBase;

      acumulado = redondear2(acumulado + monto);

      return {
        ...cuota,
        monto: monto.toFixed(2),
      };
    });
  };

  const generarCuotasRepartidas = (
    cantidad: number,
    totalACobrar: number,
    fechaBase: string,
    cuotasPrevias: CuotaEditable[] = [],
  ): CuotaEditable[] => {
    const cantidadFinal = Math.max(Number(cantidad || 1), 1);
    const montoBase = redondear2(totalACobrar / cantidadFinal);

    const nuevasCuotas = Array.from({ length: cantidadFinal }, (_, index) => {
      const cuotaPrevia = cuotasPrevias[index];

      return {
        numeroCuota: index + 1,
        monto: montoBase.toFixed(2),
        fecha_vencimiento:
          index === 0
            ? fechaActual()
            : cuotaPrevia?.fecha_vencimiento ||
              fechaVencimientoPorIndice(fechaBase, index),
        estadoCuota: cuotaPrevia?.estadoCuota ?? "Debe",
      };
    });

    const sumaActual = nuevasCuotas.reduce(
      (sum, cuota) => sum + Number(cuota.monto || 0),
      0,
    );

    const diferencia = redondear2(totalACobrar - sumaActual);

    if (nuevasCuotas.length > 0) {
      const ultimaPosicion = nuevasCuotas.length - 1;

      nuevasCuotas[ultimaPosicion].monto = redondear2(
        Number(nuevasCuotas[ultimaPosicion].monto || 0) + diferencia,
      ).toFixed(2);
    }

    return nuevasCuotas;
  };

  const normalizarCarreras = (response: any): Carrera[] => {
    if (Array.isArray(response)) {
      return response;
    }

    return response?.carreras ?? response?.data ?? response?.resultado ?? [];
  };

  const prepararPlanPorDefecto = (item: Carrera) => {
    const total = Number(item.costo ?? 0);

    const matricula = Number(
      item.costo_matricula ?? item.costoMatricula ?? 0,
    );

    const numeroCuotas = Math.max(
      Number(item.numeroCuotas ?? item.cuotas_por_anio ?? 1),
      1,
    );

    const fechaHoy = fechaActual();
    const totalACobrar = redondear2(Math.max(total - matricula, 0));

    setMontoMatricula(matricula.toFixed(2));
    setFechaMatricula(fechaHoy);
    setCantidadCuotas(String(numeroCuotas));
    setTotalCuotasEditable(totalACobrar.toFixed(2));
    setMontoTodasCuotas("");
    setCuotas(
      generarCuotasRepartidas(numeroCuotas, totalACobrar, fechaHoy),
    );
  };

  const aplicarCuotasExistentes = (data: any[]) => {
    const matricula = data.find(
      (item) => String(item.tipo).toUpperCase() === "MATRICULA",
    );

    const mensuales = data
      .filter((item) => String(item.tipo).toUpperCase() === "MENSUAL")
      .sort((a, b) => Number(a.numeroCuota) - Number(b.numeroCuota));

    const fechaBaseCuotas = String(
      matricula?.fecha_vencimiento ?? fechaActual(),
    ).slice(0, 10);

    if (matricula) {
      setMontoMatricula(Number(matricula.monto ?? 0).toFixed(2));
      setFechaMatricula(fechaBaseCuotas);
    }

    if (mensuales.length === 0) {
      return;
    }

    const cuotasExistentes: CuotaEditable[] = mensuales.map((item, index) => ({
      numeroCuota: Number(item.numeroCuota ?? index + 1),
      monto: Number(item.monto ?? 0).toFixed(2),
      fecha_vencimiento: String(
        item.fecha_vencimiento ??
          fechaVencimientoPorIndice(fechaBaseCuotas, index),
      ).slice(0, 10),
      estadoCuota:
        item.estadoCuota === "Condonado" ? "Condonado" : "Debe",
    }));

    setCantidadCuotas(String(cuotasExistentes.length));
    setCuotas(cuotasExistentes);

    const totalExistente = cuotasExistentes.reduce((sum, cuota) => {
      if (cuota.estadoCuota === "Condonado") {
        return sum;
      }

      return sum + Number(cuota.monto || 0);
    }, 0);

    setTotalCuotasEditable(totalExistente.toFixed(2));
  };

  const seleccionarCarrera = async (item: Carrera) => {
    const solicitudActual = solicitudCuotasRef.current + 1;
    solicitudCuotasRef.current = solicitudActual;

    setCarrera(item);
    prepararPlanPorDefecto(item);

    try {
      setCargandoCuotas(true);

      const response = await httpClient.getAuth<any[]>(
        `/api/estudiantes/${idEstudiante}/carreras/${item.idCarrera}/cuotas`,
      );

      if (solicitudCuotasRef.current !== solicitudActual) {
        return;
      }

      const data = Array.isArray(response) ? response : [];

      if (data.length > 0) {
        aplicarCuotasExistentes(data);
      }
    } catch (error: any) {
      if (solicitudCuotasRef.current !== solicitudActual) {
        return;
      }

      Toast.show({
        type: "error",
        text1: "No se pudieron cargar las cuotas",
        text2:
          error?.response?.data?.message ??
          error?.message ??
          "Se mantendrá el plan sugerido de la carrera.",
      });
    } finally {
      if (solicitudCuotasRef.current === solicitudActual) {
        setCargandoCuotas(false);
      }
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setCarreras([]);
      setCarrera(null);
      setIdCarreraOriginal(null);
      setNombreCarreraOriginal("");
      setTurnoPreferido(null);

      const response = await httpClient.getAuth<DatosCuotasResponse>(
        `/api/inscripcion/datos-cuotas/${idEstudiante}`,
      );

      const listaCarreras = normalizarCarreras(response);
      const carreraActual = response?.carreraActual ?? null;

      setCarreras(listaCarreras);

      if (response?.advertencia) {
        Toast.show({
          type: "info",
          text1: "Revisión de carrera",
          text2: response.advertencia,
        });
      }

      if (!carreraActual) {
        return;
      }

      const idActual = Number(carreraActual.idCarrera);
      const seleccionActual = listaCarreras.find(
        (item) => Number(item.idCarrera) === idActual,
      );

      setIdCarreraOriginal(idActual);
      setNombreCarreraOriginal(
        carreraActual.nombreCarrera ??
          seleccionActual?.nombreCarrera ??
          `Carrera ${idActual}`,
      );
      setTurnoPreferido(carreraActual.turnoPreferido ?? null);

      if (seleccionActual) {
        await seleccionarCarrera(seleccionActual);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.response?.data?.message ??
          error?.message ??
          "No se pudieron cargar las carreras.",
      });
    } finally {
      setLoading(false);
    }
  };

  const cambiarMatricula = (value: string) => {
    const limpio = limpiarNumero(value);
    const nuevaMatricula = Number(limpio || 0);

    const totalACobrar = redondear2(
      Math.max(totalCarreraFijo - nuevaMatricula, 0),
    );

    setMontoMatricula(limpio);
    setTotalCuotasEditable(totalACobrar.toFixed(2));
    setCuotas((prev) => repartirMontoEnCuotas(totalACobrar, prev));
  };

  const cambiarTotalCuotas = (value: string) => {
    const limpio = limpiarNumero(value);
    const total = Number(limpio || 0);

    setTotalCuotasEditable(limpio);
    setCuotas((prev) => repartirMontoEnCuotas(total, prev));
  };

  const cambiarMontoTodasCuotas = (value: string) => {
    const limpio = limpiarNumero(value);

    setMontoTodasCuotas(limpio);

    setCuotas((prev) => {
      const nuevasCuotas = prev.map((cuota) => ({
        ...cuota,
        monto: limpio || "0",
      }));

      const nuevoTotalDebe = nuevasCuotas.reduce((sum, cuota) => {
        if (cuota.estadoCuota === "Condonado") {
          return sum;
        }

        return sum + Number(cuota.monto || 0);
      }, 0);

      setTotalCuotasEditable(nuevoTotalDebe.toFixed(2));

      return nuevasCuotas;
    });
  };

  const cambiarFechaMatricula = (value: string) => {
    setFechaMatricula(value);

    setCuotas((prev) =>
      prev.map((cuota, index) => ({
        ...cuota,
        fecha_vencimiento: fechaVencimientoPorIndice(value, index),
      })),
    );
  };

  const cambiarCantidadCuotas = (value: string) => {
    const limpio = value.replace(/\D/g, "");
    const cantidad = Math.max(Number(limpio || 1), 1);
    const total = Number(totalCuotasEditable || 0);

    setCantidadCuotas(String(cantidad));
    setCuotas((prev) =>
      generarCuotasRepartidas(cantidad, total, fechaMatricula, prev),
    );
  };

  const sumarCuota = () => {
    cambiarCantidadCuotas(String(Number(cantidadCuotas || 1) + 1));
  };

  const restarCuota = () => {
    const actual = Number(cantidadCuotas || 1);

    if (actual <= 1) {
      return;
    }

    cambiarCantidadCuotas(String(actual - 1));
  };

  const actualizarCuota = (
    index: number,
    field: keyof CuotaEditable,
    value: string,
  ) => {
    const finalValue = field === "monto" ? limpiarNumero(value) : value;

    setCuotas((prev) => {
      const nuevasCuotas = prev.map((cuota, posicion) =>
        posicion === index
          ? {
              ...cuota,
              [field]: finalValue,
            }
          : cuota,
      );

      const totalDebe = nuevasCuotas.reduce((sum, cuota) => {
        if (cuota.estadoCuota === "Condonado") {
          return sum;
        }

        return sum + Number(cuota.monto || 0);
      }, 0);

      setTotalCuotasEditable(totalDebe.toFixed(2));

      return nuevasCuotas;
    });
  };

  const validar = () => {
    if (!carrera) {
      Toast.show({
        type: "error",
        text1: "Selecciona una carrera",
      });

      return false;
    }

    if (!turnoPreferido) {
      Toast.show({
        type: "error",
        text1: "Selecciona un turno",
        text2: "Indica el turno que prefiere el estudiante.",
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
    if (!validar()) {
      return;
    }

    const carreraSeleccionada = carrera;
    const turnoSeleccionado = turnoPreferido;

    if (!carreraSeleccionada || !turnoSeleccionado) {
      return;
    }

    try {
      setGuardando(true);

      const response = await httpClient.postAuth<any>(
        "/api/inscripcion/pago-cuotas",
        {
          idUsuario: idEstudiante,
          idCarrera: carreraSeleccionada.idCarrera,
          turnoPreferido: turnoSeleccionado,
          matricula: {
            monto: Number(montoMatricula || 0),
            descuento: 0,
            fecha_vencimiento: fechaMatricula,
          },
          cuotas: cuotas.map((cuota, index) => ({
            numeroCuota: cuota.numeroCuota,
            monto: Number(cuota.monto || 0),
            descuento: 0,
            fecha_vencimiento:
              index === 0 ? fechaActual() : cuota.fecha_vencimiento,
            estadoCuota: cuota.estadoCuota,
          })),
        },
      );

      if (!response?.guardado) {
        Toast.show({
          type: "error",
          text1: "No se guardaron los cambios",
          text2:
            response?.message ??
            "El backend no confirmó el guardado del plan de cuotas.",
        });

        return;
      }

      setIdCarreraOriginal(carreraSeleccionada.idCarrera);
      setNombreCarreraOriginal(carreraSeleccionada.nombreCarrera);

      Toast.show({
        type: "success",
        text1: response.carreraCambiada
          ? "Carrera actualizada"
          : response.actualizado
            ? "Plan actualizado"
            : "Plan guardado",
        text2: response.message,
      });

      onFinish?.();
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message ??
        error?.response?.data?.errors?.idCarrera?.[0] ??
        error?.response?.data?.errors?.turnoPreferido?.[0] ??
        error?.response?.data?.errors?.cuotas?.[0] ??
        error?.message;

      Toast.show({
        type: "error",
        text1: "No se pudo guardar",
        text2: backendMessage ?? "No se pudo guardar el plan de cuotas.",
      });
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    void cargarDatos();
  }, [idEstudiante]);

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
        <ActivityIndicator color={theme.colors.primary} size="large" />

        <ThemedText
          style={{
            color: theme.colors.muted,
            fontWeight: "800",
          }}
        >
          Cargando carreras y plan de cuotas...
        </ThemedText>
      </View>
    );
  }

  const carreraCardWidth = isMobile ? "100%" : isTablet ? "48.8%" : "32.4%";

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
        <View style={styles.headerRow}>
          <View style={styles.headerInfo}>
            <ThemedText style={[styles.title, { color: theme.colors.text }]}> 
              Carrera del estudiante
            </ThemedText>

            <ThemedText style={[styles.subtitle, { color: theme.colors.muted }]}> 
              Puedes cambiar la carrera seleccionada. Al guardar se actualizará
              la relación existente en CarreraUsuario; no se creará otra fila.
            </ThemedText>
          </View>

          <View
            style={[
              styles.totalBadge,
              {
                backgroundColor: `${theme.colors.primary}18`,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <Ionicons
              name="school-outline"
              size={18}
              color={theme.colors.primary}
            />

            <ThemedText
              style={{ color: theme.colors.primary, fontWeight: "900" }}
            >
              {carreras.length} carreras
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={theme.colors.muted} />

          <TextInput
            value={busquedaCarrera}
            onChangeText={setBusquedaCarrera}
            placeholder="Buscar carrera por nombre, código o régimen..."
            placeholderTextColor={theme.colors.muted}
            style={[styles.searchInput, { color: theme.colors.text }]}
          />

          {busquedaCarrera.length > 0 && (
            <Pressable onPress={() => setBusquedaCarrera("")}>
              <Ionicons
                name="close-circle"
                size={21}
                color={theme.colors.muted}
              />
            </Pressable>
          )}
        </View>

        {carreraCambioPendiente && (
          <View
            style={[
              styles.changeNotice,
              {
                backgroundColor: "rgba(245,158,11,0.12)",
                borderColor: "#F59E0B",
              },
            ]}
          >
            <Ionicons name="swap-horizontal" size={22} color="#F59E0B" />

            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.noticeTitle, { color: "#F59E0B" }]}> 
                Cambio de carrera pendiente
              </ThemedText>

              <ThemedText
                style={[styles.noticeText, { color: theme.colors.text }]}
              >
                {nombreCarreraOriginal || "Carrera actual"} → {" "}
                {carrera?.nombreCarrera}
              </ThemedText>
            </View>
          </View>
        )}

        <ScrollView
          style={styles.carrerasScroll}
          nestedScrollEnabled
          showsVerticalScrollIndicator
          contentContainerStyle={styles.carrerasGrid}
        >
          {carrerasFiltradas.map((item) => {
            const active = carrera?.idCarrera === item.idCarrera;
            const actualGuardada = idCarreraOriginal === item.idCarrera;
            const total = Number(item.costo ?? 0);
            const cuotasCarrera = Number(
              item.numeroCuotas ?? item.cuotas_por_anio ?? 1,
            );

            return (
              <Pressable
                key={item.idCarrera}
                disabled={guardando || cargandoCuotas}
                onPress={() => void seleccionarCarrera(item)}
                style={({ pressed }) => [
                  styles.carreraCard,
                  {
                    width: carreraCardWidth as any,
                    backgroundColor: active
                      ? `${theme.colors.primary}16`
                      : theme.colors.background,
                    borderColor: active
                      ? theme.colors.primary
                      : theme.colors.border,
                    opacity:
                      guardando || cargandoCuotas
                        ? 0.65
                        : pressed
                          ? 0.78
                          : 1,
                  },
                ]}
              >
                <View style={styles.carreraCardTop}>
                  <View
                    style={[
                      styles.carreraIcon,
                      {
                        backgroundColor: active
                          ? theme.colors.primary
                          : `${theme.colors.primary}18`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={active ? "checkmark" : "school-outline"}
                      size={22}
                      color={active ? "#FFFFFF" : theme.colors.primary}
                    />
                  </View>

                  <View style={styles.carreraCardInfo}>
                    <ThemedText
                      numberOfLines={2}
                      style={[styles.carreraNombre, { color: theme.colors.text }]}
                    >
                      {item.nombreCarrera}
                    </ThemedText>

                    <ThemedText
                      numberOfLines={1}
                      style={[styles.carreraCodigo, { color: theme.colors.muted }]}
                    >
                      {item.codigo || "Sin código"} · {item.regimen || "Sin régimen"}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.carreraMetaRow}>
                  <MetaPill
                    icon="cash-outline"
                    text={formatoBs(total)}
                    active={active}
                  />

                  <MetaPill
                    icon="calendar-outline"
                    text={`${cuotasCarrera} cuota(s)`}
                    active={active}
                  />
                </View>

                <View style={styles.carreraFooter}>
                  {actualGuardada && (
                    <View
                      style={[
                        styles.currentBadge,
                        {
                          backgroundColor: "rgba(22,163,74,0.14)",
                          borderColor: "#16A34A",
                        },
                      ]}
                    >
                      <Ionicons
                        name="bookmark"
                        size={13}
                        color="#16A34A"
                      />
                      <ThemedText style={styles.currentBadgeText}>
                        Actual
                      </ThemedText>
                    </View>
                  )}

                  <ThemedText
                    style={{
                      color: active ? theme.colors.primary : theme.colors.muted,
                      fontWeight: "900",
                      fontSize: 12,
                    }}
                  >
                    {active ? "Seleccionada" : "Seleccionar"}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}

          {carrerasFiltradas.length === 0 && (
            <View
              style={[
                styles.emptyCarreras,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={34}
                color={theme.colors.muted}
              />

              <ThemedText
                style={{ color: theme.colors.text, fontWeight: "900" }}
              >
                No se encontraron carreras
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>

      {carrera && (
        <>
          <View
            style={[
              styles.panel,
              {
                backgroundColor: theme.colors.card,
                borderColor: turnoPreferido
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
          >
            <View style={styles.headerRow}>
              <View style={styles.headerInfo}>
                <ThemedText
                  style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                  Turno preferido
                </ThemedText>

                <ThemedText
                  style={[styles.subtitle, { color: theme.colors.muted }]}
                >
                  Este turno se guardará junto con la carrera del estudiante y
                  servirá como referencia al momento de asignar materias.
                </ThemedText>
              </View>

              {turnoPreferido && (
                <View
                  style={[
                    styles.turnoSelectedBadge,
                    {
                      backgroundColor: `${theme.colors.primary}18`,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <ThemedText
                    style={{ color: theme.colors.primary, fontWeight: "900" }}
                  >
                    {turnoPreferido}
                  </ThemedText>
                </View>
              )}
            </View>

            <View
              style={[
                styles.turnosGrid,
                { flexDirection: isMobile ? "column" : "row" },
              ]}
            >
              {TURNOS.map((item) => {
                const active = turnoPreferido === item.value;

                return (
                  <Pressable
                    key={item.value}
                    disabled={guardando}
                    onPress={() => setTurnoPreferido(item.value)}
                    style={({ pressed }) => [
                      styles.turnoCard,
                      {
                        backgroundColor: active
                          ? `${theme.colors.primary}16`
                          : theme.colors.background,
                        borderColor: active
                          ? theme.colors.primary
                          : theme.colors.border,
                        opacity: pressed ? 0.78 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.turnoIcon,
                        {
                          backgroundColor: active
                            ? theme.colors.primary
                            : `${theme.colors.primary}18`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={24}
                        color={active ? "#FFFFFF" : theme.colors.primary}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={[styles.turnoTitle, { color: theme.colors.text }]}
                      >
                        {item.value}
                      </ThemedText>

                      <ThemedText
                        style={[styles.turnoText, { color: theme.colors.muted }]}
                      >
                        {item.descripcion}
                      </ThemedText>
                    </View>

                    <View
                      style={[
                        styles.radio,
                        {
                          backgroundColor: active
                            ? theme.colors.primary
                            : "transparent",
                          borderColor: active
                            ? theme.colors.primary
                            : theme.colors.border,
                        },
                      ]}
                    >
                      {active && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

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

            <MiniTotal
              label="Matrícula"
              value={formatoBs(matriculaNumber)}
            />

            <View style={styles.miniTotal}>
              <Input
                label="Cuotas a cobrar"
                value={totalCuotasEditable}
                onChangeText={cambiarTotalCuotas}
                keyboardType="numeric"
              />
            </View>

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
                  style={{ color: theme.colors.muted, fontWeight: "800" }}
                >
                  Cargando plan de cuotas...
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
    },
  ]}
>
  <View style={styles.cantidadCuotasRow}>
    <Input
      label="Cantidad de cuotas"
      value={cantidadCuotas}
      onChangeText={cambiarCantidadCuotas}
      keyboardType="numeric"
    />

    <View style={styles.stepperRow}>
      <Pressable
        onPress={restarCuota}
        disabled={Number(cantidadCuotas || 1) <= 1}
        style={[
          styles.stepperButton,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            opacity: Number(cantidadCuotas || 1) <= 1 ? 0.45 : 1,
          },
        ]}
      >
        <Ionicons
          name="remove"
          size={20}
          color={theme.colors.text}
        />
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
        <Ionicons
          name="add"
          size={20}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  </View>
</View>

<Input
  label="Monto para todas las cuotas"
  value={montoTodasCuotas}
  onChangeText={cambiarMontoTodasCuotas}
  keyboardType="numeric"
  placeholder="Ej: 1000"
/>
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
                        borderColor: condonado
                          ? "#16A34A"
                          : theme.colors.border,
                        shadowColor: condonado ? "#16A34A" : "#000000",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "stretch" : "center",
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
                          color: condonado ? "#FFFFFF" : theme.colors.text,
                          fontWeight: "900",
                        }}
                      >
                        #{cuota.numeroCuota}
                      </ThemedText>
                    </View>

                    <View style={{ flex: 1.2, width: isMobile ? "100%" : undefined }}>
                      <Input
                        label="Monto"
                        value={cuota.monto}
                        onChangeText={(value) =>
                          actualizarCuota(index, "monto", value)
                        }
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={{ flex: 1.2, width: isMobile ? "100%" : undefined }}>
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
                                color: active ? "#FFFFFF" : theme.colors.text,
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
              style={({ pressed }) => [
                styles.saveButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity:
                    guardando || cargandoCuotas ? 0.6 : pressed ? 0.78 : 1,
                },
              ]}
            >
              {guardando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons
                  name={carreraCambioPendiente ? "swap-horizontal" : "save-outline"}
                  size={20}
                  color="#FFFFFF"
                />
              )}

              <ThemedText style={{ color: "#FFFFFF", fontWeight: "900" }}>
                {guardando
                  ? "Guardando..."
                  : carreraCambioPendiente
                    ? "Actualizar carrera, turno y cuotas"
                    : idCarreraOriginal
                      ? "Guardar cambios y continuar"
                      : "Guardar carrera, turno y cuotas"}
              </ThemedText>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function MetaPill({
  icon,
  text,
  active,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  active: boolean;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.metaPill,
        {
          backgroundColor: active
            ? `${theme.colors.primary}12`
            : theme.colors.card,
          borderColor: active ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={13}
        color={active ? theme.colors.primary : theme.colors.muted}
      />

      <ThemedText
        style={{
          color: active ? theme.colors.primary : theme.colors.muted,
          fontWeight: "800",
          fontSize: 11,
        }}
      >
        {text}
      </ThemedText>
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
        style={{ color: theme.colors.muted, fontWeight: "900", fontSize: 11 }}
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
          height: 44,
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
        style={{ color: theme.colors.muted, fontWeight: "900", fontSize: 12 }}
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
    gap: 16,
  },
  loadingCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 32,
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  panel: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 25,
    fontWeight: "900",
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 3,
  },
  totalBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  searchBox: {
    height: 50,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 48,
    fontSize: 14,
    fontWeight: "700",
    outlineStyle: "none" as any,
  },
  changeNotice: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cantidadCuotasRow: {
  width: "100%",
  flexDirection: "row",
  alignItems: "flex-end",
  gap: 12,
},
  noticeTitle: {
    fontSize: 13,
    fontWeight: "900",
  },
  noticeText: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "800",
  },
  carrerasScroll: {
    maxHeight: 430,
  },
  carrerasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingRight: 5,
    paddingBottom: 4,
  },
  carreraCard: {
    minHeight: 156,
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  carreraCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  carreraIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  carreraCardInfo: {
    flex: 1,
    minWidth: 0,
  },
  carreraNombre: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  carreraCodigo: {
    marginTop: 3,
    fontSize: 11.5,
    fontWeight: "700",
  },
  carreraMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  metaPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  carreraFooter: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  currentBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  currentBadgeText: {
    color: "#16A34A",
    fontSize: 10.5,
    fontWeight: "900",
  },
  emptyCarreras: {
    width: "100%",
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  turnoSelectedBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  turnosGrid: {
    gap: 12,
  },
  turnoCard: {
    flex: 1,
    minHeight: 92,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  turnoIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  turnoTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  turnoText: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  totalBar: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  miniTotal: {
    flex: 1,
    gap: 3,
    minWidth: 150,
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
},
  stepperRow: {
    flexDirection: "row",
    gap: 8,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cuotasList: {
    gap: 9,
  },
  cuotaRow: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 11,
    gap: 10,
    flexWrap: "wrap",
    shadowOpacity: 0.14,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  cuotaNumber: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  estadoRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  estadoButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  saveButton: {
    minHeight: 56,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 18,
  },
});
