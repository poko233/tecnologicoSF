import { useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
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

const ESPACIO_ENTRE_TARJETAS = 14;
const COLUMNAS_DESKTOP = 3;
const COLUMNAS_MOVIL = 1;

export default function DocenteScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width < 750;
  const columnasPorFila = isMobile
    ? COLUMNAS_MOVIL
    : COLUMNAS_DESKTOP;

  const [confirmDocente, setConfirmDocente] = useState<Docente | null>(null);
  const [anchoGrid, setAnchoGrid] = useState(0);

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

  const manejarLayoutGrid = (event: LayoutChangeEvent) => {
    const nuevoAncho = Math.floor(event.nativeEvent.layout.width);

    setAnchoGrid((anchoAnterior) => {
      if (anchoAnterior === nuevoAncho) {
        return anchoAnterior;
      }

      return nuevoAncho;
    });
  };

  const anchoTarjeta =
    anchoGrid > 0
      ? Math.floor(
          (anchoGrid -
            ESPACIO_ENTRE_TARJETAS * (columnasPorFila - 1)) /
            columnasPorFila,
        )
      : 0;

  if (loading) {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator color={theme.colors.primary} size="large" />

        <ThemedText
          style={[styles.loadingText, { color: theme.colors.text }]}
        >
          Cargando docentes...
        </ThemedText>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[
          styles.screen,
          { backgroundColor: theme.colors.background },
        ]}
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

        <View
          style={styles.grid}
          onLayout={manejarLayoutGrid}
        >
          {docentesFiltrados.map((docente) => (
            <View
              key={docente.idDocente}
              style={[
                styles.tarjetaContainer,
                anchoTarjeta > 0
                  ? { width: anchoTarjeta }
                  : styles.tarjetaContainerInicial,
              ]}
            >
              <DocenteCard
                docente={docente}
                loadingEstado={estadoLoadingId === docente.idDocente}
                onEdit={() => abrirEditar(docente)}
                onToggleEstado={() => setConfirmDocente(docente)}
              />
            </View>
          ))}

          {docentesFiltrados.length === 0 && (
            <View
              style={[
                styles.emptyBox,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.emptyText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No se encontraron docentes.
              </ThemedText>
            </View>
          )}
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
        loading={
          !!confirmDocente &&
          estadoLoadingId === confirmDocente.idDocente
        }
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
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ESPACIO_ENTRE_TARJETAS,
    paddingBottom: 12,
  },

  tarjetaContainer: {
    flexGrow: 0,
    flexShrink: 0,
  },

  tarjetaContainerInicial: {
    width: "100%",
  },

  emptyBox: {
    width: "100%",
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  emptyText: {
    fontSize: 14,
    fontWeight: "800",
  },
});