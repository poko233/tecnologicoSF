import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import {
  actualizarElementoEvaluativo,
  crearElementoEvaluativo,
  fetchElementosEvaluativos,
} from "../services/elementosEvaluativos.service";
import { ElementoEvaluativo } from "../types/notas.types";

export function useElementosEvaluativos(idEC: number | null) {
  const [evs, setEvs] = useState<ElementoEvaluativo[]>([]);
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setEvs([]);
    setLoading(false);
  }, []);

  const cargar = useCallback(async () => {
    if (!idEC) return;
    setLoading(true);
    try {
      const data = await fetchElementosEvaluativos(idEC);
      setEvs(data);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.message });
    } finally {
      setLoading(false);
    }
  }, [idEC]);

  const crear = useCallback(
    async (nombre: string, puntaje_maximo?: number): Promise<boolean> => {
      if (!idEC) return false;
      try {
        const nuevo = await crearElementoEvaluativo({
          id_elemento_competencia: idEC,
          nombre,
          puntaje_maximo,
        });
        setEvs((prev) => [...prev, nuevo]);
        Toast.show({ type: "success", text1: "EV creado correctamente" });
        return true;
      } catch (err: any) {
        Toast.show({ type: "error", text1: "Error", text2: err.message });
        return false;
      }
    },
    [idEC],
  );

  const actualizar = useCallback(
    async (
      id: number,
      data: {
        nombre?: string;
        puntaje_maximo?: number;
        estado?: "activo" | "inactivo";
      },
    ): Promise<boolean> => {
      try {
        const actualizado = await actualizarElementoEvaluativo({ id, ...data });
        setEvs((prev) => prev.map((ev) => (ev.id === id ? actualizado : ev)));
        Toast.show({ type: "success", text1: "EV actualizado correctamente" });
        return true;
      } catch (err: any) {
        Toast.show({ type: "error", text1: "Error", text2: err.message });
        return false;
      }
    },
    [],
  );

  const activos = evs.filter((ev) => ev.estado === "activo");
  const inactivos = evs.filter((ev) => ev.estado === "inactivo");

  return { evs, activos, inactivos, loading, cargar, crear, actualizar, reset };
}
