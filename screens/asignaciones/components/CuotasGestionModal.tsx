import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import {
  getCuotasGestionAsignaciones,
  guardarCuotasGestionAsignaciones,
  reutilizarPlanCuotasGestionAsignaciones,
} from "../services/asignaciones.services";
import {
  CuotasGestionResponse,
  Estudiante,
  GuardarCuotasGestionPayload,
  GuardarCuotasGestionResponse,
  TurnoInscripcion,
} from "../types/asignaciones.types";

type EstadoEditable = "Debe" | "Condonado";
type ModoPlanCuotas = "elegir" | "nuevo" | "anterior" | "existente";

type CuotaEditable = {
  numeroCuota: number;
  monto: string;
  descuento: string;
  fecha_vencimiento: string;
  estadoCuota: EstadoEditable;
  bloqueada: boolean;
};

type Props = {
  visible: boolean;
  estudiante: Estudiante | null;
  idCarrera: number | null;
  datosIniciales?: CuotasGestionResponse | null;
  onClose: () => void;
  onSuccess: (
    response: GuardarCuotasGestionResponse,
    datosActualizados: CuotasGestionResponse,
  ) => void | Promise<void>;
};

const TURNOS: Array<{
  value: TurnoInscripcion;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}> = [
  {
    value: "Mañana",
    icon: "sunny-outline",
    description: "Grupos disponibles durante la mañana.",
  },
  {
    value: "Tarde",
    icon: "partly-sunny-outline",
    description: "Grupos disponibles durante la tarde.",
  },
  {
    value: "Noche",
    icon: "moon-outline",
    description: "Grupos disponibles durante la noche.",
  },
];

function nombreCompleto(estudiante: Estudiante | null): string {
  if (!estudiante) return "Estudiante";

  return `${estudiante.nombres ?? ""} ${estudiante.apellidoPaterno ?? ""} ${
    estudiante.apellidoMaterno ?? ""
  }`
    .replace(/\s+/g, " ")
    .trim();
}

