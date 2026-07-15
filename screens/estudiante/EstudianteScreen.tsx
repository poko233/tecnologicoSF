import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../components/ThemedText";
import { httpClient } from "../../http/httpClient";
import { useTheme } from "../../theme/useTheme";

import EstudianteEditModal from "./components/EstudianteEditModal";
import EstudiantesTable from "./components/EstudiantesTable";
import HistorialEstudianteModal from "./components/HistorialEstudianteModal";
import { useEstudiantes } from "./hooks/useEstudiantes";
import { createEstudianteScreenStyles } from "./styles/estudianteScreen.styles";
import {
  EstudianteForm,
  EstudianteUsuario,
  FotoEstudianteArchivo,
  HistorialEstudianteResponse,
} from "./types/estudiante.types";

export type FiltrosEstudiantes = {
  tipo: string;
  idCarrera: string;
  nivel: string;
};

export default function EstudianteScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const styles = useMemo(
    () => createEstudianteScreenStyles(theme.colors),
    [theme.colors],
  );

  const {
    estudiantes,
    loading,
    cargandoDetalle,
    cargandoHistorialEstudiante,
    guardando,
    subiendoFoto,
    cargarEstudiantes,
    cargarDetalleEstudiante,
    cargarHistorialEstudiante,
    guardarDatosEstudiante,
    guardarFotoEstudiante,
  } = useEstudiantes();

  const [estudianteSeleccionado, setEstudianteSeleccionado] =
    useState<EstudianteUsuario | null>(null);

  const [estudianteHistorial, setEstudianteHistorial] =
    useState<EstudianteUsuario | null>(null);

  const [historialEstudiante, setHistorialEstudiante] =
    useState<HistorialEstudianteResponse | null>(null);

  const [historialEstudianteVisible, setHistorialEstudianteVisible] =
    useState(false);

  const [filtros, setFiltros] = useState<FiltrosEstudiantes>({
    tipo: "",
    idCarrera: "",
    nivel: "",
  });

  const abrirDetalle = async (estudiante: EstudianteUsuario) => {
    setEstudianteSeleccionado(estudiante);

    const detalle = await cargarDetalleEstudiante(estudiante.id);

    if (detalle) {
      setEstudianteSeleccionado(detalle);
    }
  };

  const cerrarDetalle = () => {
    if (guardando || subiendoFoto) return;

    setEstudianteSeleccionado(null);
  };

  const abrirHistorialEstudiante = async (estudiante: EstudianteUsuario) => {
    setEstudianteHistorial(estudiante);
    setHistorialEstudiante(null);
    setHistorialEstudianteVisible(true);

    const data = await cargarHistorialEstudiante(estudiante.id, true);

    if (data) {
      setHistorialEstudiante(data);
      setEstudianteHistorial(data.estudiante);
    }
  };

  const cerrarHistorialEstudiante = () => {
    if (cargandoHistorialEstudiante) return;

    setHistorialEstudianteVisible(false);
    setHistorialEstudiante(null);
    setEstudianteHistorial(null);
  };

  const guardarDatos = async (id: number, form: EstudianteForm) => {
    const actualizado = await guardarDatosEstudiante(id, form);

    if (actualizado) {
      setEstudianteSeleccionado(actualizado);
    }

    return actualizado;
  };

  const guardarFoto = async (id: number, archivo: FotoEstudianteArchivo) => {
    const actualizado = await guardarFotoEstudiante(id, archivo);

    if (actualizado) {
      setEstudianteSeleccionado(actualizado);
    }

    return actualizado;
  };

  const recargarDetalle = async (idUsuario: number) => {
    const actualizado = await cargarDetalleEstudiante(idUsuario, true);

    if (actualizado) {
      setEstudianteSeleccionado(actualizado);
    }
  };

  const abrirReporteDocumentos = async () => {
    const nuevaVentana =
      Platform.OS === "web" ? window.open("", "_blank") : null;

    try {
      const params = new URLSearchParams();

      if (filtros.tipo) params.append("tipo", filtros.tipo);
      if (filtros.idCarrera) params.append("idCarrera", filtros.idCarrera);
      if (filtros.nivel) params.append("nivel", filtros.nivel);

      const query = params.toString();

      const path = query
        ? `/api/estudiantes-usuarios/reporte-documentos-faltantes?${query}`
        : "/api/estudiantes-usuarios/reporte-documentos-faltantes";

      const response = await httpClient._rawFetch(path, "application/pdf");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      if (Platform.OS === "web") {
        if (nuevaVentana) {
          nuevaVentana.location.href = blobUrl;
        } else {
          window.open(blobUrl, "_blank");
        }

        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 60000);
      }
    } catch (error: any) {
      if (nuevaVentana) {
        nuevaVentana.close();
      }

      console.error(error);

      Toast.show({
        type: "error",
        text1: "No se pudo generar el reporte",
        text2: error?.message || "Intenta nuevamente.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.kicker}>Estudiantes</ThemedText>

              <ThemedText style={styles.title}>
                Información de estudiantes
              </ThemedText>

              <ThemedText style={styles.subtitle}>
                Administra los datos personales, contacto, referencia,
                documentos, foto, código QR e historial del estudiante.
              </ThemedText>
            </View>

            <Pressable
              onPress={abrirReporteDocumentos}
              style={({ pressed }) => [
                styles.reportBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.78 : 1,
                },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color={colors.primaryForeground}
              />

              <ThemedText style={styles.reportBtnText}>
                Reporte de documentos adeudados
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <EstudiantesTable
          estudiantes={estudiantes}
          loading={loading}
          filtros={filtros}
          onFiltrosChange={setFiltros}
          onVerDetalle={abrirDetalle}
          onVerHistorialEstudiante={abrirHistorialEstudiante}
          onRefresh={() => cargarEstudiantes(true)}
        />
      </ScrollView>

      <EstudianteEditModal
        visible={!!estudianteSeleccionado}
        estudiante={estudianteSeleccionado}
        cargandoDetalle={cargandoDetalle}
        guardando={guardando}
        subiendoFoto={subiendoFoto}
        onClose={cerrarDetalle}
        onSave={guardarDatos}
        onFotoActualizada={guardarFoto}
        onDocumentoSubido={recargarDetalle}
      />

      <HistorialEstudianteModal
        visible={historialEstudianteVisible}
        estudiante={estudianteHistorial}
        historial={historialEstudiante}
        loading={cargandoHistorialEstudiante}
        onClose={cerrarHistorialEstudiante}
      />
    </View>
  );
}