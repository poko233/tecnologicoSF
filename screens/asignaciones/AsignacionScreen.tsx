import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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
import { Estudiante } from "./types/asignaciones.types";

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

  const isDark =
    theme.colors.background.toLowerCase().includes("0") ||
    theme.colors.card.toLowerCase().includes("1");

  const strongText = isDark ? "#F8FAFC" : theme.colors.text;
  const mutedText = isDark ? "#CBD5E1" : theme.colors.textSecondary;
  const heroBg = isDark ? "rgba(15,23,42,0.72)" : "rgba(248,250,252,0.9)";
  const heroBorder = isDark
    ? "rgba(255,255,255,0.10)"
    : "rgba(15,23,42,0.10)";
  const iconBg = isDark ? "rgba(59,130,246,0.18)" : "#DBEAFE";

  const abrirInscribir = async (estudiante: Estudiante) => {
    limpiarSeleccion(true);
    setEstudianteSeleccionado(estudiante);
    setInscribirVisible(true);

    await Promise.all([
      cargarDetalle(estudiante.id),
      cargarMaterias(estudiante.id),
    ]);
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

  const confirmarInscripcion = async () => {
    if (!estudianteSeleccionado) return;

    const idCarrera = detalle?.carreras?.[0]?.idCarrera;
    const response = await inscribir(estudianteSeleccionado.id, idCarrera);

    if (response) {
      cerrarInscribir();
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isMobile && styles.contentMobile,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={cargarEstudiantes}
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
                  Inscripción automática de materias del semestre 1 y formulario
                  de registro de estudiantes.
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
                {estudiantes.length} estudiantes
              </ThemedText>
            </View>
          </View>
        </View>

        <EstudiantesTable
          estudiantes={estudiantes}
          loading={loading}
          onInscribir={abrirInscribir}
          onVerPdf={abrirPdfEstudiante}
        />
      </ScrollView>

      <InscribirModal
        key={`inscribir-${estudianteSeleccionado?.id ?? "empty"}`}
        visible={inscribirVisible}
        estudiante={estudianteSeleccionado}
        materias={materias}
        loading={loadingDetalle || loadingMaterias}
        inscribiendo={inscribiendo}
        onClose={cerrarInscribir}
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