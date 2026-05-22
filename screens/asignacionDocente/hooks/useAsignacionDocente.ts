import { useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";

import { httpClient } from "../../../http/httpClient";
import {
    AsignacionDocente,
    AsignacionDocenteResponse,
    Carrera,
    Grupo,
    Materia,
} from "../types/asignacionDocente.types";

export function useAsignacionDocente() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);

  const [searchCarrera, setSearchCarrera] = useState("");
  const [searchMateria, setSearchMateria] = useState("");

  const [carreraSeleccionada, setCarreraSeleccionada] =
    useState<Carrera | null>(null);

  const [materiaSeleccionada, setMateriaSeleccionada] =
    useState<Materia | null>(null);

  const [idDocenteSeleccionado, setIdDocenteSeleccionado] =
    useState<number | null>(null);

  const [gruposSeleccionados, setGruposSeleccionados] = useState<number[]>([]);

  const [docenteModalVisible, setDocenteModalVisible] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const response = await httpClient.getAuth<AsignacionDocenteResponse>(
        "/api/asignacion-docente"
      );

      setCarreras(response.carreras ?? []);
      setMaterias(response.materias ?? []);
      setGrupos(response.grupos ?? []);
      setDocentes(response.docentes ?? []);
      setAsignaciones(response.asignaciones ?? []);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cargar la asignación docente",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const carrerasFiltradas = useMemo(() => {
    const text = searchCarrera.trim().toLowerCase();

    if (!text) return carreras;

    return carreras.filter((carrera) => {
      const nombre = carrera.nombreCarrera ?? carrera.nombre ?? "";
      const codigo = carrera.codigoCarrera ?? carrera.codigo ?? "";

      return (
        nombre.toLowerCase().includes(text) ||
        codigo.toLowerCase().includes(text)
      );
    });
  }, [carreras, searchCarrera]);

  const materiasCarrera = useMemo(() => {
    if (!carreraSeleccionada) return [];

    return materias.filter(
      (materia) => materia.idCarrera === carreraSeleccionada.idCarrera
    );
  }, [materias, carreraSeleccionada]);

  const materiasCarreraFiltradas = useMemo(() => {
    const text = searchMateria.trim().toLowerCase();

    if (!text) return materiasCarrera;

    return materiasCarrera.filter((materia) => {
      const nombre = materia.nombreMateria ?? materia.nombre ?? "";
      const codigo = materia.codigo ?? materia.sigla ?? "";

      return (
        nombre.toLowerCase().includes(text) ||
        codigo.toLowerCase().includes(text)
      );
    });
  }, [materiasCarrera, searchMateria]);

  const materiasPorSemestre = useMemo(() => {
    const map = new Map<number, Materia[]>();

    materiasCarreraFiltradas.forEach((materia) => {
      const semestre = Number(materia.semestre ?? 0);
      const list = map.get(semestre) ?? [];
      list.push(materia);
      map.set(semestre, list);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([semestre, items]) => ({
        semestre,
        materias: items.sort((a, b) =>
          String(a.nombreMateria ?? a.nombre ?? "").localeCompare(
            String(b.nombreMateria ?? b.nombre ?? "")
          )
        ),
      }));
  }, [materiasCarreraFiltradas]);

  const asignacionesMateria = useMemo(() => {
    if (!materiaSeleccionada) return [];

    return asignaciones.filter(
      (item) => item.idMateria === materiaSeleccionada.idMateria
    );
  }, [asignaciones, materiaSeleccionada]);

  const seleccionarCarrera = (carrera: Carrera) => {
    setCarreraSeleccionada(carrera);
    setMateriaSeleccionada(null);
    setIdDocenteSeleccionado(null);
    setGruposSeleccionados([]);
    setSearchMateria("");
  };

  const seleccionarMateria = (materia: Materia) => {
    setMateriaSeleccionada(materia);

    const actuales = asignaciones.filter(
      (item) => item.idMateria === materia.idMateria
    );

    if (actuales.length > 0) {
      setIdDocenteSeleccionado(actuales[0].idDocente);
      setGruposSeleccionados(actuales.map((item) => item.idGrupo));
    } else {
      setIdDocenteSeleccionado(null);
      setGruposSeleccionados([]);
    }
  };

  const toggleGrupo = (idGrupo: number) => {
    setGruposSeleccionados((prev) =>
      prev.includes(idGrupo)
        ? prev.filter((id) => id !== idGrupo)
        : [...prev, idGrupo]
    );
  };

  const guardarAsignacion = async () => {
    if (!materiaSeleccionada) {
      Toast.show({
        type: "error",
        text1: "Selecciona una materia",
      });
      return;
    }

    if (!idDocenteSeleccionado) {
      Toast.show({
        type: "error",
        text1: "Selecciona un docente",
      });
      return;
    }

    if (gruposSeleccionados.length === 0) {
      Toast.show({
        type: "error",
        text1: "Selecciona al menos un grupo",
      });
      return;
    }

    try {
      setSaving(true);

      await httpClient.postAuth("/api/asignacion-docente", {
        idMateria: materiaSeleccionada.idMateria,
        idDocente: idDocenteSeleccionado,
        grupos: gruposSeleccionados,
      });

      Toast.show({
        type: "success",
        text1: "Asignación guardada",
        text2: "El docente fue asignado correctamente",
      });

      await cargarDatos();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo guardar la asignación",
      });
    } finally {
      setSaving(false);
    }
  };

  const limpiarAsignacion = async () => {
    if (!materiaSeleccionada) return;

    try {
      setSaving(true);

      await httpClient.deleteAuth(
        `/api/asignacion-docente/materia/${materiaSeleccionada.idMateria}`
      );

      setIdDocenteSeleccionado(null);
      setGruposSeleccionados([]);

      Toast.show({
        type: "success",
        text1: "Asignación limpiada",
      });

      await cargarDatos();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo limpiar la asignación",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,

    carreras,
    carrerasFiltradas,
    materias,
    materiasPorSemestre,
    grupos,
    docentes,
    asignaciones,
    asignacionesMateria,

    searchCarrera,
    setSearchCarrera,
    searchMateria,
    setSearchMateria,

    carreraSeleccionada,
    seleccionarCarrera,

    materiaSeleccionada,
    seleccionarMateria,

    idDocenteSeleccionado,
    setIdDocenteSeleccionado,

    gruposSeleccionados,
    toggleGrupo,

    docenteModalVisible,
    setDocenteModalVisible,

    guardarAsignacion,
    limpiarAsignacion,
  };
}