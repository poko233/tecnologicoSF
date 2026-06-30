// screens/asistencia/AsistenciaScreen.tsx
import { useResponsive } from "@/hooks/useResponsive";
import { useTheme } from "@/theme/useTheme";
import { ArrowLeft, Save, Search } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { GroupSelector } from "./components/GroupSelector";
import { ListModeView } from "./components/ListModeView";
import { ModeSwitcher } from "./components/ModeSwitcher";
import { QuickModeView } from "./components/QuickModeView";
import { ReporteButton } from "./components/ReporteButton";
import { ScheduleSelector } from "./components/ScheduleSelector";
import { LocalAttendanceState, useAsistencia } from "./hooks/useAsistencia";

type ViewMode = "list" | "quick";
type Step = "groups" | "schedule" | "attendance";
type SortOrder = "asc" | "desc";

export function AsistenciaScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { isMobile } = useResponsive();

  const {
    grupos,
    loadingGrupos,
    errorGrupos,
    estudiantesData,
    loadingEstudiantes,
    errorEstudiantes,
    sinEstudiantesMessage,
    fetchEstudiantes,
    selectedHorarioId,
    setSelectedHorarioId,
    localChanges,
    updateLocalChange,
    submitBatch,
    resetToGroupSelection,
    selectedGrupoId,
  } = useAsistencia();

  const [step, setStep] = useState<Step>("groups");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSelectGroup = useCallback(
    (id: number) => {
      fetchEstudiantes(id);
      setStep("schedule");
      setSearchQuery("");
      setSortOrder("asc");
    },
    [fetchEstudiantes],
  );

  const handleSelectSchedule = useCallback(
    (horarioId: number | null) => {
      setSelectedHorarioId(horarioId);
      setStep("attendance");
    },
    [setSelectedHorarioId],
  );

  const handleBackToGroups = useCallback(() => {
    setStep("groups");
    resetToGroupSelection();
  }, [resetToGroupSelection]);

  const handleBackToSchedule = useCallback(() => {
    setStep("schedule");
    setSelectedHorarioId(null);
    setSearchQuery("");
  }, [setSelectedHorarioId]);

  const handleOpenConfirm = useCallback(() => {
    setShowConfirmModal(true);
  }, []);

  const handleConfirmSave = useCallback(async () => {
    setShowConfirmModal(false);
    setSaving(true);
    try {
      const res = await submitBatch();
      if (res) {
        Toast.show({
          type: "success",
          text1: "Asistencia guardada correctamente.",
        });
        handleBackToGroups();
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error al guardar",
        text2: err.message,
      });
    } finally {
      setSaving(false);
    }
  }, [submitBatch, handleBackToGroups]);

  const selectedGroup = grupos.find(
    (g) => g.id_grupo_materia_docente === selectedGrupoId,
  );
  const selectedGroupName = selectedGroup?.grupo ?? "";
  const selectedMateria = selectedGroup?.materia ?? "";

  const localAttendanceState: LocalAttendanceState = localChanges;

  useEffect(() => {
    if (
      step === "schedule" &&
      !loadingEstudiantes &&
      !errorEstudiantes &&
      !sinEstudiantesMessage &&
      estudiantesData &&
      estudiantesData.horarios.length === 0
    ) {
      handleSelectSchedule(null);
      setStep("attendance");
    }
  }, [
    step,
    loadingEstudiantes,
    errorEstudiantes,
    sinEstudiantesMessage,
    estudiantesData,
  ]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: c.border,
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: c.text }]}>
              Registro de Asistencia
            </Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              {step === "groups" &&
                "Seleccione un grupo o cambie de modo para registrar asistencia."}
              {step === "schedule" &&
                "Seleccione el horario correspondiente a la sesión."}
              {step === "attendance" &&
                "Registre la asistencia de los estudiantes."}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: isMobile ? 12 : 0,
              alignItems: "center",
            }}
          >
            {estudiantesData && (
              <ReporteButton
                idGrupoMateriaDocente={selectedGrupoId!}
                grupoNombre={selectedGroupName}
              />
            )}
            {step === "attendance" && (
              <ModeSwitcher currentMode={viewMode} onModeChange={setViewMode} />
            )}
          </View>
        </View>

        {/* Contenido */}
        {loadingGrupos && step === "groups" && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={c.primary} />
          </View>
        )}
        {errorGrupos && step === "groups" && (
          <View style={styles.center}>
            <Text style={{ color: c.destructive }}>{errorGrupos}</Text>
          </View>
        )}

        {step === "groups" && !loadingGrupos && (
          <GroupSelector grupos={grupos} onSelect={handleSelectGroup} />
        )}

        {step === "schedule" && (
          <>
            {loadingEstudiantes && (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={c.primary} />
              </View>
            )}
            {errorEstudiantes && (
              <View style={styles.center}>
                <Text style={{ color: c.destructive, marginBottom: 8 }}>
                  {errorEstudiantes}
                </Text>
                <TouchableOpacity onPress={handleBackToGroups}>
                  <Text style={{ color: c.primary }}>Volver</Text>
                </TouchableOpacity>
              </View>
            )}
            {!loadingEstudiantes &&
              !errorEstudiantes &&
              sinEstudiantesMessage && (
                <View style={styles.center}>
                  <Text
                    style={{
                      color: c.textSecondary,
                      fontSize: 16,
                      marginBottom: 16,
                    }}
                  >
                    {sinEstudiantesMessage}
                  </Text>
                  <TouchableOpacity onPress={handleBackToGroups}>
                    <Text style={{ color: c.primary, fontWeight: "600" }}>
                      Seleccionar otro grupo
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            {!loadingEstudiantes &&
              !errorEstudiantes &&
              !sinEstudiantesMessage &&
              estudiantesData && (
                <ScheduleSelector
                  groupName={selectedGroupName}
                  materia={selectedMateria}
                  horarios={estudiantesData.horarios}
                  onBack={handleBackToGroups}
                  onSelect={handleSelectSchedule}
                />
              )}
          </>
        )}

        {step === "attendance" && estudiantesData && (
          <View style={styles.attendanceContainer}>
            {/* Barra de acción */}
            <View
              style={[
                styles.actionBar,
                {
                  borderBottomColor: c.border,
                  justifyContent: isMobile ? "flex-start" : "space-between",
                },
              ]}
            >
              {/* Izquierda: volver + nombre del grupo */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexShrink: 1,
                }}
              >
                <TouchableOpacity
                  onPress={handleBackToSchedule}
                  style={styles.backBtn}
                >
                  <ArrowLeft size={24} color={c.primary} />
                </TouchableOpacity>
                <Text
                  style={[styles.sessionInfo, { color: c.text }]}
                  numberOfLines={1}
                >
                  {selectedGroupName}{" "}
                  {selectedHorarioId
                    ? (() => {
                        const h = estudiantesData?.horarios.find(
                          (h) => h.idHorario === selectedHorarioId,
                        );
                        return h?.dia
                          ? `${h.dia} ${h.horaInicio.slice(0, 5)}-${h.horaFin.slice(0, 5)}`
                          : `${h?.horaInicio.slice(0, 5)}-${h?.horaFin.slice(0, 5)}`;
                      })()
                    : "Sin horario"}
                </Text>
              </View>

              {/* Centro: buscador (solo en modo lista) */}
              {viewMode === "list" && (
                <View
                  style={[
                    styles.searchBox,
                    { backgroundColor: c.input, borderColor: c.inputBorder },
                  ]}
                >
                  <Search size={16} color={c.textSecondary} />
                  <TextInput
                    placeholder="Buscar estudiante..."
                    placeholderTextColor={c.textMuted}
                    style={[
                      styles.searchInput,
                      { color: c.text, outline: "none" } as any,
                    ]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              )}
              {/* Derecha: botón Guardar */}
              <TouchableOpacity
                onPress={handleOpenConfirm}
                disabled={saving}
                style={[
                  styles.saveBtn,
                  { backgroundColor: saving ? c.disabled : c.primary },
                ]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={c.primaryForeground} />
                ) : (
                  <Save size={18} color={c.primaryForeground} />
                )}
                <Text
                  style={{
                    color: c.primaryForeground,
                    fontWeight: "600",
                    marginLeft: 6,
                  }}
                >
                  {saving ? "Guardando..." : "Guardar Asistencia"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Vistas */}
            <View style={{ flex: 1, position: "relative" }}>
              <AnimatePresence>
                {viewMode === "list" ? (
                  <MotiView
                    key="list"
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -20 }}
                    transition={{ type: "timing", duration: 300 }}
                    style={StyleSheet.absoluteFill}
                  >
                    <ListModeView
                      estudiantesData={estudiantesData}
                      selectedHorarioId={selectedHorarioId}
                      localState={localAttendanceState}
                      onUpdateLocal={updateLocalChange}
                      searchQuery={searchQuery}
                      sortOrder={sortOrder}
                      onSortToggle={() =>
                        setSortOrder((prev) =>
                          prev === "asc" ? "desc" : "asc",
                        )
                      }
                    />
                  </MotiView>
                ) : (
                  <MotiView
                    key="quick"
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -20 }}
                    transition={{ type: "timing", duration: 300 }}
                    style={StyleSheet.absoluteFill}
                  >
                    <QuickModeView
                      estudiantesData={estudiantesData}
                      selectedHorarioId={selectedHorarioId}
                      localState={localAttendanceState}
                      onUpdateLocal={updateLocalChange}
                      onFinish={() => setViewMode("list")}
                    />
                  </MotiView>
                )}
              </AnimatePresence>
            </View>
          </View>
        )}
      </View>

      <ConfirmationModal
        visible={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    gap: 12,
  },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 14, marginTop: 4 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  attendanceContainer: { flex: 1 },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: { padding: 4 },
  sessionInfo: { fontSize: 14, fontWeight: "600", flexShrink: 1 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    height: 32,
    flexShrink: 1,
    minWidth: 120,
    maxWidth: 250,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    marginLeft: 6,
    padding: 0,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
});
