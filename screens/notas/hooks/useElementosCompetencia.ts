import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import {
  actualizarElementoCompetencia,
  crearElementoCompetencia,
  fetchElementosCompetencia,
} from "../services/elementos.service";
import { ElementoCompetencia } from "../types/notas.types";

export function useElementosCompetencia(idGrupo: number | null) {
  const [ecs, setEcs] = useState<ElementoCompetencia[]>([]);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    if (!idGrupo) return;
    setLoading(true);
    try {
      const data = await fetchElementosCompetencia(idGrupo);
      setEcs(data);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.message });
    } finally {
      setLoading(false);
    }
  }, [idGrupo]);

  const crear = useCallback(
    async (nombre: string, observaciones?: string): Promise<boolean> => {
      if (!idGrupo) return false;
      try {
        const nuevo = await crearElementoCompetencia({
          id_grupo_materia_docente: idGrupo,
          nombre,
          observaciones,
        });
        setEcs((prev) => [...prev, nuevo]);
        Toast.show({
          type: "success",
          text1: "Creado correctamente",
          text2: `Elemento de Competencia "${nuevo.nombre}" creado`,
        });
        return true;
      } catch (err: any) {
        Toast.show({ type: "error", text1: "Error", text2: err.message });
        return false;
      }
    },
    [idGrupo],
  );

  const actualizar = useCallback(
    async (
      id: number,
      data: {
        nombre?: string;
        observaciones?: string;
        estado?: "activo" | "inactivo";
      },
    ): Promise<boolean> => {
      try {
        const actualizado = await actualizarElementoCompetencia({
          id,
          ...data,
        });
        setEcs((prev) => prev.map((ec) => (ec.id === id ? actualizado : ec)));
        Toast.show({
          type: "success",
          text1: "Actualizado correctamente",
          text2: `Elemento de Competencia "${actualizado.nombre}" ${actualizado.estado === "activo" ? "activado" : "inactivado"}`,
        });
        return true;
      } catch (err: any) {
        Toast.show({ type: "error", text1: "Error", text2: err.message });
        return false;
      }
    },
    [],
  );

  const activos = ecs.filter((ec) => ec.estado === "activo");
  const inactivos = ecs.filter((ec) => ec.estado === "inactivo");

  return { ecs, activos, inactivos, loading, cargar, crear, actualizar };
}
