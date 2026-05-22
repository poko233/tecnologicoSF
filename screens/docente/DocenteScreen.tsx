import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../components/ThemedText";
import { useTheme } from "../../contexts/ThemeContext";

import ConfirmEstadoDocenteModal from "./components/ConfirmEstadoDocenteModal";
import DocenteCard from "./components/DocenteCard";
import DocenteFormModal from "./components/DocenteFormModal";
import DocenteSearchBar from "./components/DocenteSearchBar";
import DocenteStats from "./components/DocenteStats";
import { useDocentes } from "./hooks/useDocentes";
import { Docente } from "./types/docente.types";

export default function DocenteScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 750;

  const [confirmDocente, setConfirmDocente] = useState<Docente | null>(null);

  const {
    docentes,
    docentesFiltrados,
    loading,
    saving,
    estadoLoadingId,

    search,
    setSearch,

    modalVisible,
    setModalVisible,

    editingDocente,

    serverErrors,
    clearServerError,

    abrirCrear,
    abrirEditar,
    guardarDocente,
    desactivarDocente,
    activarDocente,
  } = useDocentes();

  const confirmarCambioEstado = async () => {
    if (!confirmDocente) return;

    if (confirmDocente.estadoDocente === "activo") {
      await desactivarDocente(confirmDocente);
    } else {
      await activarDocente(confirmDocente);
    }

    setConfirmDocente(null);
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />

        <ThemedText style={[styles.loadingText, { color: theme.colors.text }]}>
          Cargando docentes...
        </ThemedText>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DocenteSearchBar
          search={search}
          onSearchChange={setSearch}
          onAdd={abrirCrear}
          isMobile={isMobile}
        />

        <DocenteStats docentes={docentes} isMobile={isMobile} />

        <View style={styles.grid}>
          {docentesFiltrados.map((docente) => (
            <DocenteCard
              key={docente.idDocente}
              docente={docente}
              loadingEstado={estadoLoadingId === docente.idDocente}
              onEdit={() => abrirEditar(docente)}
              onToggleEstado={() => setConfirmDocente(docente)}
            />
          ))}
        </View>
      </ScrollView>

      <DocenteFormModal
        visible={modalVisible}
        saving={saving}
        docente={editingDocente}
        serverErrors={serverErrors}
        onClearServerError={clearServerError}
        onClose={() => setModalVisible(false)}
        onSave={guardarDocente}
      />

      <ConfirmEstadoDocenteModal
        visible={!!confirmDocente}
        docente={confirmDocente}
        loading={!!confirmDocente && estadoLoadingId === confirmDocente.idDocente}
        onClose={() => setConfirmDocente(null)}
        onConfirm={confirmarCambioEstado}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 22,
    gap: 16,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "800",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
});