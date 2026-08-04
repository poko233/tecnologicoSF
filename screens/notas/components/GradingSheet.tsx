import { useTheme } from "@/theme/useTheme";
import { Tooltip } from "@components/Tooltip";
import { ArrowDown, ArrowUp } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { fadeSlideUp } from "../animations/notas.animations";
import { usePlanilla } from "../hooks/usePlanilla";
import { abrirPDF, descargarExcel } from "../services/notas.service";
import { GuardarPayload } from "../types/notas.types";
import { ConfirmStatusModal } from "./ConfirmStatusModal";
import { GradingHeader } from "./GradingHeader";

const COL_STUDENT = 250;
const COL_EC = 100;
const COL_EV = 100;
const COL_ASIST = 100;
const COL_FINAL = 130;
const COL_SEGUNDA = 110;
const COL_STATUS = 150;
const COL_OBS = 220;
const COL_SUMA_EV = 80;

interface Props {
  idGrupo: number;
  grupoNombre: string;
  gestion: string;
  materiaNombre: string;
  notaAprobacion: number;
  onBack: () => void;
  mode?: "principal" | "detalle";
  selectedECId?: number | null;
  onNavigateToEC?: (ecId: number) => void;
  evScores?: Record<number, Record<number, Record<number, number | null>>>;
  onUpdateEVScores?: (
    idInscripcion: number,
    ecId: number,
    evId: number,
    puntaje: number | null,
  ) => void;
}

