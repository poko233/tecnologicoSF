// screens/asistencia/components/spreadsheet/SpreadsheetScreen.tsx
import { useTheme } from "@/theme/useTheme";
import { MotiView } from "moti";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  applyMonthVisibilityPolicy,
  getCurrentMonthKey,
  getMonthKeyFromFecha,
  groupSessionsByMonth,
} from "../../helpers/month.helpers";
import { useReporteAsistencia } from "../../hooks/useReporteAsistencia";
import {
  AsistenciaTipo,
  EstudianteAsistencia,
  GrupoData,
  Sesion,
} from "../../types/asistencia.types";
import { ControlSesionModal } from "../sessions/ControlSesionModal";
import { FechasMateriaModal } from "../sessions/FechasMateriaModal";
import { SessionsFlowModal } from "../sessions/SessionsFlowModal";
import { EmptyStudentsIllustration } from "./EmptyStudentsIllustration";
import { SpreadsheetEmptyState } from "./SpreadsheetEmptyState";
import { SpreadsheetEmptyStudents } from "./SpreadsheetEmptyStudents";
import { SpreadsheetGrid } from "./SpreadsheetGrid";
import { SpreadsheetMonthTabs } from "./SpreadsheetMonthTabs";
import { SpreadsheetToolbar } from "./SpreadsheetToolbar";

interface Props {
  grupoData: GrupoData | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onRefresh: () => Promise<void>;
  onSaveSesion: (
    idSesion: number,
    asistencias: {
      id_inscripcion: number;
      tipo: AsistenciaTipo;
      observacion?: string | null;
    }[],
  ) => Promise<void>;
  onSaveSesionSilent?: (
    idSesion: number,
    asistencias: {
      id_inscripcion: number;
      tipo: AsistenciaTipo;
      observacion?: string | null;
    }[],
  ) => Promise<void>;
  onUpdateEstado: (
    idSesion: number,
    estado: "cancelada" | "feriado",
    motivo: string,
  ) => Promise<void>;
  onReabrir: (idSesion: number) => Promise<void>;
  onLimpiar: (idSesion: number) => Promise<void>;
  onSaveMateriaFechas: (fechaInicio: string, fechaFin: string) => Promise<void>;
}

