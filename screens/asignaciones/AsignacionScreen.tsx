import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
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
import { getToken } from "../../storage/secureStorage";
import { useTheme } from "../../theme/useTheme";

import EstudiantesTable from "./components/EstudianteTable";
import InscribirModal from "./components/InscribirModal";

import { useAsignaciones } from "./hooks/useAsignaciones";
import {
  Estudiante,
  TurnoInscripcion,
} from "./types/asignaciones.types";

type CarreraFiltro = {
  idCarrera: number;
  nombreCarrera: string;
  codigo?: string | null;
};

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

    cargarEstudiantes,
    cargarDetalle,
    cargarMaterias,
    inscribir,
    limpiarSeleccion,
  } = useAsignaciones();

  const [inscribirVisible, setInscribirVisible] = useState(false);

  const [carreras, setCarreras] = useState<CarreraFiltro[]>([]);
  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [carreraSeleccionadaId, setCarreraSeleccionadaId] = useState<
    number | null
  >(null);

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

  const cargarCarreras = useCallback(async () => {
    try {
      setLoadingCarreras(true);

      const token = await getToken();

      const response = await fetch(`${BASE_URL}/api/asignaciones/carreras`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      const data = (await response.json().catch(() => null)) as
        | CarreraFiltro[]
        | {
            carreras?: CarreraFiltro[];
            data?: CarreraFiltro[];
            message?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(
          !Array.isArray(data)
            ? data?.message || "No se pudieron cargar las carreras."
            : "No se pudieron cargar las carreras.",
        );
      }

      const lista = Array.isArray(data)
        ? data
        : data?.carreras ?? data?.data ?? [];

      setCarreras(
        lista
          .map((carrera) => ({
            idCarrera: Number(carrera.idCarrera),
            nombreCarrera: carrera.nombreCarrera,
            codigo: carrera.codigo ?? null,
          }))
          .filter(
            (carrera) =>
              Number.isFinite(carrera.idCarrera) &&
              carrera.idCarrera > 0 &&
              Boolean(carrera.nombreCarrera),
          ),
      );
    } catch (error) {
      console.error("Error al cargar carreras:", error);

      Toast.show({
        type: "error",
        text1: "No se pudieron cargar las carreras",
        text2:
          error instanceof Error
            ? error.message
            : "Verifica la conexión con el servidor.",
      });
    } finally {
      setLoadingCarreras(false);
    }
  }, []);

  useEffect(() => {
    void cargarCarreras();
  }, [cargarCarreras]);

  const seleccionarCarreraTabla = async (idCarrera: number) => {
    if (!idCarrera) {
      return;
    }

    limpiarSeleccion(false);
    setEstudianteSeleccionado(null);
    setCarreraSeleccionadaId(idCarrera);

    await cargarEstudiantes(idCarrera);
  };

  const refrescarDatos = async () => {
    await cargarCarreras();

    if (carreraSeleccionadaId) {
      await cargarEstudiantes(carreraSeleccionadaId);
    }
  };

  const abrirInscribir = async (estudiante: Estudiante) => {
    limpiarSeleccion(false);

    setEstudianteSeleccionado(estudiante);
    setInscribirVisible(true);

    await cargarDetalle(estudiante.id);
  };

  const seleccionarCarrera = async (idCarrera: number) => {
    if (!estudianteSeleccionado) {
      return;
    }

    await cargarMaterias(estudianteSeleccionado.id, idCarrera);
  };

  const abrirPdfEstudiante = async (estudiante: Estudiante) => {
    try {
      const url = `${BASE_URL}/api/inscripcion/formulario-registro/${estudiante.id}/pdf`;

      await Linking.openURL(url);
    } catch (error) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo abrir el formulario de registro.",
      });
    }
  };

  const cerrarInscribir = () => {
    setInscribirVisible(false);
    setEstudianteSeleccionado(null);
    limpiarSeleccion(false);
  };

  const confirmarInscripcion = async (
    idCarrera: number,
    turno: TurnoInscripcion,
  ) => {
    if (!estudianteSeleccionado) {
      return;
    }

    const response = await inscribir(
      estudianteSeleccionado.id,
      idCarrera,
      turno,
    );

    if (response) {
      cerrarInscribir();

      if (carreraSeleccionadaId) {
        await cargarEstudiantes(carreraSeleccionadaId);
      }
    }
  };

  const textoContador =
    carreraSeleccionadaId === null
      ? "Selecciona una carrera"
      : `${estudiantes.length} estudiantes`;

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
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: iconBg,
                  },
                ]}
              >
                <Ionicons
                  name="git-branch-outline"
                  size={26}
                  color={theme.colors.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.title, { color: strongText }]}>
                  Asignaciones
                </ThemedText>

                <ThemedText style={[styles.subtitle, { color: mutedText }]}>
                  Selecciona una carrera para consultar estudiantes, revisar
                  materias e inscribirlo.
                </ThemedText>
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
                style={[
                  styles.counterText,
                  {
                    color: theme.colors.primary,
                  },
                ]}
              >
                {textoContador}
              </ThemedText>
            </View>
          </View>
        </View>

        <EstudiantesTable
          estudiantes={estudiantes}
          carreras={carreras}
          carreraSeleccionadaId={carreraSeleccionadaId}
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
        materias={materias}
        loading={loadingDetalle}
        loadingMaterias={loadingMaterias}
        inscribiendo={inscribiendo}
        onClose={cerrarInscribir}
        onSelectCarrera={seleccionarCarrera}
        onConfirm={confirmarInscripcion}
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
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
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