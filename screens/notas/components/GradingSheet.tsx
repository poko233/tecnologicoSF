import { useTheme } from "@/theme/useTheme";
import { Tooltip } from "@components/Tooltip";
import { MotiView } from "moti";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { fadeSlideUp } from "../animations/notas.animations";
import { usePlanilla } from "../hooks/usePlanilla";
import { abrirPDF, descargarExcel } from "../services/notas.service";
import { GuardarPayload } from "../types/notas.types";
import { GradingHeader } from "./GradingHeader";
import { GradingRow } from "./GradingRow";

const COL_STUDENT_MIN = 250;
const COL_EC = 100;
const COL_ASIST = 100;
const COL_FINAL = 130;
const COL_STATUS = 150;
const COL_OBS = 220;

interface Props {
  idGrupo: number;
  grupoNombre: string;
  gestion: string;
  materiaNombre: string;
  onBack: () => void;
}

export function GradingSheet({
  idGrupo,
  grupoNombre,
  gestion,
  materiaNombre,
  onBack,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { planilla, loading, cargar, guardar } = usePlanilla();
  const [scores, setScores] = useState<
    Record<number, Record<number, number | null>>
  >({});
  const [observaciones, setObservaciones] = useState<Record<number, string>>(
    {},
  );
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  React.useEffect(() => {
    cargar(idGrupo).then(() => setLoaded(true));
  }, [idGrupo]);

  React.useEffect(() => {
    if (planilla) {
      const initialScores: Record<number, Record<number, number | null>> = {};
      const initialObs: Record<number, string> = {};
      planilla.estudiantes.forEach((est) => {
        initialScores[est.id_inscripcion] = {};
        initialObs[est.id_inscripcion] = "";
        planilla.elementos_competencia.forEach((ec) => {
          const nota = est.notas_ec.find(
            (n) => n.id_elemento_competencia === ec.id,
          );
          initialScores[est.id_inscripcion][ec.id] = nota?.puntaje ?? null;
        });
      });
      setScores(initialScores);
      setObservaciones(initialObs);
    }
  }, [planilla]);

  const handleScoreChange = useCallback(
    (idInscripcion: number, ecId: number, puntaje: number | null) => {
      setScores((prev) => ({
        ...prev,
        [idInscripcion]: { ...prev[idInscripcion], [ecId]: puntaje },
      }));
    },
    [],
  );

  const handleObservacionChange = useCallback(
    (idInscripcion: number, obs: string) => {
      setObservaciones((prev) => ({ ...prev, [idInscripcion]: obs }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!planilla) return;
    setSaving(true);
    try {
      const notas = planilla.estudiantes.map((est) => {
        const studentScores = scores[est.id_inscripcion] || {};
        const obs = observaciones[est.id_inscripcion] || null;
        const ecScores = planilla.elementos_competencia.map((ec) => ({
          id_elemento_competencia: ec.id,
          puntaje: studentScores[ec.id] ?? 0,
          observaciones: null,
        }));
        const ecValues = planilla.elementos_competencia.map(
          (ec) => studentScores[ec.id] ?? 0,
        );
        const validScores = ecValues.filter((v) => v !== null) as number[];
        const promedio =
          validScores.length > 0
            ? validScores.reduce((a, b) => a + b, 0) / validScores.length
            : 0;
        const notaFinal = Math.min(promedio * 0.9 + est.nota_asistencia, 100);
        const notaFinalRedondeada = Math.round(notaFinal * 100) / 100;
        const estado =
          notaFinalRedondeada >= 51
            ? ("Aprobado" as const)
            : ("Reprobado" as const);
        return {
          id_inscripcion: est.id_inscripcion,
          nota_asistencia: est.nota_asistencia,
          nota_final: notaFinalRedondeada,
          estado,
          observaciones: obs,
          ecs: ecScores,
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
  }, [planilla, scores, observaciones, idGrupo, guardar]);

  // ─── EXCEL ───────────────────────────────────────────────
  const handleExportExcel = useCallback(async () => {
    try {
      await descargarExcel(idGrupo);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.message });
    }
  }, [idGrupo]);

  const handleExportPDF = useCallback(async () => {
    try {
      await abrirPDF(idGrupo);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.message });
    }
  }, [idGrupo]);

  const numECs = planilla?.elementos_competencia.length ?? 0;
  const minTableWidth = useMemo(
    () =>
      COL_STUDENT_MIN +
      numECs * COL_EC +
      COL_ASIST +
      COL_FINAL +
      COL_STATUS +
      COL_OBS,
    [numECs],
  );

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
        <Text style={{ color: c.text }}>No se pudo cargar la planilla.</Text>
      </View>
    );
  }

  const renderHeader = () => (
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
      <View
        style={[
          styles.headerCell,
          {
            width: COL_STUDENT_MIN,
            borderRightWidth: 1,
            borderRightColor: c.border + "100",
          },
        ]}
      >
        <Text style={[styles.headerText, { color: c.textSecondary }]}>
          Estudiante
        </Text>
      </View>
      {planilla.elementos_competencia.map((ec) => (
        <View
          key={ec.id}
          style={[
            styles.headerCell,
            {
              width: COL_EC,
              borderRightWidth: 1,
              borderRightColor: c.border + "100",
            },
          ]}
        >
          <Text
            style={[styles.headerText, { color: c.textSecondary }]}
            numberOfLines={2}
          >
            {ec.nombre}
          </Text>
        </View>
      ))}
      <View
        style={[
          styles.headerCell,
          {
            width: COL_ASIST,
            backgroundColor: c.backgroundSecondary + "40",
            borderRightWidth: 1,
            borderRightColor: c.border + "100",
          },
        ]}
      >
        <View style={styles.tooltipContainer}>
          <Text style={[styles.headerText, { color: c.textSecondary }]}>
            Asist. (10)
          </Text>
          <Tooltip
            message="Asistencia; Presente y con Permiso = 1 punto, Atraso = 0.5 puntos y Falta = 0 puntos"
            position="bottom"
          />
        </View>
      </View>
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
            message="Cálculo automático basado en el promedio de los Elementos de Competencia (90%) y la asistencia (10%)."
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
            message="Indicador automático de Aprobado/Reprobado basado en la Nota Final (Aprobado ≥ 51)."
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
            message="Campo libre para registrar comentarios adicionales sobre el desempeño del estudiante. (Este campo sera visible para el estudiante)"
            position="bottom-left"
          />
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }: any) => (
    <GradingRow
      estudiante={item}
      ecs={planilla.elementos_competencia}
      initialScores={scores[item.id_inscripcion] || {}}
      initialAsistencia={item.nota_asistencia}
      initialObservacion={observaciones[item.id_inscripcion] || ""}
      onScoreChange={handleScoreChange}
      onObservacionChange={handleObservacionChange}
      columnWidths={{
        student: COL_STUDENT_MIN,
        ec: COL_EC,
        asist: COL_ASIST,
        final: COL_FINAL,
        status: COL_STATUS,
        obs: COL_OBS,
      }}
    />
  );

  return (
    <MotiView
      style={[styles.container, { backgroundColor: c.background }]}
      {...fadeSlideUp}
    >
      {/* GradingHeader ya tiene los botones Excel y PDF */}
      <GradingHeader
        grupo={grupoNombre}
        gestion={gestion}
        materia={materiaNombre}
        onBack={onBack}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        onSave={handleSave}
        saving={saving}
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
            {renderHeader()}
            <FlatList
              ref={flatListRef}
              data={planilla.estudiantes}
              keyExtractor={(item) => item.id_inscripcion.toString()}
              renderItem={renderItem}
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
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  tableContainer: { flex: 1, marginTop: 16, zIndex: 1 },
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
  listContent: { paddingBottom: 60 },
});
