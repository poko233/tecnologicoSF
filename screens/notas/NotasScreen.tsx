import { useTheme } from "@/theme/useTheme";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ConfirmStatusModal } from "./components/ConfirmStatusModal";
import { ECPanel } from "./components/ECPanel";
import { GradingSheet } from "./components/GradingSheet";
import { GroupList } from "./components/GroupList";
import { ManageEVModal } from "./components/ManageEVModal";
import { useNotasGroups } from "./hooks/useNotasGroups";
import { GrupoMateriaDocente } from "./types/notas.types";

type Screen = "groups" | "grading";

export function NotasScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { grupos, loading, error, recargar } = useNotasGroups();

  const [screen, setScreen] = useState<Screen>("groups");
  const [selectedGroup, setSelectedGroup] =
    useState<GrupoMateriaDocente | null>(null);
  const [showECPanel, setShowECPanel] = useState(false);
  const [manageEV, setManageEV] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [selectedECId, setSelectedECId] = useState<number | null>(null);
  const [noEVWarning, setNoEVWarning] = useState(false);

  const [evScores, setEvScores] = useState<
    Record<number, Record<number, Record<number, number | null>>>
  >({});

  const handleSelectGroup = useCallback(
    (id: number) => {
      const grupo = grupos.find((g) => g.id_grupo_materia_docente === id);
      if (grupo) {
        setSelectedGroup(grupo);
        setShowECPanel(true);
      }
    },
    [grupos],
  );

  const handleCloseECPanel = useCallback(() => setShowECPanel(false), []);
  const handleGoToGrading = useCallback(() => {
    setShowECPanel(false);
    setScreen("grading");
  }, []);

  const handleBackFromGrading = useCallback(() => {
    setScreen("groups");
    setShowECPanel(true);
    setSelectedECId(null);
  }, []);
  const handleBackToMainSheet = useCallback(() => setSelectedECId(null), []);

  const handleNavigateToEC = (ecId: number) => {
    // Verificar si el EC tiene EVs. planilla no está disponible aquí, así que lo comprobaremos en GradingSheet y emitiremos un callback.
    // Alternativamente, pasamos una prop al GradingSheet para que avise.
    // De momento, usaremos el estado noEVWarning controlado por GradingSheet.
    // En GradingSheet, cuando se intente navegar y no tenga EVs, se llamará a onMissingEVs.
    setSelectedECId(ecId);
  };

  const updateEVScores = useCallback(
    (
      idInscripcion: number,
      ecId: number,
      evId: number,
      puntaje: number | null,
    ) => {
      setEvScores((prev) => ({
        ...prev,
        [idInscripcion]: {
          ...prev[idInscripcion],
          [ecId]: {
            ...prev[idInscripcion]?.[ecId],
            [evId]: puntaje,
          },
        },
      }));
    },
    [],
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={[styles.center, { backgroundColor: c.background }]}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.center, { backgroundColor: c.background }]}>
          <Text style={{ color: c.destructive, marginBottom: 12 }}>
            {error}
          </Text>
          <Text
            style={{ color: c.primary, fontWeight: "600" }}
            onPress={recargar}
          >
            Reintentar
          </Text>
        </View>
      );
    }

    if (screen === "grading" && selectedGroup) {
      if (selectedECId !== null) {
        return (
          <GradingSheet
            idGrupo={selectedGroup.id_grupo_materia_docente}
            grupoNombre={selectedGroup.grupo}
            gestion={selectedGroup.gestion}
            materiaNombre={selectedGroup.materia}
            notaAprobacion={51}
            mode="detalle"
            selectedECId={selectedECId}
            onBack={handleBackToMainSheet}
            evScores={evScores}
            onUpdateEVScores={updateEVScores}
          />
        );
      }
      return (
        <GradingSheet
          idGrupo={selectedGroup.id_grupo_materia_docente}
          grupoNombre={selectedGroup.grupo}
          gestion={selectedGroup.gestion}
          materiaNombre={selectedGroup.materia}
          notaAprobacion={51}
          onBack={handleBackFromGrading}
          onNavigateToEC={(ecId) => setSelectedECId(ecId)}
          evScores={evScores}
          onUpdateEVScores={updateEVScores}
        />
      );
    }

    return (
      <>
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.text }]}>Mis Grupos</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            Gestiona tus asignaturas y elementos de competencia.
          </Text>
        </View>
        <GroupList grupos={grupos} onSelect={handleSelectGroup} />
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={styles.screenContainer}>
        {/* Contenido principal (siempre ocupa todo el espacio) */}
        <View style={styles.content}>{renderContent()}</View>

        {/* Overlay del panel de EC (sin afectar al contenido) */}
        {selectedGroup && (
          <ECPanel
            visible={showECPanel}
            idGrupo={selectedGroup.id_grupo_materia_docente}
            grupoNombre={selectedGroup.grupo}
            materiaNombre={selectedGroup.materia}
            onClose={handleCloseECPanel}
            onGoToGrading={handleGoToGrading}
            onManageEV={(ec) => setManageEV(ec)}
          />
        )}
        <ManageEVModal
          visible={manageEV !== null}
          ec={manageEV}
          onClose={() => setManageEV(null)}
        />
        <ConfirmStatusModal
          visible={noEVWarning}
          title="Sin elementos evaluativos"
          message="Este Elemento de Competencia no tiene elementos evaluativos. Créelos desde el panel de gestión antes de entrar al detalle."
          confirmLabel="ENTENDIDO"
          hideCancel
          onCancel={() => setNoEVWarning(false)}
          onConfirm={() => setNoEVWarning(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  screenContainer: {
    flex: 1,
    position: "relative",
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
