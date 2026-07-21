import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../components/ThemedText";
import { BASE_URL } from "../../http/httpClient";
import { useTheme } from "../../theme/useTheme";

import EstudiantesTable from "./components/EstudianteTable";
import InscribirModal from "./components/InscribirModal";
import { useAsignaciones } from "./hooks/useAsignaciones";
import {
  Estudiante,
  SeleccionMateriaInscripcion,
} from "./types/asignaciones.types";

export default function AsignacionesScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 850;

  const {
    loading,
    loadingCarreras,
    carreras,
    estudiantes,
    estudianteSeleccionado,
    setEstudianteSeleccionado,
    detalle,
    materias,
    materiasPendientesAnteriores,
    loadingDetalle,
    loadingMaterias,
    guardandoInscripcion,
    carreraActual,
    nivelActual,
    nivelMateriasActual,
    notaAprobacionActual,
    cargarCarreras,
    cargarEstudiantes,
    cargarDetalle,
    cargarMaterias,
    actualizarInscripcion,
    limpiarSeleccion,
  } = useAsignaciones();

  const [inscribirVisible, setInscribirVisible] = useState(false);

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const heroBg = isDark
    ? "rgba(15,23,42,0.72)"
    : "rgba(248,250,252,0.9)";
  const heroBorder = isDark
    ? "rgba(255,255,255,0.10)"
    : "rgba(15,23,42,0.10)";
  const iconBg = isDark ? "rgba(59,130,246,0.18)" : "#DBEAFE";

  useEffect(() => {
    void cargarCarreras();
  }, [cargarCarreras]);

  const carreraSeleccionada = useMemo(() => {
    if (!carreraActual) return null;

    return (
      carreras.find(
        (carrera) => Number(carrera.idCarrera) === Number(carreraActual),
      ) ?? null
    );
  }, [carreras, carreraActual]);

  const textoNivel = useMemo(() => {
    if (!carreraSeleccionada || !nivelActual) return "";

    const tipoNivel = String(carreraSeleccionada.tipoNivel ?? "").trim();

    if (tipoNivel) return `${tipoNivel} ${nivelActual}`;

    const regimen = String(carreraSeleccionada.regimen ?? "").toUpperCase();

    if (regimen.includes("ANUAL")) return `Año ${nivelActual}`;
    if (regimen.includes("MENSUAL")) return `Mes ${nivelActual}`;

    return `Semestre ${nivelActual}`;
  }, [carreraSeleccionada, nivelActual]);

  const textoContador = useMemo(() => {
    if (!carreraActual) return "Selecciona una carrera";
    if (!nivelActual) return "Selecciona un nivel";

    return `${estudiantes.length} estudiante${
      estudiantes.length === 1 ? "" : "s"
    }`;
  }, [carreraActual, nivelActual, estudiantes.length]);

  const refrescarDatos = useCallback(async () => {
    await cargarCarreras();

    if (carreraActual) {
      await cargarEstudiantes(carreraActual, nivelActual);
    }
  }, [cargarCarreras, cargarEstudiantes, carreraActual, nivelActual]);

  const seleccionarCarreraTabla = useCallback(
    async (idCarrera: number, nivel?: number | null) => {
      if (!idCarrera || Number(idCarrera) <= 0) return;

      limpiarSeleccion(false);
      setEstudianteSeleccionado(null);

      await cargarEstudiantes(Number(idCarrera), nivel ?? null);
    },
    [cargarEstudiantes, limpiarSeleccion, setEstudianteSeleccionado],
  );

  const abrirInscribir = useCallback(
    async (estudiante: Estudiante) => {
      if (!carreraActual || !nivelActual) {
        Toast.show({
          type: "error",
          text1: "Filtros requeridos",
          text2:
            "Selecciona una carrera y un semestre, año o mes antes de continuar.",
        });
        return;
      }

      limpiarSeleccion(false);
      setEstudianteSeleccionado(estudiante);
      setInscribirVisible(true);

      await cargarDetalle(estudiante.id);
    },
    [
      carreraActual,
      nivelActual,
      limpiarSeleccion,
      setEstudianteSeleccionado,
      cargarDetalle,
    ],
  );

  const cargarMateriasModal = useCallback(
    async (idCarrera: number, nivel: number) => {
      if (!estudianteSeleccionado) return;

      await cargarMaterias(estudianteSeleccionado.id, idCarrera, nivel);
    },
    [estudianteSeleccionado, cargarMaterias],
  );

  const abrirPdfEstudiante = useCallback(async (estudiante: Estudiante) => {
    try {
      const url =
        `${BASE_URL}/api/inscripcion/formulario-registro/` +
        `${estudiante.id}/pdf?t=${Date.now()}`;

      await Linking.openURL(url);
    } catch (error) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo abrir el formulario de registro.",
      });
    }
  }, []);

  const cerrarInscribir = useCallback(() => {
    setInscribirVisible(false);
    setEstudianteSeleccionado(null);
    limpiarSeleccion(false);
  }, [limpiarSeleccion, setEstudianteSeleccionado]);

  const confirmarCambios = useCallback(
    async (
      idCarrera: number,
      agregar: SeleccionMateriaInscripcion[],
      quitar: SeleccionMateriaInscripcion[],
    ) => {
      if (!estudianteSeleccionado) return;

      const response = await actualizarInscripcion(
        estudianteSeleccionado.id,
        idCarrera,
        agregar,
        quitar,
      );

      if (response) {
        cerrarInscribir();
      }
    },
    [estudianteSeleccionado, actualizarInscripcion, cerrarInscribir],
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isMobile && styles.contentMobile,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loading || loadingCarreras}
            onRefresh={refrescarDatos}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View
          style={[
            styles.hero,
            {
              backgroundColor: heroBg,
              borderColor: heroBorder,
            },
          ]}
        >
          <View style={[styles.topBar, isMobile && styles.topBarMobile]}>
            <View style={styles.titleBox}>
              <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                <Ionicons
                  name="git-branch-outline"
                  size={26}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.titleContent}>
                <ThemedText style={[styles.title, { color: strongText }]}>
                  Asignaciones
                </ThemedText>

                <ThemedText style={[styles.subtitle, { color: mutedText }]}>
                  La inscripción puede editarse en cualquier momento. Puedes
                  agregar o retirar materias de cualquier nivel disponible.
                </ThemedText>

                {carreraSeleccionada && nivelActual && (
                  <ThemedText
                    style={[styles.selectedInfo, { color: mutedText }]}
                    numberOfLines={1}
                  >
                    {carreraSeleccionada.nombreCarrera} · {textoNivel} · Nota
                    mínima {Number(carreraSeleccionada.notaAprobacion ?? 51)}
                  </ThemedText>
                )}
              </View>
            </View>

            <View
              style={[
                styles.counterPill,
                {
                  backgroundColor: isDark
                    ? "rgba(59,130,246,0.14)"
                    : "#EFF6FF",
                  borderColor: isDark
                    ? "rgba(59,130,246,0.30)"
                    : "#BFDBFE",
                },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={18}
                color={theme.colors.primary}
              />

              <ThemedText
                style={[styles.counterText, { color: theme.colors.primary }]}
              >
                {textoContador}
              </ThemedText>
            </View>
          </View>
        </View>

        <EstudiantesTable
          estudiantes={estudiantes}
          carreras={carreras}
          carreraSeleccionadaId={carreraActual}
          nivelSeleccionadoId={nivelActual}
          loading={loading}
          loadingCarreras={loadingCarreras}
          onSeleccionarCarrera={seleccionarCarreraTabla}
          onInscribir={abrirInscribir}
          onVerPdf={abrirPdfEstudiante}
        />
      </ScrollView>

      <InscribirModal
        visible={inscribirVisible}
        estudiante={estudianteSeleccionado}
        carreras={detalle?.carreras ?? []}
        inscripcionesActuales={detalle?.inscripciones ?? []}
        materias={materias}
        materiasPendientesAnteriores={materiasPendientesAnteriores}
        loading={loadingDetalle}
        loadingMaterias={loadingMaterias}
        guardando={guardandoInscripcion}
        carreraInicialId={carreraActual}
        nivelInicial={nivelMateriasActual ?? nivelActual}
        notaAprobacion={notaAprobacionActual}
        onClose={cerrarInscribir}
        onLoadMaterias={cargarMateriasModal}
        onConfirm={confirmarCambios}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 22,
    gap: 18,
  },
  contentMobile: {
    padding: 14,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
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
  titleBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minWidth: 0,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContent: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  selectedInfo: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "900",
  },
  counterPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
  },
  counterText: {
    fontSize: 13,
    fontWeight: "900",
  },
});