export function SpreadsheetScreen({
  grupoData,
  loading,
  error,
  onBack,
  onRefresh,
  onSaveSesion,
  onSaveSesionSilent,
  onUpdateEstado,
  onReabrir,
  onLimpiar,
  onSaveMateriaFechas,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { height: windowH } = useWindowDimensions();

  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [selectedSesion, setSelectedSesion] = useState<Sesion | null>(null);
  const [showControl, setShowControl] = useState(false);
  const [showFechas, setShowFechas] = useState(false);
  const [showFlow, setShowFlow] = useState(false);
  const [workingData, setWorkingData] = useState<GrupoData | null>(null);
  const [changeLog, setChangeLog] = useState<Record<string, AsistenciaTipo>>(
    {},
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [savingAll, setSavingAll] = useState(false);

  const { descargarCsv, imprimirPdf, loadingCsv, loadingPdf } =
    useReporteAsistencia();

  const requiresConfiguracion = grupoData?.requires_configuracion ?? null;
  const gmd = grupoData?.grupo_materia_docente ?? null;
  const gmdId = gmd?.id ?? null;
  const gmdMateriaId = gmd?.id_materia ?? null;
  const gestionCerrada = grupoData?.gestion?.estado === "cerrado";

  useEffect(() => {
    if (requiresConfiguracion === "fechas") setShowFechas(true);
  }, [requiresConfiguracion]);

  useEffect(() => {
    if (grupoData) {
      setWorkingData(JSON.parse(JSON.stringify(grupoData)));
      setChangeLog({});
      setHasChanges(false);
    } else {
      setWorkingData(null);
    }
  }, [grupoData]);

  const months = useMemo(
    () => (workingData ? groupSessionsByMonth(workingData.sesiones ?? []) : []),
    [workingData],
  );

  const [activeMonthKey, setActiveMonthKey] = useState<string>("");

  useEffect(() => {
    if (months.length === 0) return;
    if (activeMonthKey && months.some((m) => m.key === activeMonthKey)) return;
    const lastTomada = [...(grupoData?.sesiones ?? [])]
      .reverse()
      .find((s) => s && s.estado === "tomada");
    const current = getCurrentMonthKey();
    const target = lastTomada
      ? getMonthKeyFromFecha(lastTomada.fecha)
      : (months.find((m) => m.key === current)?.key ?? months[0].key);
    setActiveMonthKey(target);
  }, [months, grupoData?.sesiones, activeMonthKey]);

  const activeMonth = months.find((m) => m.key === activeMonthKey);

  const { visible: visibleSessions, ocultas } = useMemo(() => {
    if (!activeMonth) return { visible: [] as Sesion[], ocultas: 0 };
    if (expandedMonth === activeMonth.key)
      return { visible: activeMonth.sesiones, ocultas: 0 };
    return applyMonthVisibilityPolicy(activeMonth.sesiones, 2);
  }, [activeMonth, expandedMonth]);

  const filteredStudents = useMemo(() => {
    const gd = workingData ?? grupoData;
    if (!gd) return [];
    const list = gd.estudiantes ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((e) => {
      if (!e) return false;
      const name =
        `${e.apellidoPaterno ?? ""} ${e.apellidoMaterno ?? ""} ${e.nombres ?? ""}`.toLowerCase();
      const ci = (e.ci ?? "").toLowerCase();
      return name.includes(q) || ci.includes(q);
    });
  }, [workingData, grupoData, query]);
  const totalGroupStudents =
    (workingData ?? grupoData)?.estudiantes?.length ?? 0;
  const isGroupEmpty = totalGroupStudents === 0;
  const { sesionesTomadas, sesionesTotales, asistenciaGlobal } = useMemo(() => {
    const gd = workingData ?? grupoData;
    if (!gd)
      return { sesionesTomadas: 0, sesionesTotales: 0, asistenciaGlobal: 0 };
    const sesiones = gd.sesiones ?? [];
    const tomadas = sesiones.filter((s) => s && s.estado === "tomada");
    if (tomadas.length === 0) {
      return {
        sesionesTomadas: 0,
        sesionesTotales: sesiones.length,
        asistenciaGlobal: 0,
      };
    }
    let total = 0;
    let asistidos = 0;
    for (const s of tomadas) {
      const r = s.resumen;
      if (!r) continue;
      total += r.presentes + r.faltas + r.atrasos + r.permisos;
      asistidos += r.presentes + r.permisos + r.atrasos * 0.5;
    }
    return {
      sesionesTomadas: tomadas.length,
      sesionesTotales: sesiones.length,
      asistenciaGlobal: total > 0 ? (asistidos / total) * 100 : 0,
    };
  }, [workingData, grupoData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
      Toast.show({ type: "success", text1: "Lista actualizada" });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCell = async (
    sesion: Sesion,
    estudiante: EstudianteAsistencia,
    next: AsistenciaTipo,
  ) => {
    if (!sesion || !estudiante || !workingData) return;
    if (sesion.estado !== "tomada") return;
    const idSesion = sesion.id;
    const idIns = estudiante.id_inscripcion;

    setWorkingData((prev) => {
      if (!prev) return prev;
      const cloned = JSON.parse(JSON.stringify(prev)) as GrupoData;
      const est = cloned.estudiantes.find((e) => e.id_inscripcion === idIns);
      if (est) {
        est.asistencias = est.asistencias || {};
        est.asistencias[String(idSesion)] = {
          tipo: next,
          observacion: est.asistencias[String(idSesion)]?.observacion ?? null,
        };
      }
      const ses = cloned.sesiones.find((s) => s.id === idSesion);
      if (ses) {
        let presentes = 0,
          faltas = 0,
          atrasos = 0,
          permisos = 0,
          sin_marcar = 0;
        for (const e of cloned.estudiantes) {
          const reg = e.asistencias?.[String(idSesion)];
          if (!reg) {
            sin_marcar++;
            continue;
          }
          if (reg.tipo === "Presente") presentes++;
          else if (reg.tipo === "Falta") faltas++;
          else if (reg.tipo === "Atraso") atrasos++;
          else if (reg.tipo === "Permiso") permisos++;
        }
        ses.resumen = {
          presentes,
          faltas,
          atrasos,
          permisos,
          sin_marcar,
        };
      }
      return cloned;
    });

    setChangeLog((prev) => ({
      ...prev,
      [`${idSesion}|${idIns}`]: next,
    }));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    if (!workingData || !hasChanges) return;
    setSavingAll(true);
    const bySession: Record<
      number,
      {
        id_inscripcion: number;
        tipo: AsistenciaTipo;
        observacion?: string | null;
      }[]
    > = {};
    for (const key of Object.keys(changeLog)) {
      const [idSesionStr, idInsStr] = key.split("|");
      const idSesion = Number(idSesionStr);
      const idIns = Number(idInsStr);
      const tipo = changeLog[key];
      const est = workingData.estudiantes.find(
        (e) => e.id_inscripcion === idIns,
      );
      const obs = est?.asistencias?.[String(idSesion)]?.observacion ?? null;
      if (!bySession[idSesion]) bySession[idSesion] = [];
      bySession[idSesion].push({
        id_inscripcion: idIns,
        tipo,
        observacion: obs,
      });
    }

    const orderedIds = Object.keys(bySession)
      .map(Number)
      .sort((a, b) => {
        const sa = workingData.sesiones.find((s) => s.id === a);
        const sb = workingData.sesiones.find((s) => s.id === b);
        const fa = sa?.fecha ?? "";
        const fb = sb?.fecha ?? "";
        if (fa !== fb) return fa.localeCompare(fb);
        return a - b;
      });

    const silentSave = onSaveSesionSilent ?? onSaveSesion;
    try {
      for (const idS of orderedIds) {
        await silentSave(idS, bySession[idS]);
        const ses = workingData.sesiones.find((s) => s.id === idS);
        Toast.show({
          type: "success",
          text1: `Sesión ${ses?.fecha ?? idS} actualizada`,
        });
      }
      await onRefresh();
      Toast.show({ type: "success", text1: "Cambios guardados" });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error al guardar",
        text2: err?.message ?? "Intenta de nuevo.",
      });
    } finally {
      setSavingAll(false);
    }
  };

  const handleDiscard = () => {
    if (grupoData) {
      setWorkingData(JSON.parse(JSON.stringify(grupoData)));
      setChangeLog({});
      setHasChanges(false);
    }
  };

  const handleSessionPress = (sesion: Sesion) => {
    if (!sesion) return;
    setSelectedSesion(sesion);
    setShowControl(true);
  };

  const handleTomarAsistencia = (sesion: Sesion) => {
    if (!sesion) return;
    setSelectedSesion(sesion);
    setShowControl(false);
    setShowFlow(true);
  };

  const handleExportExcel = () => {
    if (gmdId == null) {
      return;
    }
    descargarCsv(gmdId);
  };
  const handleExportPdf = () => {
    if (gmdId == null) return;
    imprimirPdf(gmdId);
  };

  /* ─── Guards de render ─── */
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={{ color: c.textSecondary, marginTop: 12 }}>
          Cargando grupo...
        </Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text
          style={{ color: c.destructive, fontSize: 14, textAlign: "center" }}
        >
          {error}
        </Text>
      </View>
    );
  }
  if (!grupoData) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text
          style={{ color: c.textSecondary, fontSize: 14, textAlign: "center" }}
        >
          No se pudo cargar el grupo.
        </Text>
      </View>
    );
  }
  if (!gmd) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text
          style={{ color: c.destructive, fontSize: 14, textAlign: "center" }}
        >
          El grupo no tiene materia asignada. Contacta al administrador.
        </Text>
      </View>
    );
  }
  if (isGroupEmpty) {
    return (
      <SpreadsheetEmptyStudents
        data={workingData ?? grupoData}
        onBack={onBack}
      />
    );
  }
  /* ─── Branch requires_configuracion ─── */
  if (requiresConfiguracion !== null) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <SpreadsheetToolbar
          data={grupoData}
          query={query}
          onQueryChange={setQuery}
          onBack={onBack}
          onRefresh={handleRefresh}
          onConfigurarFechas={() => setShowFechas(true)}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          loadingExcel={loadingCsv}
          loadingPdf={loadingPdf}
          showConfigurarFechas={requiresConfiguracion === "fechas"}
          gestionCerrada={gestionCerrada}
          sesionesTomadas={0}
          sesionesTotales={0}
          asistenciaGlobal={0}
          refreshing={refreshing}
          hasChanges={hasChanges}
          pendingCount={Object.keys(changeLog).length}
          savingAll={savingAll}
          onSaveAll={handleSaveAll}
          onDiscard={handleDiscard}
        />
        <SpreadsheetEmptyState
          kind={requiresConfiguracion}
          onBack={onBack}
          onConfigurarFechas={() => setShowFechas(true)}
        />
        <FechasMateriaModal
          visible={showFechas}
          fechaInicioSugerida={grupoData.fechas_sugeridas?.fecha_inicio ?? ""}
          fechaFinSugerida={grupoData.fechas_sugeridas?.fecha_fin ?? ""}
          onClose={() => setShowFechas(false)}
          onSave={onSaveMateriaFechas}
        />
      </View>
    );
  }

  /* ─── JSX principal ─── */
  const gridContainerHeight = Math.max(windowH - 240, 320);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <SpreadsheetToolbar
        data={(workingData ?? grupoData) as GrupoData}
        query={query}
        onQueryChange={setQuery}
        onBack={onBack}
        onRefresh={handleRefresh}
        onConfigurarFechas={() => setShowFechas(true)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        loadingExcel={loadingCsv}
        loadingPdf={loadingPdf}
        showConfigurarFechas={false}
        gestionCerrada={gestionCerrada}
        sesionesTomadas={sesionesTomadas}
        sesionesTotales={sesionesTotales}
        asistenciaGlobal={asistenciaGlobal}
        refreshing={refreshing}
        hasChanges={hasChanges}
        pendingCount={Object.keys(changeLog).length}
        savingAll={savingAll}
        onSaveAll={handleSaveAll}
        onDiscard={handleDiscard}
      />

      <View style={{ paddingHorizontal: 12 }}>
        <SpreadsheetMonthTabs
          months={months}
          activeKey={activeMonthKey}
          onChange={(k) => {
            setActiveMonthKey(k);
            setExpandedMonth(null);
          }}
        />
      </View>

      {ocultas > 0 && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ paddingHorizontal: 12, paddingBottom: 6 }}
        >
          <Text
            onPress={() => setExpandedMonth(activeMonthKey)}
            style={{
              color: c.primary,
              fontSize: 11,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            +{ocultas} programadas más — toca para expandir
          </Text>
        </MotiView>
      )}

      <View style={{ flex: 1, paddingHorizontal: 8, paddingBottom: 8 }}>
        <View
          style={[
            styles.gridBox,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          {/* LÓGICA DE ESTADOS VACÍOS */}
          {filteredStudents.length === 0 ? (
            // El grupo SÍ tiene estudiantes, pero la búsqueda no encontró nada
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.searchEmpty}
            >
              {/*  AQUI ENVOLVEMOS EL SVG CON LA ANIMACIÓN DE RESPIRACIÓN  */}
              <MotiView
                from={{ translateY: 0 }}
                animate={{ translateY: -10 }}
                transition={{
                  type: "timing",
                  duration: 2500,
                  loop: true,
                  repeatReverse: true,
                }}
              >
                <EmptyStudentsIllustration maxWidth={220} />
              </MotiView>

              <Text
                style={{
                  color: c.textSecondary,
                  fontSize: 15,
                  fontWeight: "500",
                  textAlign: "center",
                  marginTop: 16,
                  maxWidth: 400,
                }}
              >
                No se encontraron estudiantes que coincidan con &quot;{query}
                &quot;.
              </Text>
            </MotiView>
          ) : (
            // Renderizado normal de la tabla
            <SpreadsheetGrid
              data={(workingData ?? grupoData) as GrupoData}
              sesiones={visibleSessions}
              estudiantes={filteredStudents}
              gestionCerrada={gestionCerrada}
              refreshing={refreshing}
              onCellPress={handleCell}
              onSessionPress={handleSessionPress}
              containerHeight={gridContainerHeight}
            />
          )}
        </View>
      </View>

      <ControlSesionModal
        visible={showControl}
        sesion={selectedSesion}
        gestionCerrada={gestionCerrada}
        onClose={() => setShowControl(false)}
        onTomarAsistencia={handleTomarAsistencia}
        onChangeEstado={async (estado, motivo) => {
          if (!selectedSesion?.id) return;
          await onUpdateEstado(selectedSesion.id, estado, motivo);
        }}
        onReabrir={async () => {
          if (!selectedSesion?.id) return;
          await onReabrir(selectedSesion.id);
        }}
        onLimpiar={async () => {
          if (!selectedSesion?.id) return;
          await onLimpiar(selectedSesion.id);
        }}
      />

      <FechasMateriaModal
        visible={showFechas}
        fechaInicioSugerida={grupoData.fechas_sugeridas?.fecha_inicio ?? ""}
        fechaFinSugerida={grupoData.fechas_sugeridas?.fecha_fin ?? ""}
        onClose={() => setShowFechas(false)}
        onSave={onSaveMateriaFechas}
      />

      <SessionsFlowModal
        visible={showFlow}
        sesion={selectedSesion}
        estudiantes={grupoData.estudiantes ?? []}
        gestionCerrada={gestionCerrada}
        onClose={() => setShowFlow(false)}
        onSave={onSaveSesion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  gridBox: { flex: 1, borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  searchEmpty: {
    // Estilo para el estado vacío de búsqueda
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