function fechaActual(): string {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function decimoDiaDelMes(fechaBase: string, mesesAdelante: number): string {
  const base = fechaBase || fechaActual();
  const [anio, mes] = base.slice(0, 10).split("-").map(Number);

  if (!anio || !mes) {
    return decimoDiaDelMes(fechaActual(), mesesAdelante);
  }

  const fecha = new Date(anio, mes - 1 + mesesAdelante, 10);
  const nuevoAnio = fecha.getFullYear();
  const nuevoMes = String(fecha.getMonth() + 1).padStart(2, "0");

  return `${nuevoAnio}-${nuevoMes}-10`;
}

function fechaPorIndice(fechaBase: string, index: number): string {
  return index === 0 ? fechaActual() : decimoDiaDelMes(fechaBase, index);
}

function redondear2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function limpiarNumero(value: string): string {
  const limpio = value.replace(/[^0-9.]/g, "");
  const partes = limpio.split(".");

  if (partes.length <= 2) return limpio;

  return `${partes.shift()}.${partes.join("")}`;
}

function formatoBs(value: number): string {
  return `Bs ${redondear2(value).toFixed(2)}`;
}

function normalizarTurno(value: unknown): TurnoInscripcion | null {
  return TURNOS.some((turno) => turno.value === value)
    ? (value as TurnoInscripcion)
    : null;
}

function generarCuotas(
  cantidad: number,
  total: number,
  fechaBase: string,
  previas: CuotaEditable[] = [],
): CuotaEditable[] {
  const cantidadFinal = Math.max(Number(cantidad || 1), 1);

  const nuevas = Array.from({ length: cantidadFinal }, (_, index) => {
    const previa = previas[index];

    return {
      numeroCuota: index + 1,
      monto: previa?.monto ?? "0.00",
      descuento: previa?.descuento ?? "0.00",
      fecha_vencimiento:
        previa?.fecha_vencimiento ?? fechaPorIndice(fechaBase, index),
      estadoCuota: previa?.estadoCuota ?? "Debe",
      bloqueada: previa?.bloqueada ?? false,
    } satisfies CuotaEditable;
  });

  return distribuirSaldo(total, nuevas);
}

function distribuirSaldo(
  total: number,
  cuotas: CuotaEditable[],
): CuotaEditable[] {
  const fijas = cuotas.filter(
    (cuota) => cuota.bloqueada && cuota.estadoCuota !== "Condonado",
  );
  const condonadas = cuotas.filter(
    (cuota) => cuota.estadoCuota === "Condonado",
  );
  const editables = cuotas.filter(
    (cuota) => !cuota.bloqueada && cuota.estadoCuota !== "Condonado",
  );

  const totalFijo = fijas.reduce(
    (sum, cuota) => sum + Number(cuota.monto || 0),
    0,
  );
  const totalCondonado = condonadas.reduce(
    (sum, cuota) => sum + Number(cuota.monto || 0),
    0,
  );

  /*
   * El monto condonado cubre parte del costo de la carrera y no debe
   * redistribuirse entre las demás cuotas. De lo contrario, condonar una
   * cuota solamente trasladaría la deuda a las otras.
   */
  const saldo = redondear2(
    Math.max(Number(total || 0) - totalFijo - totalCondonado, 0),
  );

  if (editables.length === 0) return cuotas;

  const montoBase = redondear2(saldo / editables.length);
  let acumulado = 0;
  let editableIndex = 0;

  return cuotas.map((cuota) => {
    if (cuota.bloqueada || cuota.estadoCuota === "Condonado") {
      return cuota;
    }

    const esUltima = editableIndex === editables.length - 1;
    const monto = esUltima ? redondear2(saldo - acumulado) : montoBase;

    acumulado = redondear2(acumulado + monto);
    editableIndex += 1;

    return {
      ...cuota,
      monto: monto.toFixed(2),
    };
  });
}

export default function CuotasGestionModal({
  visible,
  estudiante,
  idCarrera,
  datosIniciales,
  onClose,
  onSuccess,
}: Props) {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const isMobile = width < 720;
  const isTablet = width < 1100;

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const modalBackground = isDark ? "#111827" : theme.colors.card;
  const panelBackground = isDark
    ? "rgba(255,255,255,0.045)"
    : "rgba(15,23,42,0.035)";
  const panelStrong = isDark
    ? "rgba(255,255,255,0.075)"
    : "rgba(15,23,42,0.06)";
  const borderColor = isDark
    ? "rgba(255,255,255,0.12)"
    : "rgba(15,23,42,0.12)";

  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [reutilizando, setReutilizando] = useState(false);
  const [datos, setDatos] = useState<CuotasGestionResponse | null>(null);
  const [turnoPreferido, setTurnoPreferido] =
    useState<TurnoInscripcion | null>(null);
  const [montoMatricula, setMontoMatricula] = useState("0.00");
  const [descuentoMatricula, setDescuentoMatricula] = useState("0.00");
  const [fechaMatricula, setFechaMatricula] = useState(fechaActual());
  const [matriculaBloqueada, setMatriculaBloqueada] = useState(false);
  const [cantidadCuotas, setCantidadCuotas] = useState("1");
  const [cuotas, setCuotas] = useState<CuotaEditable[]>([]);
  const [montoTodasCuotas, setMontoTodasCuotas] = useState("");
  const [modoPlan, setModoPlan] = useState<ModoPlanCuotas>("nuevo");

  /*
   * Evita que una consulta iniciada al abrir el modal sobrescriba la
   * decisión del usuario unos segundos después.
   */
  const cargaDatosIdRef = useRef(0);
  const decisionPlanTomadaRef = useRef(false);

  const totalCarrera = Number(datos?.carrera?.costo ?? 0);
  const matriculaNumero = Number(montoMatricula || 0);
  const saldoCarrera = redondear2(Math.max(totalCarrera - matriculaNumero, 0));

  const prepararPlanNuevo = useCallback(
    (response: CuotasGestionResponse) => {
      setDatos(response);
      setTurnoPreferido(normalizarTurno(response.turnoPreferido));

      const matriculaDefault = Number(
        response.carrera.costo_matricula ??
          response.carrera.costoMatricula ??
          0,
      );
      const fechaBase = fechaActual();
      const numeroCuotas = Math.max(
        Number(
          response.carrera.numeroCuotas ??
            response.carrera.cuotas_por_anio ??
            1,
        ),
        1,
      );
      const totalARepartir = redondear2(
        Math.max(Number(response.carrera.costo ?? 0) - matriculaDefault, 0),
      );

      setMontoMatricula(matriculaDefault.toFixed(2));
      setDescuentoMatricula("0.00");
      setFechaMatricula(fechaBase);
      setMatriculaBloqueada(false);
      setCantidadCuotas(String(numeroCuotas));
      setCuotas(generarCuotas(numeroCuotas, totalARepartir, fechaBase));
      setMontoTodasCuotas("");
      setModoPlan("nuevo");
    },
    [],
  );

  const prepararPlanAnterior = useCallback(
    (response: CuotasGestionResponse) => {
      const planAnterior = response.ultimoPlanCuotas;

      if (!planAnterior?.disponible) {
        prepararPlanNuevo(response);
        return;
      }

      setDatos(response);
      setTurnoPreferido(normalizarTurno(response.turnoPreferido));

      const fechaBase = fechaActual();
      const matriculaAnterior = planAnterior.matricula;
      const mensualesAnteriores = Array.isArray(planAnterior.cuotas)
        ? [...planAnterior.cuotas].sort(
            (a, b) => Number(a.numeroCuota) - Number(b.numeroCuota),
          )
        : [];

      const cuotasCopiadas = mensualesAnteriores.map((cuota, index) => ({
        numeroCuota: Number(cuota.numeroCuota ?? index + 1),
        monto: Number(cuota.monto ?? 0).toFixed(2),
        descuento: Number(cuota.descuento ?? 0).toFixed(2),
        fecha_vencimiento: fechaPorIndice(fechaBase, index),
        estadoCuota:
          String(cuota.estadoCuota).toLowerCase() === "condonado"
            ? "Condonado"
            : "Debe",
        bloqueada: false,
      })) satisfies CuotaEditable[];

      setMontoMatricula(
        Number(
          matriculaAnterior?.monto ??
            response.carrera.costo_matricula ??
            response.carrera.costoMatricula ??
            0,
        ).toFixed(2),
      );
      setDescuentoMatricula(
        Number(matriculaAnterior?.descuento ?? 0).toFixed(2),
      );
      setFechaMatricula(fechaBase);
      setMatriculaBloqueada(false);
      setCantidadCuotas(String(Math.max(cuotasCopiadas.length, 1)));
      setCuotas(
        cuotasCopiadas.length > 0
          ? cuotasCopiadas
          : generarCuotas(1, Number(response.carrera.costo ?? 0), fechaBase),
      );
      setMontoTodasCuotas("");
      setModoPlan("anterior");
    },
    [prepararPlanNuevo],
  );

  const aplicarPlanExistente = useCallback(
    (response: CuotasGestionResponse) => {
      setDatos(response);
      setTurnoPreferido(normalizarTurno(response.turnoPreferido));

      const cuotasServidor = Array.isArray(response.cuotas)
        ? response.cuotas
        : [];
      const matricula = cuotasServidor.find(
        (cuota) => String(cuota.tipo).toUpperCase() === "MATRICULA",
      );
      const mensuales = cuotasServidor
        .filter((cuota) => String(cuota.tipo).toUpperCase() === "MENSUAL")
        .sort((a, b) => Number(a.numeroCuota) - Number(b.numeroCuota));

      const matriculaDefault = Number(
        response.carrera.costo_matricula ??
          response.carrera.costoMatricula ??
          0,
      );
      const fechaBase = String(
        matricula?.fecha_vencimiento ?? fechaActual(),
      ).slice(0, 10);
      const matriculaPagada = Boolean(
        matricula?.fecha_pago || matricula?.estadoCuota === "Pagado",
      );

      setMontoMatricula(
        Number(matricula?.monto ?? matriculaDefault).toFixed(2),
      );
      setDescuentoMatricula(
        Number(matricula?.descuento ?? 0).toFixed(2),
      );
      setFechaMatricula(fechaBase);
      setMatriculaBloqueada(matriculaPagada);
      setMontoTodasCuotas("");

      const existentes = mensuales.map((cuota, index) => ({
        numeroCuota: Number(cuota.numeroCuota ?? index + 1),
        monto: Number(cuota.monto ?? 0).toFixed(2),
        descuento: Number(cuota.descuento ?? 0).toFixed(2),
        fecha_vencimiento: String(
          cuota.fecha_vencimiento ?? fechaPorIndice(fechaBase, index),
        ).slice(0, 10),
        estadoCuota:
          cuota.estadoCuota === "Condonado" ? "Condonado" : "Debe",
        bloqueada: Boolean(
          cuota.fecha_pago || cuota.estadoCuota === "Pagado",
        ),
      })) satisfies CuotaEditable[];

      setCantidadCuotas(String(Math.max(existentes.length, 1)));
      setCuotas(existentes);
      setModoPlan("existente");
    },
    [],
  );

  const aplicarDatos = useCallback(
    (response: CuotasGestionResponse) => {
      const cuotasServidor = Array.isArray(response.cuotas)
        ? response.cuotas
        : [];
      const tieneMatriculaActual = cuotasServidor.some(
        (cuota) => String(cuota.tipo).toUpperCase() === "MATRICULA",
      );
      const tieneMensualesActuales = cuotasServidor.some(
        (cuota) => String(cuota.tipo).toUpperCase() === "MENSUAL",
      );

      if (
        response.tieneCuotasGestion ||
        (tieneMatriculaActual && tieneMensualesActuales)
      ) {
        aplicarPlanExistente(response);
        return;
      }

      setDatos(response);
      setTurnoPreferido(normalizarTurno(response.turnoPreferido));
      setMontoMatricula("0.00");
      setDescuentoMatricula("0.00");
      setFechaMatricula(fechaActual());
      setMatriculaBloqueada(false);
      setCantidadCuotas("1");
      setCuotas([]);
      setMontoTodasCuotas("");

      /*
       * Siempre pregunta antes de crear un plan para una gestión nueva.
       * Cuando no existe plan anterior, la opción de reutilizar se mostrará
       * deshabilitada, pero la confirmación seguirá siendo explícita.
       */
      setModoPlan("elegir");
    },
    [aplicarPlanExistente, prepararPlanNuevo],
  );

  const cargarDatos = useCallback(async () => {
    if (!estudiante || !idCarrera) return;

    const requestId = cargaDatosIdRef.current + 1;
    cargaDatosIdRef.current = requestId;

    try {
      setLoading(true);

      const response = await getCuotasGestionAsignaciones(
        estudiante.id,
        idCarrera,
      );

      /*
       * Si apareció una respuesta vieja después de que el usuario ya eligió
       * crear o reutilizar un plan, se descarta y no se vuelve a "elegir".
       */
      if (
        cargaDatosIdRef.current !== requestId ||
        decisionPlanTomadaRef.current
      ) {
        return;
      }

      aplicarDatos(response);
    } catch (error: any) {
      if (cargaDatosIdRef.current !== requestId) return;

      Toast.show({
        type: "error",
        text1: "No se pudieron cargar las cuotas",
        text2:
          error?.response?.data?.message ??
          "No se encontró la gestión activa de la carrera.",
      });
    } finally {
      if (cargaDatosIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [aplicarDatos, estudiante, idCarrera]);

  useEffect(() => {
    if (!visible) {
      /* Invalida cualquier petición que todavía estuviera en curso. */
      cargaDatosIdRef.current += 1;
      decisionPlanTomadaRef.current = false;

      setDatos(null);
      setTurnoPreferido(null);
      setMontoMatricula("0.00");
      setDescuentoMatricula("0.00");
      setFechaMatricula(fechaActual());
      setMatriculaBloqueada(false);
      setCantidadCuotas("1");
      setCuotas([]);
      setMontoTodasCuotas("");
      setModoPlan("nuevo");
      setReutilizando(false);
      setLoading(false);
      return;
    }

    decisionPlanTomadaRef.current = false;

    /*
     * AsignacionesScreen ya consulta las cuotas antes de abrir el modal y
     * las entrega en datosIniciales. No se debe iniciar otra consulta porque
     * su respuesta tardía volvería a ejecutar aplicarDatos() y mostraría otra
     * vez la pantalla de elección.
     */
    if (datosIniciales) {
      cargaDatosIdRef.current += 1;
      aplicarDatos(datosIniciales);
      setLoading(false);
      return;
    }

    void cargarDatos();
  }, [visible, datosIniciales, aplicarDatos, cargarDatos]);

  const elegirPlanNuevo = useCallback(() => {
    if (!datos) return;

    decisionPlanTomadaRef.current = true;
    cargaDatosIdRef.current += 1;

    /*
     * Al crear un plan nuevo se usa automáticamente el plan anterior como
     * referencia. Si no existe uno, se utilizan los valores de la carrera.
     */
    if (
      datos.puedeReutilizarPlanAnterior ||
      datos.puedeMantenerCuotasAnteriores
    ) {
      prepararPlanAnterior(datos);
      return;
    }

    prepararPlanNuevo(datos);
  }, [datos, prepararPlanAnterior, prepararPlanNuevo]);

  const reutilizarPlanAnterior = useCallback(async () => {
    if (
      !datos ||
      !estudiante ||
      !datos.gestionActiva?.id ||
      !datos.carrera?.idCarrera ||
      reutilizando
    ) {
      return;
    }

    decisionPlanTomadaRef.current = true;
    cargaDatosIdRef.current += 1;

    const puedeReutilizar = Boolean(
      datos.puedeReutilizarPlanAnterior ??
        datos.puedeMantenerCuotasAnteriores,
    );

    if (!puedeReutilizar || !datos.ultimoPlanCuotas?.disponible) {
      decisionPlanTomadaRef.current = false;

      Toast.show({
        type: "info",
        text1: "No existe un plan anterior",
        text2: "Debes crear un nuevo plan para esta gestión.",
      });
      return;
    }

    try {
      setReutilizando(true);

      const response = await reutilizarPlanCuotasGestionAsignaciones(
        estudiante.id,
        {
          idCarrera: Number(datos.carrera.idCarrera),
          idGestion: Number(datos.gestionActiva.id),
        },
      );

      const actualizados = await getCuotasGestionAsignaciones(
        estudiante.id,
        Number(datos.carrera.idCarrera),
      );

      Toast.show({
        type: "success",
        text1: "Plan anterior mantenido",
        text2: response.message,
      });

      await onSuccess(response, actualizados);
    } catch (error: any) {
      decisionPlanTomadaRef.current = false;

      const backend = error?.response?.data;
      const errores = backend?.errors;
      const primerError =
        errores && typeof errores === "object"
          ? Object.values(errores).flat().find(Boolean)
          : null;

      Toast.show({
        type: "error",
        text1: "No se pudo mantener el plan",
        text2: String(
          primerError ??
            backend?.message ??
            error?.message ??
            "No se pudo reutilizar el plan de cuotas anterior.",
        ),
      });
    } finally {
      setReutilizando(false);
    }
  }, [datos, estudiante, onSuccess, reutilizando]);

  const volverAElegirOrigen = useCallback(() => {
    if (
      !datos?.puedeMantenerCuotasAnteriores ||
      !datos.ultimoPlanCuotas?.disponible ||
      datos.tieneCuotasGestion
    ) {
      return;
    }

    decisionPlanTomadaRef.current = false;
    setModoPlan("elegir");
  }, [datos]);

  const minimoCuotas = useMemo(() => {
    const numerosBloqueados = cuotas
      .filter((cuota) => cuota.bloqueada)
      .map((cuota) => cuota.numeroCuota);

    return Math.max(1, ...numerosBloqueados);
  }, [cuotas]);

  const totalCuotasDebe = useMemo(
    () =>
      redondear2(
        cuotas.reduce((sum, cuota) => {
          if (cuota.estadoCuota === "Condonado") return sum;
          return sum + Number(cuota.monto || 0);
        }, 0),
      ),
    [cuotas],
  );

  const totalCondonado = useMemo(
    () =>
      redondear2(
        cuotas.reduce((sum, cuota) => {
          if (cuota.estadoCuota !== "Condonado") return sum;
          return sum + Number(cuota.monto || 0);
        }, 0),
      ),
    [cuotas],
  );

  const totalACobrar = redondear2(matriculaNumero + totalCuotasDebe);
  const totalPlan = redondear2(totalACobrar + totalCondonado);
  const diferencia = redondear2(totalCarrera - totalPlan);
  const cuotasEditables = cuotas.filter((cuota) => !cuota.bloqueada);
  const todasEditablesCondonadas =
    cuotasEditables.length > 0 &&
    cuotasEditables.every((cuota) => cuota.estadoCuota === "Condonado");
  const hayCuotasCondonadasEditables = cuotasEditables.some(
    (cuota) => cuota.estadoCuota === "Condonado",
  );
  const totalDeudaEditable = redondear2(
    cuotasEditables.reduce(
      (sum, cuota) =>
        cuota.estadoCuota === "Debe"
          ? sum + Number(cuota.monto || 0)
          : sum,
      0,
    ),
  );

  const cambiarCantidad = (value: string) => {
    const limpia = value.replace(/[^0-9]/g, "");
    const cantidad = Math.max(Number(limpia || 1), minimoCuotas, 1);

    setCantidadCuotas(String(cantidad));
    setCuotas((actuales) =>
      generarCuotas(cantidad, saldoCarrera, fechaMatricula, actuales),
    );
  };

  const sumarCuota = () => {
    cambiarCantidad(String(Number(cantidadCuotas || 1) + 1));
  };

  const restarCuota = () => {
    const actual = Number(cantidadCuotas || 1);

    if (actual <= minimoCuotas) {
      Toast.show({
        type: "info",
        text1: "Cuotas protegidas",
        text2:
          minimoCuotas > 1
            ? `No se puede bajar de ${minimoCuotas} porque existen cuotas pagadas.`
            : "Debe existir al menos una cuota mensual.",
      });
      return;
    }

    cambiarCantidad(String(actual - 1));
  };

  const actualizarCuota = (
    index: number,
    field: "monto" | "fecha_vencimiento",
    value: string,
  ) => {
    setCuotas((actuales) =>
      actuales.map((cuota, posicion) => {
        if (posicion !== index || cuota.bloqueada) return cuota;

        return {
          ...cuota,
          [field]: field === "monto" ? limpiarNumero(value) : value,
        };
      }),
    );
  };

  const cambiarEstadoCuota = (
    index: number,
    estadoCuota: EstadoEditable,
  ) => {
    setCuotas((actuales) =>
      actuales.map((cuota, posicion) => {
        if (posicion !== index || cuota.bloqueada) return cuota;

        return {
          ...cuota,
          estadoCuota,
        } satisfies CuotaEditable;
      }),
    );
  };

  const condonarDeudaPendiente = () => {
    setCuotas((actuales) =>
      actuales.map((cuota) =>
        cuota.bloqueada
          ? cuota
          : {
              ...cuota,
              estadoCuota: "Condonado",
            },
      ),
    );
  };

  const restaurarDeudaPendiente = () => {
    setCuotas((actuales) =>
      actuales.map((cuota) =>
        cuota.bloqueada
          ? cuota
          : {
              ...cuota,
              estadoCuota: "Debe",
            },
      ),
    );
  };

  const distribuir = () => {
    setCuotas((actuales) => distribuirSaldo(saldoCarrera, actuales));
  };

  const aplicarMontoTodas = () => {
    const monto = Number(montoTodasCuotas || 0);

    if (monto < 0 || !Number.isFinite(monto)) return;

    setCuotas((actuales) =>
      actuales.map((cuota) =>
        cuota.bloqueada || cuota.estadoCuota === "Condonado"
          ? cuota
          : { ...cuota, monto: redondear2(monto).toFixed(2) },
      ),
    );
  };

  const validar = (): boolean => {
    if (!datos?.gestionActiva?.id || !datos?.carrera?.idCarrera) {
      Toast.show({
        type: "error",
        text1: "Gestión no disponible",
        text2: "No se pudo determinar la gestión activa de esta carrera.",
      });
      return false;
    }

    if (!turnoPreferido) {
      Toast.show({
        type: "error",
        text1: "Selecciona un turno",
        text2: "Indica el turno preferido del estudiante.",
      });
      return false;
    }

    if (!fechaMatricula) {
      Toast.show({
        type: "error",
        text1: "Fecha requerida",
        text2: "Ingresa la fecha de vencimiento de la matrícula.",
      });
      return false;
    }

    if (cuotas.length === 0) {
      Toast.show({
        type: "error",
        text1: "Cuotas requeridas",
        text2: "El plan debe contener al menos una cuota mensual.",
      });
      return false;
    }

    const incompleta = cuotas.some(
      (cuota) =>
        !cuota.fecha_vencimiento ||
        !Number.isFinite(Number(cuota.monto)) ||
        Number(cuota.monto) < 0,
    );

    if (incompleta) {
      Toast.show({
        type: "error",
        text1: "Plan incompleto",
        text2: "Revisa los montos y fechas de todas las cuotas.",
      });
      return false;
    }

    return true;
  };

  const guardar = async () => {
    if (!estudiante || !datos || !validar() || !turnoPreferido) return;

    const payload: GuardarCuotasGestionPayload = {
      idCarrera: Number(datos.carrera.idCarrera),
      idGestion: Number(datos.gestionActiva.id),
      turnoPreferido,
      matricula: {
        monto: Number(montoMatricula || 0),
        descuento: Number(descuentoMatricula || 0),
        fecha_vencimiento: fechaMatricula,
      },
      cuotas: cuotas.map((cuota, index) => ({
        numeroCuota: cuota.numeroCuota,
        monto: Number(cuota.monto || 0),
        descuento: Number(cuota.descuento || 0),
        fecha_vencimiento:
          cuota.bloqueada || index > 0
            ? cuota.fecha_vencimiento
            : fechaActual(),
        estadoCuota: cuota.estadoCuota,
      })),
    };

    try {
      setGuardando(true);

      const response = await guardarCuotasGestionAsignaciones(
        estudiante.id,
        payload,
      );

      if (!response.guardado) {
        throw new Error(response.message || "El backend no confirmó el plan.");
      }

      const actualizados = await getCuotasGestionAsignaciones(
        estudiante.id,
        Number(datos.carrera.idCarrera),
      );

      Toast.show({
        type: "success",
        text1: "Cuotas registradas",
        text2: response.message,
      });

      await onSuccess(response, actualizados);
    } catch (error: any) {
      const backend = error?.response?.data;
      const errores = backend?.errors;
      const primerError =
        errores && typeof errores === "object"
          ? Object.values(errores).flat().find(Boolean)
          : null;

      Toast.show({
        type: "error",
        text1: "No se pudo guardar",
        text2: String(
          primerError ??
            backend?.message ??
            error?.message ??
            "No se pudo guardar el plan de cuotas.",
        ),
      });
    } finally {
      setGuardando(false);
    }
  };

  const gestionTexto = datos?.gestionActiva
    ? `${datos.gestionActiva.nombre} · ${datos.gestionActiva.periodo}`
    : "Gestión activa";

  const puedeReutilizarPlan = Boolean(
    (datos?.puedeReutilizarPlanAnterior ??
      datos?.puedeMantenerCuotasAnteriores) &&
      datos?.ultimoPlanCuotas?.disponible,
  );

  const ocupado = guardando || reutilizando;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={ocupado ? undefined : onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modal,
            isMobile && styles.modalMobile,
            {
              height: Math.min(height * 0.95, 920),
              backgroundColor: modalBackground,
              borderColor,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: borderColor }]}> 
            <View style={styles.headerIdentity}>
              <View
                style={[
                  styles.headerIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(245,158,11,0.18)"
                      : "#FEF3C7",
                  },
                ]}
              >
                <Ionicons name="wallet-outline" size={28} color="#F59E0B" />
              </View>

              <View style={styles.headerTextBox}>
                <ThemedText style={[styles.title, { color: strongText }]}> 
                  Plan de cuotas de la gestión
                </ThemedText>
                <ThemedText
                  numberOfLines={1}
                  style={[styles.subtitle, { color: mutedText }]}
                >
                  {nombreCompleto(estudiante)}
                </ThemedText>
              </View>
            </View>

            <Pressable
              disabled={ocupado}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                {
                  backgroundColor: panelStrong,
                  opacity: pressed || guardando ? 0.6 : 1,
                },
              ]}
            >
              <Ionicons name="close" size={25} color={strongText} />
            </Pressable>
          </View>

          {loading && !datos ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <ThemedText style={[styles.loadingTitle, { color: strongText }]}> 
                Preparando el plan de cuotas
              </ThemedText>
              <ThemedText style={[styles.loadingText, { color: mutedText }]}> 
                Revisando la carrera y la gestión activa.
              </ThemedText>
            </View>
          ) : !datos ? (
            <View style={styles.loadingBox}>
              <Ionicons name="alert-circle-outline" size={46} color="#EF4444" />
              <ThemedText style={[styles.loadingTitle, { color: strongText }]}> 
                No se pudo preparar el plan
              </ThemedText>
              <Pressable
                onPress={() => void cargarDatos()}
                style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              >
                <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
                <ThemedText style={styles.primaryButtonText}>Reintentar</ThemedText>
              </Pressable>
            </View>
          ) : modoPlan === "elegir" ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.choiceContent}
              showsVerticalScrollIndicator
            >
              <View
                style={[
                  styles.choiceHero,
                  {
                    backgroundColor: isDark
                      ? "rgba(59,130,246,0.10)"
                      : "#EFF6FF",
                    borderColor: isDark
                      ? "rgba(96,165,250,0.35)"
                      : "#BFDBFE",
                  },
                ]}
              >
                <View
                  style={[
                    styles.choiceHeroIcon,
                    {
                      backgroundColor: isDark
                        ? "rgba(59,130,246,0.20)"
                        : "#DBEAFE",
                    },
                  ]}
                >
                  <Ionicons
                    name="git-compare-outline"
                    size={31}
                    color={theme.colors.primary}
                  />
                </View>

                <View style={styles.choiceHeroText}>
                  <ThemedText
                    style={[styles.choiceTitle, { color: strongText }]}
                  >
                    ¿Quieres crear un nuevo plan de cuotas para esta gestión?
                  </ThemedText>
                  <ThemedText
                    style={[styles.choiceSubtitle, { color: mutedText }]}
                  >
                    Elige Sí para crear cuotas nuevas usando el último plan
                    como referencia. Elige No para continuar utilizando
                    exactamente el plan anterior sin duplicar cuotas.
                  </ThemedText>
                </View>
              </View>

              <View
                style={[
                  styles.choiceContext,
                  { backgroundColor: panelBackground, borderColor },
                ]}
              >
                <View style={styles.choiceContextItem}>
                  <ThemedText
                    style={[styles.choiceContextLabel, { color: mutedText }]}
                  >
                    NUEVA GESTIÓN
                  </ThemedText>
                  <ThemedText
                    style={[styles.choiceContextValue, { color: strongText }]}
                  >
                    {datos.gestionActiva.nombre} · {datos.gestionActiva.periodo}
                  </ThemedText>
                </View>
                <View style={styles.choiceContextItem}>
                  <ThemedText
                    style={[styles.choiceContextLabel, { color: mutedText }]}
                  >
                    CARRERA
                  </ThemedText>
                  <ThemedText
                    style={[styles.choiceContextValue, { color: strongText }]}
                  >
                    {datos.carrera.nombreCarrera}
                  </ThemedText>
                </View>
              </View>

              <View
                style={[
                  styles.choiceGrid,
                  isMobile && styles.choiceGridMobile,
                ]}
              >
                <Pressable
                  disabled={ocupado}
                  onPress={elegirPlanNuevo}
                  style={({ pressed }) => [
                    styles.choiceCard,
                    {
                      backgroundColor: panelBackground,
                      borderColor,
                      opacity: ocupado ? 0.55 : pressed ? 0.78 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.choiceCardIcon,
                      {
                        backgroundColor: isDark
                          ? "rgba(34,197,94,0.16)"
                          : "#DCFCE7",
                      },
                    ]}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={29}
                      color="#16A34A"
                    />
                  </View>

                  <ThemedText
                    style={[styles.choiceCardTitle, { color: strongText }]}
                  >
                    Sí, crear un nuevo plan
                  </ThemedText>
                  <ThemedText
                    style={[styles.choiceCardText, { color: mutedText }]}
                  >
                    {puedeReutilizarPlan
                      ? "Se cargarán automáticamente los montos, descuentos y condonaciones del último plan como referencia. Podrás revisar todo antes de guardar."
                      : "No existe un plan anterior. Se preparará un plan nuevo usando la configuración actual de la carrera."}
                  </ThemedText>

                  <View style={styles.choiceBullets}>
                    <ChoiceBullet
                      icon="refresh-outline"
                      text={
                        puedeReutilizarPlan
                          ? "Montos anteriores como referencia"
                          : "Montos desde la carrera"
                      }
                      color="#16A34A"
                      textColor={strongText}
                    />
                    <ChoiceBullet
                      icon="calendar-outline"
                      text="Fechas nuevas para esta gestión"
                      color="#16A34A"
                      textColor={strongText}
                    />
                    <ChoiceBullet
                      icon="gift-outline"
                      text={
                        puedeReutilizarPlan
                          ? "Conserva condonaciones como referencia"
                          : "Sin condonaciones anteriores"
                      }
                      color="#16A34A"
                      textColor={strongText}
                    />
                  </View>

                  <View
                    style={[
                      styles.choiceAction,
                      { backgroundColor: "#16A34A" },
                    ]}
                  >
                    <ThemedText style={styles.choiceActionText}>
                      Sí, preparar plan nuevo
                    </ThemedText>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>
                </Pressable>

                <Pressable
                  disabled={ocupado || !puedeReutilizarPlan}
                  onPress={() => void reutilizarPlanAnterior()}
                  style={({ pressed }) => [
                    styles.choiceCard,
                    styles.choiceCardRecommended,
                    {
                      backgroundColor: isDark
                        ? "rgba(245,158,11,0.08)"
                        : "#FFFBEB",
                      borderColor: isDark
                        ? "rgba(245,158,11,0.42)"
                        : "#FCD34D",
                      opacity:
                        ocupado || !puedeReutilizarPlan
                          ? 0.48
                          : pressed
                            ? 0.78
                            : 1,
                    },
                  ]}
                >
                  <View style={styles.recommendedBadge}>
                    <Ionicons name="time-outline" size={14} color="#B45309" />
                    <ThemedText style={styles.recommendedBadgeText}>
                      SIN CREAR CUOTAS
                    </ThemedText>
                  </View>

                  <View
                    style={[
                      styles.choiceCardIcon,
                      {
                        backgroundColor: isDark
                          ? "rgba(245,158,11,0.18)"
                          : "#FEF3C7",
                      },
                    ]}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={29}
                      color="#D97706"
                    />
                  </View>

                  <ThemedText
                    style={[styles.choiceCardTitle, { color: strongText }]}
                  >
                    No, mantener el plan anterior
                  </ThemedText>
                  <ThemedText
                    style={[styles.choiceCardText, { color: mutedText }]}
                  >
                    {puedeReutilizarPlan
                      ? `La gestión actual utilizará exactamente las cuotas de ${
                          datos.ultimoPlanCuotas?.gestion.nombre ??
                          "la gestión anterior"
                        }. No se crearán filas nuevas y se conservarán pagos, fechas y condonaciones.`
                      : "No existe un plan anterior completo que pueda utilizarse. Debes crear un plan nuevo."}
                  </ThemedText>

                  <View style={styles.choiceStats}>
                    <ChoiceStat
                      value={String(
                        datos.ultimoPlanCuotas?.totalCuotasMensuales ?? 0,
                      )}
                      label="Cuotas"
                      color="#D97706"
                      mutedText={mutedText}
                    />
                    <ChoiceStat
                      value={String(
                        datos.ultimoPlanCuotas?.totalCuotasCondonadas ?? 0,
                      )}
                      label="Condonadas"
                      color="#D97706"
                      mutedText={mutedText}
                    />
                    <ChoiceStat
                      value={formatoBs(
                        Number(datos.ultimoPlanCuotas?.matricula?.monto ?? 0),
                      )}
                      label="Matrícula"
                      color="#D97706"
                      mutedText={mutedText}
                    />
                  </View>

                  <View
                    style={[
                      styles.choiceAction,
                      { backgroundColor: "#D97706" },
                    ]}
                  >
                    {reutilizando ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons
                        name="link-outline"
                        size={18}
                        color="#FFFFFF"
                      />
                    )}
                    <ThemedText style={styles.choiceActionText}>
                      {reutilizando
                        ? "Manteniendo plan..."
                        : puedeReutilizarPlan
                          ? "No, usar plan anterior"
                          : "Plan anterior no disponible"}
                    </ThemedText>
                  </View>
                </Pressable>
              </View>

              <View
                style={[
                  styles.choiceWarning,
                  {
                    backgroundColor: isDark
                      ? "rgba(124,58,237,0.10)"
                      : "#F5F3FF",
                    borderColor: isDark
                      ? "rgba(196,181,253,0.30)"
                      : "#DDD6FE",
                  },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#7C3AED"
                />
                <ThemedText
                  style={[styles.choiceWarningText, { color: strongText }]}
                >
                  Si eliges Sí, se crea un plan nuevo y el anterior solo sirve
                  como referencia. Si eliges No, no se crean cuotas nuevas: la
                  gestión actual queda vinculada al plan anterior y conserva
                  sus pagos, fechas, descuentos y condonaciones.
                </ThemedText>
              </View>
            </ScrollView>
          ) : (
            <>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator
              >
                <View
                  style={[
                    styles.notice,
                    {
                      backgroundColor: isDark
                        ? "rgba(245,158,11,0.10)"
                        : "#FFFBEB",
                      borderColor: isDark
                        ? "rgba(245,158,11,0.34)"
                        : "#FDE68A",
                    },
                  ]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={23}
                    color="#F59E0B"
                  />
                  <View style={styles.noticeTextBox}>
                    <ThemedText style={[styles.noticeTitle, { color: strongText }]}> 
                      Cuotas obligatorias antes de inscribir materias
                    </ThemedText>
                    <ThemedText style={[styles.noticeText, { color: mutedText }]}> 
                      Este plan pertenece solamente a la gestión activa. Las cuotas
                      de gestiones anteriores permanecen guardadas y no se modifican.
                    </ThemedText>
                  </View>
                </View>

                {modoPlan !== "existente" &&
                  datos.puedeMantenerCuotasAnteriores &&
                  datos.ultimoPlanCuotas?.disponible && (
                    <View
                      style={[
                        styles.sourceBanner,
                        {
                          backgroundColor:
                            modoPlan === "anterior"
                              ? isDark
                                ? "rgba(245,158,11,0.09)"
                                : "#FFFBEB"
                              : isDark
                                ? "rgba(34,197,94,0.09)"
                                : "#F0FDF4",
                          borderColor:
                            modoPlan === "anterior"
                              ? isDark
                                ? "rgba(245,158,11,0.35)"
                                : "#FCD34D"
                              : isDark
                                ? "rgba(34,197,94,0.35)"
                                : "#86EFAC",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.sourceBannerIcon,
                          {
                            backgroundColor:
                              modoPlan === "anterior"
                                ? "rgba(217,119,6,0.16)"
                                : "rgba(22,163,74,0.16)",
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            modoPlan === "anterior"
                              ? "copy-outline"
                              : "add-circle-outline"
                          }
                          size={21}
                          color={
                            modoPlan === "anterior" ? "#D97706" : "#16A34A"
                          }
                        />
                      </View>

                      <View style={styles.sourceBannerText}>
                        <ThemedText
                          style={[styles.sourceBannerTitle, { color: strongText }]}
                        >
                          {modoPlan === "anterior"
                            ? "Plan recuperado de la gestión anterior"
                            : "Plan nuevo desde la configuración de la carrera"}
                        </ThemedText>
                        <ThemedText
                          style={[styles.sourceBannerSubtitle, { color: mutedText }]}
                        >
                          {modoPlan === "anterior"
                            ? `Se copiaron montos y condonaciones de ${
                                datos.ultimoPlanCuotas.gestion.nombre
                              }. Revisa los datos antes de guardar.`
                            : "Los montos se calcularon desde cero y no se heredaron condonaciones."}
                        </ThemedText>
                      </View>

                      <Pressable
                        disabled={guardando}
                        onPress={volverAElegirOrigen}
                        style={({ pressed }) => [
                          styles.changeSourceButton,
                          {
                            backgroundColor: panelStrong,
                            borderColor,
                            opacity: pressed || guardando ? 0.65 : 1,
                          },
                        ]}
                      >
                        <Ionicons
                          name="swap-horizontal-outline"
                          size={16}
                          color={theme.colors.primary}
                        />
                        <ThemedText
                          style={[
                            styles.changeSourceButtonText,
                            { color: theme.colors.primary },
                          ]}
                        >
                          Cambiar opción
                        </ThemedText>
                      </Pressable>
                    </View>
                  )}

                <View style={[styles.summaryGrid, isTablet && styles.summaryGridTablet]}>
                  <SummaryCard
                    icon="school-outline"
                    label="Carrera"
                    value={datos.carrera.nombreCarrera}
                    color={theme.colors.primary}
                    background={panelBackground}
                    border={borderColor}
                    strongText={strongText}
                    mutedText={mutedText}
                  />
                  <SummaryCard
                    icon="calendar-outline"
                    label="Gestión"
                    value={gestionTexto}
                    color="#8B5CF6"
                    background={panelBackground}
                    border={borderColor}
                    strongText={strongText}
                    mutedText={mutedText}
                  />
                  <SummaryCard
                    icon="cash-outline"
                    label="Costo de carrera"
                    value={formatoBs(totalCarrera)}
                    color="#16A34A"
                    background={panelBackground}
                    border={borderColor}
                    strongText={strongText}
                    mutedText={mutedText}
                  />
                </View>

                <SectionTitle
                  icon="time-outline"
                  title="Turno preferido"
                  description="Se utilizará como turno inicial al seleccionar grupos."
                  color={strongText}
                  muted={mutedText}
                />

                <View style={[styles.turnosGrid, isMobile && styles.turnosGridMobile]}>
                  {TURNOS.map((turno) => {
                    const selected = turnoPreferido === turno.value;

                    return (
                      <Pressable
                        key={turno.value}
                        disabled={guardando}
                        onPress={() => setTurnoPreferido(turno.value)}
                        style={({ pressed }) => [
                          styles.turnoCard,
                          {
                            backgroundColor: selected
                              ? isDark
                                ? "rgba(59,130,246,0.18)"
                                : "#EFF6FF"
                              : panelBackground,
                            borderColor: selected
                              ? theme.colors.primary
                              : borderColor,
                            opacity: pressed ? 0.78 : 1,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.turnoIcon,
                            {
                              backgroundColor: selected
                                ? theme.colors.primary
                                : panelStrong,
                            },
                          ]}
                        >
                          <Ionicons
                            name={turno.icon}
                            size={21}
                            color={selected ? "#FFFFFF" : mutedText}
                          />
                        </View>
                        <View style={styles.turnoTextBox}>
                          <ThemedText
                            style={[
                              styles.turnoTitle,
                              {
                                color: selected
                                  ? theme.colors.primary
                                  : strongText,
                              },
                            ]}
                          >
                            {turno.value}
                          </ThemedText>
                          <ThemedText
                            style={[styles.turnoDescription, { color: mutedText }]}
                          >
                            {turno.description}
                          </ThemedText>
                        </View>
                        {selected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color={theme.colors.primary}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                <SectionTitle
                  icon="card-outline"
                  title="Matrícula"
                  description="Monto y fecha de la matrícula para esta gestión."
                  color={strongText}
                  muted={mutedText}
                />

                <View
                  style={[
                    styles.formCard,
                    { backgroundColor: panelBackground, borderColor },
                  ]}
                >
                  <Field
                    label="Monto de matrícula"
                    value={montoMatricula}
                    onChangeText={(value) =>
                      !matriculaBloqueada &&
                      setMontoMatricula(limpiarNumero(value))
                    }
                    keyboardType="decimal-pad"
                    icon="cash-outline"
                    disabled={matriculaBloqueada}
                    strongText={strongText}
                    mutedText={mutedText}
                    background={panelStrong}
                    border={borderColor}
                  />
                  <Field
                    label="Fecha de matrícula"
                    value={fechaMatricula}
                    onChangeText={(value) =>
                      !matriculaBloqueada && setFechaMatricula(value)
                    }
                    placeholder="AAAA-MM-DD"
                    icon="calendar-outline"
                    disabled={matriculaBloqueada}
                    strongText={strongText}
                    mutedText={mutedText}
                    background={panelStrong}
                    border={borderColor}
                  />

                  {matriculaBloqueada && (
                    <View style={styles.protectedBadge}>
                      <Ionicons name="lock-closed" size={15} color="#16A34A" />
                      <ThemedText style={styles.protectedText}>
                        Matrícula pagada y protegida
                      </ThemedText>
                    </View>
                  )}
                </View>

                <SectionTitle
                  icon="receipt-outline"
                  title="Cuotas mensuales"
                  description="La primera vence hoy y las siguientes el día 10 de cada mes."
                  color={strongText}
                  muted={mutedText}
                />

                <View
                  style={[
                    styles.controlsCard,
                    { backgroundColor: panelBackground, borderColor },
                  ]}
                >
                  <View style={styles.quantityBox}>
                    <ThemedText style={[styles.controlLabel, { color: mutedText }]}> 
                      CANTIDAD DE CUOTAS
                    </ThemedText>
                    <View style={styles.quantityControls}>
                      <Pressable
                        onPress={restarCuota}
                        disabled={guardando}
                        style={[styles.squareButton, { backgroundColor: panelStrong }]}
                      >
                        <Ionicons name="remove" size={20} color={strongText} />
                      </Pressable>
                      <TextInput
                        value={cantidadCuotas}
                        onChangeText={cambiarCantidad}
                        keyboardType="number-pad"
                        editable={!guardando}
                        style={[
                          styles.quantityInput,
                          {
                            color: strongText,
                            backgroundColor: panelStrong,
                            borderColor,
                          },
                        ]}
                      />
                      <Pressable
                        onPress={sumarCuota}
                        disabled={guardando}
                        style={[styles.squareButton, { backgroundColor: panelStrong }]}
                      >
                        <Ionicons name="add" size={20} color={strongText} />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.applyBox}>
                    <Field
                      label="Mismo monto para cuotas pendientes"
                      value={montoTodasCuotas}
                      onChangeText={(value) =>
                        setMontoTodasCuotas(limpiarNumero(value))
                      }
                      keyboardType="decimal-pad"
                      icon="calculator-outline"
                      strongText={strongText}
                      mutedText={mutedText}
                      background={panelStrong}
                      border={borderColor}
                    />
                    <Pressable
                      onPress={aplicarMontoTodas}
                      disabled={guardando || !montoTodasCuotas}
                      style={({ pressed }) => [
                        styles.applyButton,
                        {
                          backgroundColor: theme.colors.primary,
                          opacity:
                            guardando || !montoTodasCuotas
                              ? 0.5
                              : pressed
                                ? 0.8
                                : 1,
                        },
                      ]}
                    >
                      <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
                      <ThemedText style={styles.primaryButtonText}>Aplicar</ThemedText>
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={distribuir}
                    disabled={guardando}
                    style={({ pressed }) => [
                      styles.distributeButton,
                      {
                        backgroundColor: panelStrong,
                        borderColor,
                        opacity: pressed ? 0.76 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name="git-compare-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
                    <ThemedText
                      style={[
                        styles.distributeText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      Distribuir saldo de {formatoBs(saldoCarrera)}
                    </ThemedText>
                  </Pressable>
                </View>

                <View
                  style={[
                    styles.debtActionsCard,
                    {
                      backgroundColor: isDark
                        ? "rgba(245,158,11,0.08)"
                        : "#FFFBEB",
                      borderColor: isDark
                        ? "rgba(245,158,11,0.35)"
                        : "#FDE68A",
                    },
                  ]}
                >
                  <View style={styles.debtActionsText}>
                    <View style={styles.debtActionsTitleRow}>
                      <Ionicons
                        name="gift-outline"
                        size={21}
                        color="#D97706"
                      />
                      <ThemedText
                        style={[styles.debtActionsTitle, { color: strongText }]}
                      >
                        Condonación de deuda
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[styles.debtActionsDescription, { color: mutedText }]}
                    >
                      Puedes condonar todas las cuotas mensuales pendientes o
                      elegir Debe/Condonado de forma individual. Las cuotas ya
                      pagadas permanecen protegidas.
                    </ThemedText>
                    <ThemedText
                      style={[styles.debtActionsAmount, { color: "#D97706" }]}
                    >
                      Deuda editable actual: {formatoBs(totalDeudaEditable)}
                    </ThemedText>
                  </View>

                  <View
                    style={[
                      styles.debtActionsButtons,
                      isMobile && styles.debtActionsButtonsMobile,
                    ]}
                  >
                    <Pressable
                      disabled={
                        guardando ||
                        cuotasEditables.length === 0 ||
                        todasEditablesCondonadas
                      }
                      onPress={condonarDeudaPendiente}
                      style={({ pressed }) => [
                        styles.condoneAllButton,
                        {
                          backgroundColor: "#D97706",
                          opacity:
                            guardando ||
                            cuotasEditables.length === 0 ||
                            todasEditablesCondonadas
                              ? 0.48
                              : pressed
                                ? 0.8
                                : 1,
                        },
                      ]}
                    >
                      <Ionicons name="gift" size={18} color="#FFFFFF" />
                      <ThemedText style={styles.condoneAllButtonText}>
                        Condonar deuda pendiente
                      </ThemedText>
                    </Pressable>

                    <Pressable
                      disabled={guardando || !hayCuotasCondonadasEditables}
                      onPress={restaurarDeudaPendiente}
                      style={({ pressed }) => [
                        styles.restoreDebtButton,
                        {
                          backgroundColor: panelStrong,
                          borderColor,
                          opacity:
                            guardando || !hayCuotasCondonadasEditables
                              ? 0.48
                              : pressed
                                ? 0.76
                                : 1,
                        },
                      ]}
                    >
                      <Ionicons
                        name="refresh-outline"
                        size={18}
                        color={strongText}
                      />
                      <ThemedText
                        style={[
                          styles.restoreDebtButtonText,
                          { color: strongText },
                        ]}
                      >
                        Restaurar como deuda
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.cuotasList}>
                  {cuotas.map((cuota, index) => (
                    <View
                      key={`cuota-${cuota.numeroCuota}`}
                      style={[
                        styles.cuotaCard,
                        {
                          backgroundColor: panelBackground,
                          borderColor: cuota.bloqueada
                            ? "rgba(34,197,94,0.55)"
                            : cuota.estadoCuota === "Condonado"
                              ? "rgba(245,158,11,0.55)"
                              : borderColor,
                        },
                      ]}
                    >
                      <View style={styles.cuotaHeader}>
                        <View
                          style={[
                            styles.cuotaNumber,
                            {
                              backgroundColor: cuota.bloqueada
                                ? "#16A34A"
                                : cuota.estadoCuota === "Condonado"
                                  ? "#F59E0B"
                                  : theme.colors.primary,
                            },
                          ]}
                        >
                          <ThemedText style={styles.cuotaNumberText}>
                            {cuota.numeroCuota}
                          </ThemedText>
                        </View>
                        <View style={styles.cuotaHeadingText}>
                          <ThemedText style={[styles.cuotaTitle, { color: strongText }]}> 
                            Cuota {cuota.numeroCuota}
                          </ThemedText>
                          <ThemedText style={[styles.cuotaSubtitle, { color: mutedText }]}> 
                            {cuota.bloqueada
                              ? "Pago registrado · no puede modificarse"
                              : index === 0
                                ? "Primera cuota · vence hoy"
                                : "Vencimiento programado"}
                          </ThemedText>
                        </View>

                        {cuota.bloqueada ? (
                          <View style={styles.paidStatusBadge}>
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color="#16A34A"
                            />
                            <ThemedText style={styles.paidStatusText}>
                              Pagado
                            </ThemedText>
                          </View>
                        ) : (
                          <View style={styles.statusChoices}>
                            {(["Debe", "Condonado"] as EstadoEditable[]).map(
                              (estado) => {
                                const active = cuota.estadoCuota === estado;
                                const condonado = estado === "Condonado";
                                const activeColor = condonado
                                  ? "#D97706"
                                  : theme.colors.primary;

                                return (
                                  <Pressable
                                    key={`${cuota.numeroCuota}-${estado}`}
                                    disabled={guardando}
                                    onPress={() =>
                                      cambiarEstadoCuota(index, estado)
                                    }
                                    style={({ pressed }) => [
                                      styles.statusChoiceButton,
                                      {
                                        backgroundColor: active
                                          ? condonado
                                            ? isDark
                                              ? "rgba(245,158,11,0.20)"
                                              : "#FEF3C7"
                                            : isDark
                                              ? "rgba(59,130,246,0.20)"
                                              : "#DBEAFE"
                                          : panelStrong,
                                        borderColor: active
                                          ? activeColor
                                          : borderColor,
                                        opacity: pressed ? 0.76 : 1,
                                      },
                                    ]}
                                  >
                                    <Ionicons
                                      name={
                                        condonado
                                          ? "gift-outline"
                                          : "time-outline"
                                      }
                                      size={15}
                                      color={active ? activeColor : mutedText}
                                    />
                                    <ThemedText
                                      style={[
                                        styles.statusChoiceText,
                                        {
                                          color: active
                                            ? activeColor
                                            : mutedText,
                                        },
                                      ]}
                                    >
                                      {estado}
                                    </ThemedText>
                                  </Pressable>
                                );
                              },
                            )}
                          </View>
                        )}
                      </View>

                      <View style={[styles.cuotaFields, isMobile && styles.cuotaFieldsMobile]}>
                        <Field
                          label="Monto"
                          value={cuota.monto}
                          onChangeText={(value) =>
                            actualizarCuota(index, "monto", value)
                          }
                          keyboardType="decimal-pad"
                          icon="cash-outline"
                          disabled={cuota.bloqueada || guardando}
                          strongText={strongText}
                          mutedText={mutedText}
                          background={panelStrong}
                          border={borderColor}
                        />
                        <Field
                          label="Fecha de vencimiento"
                          value={cuota.fecha_vencimiento}
                          onChangeText={(value) =>
                            actualizarCuota(index, "fecha_vencimiento", value)
                          }
                          placeholder="AAAA-MM-DD"
                          icon="calendar-outline"
                          disabled={cuota.bloqueada || guardando || index === 0}
                          strongText={strongText}
                          mutedText={mutedText}
                          background={panelStrong}
                          border={borderColor}
                        />
                      </View>
                    </View>
                  ))}
                </View>

                <View style={[styles.totalsCard, { backgroundColor: panelBackground, borderColor }]}> 
                  <TotalRow
                    label="Costo registrado de la carrera"
                    value={formatoBs(totalCarrera)}
                    color={strongText}
                    muted={mutedText}
                  />
                  <TotalRow
                    label="Matrícula"
                    value={formatoBs(matriculaNumero)}
                    color={strongText}
                    muted={mutedText}
                  />
                  <TotalRow
                    label="Cuotas por cobrar"
                    value={formatoBs(totalCuotasDebe)}
                    color={strongText}
                    muted={mutedText}
                  />
                  <TotalRow
                    label="Total condonado"
                    value={formatoBs(totalCondonado)}
                    color="#F59E0B"
                    muted={mutedText}
                  />
                  <View style={[styles.totalDivider, { backgroundColor: borderColor }]} />
                  <TotalRow
                    label="Total a cobrar"
                    value={formatoBs(totalACobrar)}
                    color={strongText}
                    muted={mutedText}
                  />
                  <TotalRow
                    label="Total cubierto del plan"
                    value={formatoBs(totalPlan)}
                    color={theme.colors.primary}
                    muted={mutedText}
                    strong
                  />
                  <TotalRow
                    label={diferencia >= 0 ? "Saldo sin distribuir" : "Exceso del plan"}
                    value={formatoBs(Math.abs(diferencia))}
                    color={
                      Math.abs(diferencia) < 0.01
                        ? "#16A34A"
                        : diferencia >= 0
                          ? "#F59E0B"
                          : "#EF4444"
                    }
                    muted={mutedText}
                  />
                </View>
              </ScrollView>

              <View style={[styles.footer, { borderTopColor: borderColor }]}> 
                <Pressable
                  disabled={guardando}
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    {
                      backgroundColor: panelBackground,
                      borderColor,
                      opacity: pressed || guardando ? 0.65 : 1,
                    },
                  ]}
                >
                  <ThemedText style={[styles.cancelButtonText, { color: strongText }]}> 
                    Cancelar
                  </ThemedText>
                </Pressable>

                <Pressable
                  disabled={guardando || loading}
                  onPress={() => void guardar()}
                  style={({ pressed }) => [
                    styles.saveButton,
                    {
                      backgroundColor: theme.colors.primary,
                      opacity: guardando || loading ? 0.58 : pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  {guardando ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                  )}
                  <ThemedText style={styles.saveButtonText}>
                    {guardando ? "Guardando..." : "Guardar cuotas y continuar"}
                  </ThemedText>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
  background,
  border,
  strongText,
  mutedText,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  background: string;
  border: string;
  strongText: string;
  mutedText: string;
}) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: background, borderColor: border }]}> 
      <View style={[styles.summaryIcon, { backgroundColor: `${color}1E` }]}> 
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <View style={styles.summaryTextBox}>
        <ThemedText style={[styles.summaryLabel, { color: mutedText }]}> 
          {label}
        </ThemedText>
        <ThemedText numberOfLines={2} style={[styles.summaryValue, { color: strongText }]}> 
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

function SectionTitle({
  icon,
  title,
  description,
  color,
  muted,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  muted: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={21} color={muted} />
      <View style={styles.sectionTitleText}>
        <ThemedText style={[styles.sectionTitle, { color }]}>{title}</ThemedText>
        <ThemedText style={[styles.sectionDescription, { color: muted }]}> 
          {description}
        </ThemedText>
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  icon,
  disabled = false,
  strongText,
  mutedText,
  background,
  border,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "decimal-pad" | "number-pad";
  icon: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  strongText: string;
  mutedText: string;
  background: string;
  border: string;
}) {
  return (
    <View style={styles.fieldRoot}>
      <ThemedText style={[styles.fieldLabel, { color: mutedText }]}> 
        {label.toUpperCase()}
      </ThemedText>
      <View
        style={[
          styles.fieldBox,
          {
            backgroundColor: background,
            borderColor: border,
            opacity: disabled ? 0.62 : 1,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={mutedText} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={mutedText}
          keyboardType={keyboardType}
          editable={!disabled}
          style={[styles.fieldInput, { color: strongText }]}
        />
      </View>
    </View>
  );
}

function TotalRow({
  label,
  value,
  color,
  muted,
  strong = false,
}: {
  label: string;
  value: string;
  color: string;
  muted: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.totalRow}>
      <ThemedText
        style={[
          styles.totalLabel,
          { color: strong ? color : muted, fontWeight: strong ? "900" : "700" },
        ]}
      >
        {label}
      </ThemedText>
      <ThemedText style={[styles.totalValue, { color }]}>{value}</ThemedText>
    </View>
  );
}

function ChoiceBullet({
  icon,
  text,
  color,
  textColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color: string;
  textColor: string;
}) {
  return (
    <View style={styles.choiceBullet}>
      <Ionicons name={icon} size={16} color={color} />
      <ThemedText style={[styles.choiceBulletText, { color: textColor }]}>
        {text}
      </ThemedText>
    </View>
  );
}

function ChoiceStat({
  value,
  label,
  color,
  mutedText,
}: {
  value: string;
  label: string;
  color: string;
  mutedText: string;
}) {
  return (
    <View style={styles.choiceStat}>
      <ThemedText style={[styles.choiceStatValue, { color }]}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.choiceStatLabel, { color: mutedText }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.86)",
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "96%",
    maxWidth: 1180,
    borderRadius: 26,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.36,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 20,
  },
  modalMobile: {
    width: "100%",
    borderRadius: 20,
  },
  header: {
    minHeight: 82,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  headerIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextBox: { flex: 1, minWidth: 0 },
  title: { fontSize: 22, fontWeight: "900" },
  subtitle: { marginTop: 3, fontSize: 12.5, fontWeight: "700" },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 10,
  },
  loadingTitle: { marginTop: 4, fontSize: 18, fontWeight: "900", textAlign: "center" },
  loadingText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  retryButton: {
    marginTop: 8,
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  choiceContent: {
    padding: 20,
    gap: 18,
    paddingBottom: 30,
  },
  choiceHero: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  choiceHeroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceHeroText: {
    flex: 1,
    minWidth: 0,
  },
  choiceTitle: {
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 25,
  },
  choiceSubtitle: {
    marginTop: 5,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "650" as any,
  },
  choiceContext: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  choiceContextItem: {
    flex: 1,
    minWidth: 220,
  },
  choiceContextLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  choiceContextValue: {
    marginTop: 4,
    fontSize: 13.5,
    fontWeight: "900",
  },
  choiceGrid: {
    flexDirection: "row",
    gap: 14,
    alignItems: "stretch",
  },
  choiceGridMobile: {
    flexDirection: "column",
  },
  choiceCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 21,
    padding: 17,
    gap: 12,
  },
  choiceCardRecommended: {
    position: "relative",
  },
  recommendedBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "rgba(217,119,6,0.14)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  recommendedBadgeText: {
    color: "#B45309",
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.55,
  },
  choiceCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceCardTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  choiceCardText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "650" as any,
  },
  choiceBullets: {
    gap: 8,
    flex: 1,
  },
  choiceBullet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  choiceBulletText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "700",
  },
  choiceStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  choiceStat: {
    flex: 1,
    minWidth: 92,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: "rgba(217,119,6,0.09)",
  },
  choiceStatValue: {
    fontSize: 15,
    fontWeight: "900",
  },
  choiceStatLabel: {
    marginTop: 2,
    fontSize: 9.5,
    fontWeight: "800",
  },
  choiceAction: {
    minHeight: 45,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  choiceActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  choiceWarning: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  choiceWarningText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "700",
  },
  sourceBanner: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sourceBannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  sourceBannerText: {
    flex: 1,
    minWidth: 0,
  },
  sourceBannerTitle: {
    fontSize: 13,
    fontWeight: "900",
  },
  sourceBannerSubtitle: {
    marginTop: 3,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "650" as any,
  },
  changeSourceButton: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  changeSourceButtonText: {
    fontSize: 10.5,
    fontWeight: "900",
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 18, gap: 18, paddingBottom: 28 },
  notice: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  noticeTextBox: { flex: 1, minWidth: 0 },
  noticeTitle: { fontSize: 14, fontWeight: "900" },
  noticeText: { marginTop: 3, fontSize: 12, lineHeight: 18, fontWeight: "600" },
  summaryGrid: { flexDirection: "row", gap: 10 },
  summaryGridTablet: { flexWrap: "wrap" },
  summaryCard: {
    flex: 1,
    minWidth: 220,
    minHeight: 88,
    borderWidth: 1,
    borderRadius: 17,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  summaryTextBox: { flex: 1, minWidth: 0 },
  summaryLabel: { fontSize: 10.5, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.4 },
  summaryValue: { marginTop: 3, fontSize: 14, lineHeight: 18, fontWeight: "900" },
  sectionTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  sectionTitleText: { flex: 1, minWidth: 0 },
  sectionTitle: { fontSize: 17, fontWeight: "900" },
  sectionDescription: { marginTop: 2, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  turnosGrid: { flexDirection: "row", gap: 10 },
  turnosGridMobile: { flexDirection: "column" },
  turnoCard: {
    flex: 1,
    minHeight: 82,
    borderRadius: 17,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  turnoIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  turnoTextBox: { flex: 1, minWidth: 0 },
  turnoTitle: { fontSize: 14, fontWeight: "900" },
  turnoDescription: { marginTop: 2, fontSize: 10.5, lineHeight: 15, fontWeight: "600" },
  formCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 12,
  },
  fieldRoot: { flex: 1, minWidth: 210, gap: 6 },
  fieldLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 0.65 },
  fieldBox: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fieldInput: { flex: 1, minWidth: 0, paddingVertical: 10, fontSize: 13, fontWeight: "800" },
  protectedBadge: {
    minHeight: 40,
    borderRadius: 13,
    paddingHorizontal: 12,
    backgroundColor: "rgba(34,197,94,0.13)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  protectedText: { color: "#16A34A", fontSize: 11.5, fontWeight: "900" },
  controlsCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 12,
  },
  quantityBox: { minWidth: 220, gap: 7 },
  controlLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 0.65 },
  quantityControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  squareButton: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  quantityInput: { width: 72, minHeight: 44, borderWidth: 1, borderRadius: 13, textAlign: "center", fontSize: 15, fontWeight: "900" },
  applyBox: { flex: 1, minWidth: 320, flexDirection: "row", alignItems: "flex-end", gap: 8 },
  applyButton: { minHeight: 50, borderRadius: 14, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  distributeButton: { minHeight: 50, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  distributeText: { fontSize: 11.5, fontWeight: "900" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  debtActionsCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 14,
  },
  debtActionsText: { flex: 1, minWidth: 300 },
  debtActionsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  debtActionsTitle: { fontSize: 15, fontWeight: "900" },
  debtActionsDescription: {
    marginTop: 4,
    maxWidth: 650,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "600",
  },
  debtActionsAmount: { marginTop: 7, fontSize: 12, fontWeight: "900" },
  debtActionsButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  debtActionsButtonsMobile: { width: "100%", flexDirection: "column" },
  condoneAllButton: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  condoneAllButtonText: { color: "#FFFFFF", fontSize: 11.5, fontWeight: "900" },
  restoreDebtButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  restoreDebtButtonText: { fontSize: 11.5, fontWeight: "900" },
  cuotasList: { gap: 10 },
  cuotaCard: { borderWidth: 1, borderRadius: 18, padding: 13, gap: 12 },
  cuotaHeader: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10 },
  cuotaNumber: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cuotaNumberText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  cuotaHeadingText: { flex: 1, minWidth: 0 },
  cuotaTitle: { fontSize: 14, fontWeight: "900" },
  cuotaSubtitle: { marginTop: 2, fontSize: 10.5, fontWeight: "600" },
  statusButton: { minHeight: 38, borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 5 },
  statusText: { fontSize: 10.5, fontWeight: "900" },
  statusChoices: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  statusChoiceButton: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  statusChoiceText: { fontSize: 10.5, fontWeight: "900" },
  paidStatusBadge: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(34,197,94,0.13)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  paidStatusText: { color: "#16A34A", fontSize: 10.5, fontWeight: "900" },
  cuotaFields: { flexDirection: "row", gap: 10 },
  cuotaFieldsMobile: { flexDirection: "column" },
  totalsCard: { borderWidth: 1, borderRadius: 18, padding: 15, gap: 10 },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  totalLabel: { flex: 1, fontSize: 12.5 },
  totalValue: { fontSize: 13.5, fontWeight: "900" },
  totalDivider: { height: 1, width: "100%", marginVertical: 2 },
  footer: { minHeight: 76, borderTopWidth: 1, paddingHorizontal: 18, paddingVertical: 13, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 10 },
  cancelButton: { minHeight: 48, borderRadius: 15, borderWidth: 1, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  cancelButtonText: { fontSize: 13, fontWeight: "900" },
  saveButton: { minHeight: 48, borderRadius: 15, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  saveButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
});
