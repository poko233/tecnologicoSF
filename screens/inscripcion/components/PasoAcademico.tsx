import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { httpClient } from "../../../http/httpClient";
import { useTheme } from "../../../theme/useTheme";

import {
    Carrera,
    Grupo,
    GrupoSeleccionado,
    Materia,
} from "../types/inscripcion.types";

import CarrerasTable from "./CarrerasTable";
import GruposModal from "./GruposModal";
import MateriasModal from "./MateriasModal";
import TipoInscripcionSelector from "./TipoInscripcionSelector";

type Props = {
  idEstudiante: number | null;
  gruposSeleccionados: GrupoSeleccionado[];
  setGruposSeleccionados: (grupos: GrupoSeleccionado[]) => void;
  onFinish?: () => void;
};

export default function PasoAcademico({
  idEstudiante,
  gruposSeleccionados,
  setGruposSeleccionados,
  onFinish,
}: Props) {
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
    ? data.filter((item) => item.tipo === "Carrera")
    : data.filter((item) => item.tipo !== "Carrera");

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

      const materiasDisponibles = (response.materias ?? []).filter(
  (materia) => !materia.idPrerequisito
);

setMaterias(materiasDisponibles);
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

  const grupoYaSeleccionado = (idGrupo: number) => {
    return gruposSeleccionados.some((grupo) => grupo.idGrupo === idGrupo);
  };

  const toggleGrupo = (grupo: Grupo) => {
  const existe = grupoYaSeleccionado(grupo.idGrupo);

  if (existe) {
    setGruposSeleccionados(
      gruposSeleccionados.filter((item) => item.idGrupo !== grupo.idGrupo)
    );
    return;
  }

  const nuevoGrupo: GrupoSeleccionado = {
    ...grupo,
    nombreMateria: materiaSeleccionada?.nombreMateria,
    nombreCarrera: carreraSeleccionada?.nombreCarrera,
  };

  setGruposSeleccionados([...gruposSeleccionados, nuevoGrupo]);

  setShowGrupos(false);
  setShowMaterias(true);
};

  const quitarGrupo = (idGrupo: number) => {
    setGruposSeleccionados(
      gruposSeleccionados.filter((grupo) => grupo.idGrupo !== idGrupo)
    );
  };

  const inscribirGruposSeleccionados = async () => {
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
        text2: "Selecciona una carrera.",
      });
      return;
    }

    if (gruposSeleccionados.length === 0) {
      Toast.show({
        type: "error",
        text1: "Sin grupos",
        text2: "Selecciona al menos un grupo.",
      });
      return;
    }

    try {
      setInscribiendo(true);

      await Promise.all(
        gruposSeleccionados.map((grupo) =>
          httpClient.postAuth("/api/inscripciones-academicas", {
            idUsuario: idEstudiante,
            idCarrera: carreraSeleccionada.idCarrera,
            idGrupo: grupo.idGrupo,
          })
        )
      );

      Toast.show({
        type: "success",
        text1: "Inscripción académica completada",
        text2: `${gruposSeleccionados.length} grupo(s) inscrito(s).`,
      });

      setShowGrupos(false);
      setShowMaterias(false);

      onFinish?.();
    } catch (error) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "No se pudo inscribir",
        text2: "Verifica que el estudiante no esté inscrito en algún grupo.",
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
              Selecciona una opción, revisa sus materias y elige uno o más
              grupos.
            </ThemedText>
          </View>

          <CarrerasTable
            carreras={carreras}
            loading={loadingCarreras}
            onVerMaterias={cargarMaterias}
          />
        </View>
      </View>

      <View
        style={[
          styles.selectedBox,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <ThemedText style={styles.selectedTitle}>
          Grupos seleccionados ({gruposSeleccionados.length})
        </ThemedText>

        {gruposSeleccionados.length === 0 ? (
          <ThemedText style={styles.emptyText}>
            Todavía no seleccionaste ningún grupo.
          </ThemedText>
        ) : (
          <View style={styles.selectedList}>
            {gruposSeleccionados.map((grupo) => (
  <View
    key={grupo.idGrupo}
    style={[
      styles.selectedItem,
      {
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
      },
    ]}
  >
    <View style={{ flex: 1 }}>
      <ThemedText style={styles.groupName}>
        {grupo.nombreCarrera ?? "Sin carrera"}
      </ThemedText>

      <ThemedText style={styles.groupInfo}>
        Materia: {grupo.nombreMateria ?? "Sin materia"}
      </ThemedText>

      <ThemedText style={styles.groupInfo}>
        Grupo: {grupo.nombre} · Paralelo {grupo.paralelo}
      </ThemedText>

      <ThemedText style={styles.groupInfo}>
        Turno: {grupo.turno} · Horario: {grupo.horario}
      </ThemedText>
    </View>

    <Pressable
      onPress={() => quitarGrupo(grupo.idGrupo)}
      style={[
        styles.removeButton,
        { borderColor: theme.colors.border },
      ]}
    >
      <ThemedText style={{ color: theme.colors.primary }}>
        Quitar
      </ThemedText>
    </Pressable>
  </View>
))}
          </View>
        )}

        <Pressable
          onPress={inscribirGruposSeleccionados}
          disabled={inscribiendo || gruposSeleccionados.length === 0}
          style={[
            styles.finishButton,
            {
              backgroundColor: theme.colors.primary,
              opacity:
                inscribiendo || gruposSeleccionados.length === 0 ? 0.55 : 1,
            },
          ]}
        >
          <ThemedText style={styles.finishText}>
            {inscribiendo ? "Inscribiendo..." : "Continuar con documentos"}
          </ThemedText>
        </Pressable>
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
        gruposSeleccionados={gruposSeleccionados}
        onClose={() => setShowGrupos(false)}
        onToggleGrupo={toggleGrupo}
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
  selectedBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    opacity: 0.7,
  },
  selectedList: {
    gap: 10,
  },
  selectedItem: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  groupName: {
    fontSize: 15,
    fontWeight: "900",
  },
  groupInfo: {
    fontSize: 13,
    opacity: 0.75,
    marginTop: 3,
  },
  removeButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  finishButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  finishText: {
    color: "#fff",
    fontWeight: "900",
  },
});