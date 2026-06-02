import { useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";

import { ThemeSelector } from "../../components/ThemeSelector";
import { ThemedText } from "../../components/ThemedText";
import { useTheme } from "../../theme/useTheme";

import EditarEstudianteModal from "./components/EditarEstudianteModal";
import EstudiantesTable from "./components/EstudianteTable";
import InscribirModal from "./components/InscribirModal";
import RevisarModal from "./components/RevisarModal";

import { useAsignaciones } from "./hooks/useAsignaciones";
import { Estudiante, EstudianteForm } from "./types/asignaciones.types";

export default function AsignacionesScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 850;

  const {
    loading,
    estudiantes,
    estudianteSeleccionado,
    setEstudianteSeleccionado,

    detalle,
    materias,

    loadingDetalle,
    loadingMaterias,
    inscribiendo,
    guardando,

    cargarEstudiantes,
    cargarDetalle,
    cargarMaterias,
    inscribir,
    actualizarEstudiante,
  } = useAsignaciones();

  const [inscribirVisible, setInscribirVisible] = useState(false);
  const [revisarVisible, setRevisarVisible] = useState(false);
  const [editarVisible, setEditarVisible] = useState(false);

  const abrirInscribir = async (estudiante: Estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setInscribirVisible(true);
    await cargarDetalle(estudiante.id);
    await cargarMaterias(estudiante.id);
  };

  const abrirRevisar = async (estudiante: Estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setRevisarVisible(true);
    await cargarDetalle(estudiante.id);
  };

  const abrirEditar = async (estudiante: Estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setEditarVisible(true);
    await cargarDetalle(estudiante.id);
  };

  const confirmarInscripcion = async () => {
    if (!estudianteSeleccionado) return;

    const idCarrera = detalle?.carreras?.[0]?.idCarrera;
    const response = await inscribir(estudianteSeleccionado.id, idCarrera);

    if (response) {
      setInscribirVisible(false);
    }
  };

  const guardarEdicion = async (form: EstudianteForm) => {
    if (!estudianteSeleccionado) return;

    const ok = await actualizarEstudiante(estudianteSeleccionado.id, form);

    if (ok) {
      setEditarVisible(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={cargarEstudiantes} />
        }
      >
        <View style={[styles.topBar, isMobile && styles.topBarMobile]}>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.title}>Asignaciones</ThemedText>
            <ThemedText style={{ color: theme.colors.textSecondary }}>
              Inscripción automática de materias del semestre 1, revisión y edición de estudiantes.
            </ThemedText>
          </View>

          <ThemeSelector />
        </View>

        <EstudiantesTable
          estudiantes={estudiantes}
          loading={loading}
          onInscribir={abrirInscribir}
          onRevisar={abrirRevisar}
          onEditar={abrirEditar}
        />
      </ScrollView>

      <InscribirModal
        visible={inscribirVisible}
        estudiante={estudianteSeleccionado}
        materias={materias}
        loading={loadingMaterias}
        inscribiendo={inscribiendo}
        onClose={() => setInscribirVisible(false)}
        onConfirm={confirmarInscripcion}
      />

      <RevisarModal
        visible={revisarVisible}
        estudiante={estudianteSeleccionado}
        detalle={detalle}
        loading={loadingDetalle}
        onClose={() => setRevisarVisible(false)}
      />

      <EditarEstudianteModal
        visible={editarVisible}
        estudiante={estudianteSeleccionado}
        detalle={detalle}
        loading={loadingDetalle}
        guardando={guardando}
        onClose={() => setEditarVisible(false)}
        onSave={guardarEdicion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 18,
    gap: 18,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  topBarMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
  },
});