export function GradingSheet({
  idGrupo,
  grupoNombre,
  gestion,
  materiaNombre,
  notaAprobacion: propNotaAprobacion,
  onBack,
  mode = "principal",
  selectedECId = null,
  onNavigateToEC,
  evScores,
  onUpdateEVScores,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { planilla, loading, cargar, guardar } = usePlanilla();
  const initializedRef = useRef(false);
  const [notaAprobacionState, setNotaAprobacionState] =
    useState(propNotaAprobacion);

  const [ecScores, setEcScores] = useState<
    Record<number, Record<number, number | null>>
  >({});
  const [asistencias, setAsistencias] = useState<Record<number, number>>({});
  const [observaciones, setObservaciones] = useState<Record<number, string>>(
    {},
  );
  const [segundaInstanciaNota, setSegundaInstanciaNota] = useState<
    Record<number, number | null>
  >({});

  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const [noEVWarning, setNoEVWarning] = useState(false);
  const [selectedECName, setSelectedECName] = useState<string>("");
  const [lastDetailECId, setLastDetailECId] = useState<number | null>(null); // nuevo estado
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  // ─── Cargar planilla ────────────────────────────────────────────────
  React.useEffect(() => {
    initializedRef.current = false; // reset para nueva planilla
    cargar(idGrupo).then(() => setLoaded(true));
  }, [idGrupo]);

  // ─── Inicializar datos del backend ─────────────────────────────────
  React.useEffect(() => {
    if (planilla && !initializedRef.current) {
      initializedRef.current = true;

      // Cargar nota de aprobación del backend
      if (planilla.materia?.nota_aprobacion) {
        setNotaAprobacionState(planilla.materia.nota_aprobacion);
      }

      // Inicializar evScores con los datos del backend
      if (onUpdateEVScores) {
        planilla.estudiantes.forEach((est) => {
          planilla.ecs.forEach((ec) => {
            const ecData = est.ecs.find(
              (e) => e.id_elemento_competencia === ec.id,
            );
            ec.evs.forEach((ev) => {
              const nota = ecData?.evs.find(
                (n) => n.id_elemento_evaluativo === ev.id,
              );
              if (nota?.puntaje !== undefined) {
                onUpdateEVScores(
                  est.id_inscripcion,
                  ec.id,
                  ev.id,
                  Number(nota.puntaje),
                );
              }
            });
          });
        });
      }

      // Inicializar ecScores DIRECTAMENTE desde los datos del backend
      const initialEcScores: Record<number, Record<number, number | null>> = {};
      const initialAsistencias: Record<number, number> = {};
      const initialObs: Record<number, string> = {};
      const initialSegundaInstancia: Record<number, number | null> = {};

      planilla.estudiantes.forEach((est) => {
        initialEcScores[est.id_inscripcion] = {};
        initialObs[est.id_inscripcion] = "";
        initialSegundaInstancia[est.id_inscripcion] =
          est.segunda_instancia_nota ?? null;

        planilla.ecs.forEach((ec) => {
          const ecData = est.ecs.find(
            (e) => e.id_elemento_competencia === ec.id,
          );
          initialEcScores[est.id_inscripcion][ec.id] =
            ecData?.puntaje != null ? Number(ecData.puntaje) : null;
        });

        initialAsistencias[est.id_inscripcion] = est.nota_asistencia;
      });

      setEcScores(initialEcScores);
      setAsistencias(initialAsistencias);
      setObservaciones(initialObs);
      setSegundaInstanciaNota(initialSegundaInstancia);
    }
  }, [planilla, onUpdateEVScores]); // <-- sin evScores

  // ─── Recalcular EC desde sus EV (usado al volver del detalle) ────
  const recalcEcFromEvs = useCallback(
    (estId: number, ecId: number) => {
      const ec = planilla?.ecs.find((e) => e.id === ecId);
      if (!ec) return;
      const localEvScores = evScores?.[estId]?.[ecId] ?? {};
      const evValues = ec.evs.map((ev) => localEvScores[ev.id] ?? 0);
      if (evValues.length === 0) return;
      const sumaEV = evValues.reduce((a, b) => a + b, 0);
      const nuevaNota = Math.min(
        Math.round(sumaEV * 0.9 + (asistencias[estId] ?? 0)),
        100,
      );
      setEcScores((prev) => ({
        ...prev,
        [estId]: { ...prev[estId], [ecId]: nuevaNota },
      }));
    },
    [planilla, evScores, asistencias],
  );

  // ─── Recalcular al salir del detalle ───────────────────────────────
  React.useEffect(() => {
    if (mode === "principal" && lastDetailECId !== null && planilla) {
      planilla.estudiantes.forEach((est) => {
        recalcEcFromEvs(est.id_inscripcion, lastDetailECId);
      });
      setLastDetailECId(null);
    }
  }, [mode, lastDetailECId, recalcEcFromEvs, planilla]);

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleEcScoreChange = useCallback(
    (idInscripcion: number, ecId: number, puntaje: number | null) => {
      setEcScores((prev) => ({
        ...prev,
        [idInscripcion]: { ...prev[idInscripcion], [ecId]: puntaje },
      }));
    },
    [],
  );

  const handleAsistenciaChange = useCallback(
    (idInscripcion: number, value: string) => {
      const filtered = value.replace(/[^0-9.]/g, "");
      const val = filtered === "" ? 0 : parseFloat(filtered);
      if (!isNaN(val) && val >= 0 && val <= 10) {
        setAsistencias((prev) => ({ ...prev, [idInscripcion]: val }));
      }
    },
    [],
  );

  const handleAsistenciaBlur = useCallback((idInscripcion: number) => {
    setAsistencias((prev) => {
      let val = prev[idInscripcion] ?? 0;
      if (isNaN(val)) val = 0;
      if (val < 0) val = 0;
      if (val > 10) val = 10;
      return { ...prev, [idInscripcion]: Math.round(val) };
    });
  }, []);

  const handleSegundaInstanciaChange = useCallback(
    (idInscripcion: number, value: string) => {
      const filtered = value.replace(/[^0-9.]/g, "");
      const val = filtered === "" ? null : parseFloat(filtered);
      if (val !== null && (isNaN(val) || val < 0 || val > 100)) return;
      setSegundaInstanciaNota((prev) => ({ ...prev, [idInscripcion]: val }));
    },
    [],
  );

  const handleSegundaInstanciaBlur = useCallback((idInscripcion: number) => {
    setSegundaInstanciaNota((prev) => {
      const val = prev[idInscripcion];
      if (val === null || val === undefined) return prev;
      if (isNaN(val)) return { ...prev, [idInscripcion]: null };
      if (val < 0) return { ...prev, [idInscripcion]: 0 };
      if (val > 100) return { ...prev, [idInscripcion]: 100 };
      return { ...prev, [idInscripcion]: Math.round(val) };
    });
  }, []);

  const handleObservacionChange = useCallback(
    (idInscripcion: number, obs: string) => {
      setObservaciones((prev) => ({ ...prev, [idInscripcion]: obs }));
    },
    [],
  );

  const calcularNotaFinal = useCallback(
    (estId: number) => {
      const ecs = planilla?.ecs ?? [];
      const scores = ecScores[estId] ?? {};
      const validScores = ecs.map((ec) => scores[ec.id] ?? 0);
      if (validScores.length === 0) return 0;
      const promedio =
        validScores.reduce((a, b) => a + b, 0) / validScores.length;
      return Math.round(promedio);
    },
    [planilla, ecScores],
  );

  const handleSave = useCallback(async () => {
    if (!planilla) return;
    setSaving(true);
    try {
      const notas = planilla.estudiantes.map((est) => {
        const studentEcScores = ecScores[est.id_inscripcion] || {};
        const studentEvScores = evScores?.[est.id_inscripcion] || {};
        const ecsPayload = planilla.ecs.map((ec) => ({
          id_elemento_competencia: ec.id,
          puntaje: studentEcScores[ec.id] ?? 0,
          observaciones: null,
          evs: ec.evs.map((ev) => ({
            id_elemento_evaluativo: ev.id,
            puntaje: studentEvScores[ec.id]?.[ev.id] ?? 0,
            observaciones: null,
          })),
        }));

        const notaFinal = calcularNotaFinal(est.id_inscripcion);
        const notaSegunda = segundaInstanciaNota[est.id_inscripcion];

        const estado =
          notaFinal >= notaAprobacionState ||
          (notaSegunda !== null &&
            notaSegunda !== undefined &&
            notaSegunda >= notaAprobacionState)
            ? ("Aprobado" as const)
            : ("Reprobado" as const);

        return {
          id_inscripcion: est.id_inscripcion,
          nota_asistencia:
            asistencias[est.id_inscripcion] ?? est.nota_asistencia,
          nota_final: Math.round(notaFinal),
          segunda_instancia_nota: notaSegunda ?? null,
          estado,
          observaciones: observaciones[est.id_inscripcion] || null,
          ecs: ecsPayload,
        };
      });

      const payload: GuardarPayload = {
        id_grupo_materia_docente: idGrupo,
        notas,
      };
      await guardar(payload);
    } catch (err) {
    } finally {
      setSaving(false);
    }
  }, [
    planilla,
    ecScores,
    asistencias,
    observaciones,
    evScores,
    idGrupo,
    notaAprobacionState,
    guardar,
    segundaInstanciaNota,
    calcularNotaFinal,
  ]);

  const handleExportExcel = async () => {
    try {
      await descargarExcel(idGrupo);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.message });
    }
  };

  const handleExportPDF = async () => {
    try {
      await abrirPDF(idGrupo);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.message });
    }
  };
  const sortedStudents = useMemo(() => {
    if (!planilla) return [];
    return [...planilla.estudiantes].sort((a, b) => {
      const aKey = `${a.apellidoPaterno.toLowerCase()} ${a.apellidoMaterno.toLowerCase()} ${a.nombres.toLowerCase()}`;
      const bKey = `${b.apellidoPaterno.toLowerCase()} ${b.apellidoMaterno.toLowerCase()} ${b.nombres.toLowerCase()}`;
      if (aKey < bKey) return sortOrder === "asc" ? -1 : 1;
      if (aKey > bKey) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [planilla, sortOrder]);
  // ─── Estados de carga / error ──────────────────────────────────────
  if (!loaded && loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!planilla) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={{ color: c.text, marginBottom: 16 }}>
          No se pudo cargar la planilla.
        </Text>
        <TouchableOpacity
          onPress={onBack}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: c.primary,
          }}
        >
          <Text style={{ color: c.primaryForeground, fontWeight: "600" }}>
            Regresar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isDetail = mode === "detalle" && selectedECId !== null;
  const ecActual = isDetail
    ? planilla.ecs.find((ec) => ec.id === selectedECId)
    : null;

  // ─────────────────────────────────────────────────────────────────
  // VISTA DE DETALLE (EVs)
  // ─────────────────────────────────────────────────────────────────
  if (isDetail && ecActual) {
    const evs = ecActual.evs;
    return (
      <MotiView
        style={[styles.container, { backgroundColor: c.background }]}
        {...fadeSlideUp}
      >
        <GradingHeader
          grupo={grupoNombre}
          gestion={gestion}
          materia={materiaNombre}
          onBack={onBack}
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          onSave={handleSave}
          saving={saving}
          showSave={false}
          ecNombre={ecActual.nombre}
        />
        <View
          style={[
            styles.tableContainer,
            {
              backgroundColor: c.card,
              borderTopWidth: 1,
              borderTopColor: c.border + "100",
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.horizontalScroll}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{ flexGrow: 1, zIndex: 1, minWidth: "100%" }}>
              <View
                style={[
                  styles.headerRow,
                  {
                    borderBottomColor: c.border + "100",
                    backgroundColor: c.backgroundSecondary,
                    zIndex: 9999,
                    elevation: 10,
                  },
                ]}
              >
                <Pressable
                  onPress={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  style={[
                    styles.headerCell,
                    {
                      width: COL_STUDENT,
                      borderRightWidth: 1,
                      borderRightColor: c.border + "100",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                    },
                  ]}
                >
                  <Text style={[styles.headerText, { color: c.textSecondary }]}>
                    Estudiante
                  </Text>
                  {sortOrder === "asc" ? (
                    <ArrowUp size={12} color={c.textSecondary} />
                  ) : (
                    <ArrowDown size={12} color={c.textSecondary} />
                  )}
                </Pressable>
                {evs.map((ev) => (
                  <View
                    key={ev.id}
                    style={[
                      styles.headerCell,
                      {
                        width: COL_EV,
                        borderRightWidth: 1,
                        borderRightColor: c.border + "100",
                      },
                    ]}
                  >
                    <Text
                      style={[styles.headerText, { color: c.textSecondary }]}
                      numberOfLines={2}
                    >
                      {ev.puntaje_maximo != null
                        ? `(${ev.puntaje_maximo}) `
                        : ""}
                      {ev.nombre}
                    </Text>
                  </View>
                ))}
                {/* Suma 90% */}
                <View
                  style={[
                    styles.headerCell,
                    {
                      width: COL_SUMA_EV,
                      borderRightWidth: 1,
                      borderRightColor: c.border + "100",
                      backgroundColor: c.backgroundSecondary + "40",
                    },
                  ]}
                >
                  <View style={styles.tooltipContainer}>
                    <Text
                      style={[styles.headerText, { color: c.textSecondary }]}
                    >
                      Suma 90%
                    </Text>
                    <Tooltip
                      message="Suma de todos los elementos evaluativos multiplicada por 0.9. Representa el aporte ponderado de las evaluaciones antes de sumar la asistencia."
                      position="bottom"
                    />
                  </View>
                </View>

                {/* Asist. */}
                <View
                  style={[
                    styles.headerCell,
                    {
                      width: COL_ASIST,
                      borderRightWidth: 1,
                      borderRightColor: c.border + "100",
                      backgroundColor: c.backgroundSecondary + "40",
                    },
                  ]}
                >
                  <View style={styles.tooltipContainer}>
                    <Text
                      style={[styles.headerText, { color: c.textSecondary }]}
                    >
                      Asist.
                    </Text>
                    <Tooltip
                      message="Nota de asistencia (0-10). Se suma directamente al 90% de los elementos evaluativos para calcular la Nota EC."
                      position="bottom"
                    />
                  </View>
                </View>

                {/* Nota EC */}
                <View
                  style={[
                    styles.headerCell,
                    {
                      width: COL_EC,
                      borderRightWidth: 1,
                      borderRightColor: c.border + "100",
                      backgroundColor: c.backgroundSecondary + "40",
                    },
                  ]}
                >
                  <View style={styles.tooltipContainer}>
                    <Text
                      style={[styles.headerText, { color: c.textSecondary }]}
                    >
                      Nota EC
                    </Text>
                    <Tooltip
                      message="Nota final del Elemento de Competencia = Suma(90%) + Asistencia (máximo 100). Puede editarse manualmente si es necesario en la pantalla anterior."
                      position="bottom"
                    />
                  </View>
                </View>

                {/* Estado EC */}
                <View
                  style={[
                    styles.headerCell,
                    {
                      flex: 1,
                      minWidth: COL_STATUS,
                      borderRightWidth: 1,
                      borderRightColor: c.border + "100",
                    },
                  ]}
                >
                  <View style={styles.tooltipContainer}>
                    <Text
                      style={[styles.headerText, { color: c.textSecondary }]}
                    >
                      Estado EC
                    </Text>
                    <Tooltip
                      message={`Indica si el estudiante alcanza la nota de aprobación (Aprobado ≥ ${notaAprobacionState}) en este Elemento de Competencia.`}
                      position="bottom-left"
                    />
                  </View>
                </View>
              </View>
              <FlatList
                data={sortedStudents}
                keyExtractor={(item) => item.id_inscripcion.toString()}
                renderItem={({ item }) => {
                  const currentEvScores =
                    evScores?.[item.id_inscripcion]?.[ecActual.id] ?? {};
                  const evValues = evs.map((ev) => currentEvScores[ev.id] ?? 0);
                  const sumaEV = evValues.reduce((a, b) => a + b, 0);
                  const notaEcCalculada = Math.round(
                    Math.min(
                      sumaEV * 0.9 +
                        (asistencias[item.id_inscripcion] ??
                          item.nota_asistencia),
                      100,
                    ),
                  );
                  const notaEcOk = notaEcCalculada >= notaAprobacionState;
                  const asistencia =
                    asistencias[item.id_inscripcion] ?? item.nota_asistencia;
                  const asistenciaOk = asistencia >= 1;
                  const estadoEC =
                    notaEcCalculada >= notaAprobacionState
                      ? "Aprobado"
                      : "Reprobado";

                  return (
                    <View
                      style={[
                        styles.row,
                        { borderBottomColor: c.border + "100" },
                      ]}
                    >
                      <View
                        style={[
                          styles.studentCell,
                          {
                            width: COL_STUDENT,
                            borderRightColor: c.border + "100",
                            borderRightWidth: 1,
                          },
                        ]}
                      >
                        <Text style={styles.studentName}>
                          {`${item.apellidoPaterno} ${item.apellidoMaterno} ${item.nombres}`.trim()}
                        </Text>
                      </View>
                      {evs.map((ev) => {
                        const currentVal = currentEvScores[ev.id] ?? 0;
                        const puntajeMaximo = Number(ev.puntaje_maximo) || 0;
                        let bgColor = "transparent";
                        if (puntajeMaximo > 0) {
                          if (currentVal > puntajeMaximo) {
                            bgColor = c.destructive + "20";
                          } else if (currentVal === puntajeMaximo) {
                            bgColor = c.success + "20";
                          }
                        }

                        return (
                          <View
                            key={ev.id}
                            style={[
                              styles.cell,
                              {
                                width: COL_EV,
                                borderRightWidth: 1,
                                borderRightColor: c.border + "100",
                                backgroundColor: bgColor,
                              },
                            ]}
                          >
                            <TextInput
                              style={[styles.input, { color: c.text }]}
                              keyboardType="decimal-pad"
                              value={Math.round(currentVal).toString()}
                              onChangeText={(text) => {
                                const filtered = text.replace(/[^0-9.]/g, "");
                                const val =
                                  filtered === "" ? 0 : Number(filtered);
                                if (isNaN(val) || val < 0 || val > 100) return;
                                onUpdateEVScores?.(
                                  item.id_inscripcion,
                                  ecActual.id,
                                  ev.id,
                                  val,
                                );
                              }}
                              selectTextOnFocus
                              maxLength={6}
                            />
                          </View>
                        );
                      })}
                      <View
                        style={[
                          styles.cell,
                          {
                            width: COL_SUMA_EV,
                            borderRightWidth: 1,
                            borderRightColor: c.border + "100",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor:
                              Math.round(sumaEV * 0.9) >= notaAprobacionState
                                ? c.success + "20"
                                : c.destructive + "20",
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              Math.round(sumaEV * 0.9) >= notaAprobacionState
                                ? c.success
                                : c.destructive,
                            fontWeight: "700",
                            fontSize: 14,
                          }}
                        >
                          {Math.round(sumaEV * 0.9)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.cell,
                          {
                            width: COL_ASIST,
                            borderRightWidth: 1,
                            borderRightColor: c.border + "100",
                            backgroundColor: asistenciaOk
                              ? c.success + "20"
                              : c.destructive + "20",
                          },
                        ]}
                      >
                        <TextInput
                          style={[
                            styles.input,
                            {
                              color: asistenciaOk ? c.success : c.destructive,
                              fontWeight: "700",
                            },
                          ]}
                          keyboardType="decimal-pad"
                          value={asistencia.toString()}
                          onChangeText={(text) =>
                            handleAsistenciaChange(item.id_inscripcion, text)
                          }
                          onBlur={() =>
                            handleAsistenciaBlur(item.id_inscripcion)
                          }
                          selectTextOnFocus
                        />
                      </View>
                      <View
                        style={[
                          styles.cell,
                          {
                            width: COL_EC,
                            borderRightWidth: 1,
                            borderRightColor: c.border + "100",
                            backgroundColor: notaEcOk
                              ? c.success + "20"
                              : c.destructive + "20",
                          },
                        ]}
                      >
                        <TextInput
                          style={[
                            styles.input,
                            {
                              color: notaEcOk ? c.success : c.destructive,
                              fontWeight: "700",
                            },
                          ]}
                          keyboardType="decimal-pad"
                          value={Math.round(notaEcCalculada).toString()}
                          onChangeText={(text) => {
                            const filtered = text.replace(/[^0-9.]/g, "");
                            const val =
                              filtered === "" ? null : Number(filtered);
                            if (
                              val !== null &&
                              !isNaN(val) &&
                              val >= 0 &&
                              val <= 100
                            ) {
                              handleEcScoreChange(
                                item.id_inscripcion,
                                ecActual.id,
                                val,
                              );
                            }
                          }}
                          selectTextOnFocus
                        />
                      </View>
                      <View
                        style={[
                          styles.cell,
                          {
                            flex: 1,
                            minWidth: COL_STATUS,
                            borderRightWidth: 1,
                            borderRightColor: c.border + "100",
                            justifyContent: "center",
                            alignItems: "center",
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                estadoEC === "Aprobado"
                                  ? c.success + "15"
                                  : c.destructive + "15",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color:
                                  estadoEC === "Aprobado"
                                    ? c.success
                                    : c.destructive,
                              },
                            ]}
                          >
                            {estadoEC}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                }}
                contentContainerStyle={{ paddingBottom: 60 }}
              />
            </View>
          </ScrollView>
        </View>
      </MotiView>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // VISTA PRINCIPAL (ECs + Segunda Instancia)
  // ─────────────────────────────────────────────────────────────────
  const ecs = planilla.ecs;
  return (
    <MotiView
      style={[styles.container, { backgroundColor: c.background }]}
      {...fadeSlideUp}
    >
      <GradingHeader
        grupo={grupoNombre}
        gestion={gestion}
        materia={materiaNombre}
        onBack={onBack}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        onSave={handleSave}
        saving={saving}
        showSave={true}
      />
      <View
        style={[
          styles.tableContainer,
          {
            backgroundColor: c.card,
            borderTopWidth: 1,
            borderTopColor: c.border + "100",
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.horizontalScroll}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ flexGrow: 1, zIndex: 1, minWidth: "100%" }}>
            <View
              style={[
                styles.headerRow,
                {
                  borderBottomColor: c.border + "100",
                  backgroundColor: c.backgroundSecondary,
                  zIndex: 9999,
                  elevation: 10,
                },
              ]}
            >
              <Pressable
                onPress={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                style={[
                  styles.headerCell,
                  {
                    width: COL_STUDENT,
                    borderRightWidth: 1,
                    borderRightColor: c.border + "100",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  },
                ]}
              >
                <Text style={[styles.headerText, { color: c.textSecondary }]}>
                  Estudiante
                </Text>
                {sortOrder === "asc" ? (
                  <ArrowUp size={12} color={c.textSecondary} />
                ) : (
                  <ArrowDown size={12} color={c.textSecondary} />
                )}
              </Pressable>
              {ecs.map((ec) => (
                <TouchableOpacity
                  key={ec.id}
                  style={[
                    styles.headerCell,
                    {
                      width: COL_EC,
                      borderRightWidth: 1,
                      borderRightColor: c.border + "100",
                    },
                  ]}
                  onPress={() => {
                    if (ec.evs.length === 0) {
                      setSelectedECName(ec.nombre);
                      setNoEVWarning(true);
                    } else {
                      setLastDetailECId(ec.id); // registrar el EC que vamos a ver
                      onNavigateToEC?.(ec.id);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.headerText,
                      { color: c.primary, textDecorationLine: "underline" },
                    ]}
                    numberOfLines={2}
                  >
                    {ec.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
              <View
                style={[
                  styles.headerCell,
                  {
                    width: COL_FINAL,
                    borderRightWidth: 1,
                    borderRightColor: c.border + "100",
                  },
                ]}
              >
                <View style={styles.tooltipContainer}>
                  <Text style={[styles.headerText, { color: c.textSecondary }]}>
                    Nota Final
                  </Text>
                  <Tooltip
                    message="Cálculo automático basado en la suma de los Elementos de Competencia."
                    position="bottom"
                  />
                </View>
              </View>
              <View
                style={[
                  styles.headerCell,
                  {
                    width: COL_SEGUNDA,
                    borderRightWidth: 1,
                    borderRightColor: c.border + "100",
                  },
                ]}
              >
                <View style={styles.tooltipContainer}>
                  <Text style={[styles.headerText, { color: c.textSecondary }]}>
                    2da Instancia
                  </Text>
                  <Tooltip
                    message="Nota de recuperación. Si el estudiante alcanza o supera la nota de aprobación aquí, se considera Aprobado aunque la Nota Final sea inferior."
                    position="bottom"
                  />
                </View>
              </View>
              <View
                style={[
                  styles.headerCell,
                  {
                    width: COL_STATUS,
                    borderRightWidth: 1,
                    borderRightColor: c.border + "100",
                  },
                ]}
              >
                <View style={styles.tooltipContainer}>
                  <Text style={[styles.headerText, { color: c.textSecondary }]}>
                    Estado
                  </Text>
                  <Tooltip
                    message={`Indicador automático de Aprobado/Reprobado basado en la Nota Final o Segunda Instancia (Aprobado ≥ ${notaAprobacionState}).`}
                    position="bottom"
                  />
                </View>
              </View>
              <View
                style={[
                  styles.headerCell,
                  {
                    flex: 1,
                    minWidth: COL_OBS,
                    borderRightWidth: 1,
                    borderRightColor: c.border + "100",
                  },
                ]}
              >
                <View style={styles.tooltipContainer}>
                  <Text style={[styles.headerText, { color: c.textSecondary }]}>
                    Observación
                  </Text>
                  <Tooltip
                    message="Campo libre para registrar comentarios adicionales sobre el desempeño del estudiante."
                    position="bottom-left"
                  />
                </View>
              </View>
            </View>

            <FlatList
              ref={flatListRef}
              data={sortedStudents}
              keyExtractor={(item) => item.id_inscripcion.toString()}
              renderItem={({ item }) => {
                const finalNota = calcularNotaFinal(item.id_inscripcion);
                const notaSegunda = segundaInstanciaNota[item.id_inscripcion];
                const estado =
                  finalNota >= notaAprobacionState ||
                  (notaSegunda !== null &&
                    notaSegunda !== undefined &&
                    notaSegunda >= notaAprobacionState)
                    ? "Aprobado"
                    : "Reprobado";

                return (
                  <View
                    style={[
                      styles.row,
                      { borderBottomColor: c.border + "100" },
                    ]}
                  >
                    <View
                      style={[
                        styles.studentCell,
                        {
                          width: COL_STUDENT,
                          borderRightColor: c.border + "100",
                          borderRightWidth: 1,
                        },
                      ]}
                    >
                      <Text style={styles.studentName}>
                        {`${item.apellidoPaterno} ${item.apellidoMaterno} ${item.nombres}`.trim()}
                      </Text>
                    </View>
                    {ecs.map((ec) => {
                      const score =
                        ecScores[item.id_inscripcion]?.[ec.id] ?? null;
                      return (
                        <View
                          key={ec.id}
                          style={[
                            styles.scoreCell,
                            {
                              width: COL_EC,
                              borderRightColor: c.border + "100",
                              borderRightWidth: 1,
                              backgroundColor:
                                (score ?? 0) < notaAprobacionState
                                  ? c.destructive + "20"
                                  : c.success + "20",
                            },
                          ]}
                        >
                          <TextInput
                            style={[styles.input, { color: c.text }]}
                            keyboardType="decimal-pad"
                            value={
                              score != null ? Math.round(score).toString() : "0"
                            }
                            onChangeText={(text) => {
                              const filtered = text.replace(/[^0-9.]/g, "");
                              const val =
                                filtered === "" ? 0 : Number(filtered);
                              if (
                                val !== null &&
                                (isNaN(val) || val < 0 || val > 100)
                              )
                                return;
                              handleEcScoreChange(
                                item.id_inscripcion,
                                ec.id,
                                val,
                              );
                            }}
                            selectTextOnFocus
                            maxLength={6}
                          />
                        </View>
                      );
                    })}
                    <View
                      style={[
                        styles.scoreCell,
                        {
                          width: COL_FINAL,
                          borderRightColor: c.border + "100",
                          borderRightWidth: 1,
                          backgroundColor:
                            finalNota < notaAprobacionState
                              ? c.destructive + "20"
                              : c.success + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.finalText,
                          {
                            color:
                              finalNota >= notaAprobacionState
                                ? c.success
                                : c.destructive,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {Math.round(finalNota)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.scoreCell,
                        {
                          width: COL_SEGUNDA,
                          borderRightColor: c.border + "100",
                          borderRightWidth: 1,
                          backgroundColor:
                            notaSegunda == null
                              ? c.backgroundSecondary + "60" // cuando todavía no existe nota
                              : notaSegunda < notaAprobacionState
                                ? c.destructive + "20"
                                : c.success + "20",
                        },
                      ]}
                    >
                      <TextInput
                        style={[
                          styles.input,
                          {
                            color:
                              notaSegunda !== null && notaSegunda !== undefined
                                ? notaSegunda >= notaAprobacionState
                                  ? c.success
                                  : c.destructive
                                : c.text,
                            fontWeight: "600",
                          },
                        ]}
                        keyboardType="decimal-pad"
                        value={
                          notaSegunda !== null && notaSegunda !== undefined
                            ? Math.round(notaSegunda).toString()
                            : ""
                        }
                        onChangeText={(text) =>
                          handleSegundaInstanciaChange(
                            item.id_inscripcion,
                            text,
                          )
                        }
                        onBlur={() =>
                          handleSegundaInstanciaBlur(item.id_inscripcion)
                        }
                        selectTextOnFocus
                      />
                    </View>
                    <View
                      style={[
                        styles.statusCell,
                        {
                          width: COL_STATUS,
                          borderRightColor: c.border + "100",
                          borderRightWidth: 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              estado === "Aprobado"
                                ? c.success + "15"
                                : c.destructive + "15",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                estado === "Aprobado"
                                  ? c.success
                                  : c.destructive,
                            },
                          ]}
                        >
                          {estado}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.scoreCell,
                        {
                          flex: 1,
                          minWidth: COL_OBS,
                          borderRightColor: c.border + "100",
                          borderRightWidth: 1,
                        },
                      ]}
                    >
                      <TextInput
                        style={[
                          styles.input,
                          {
                            color: c.text,
                            textAlign: "left",
                            paddingHorizontal: 12,
                          },
                        ]}
                        placeholder="Añadir observación..."
                        placeholderTextColor={c.textSecondary}
                        value={observaciones[item.id_inscripcion] || ""}
                        onChangeText={(text) =>
                          handleObservacionChange(item.id_inscripcion, text)
                        }
                        returnKeyType="done"
                      />
                    </View>
                  </View>
                );
              }}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={true}
              initialNumToRender={20}
              windowSize={10}
              removeClippedSubviews={false}
              style={styles.flatList}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </ScrollView>
        <ConfirmStatusModal
          visible={noEVWarning}
          title="Sin elementos evaluativos"
          message={`El Elemento de Competencia "${selectedECName}" no tiene elementos evaluativos. Créelos desde el panel de gestión.`}
          confirmLabel="ENTENDIDO"
          hideCancel
          onCancel={() => setNoEVWarning(false)}
          onConfirm={() => setNoEVWarning(false)}
        />
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  tableContainer: { flex: 1, marginTop: 0, zIndex: 1 },
  horizontalScroll: { flex: 1 },
  flatList: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#bcc9c5",
    paddingVertical: 0,
    height: 50,
    width: "100%",
    alignItems: "stretch",
  },
  headerCell: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
  },
  tooltipContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingLeft: 12,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    minHeight: 48,
    width: "100%",
  },
  studentCell: {
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  studentName: { fontSize: 14, fontWeight: "600" },
  cell: {
    justifyContent: "center",
    alignItems: "stretch",
    padding: 0,
  },
  scoreCell: {
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  input: {
    flex: 1,
    width: "100%",
    height: "100%",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    padding: 0,
    textAlignVertical: "center",
  },
  statusCell: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  statusBadge: {
    minWidth: 110,
    height: 30,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  statusText: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  listContent: { paddingBottom: 60 },
  finalText: {
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    fontSize: 14,
    fontWeight: "700",
  },
});
