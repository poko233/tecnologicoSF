import React, { useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { httpClient } from "../../../http/httpClient";
import { useTheme } from "../../../theme/useTheme";
import {
    Carrera,
    Grupo,
    Materia,
} from "../types/inscripcion.types";
import CarrerasTable from "./CarrerasTable";
import GruposModal from "./GruposModal";
import MateriasModal from "./MateriasModal";
import TipoInscripcionSelector from "./TipoInscripcionSelector";

type Props = {
  idEstudiante: number | null;
  onFinish?: () => void;
};

export default function PasoAcademico({ idEstudiante, onFinish }: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const [tipo, setTipo] = useState<"carrera" | "curso">("carrera");

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  const [carreraSeleccionada, setCarreraSeleccionada] =
    useState<Carrera | null>(null);
  const [materiaSeleccionada, setMateriaSeleccionada] =
    useState<Materia | null>(null);

  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [inscribiendo, setInscribiendo] = useState(false);

  const [showMaterias, setShowMaterias] = useState(false);
  const [showGrupos, setShowGrupos] = useState(false);

  const cargarCarreras = async () => {
    try {
      setLoadingCarreras(true);

      const response = await httpClient.getAuth<{ carreras: Carrera[] }>(
        "/api/carreras"
      );

      const data = response.carreras ?? [];

      const filtradas =
        tipo === "carrera"
          ? data.filter((item) => item.denominacionTituloProfesional)
          : data.filter((item) => !item.denominacionTituloProfesional);

      setCarreras(filtradas);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar las carreras.",
      });
    } finally {
      setLoadingCarreras(false);
    }
  };

  const cargarMaterias = async (carrera: Carrera) => {
    try {
      setCarreraSeleccionada(carrera);
      setShowMaterias(true);
      setLoadingMaterias(true);
      setMaterias([]);

      const response = await httpClient.getAuth<{ materias: Materia[] }>(
        `/api/carreras/${carrera.idCarrera}/materias`
      );

      setMaterias(response.materias ?? []);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar las materias.",
      });
    } finally {
      setLoadingMaterias(false);
    }
  };

  const cargarGrupos = async (materia: Materia) => {
    try {
      setMateriaSeleccionada(materia);
      setShowGrupos(true);
      setLoadingGrupos(true);
      setGrupos([]);

      const response = await httpClient.getAuth<{ grupos: Grupo[] }>(
        `/api/materias/${materia.idMateria}/grupos`
      );

      setGrupos(response.grupos ?? []);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los grupos.",
      });
    } finally {
      setLoadingGrupos(false);
    }
  };

  const inscribirGrupo = async (grupo: Grupo) => {
    if (!idEstudiante) {
      Toast.show({
        type: "error",
        text1: "Falta estudiante",
        text2: "Primero debes registrar los datos del estudiante.",
      });
      return;
    }

    if (!carreraSeleccionada) {
      Toast.show({
        type: "error",
        text1: "Falta carrera",
      });
      return;
    }

    try {
      setInscribiendo(true);

      await httpClient.postAuth("/api/inscripciones-academicas", {
        idUsuario: idEstudiante,
        idCarrera: carreraSeleccionada.idCarrera,
        idGrupo: grupo.idGrupo,
      });

      Toast.show({
        type: "success",
        text1: "Inscripción completada",
        text2: `${carreraSeleccionada.nombreCarrera} - ${grupo.nombre}`,
      });

      setShowGrupos(false);
      setShowMaterias(false);

      onFinish?.();
    } catch (error) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "No se pudo inscribir",
        text2: "Verifica que el estudiante no esté inscrito en ese grupo.",
      });
    } finally {
      setInscribiendo(false);
    }
  };

  useEffect(() => {
    cargarCarreras();
  }, [tipo]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.layout,
          {
            flexDirection: isDesktop ? "row" : "column",
          },
        ]}
      >
        <View
          style={[
            styles.left,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <TipoInscripcionSelector tipo={tipo} onChange={setTipo} />
        </View>

        <View
          style={[
            styles.right,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <ThemedText style={styles.title}>
              Oferta Académica Disponible
            </ThemedText>

            <ThemedText style={styles.subtitle}>
              Selecciona una opción y revisa sus materias para inscribir al grupo.
            </ThemedText>
          </View>

          <CarrerasTable
            carreras={carreras}
            loading={loadingCarreras}
            onVerMaterias={cargarMaterias}
          />
        </View>
      </View>

      <MateriasModal
        visible={showMaterias}
        carrera={carreraSeleccionada}
        materias={materias}
        loading={loadingMaterias}
        onClose={() => setShowMaterias(false)}
        onVerGrupos={cargarGrupos}
      />

      <GruposModal
        visible={showGrupos}
        materia={materiaSeleccionada}
        grupos={grupos}
        loading={loadingGrupos}
        inscribiendo={inscribiendo}
        onClose={() => setShowGrupos(false)}
        onInscribir={inscribirGrupo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  layout: {
    gap: 18,
  },
  left: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    width: "100%",
    maxWidth: 330,
  },
  right: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    minHeight: 420,
  },
  header: {
    marginBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.75,
  },
});