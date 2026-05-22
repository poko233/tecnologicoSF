import { useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";
import { asignacionDocenteService } from "../services/asignacionDocenteService";
import {
    AsignacionDocente,
    Docente,
    Grupo,
    Materia,
} from "../types/asignacionDocente.types";

export function useAsignacionDocente() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);

  const [searchMateria, setSearchMateria] = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada] =
    useState<Materia | null>(null);

  const [idDocenteSeleccionado, setIdDocenteSeleccionado] = useState<
    number | null
  >(null);

  const [gruposSeleccionados, setGruposSeleccionados] = useState<number[]>([]);
  const [docenteModalVisible, setDocenteModalVisible] = useState(false);

  const asignacionesMateria = useMemo(() => {
    if (!materiaSeleccionada) return [];

    return asignaciones.filter(
      (item) => item.idMateria === materiaSeleccionada.idMateria
    );
  }, [asignaciones, materiaSeleccionada]);

  const seleccionarMateria = (
    materia: Materia,
    asignacionesActuales = asignaciones
  ) => {
    setMateriaSeleccionada(materia);

    const asignacionesDeMateria = asignacionesActuales.filter(
      (item) => item.idMateria === materia.idMateria
    );

    if (asignacionesDeMateria.length > 0) {
      setIdDocenteSeleccionado(asignacionesDeMateria[0].idDocente);
      setGruposSeleccionados(asignacionesDeMateria.map((item) => item.idGrupo));
      return;
    }

    setIdDocenteSeleccionado(null);
    setGruposSeleccionados([]);
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const response = await asignacionDocenteService.listar();

      const materiasResponse = response.materias ?? [];
      const gruposResponse = response.grupos ?? [];
      const docentesResponse = response.docentes ?? [];
      const asignacionesResponse = response.asignaciones ?? [];

      setMaterias(materiasResponse);
      setGrupos(gruposResponse);
      setDocentes(docentesResponse);
      setAsignaciones(asignacionesResponse);

      if (!materiaSeleccionada && materiasResponse.length > 0) {
        seleccionarMateria(materiasResponse[0], asignacionesResponse);
      }
    } catch (error) {
      console.error("Error cargando asignación docente:", error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar materias, grupos y docentes",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const toggleGrupo = (idGrupo: number) => {
    setGruposSeleccionados((prev) => {
      if (prev.includes(idGrupo)) {
        return prev.filter((id) => id !== idGrupo);
      }

      return [...prev, idGrupo];
    });
  };

  const guardarAsignacion = async () => {
    if (!materiaSeleccionada) {
      Toast.show({
        type: "info",
        text1: "Selecciona una materia",
      });
      return;
    }

    if (!idDocenteSeleccionado) {
      Toast.show({
        type: "info",
        text1: "Selecciona un docente",
      });
      return;
    }

    if (gruposSeleccionados.length === 0) {
      Toast.show({
        type: "info",
        text1: "Selecciona al menos un grupo",
      });
      return;
    }

    try {
      setSaving(true);

      await asignacionDocenteService.guardar({
        idMateria: materiaSeleccionada.idMateria,
        idDocente: idDocenteSeleccionado,
        grupos: gruposSeleccionados,
      });

      const response = await asignacionDocenteService.listar();
      const nuevasAsignaciones = response.asignaciones ?? [];

      setAsignaciones(nuevasAsignaciones);
      seleccionarMateria(materiaSeleccionada, nuevasAsignaciones);

      Toast.show({
        type: "success",
        text1: "Guardado",
        text2: "Asignación guardada correctamente",
      });
    } catch (error) {
      console.error("Error guardando asignación:", error);

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

      await asignacionDocenteService.eliminarPorMateria(
        materiaSeleccionada.idMateria
      );

      const response = await asignacionDocenteService.listar();

      setAsignaciones(response.asignaciones ?? []);
      setIdDocenteSeleccionado(null);
      setGruposSeleccionados([]);

      Toast.show({
        type: "success",
        text1: "Asignación eliminada",
      });
    } catch (error) {
      console.error("Error eliminando asignación:", error);

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

    materias,
    grupos,
    docentes,
    asignaciones,
    asignacionesMateria,

    searchMateria,
    setSearchMateria,

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
    cargarDatos,
  };
}