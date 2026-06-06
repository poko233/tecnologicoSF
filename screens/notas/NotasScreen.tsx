import { useTheme } from "@/theme/useTheme";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ECPanel } from "./components/ECPanel";
import { GradingSheet } from "./components/GradingSheet";
import { GroupList } from "./components/GroupList";
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

  const handleCloseECPanel = useCallback(() => {
    setShowECPanel(false);
  }, []);

  const handleGoToGrading = useCallback(() => {
    setShowECPanel(false);
    setScreen("grading");
  }, []);

  const handleBackFromGrading = useCallback(() => {
    setScreen("groups");
    setShowECPanel(true);
  }, []);

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
      return (
        <GradingSheet
          idGrupo={selectedGroup.id_grupo_materia_docente}
          grupoNombre={selectedGroup.grupo}
          gestion={selectedGroup.gestion}
          materiaNombre={selectedGroup.materia}
          onBack={handleBackFromGrading}
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
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  screenContainer: {
    flex: 1,
    position: "relative", // permite posicionar overlays absolutos dentro
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
