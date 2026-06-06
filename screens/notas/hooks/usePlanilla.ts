import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { fetchPlanilla, guardarPlanilla } from "../services/notas.service";
import { GuardarPayload, PlanillaData } from "../types/notas.types";

export function usePlanilla() {
  const [planilla, setPlanilla] = useState<PlanillaData | null>(null);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async (idGrupo: number) => {
    setLoading(true);
    try {
      const data = await fetchPlanilla(idGrupo);
      setPlanilla(data);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  const guardar = useCallback(async (payload: GuardarPayload) => {
    try {
      const res = await guardarPlanilla(payload);
      if (res.errores.length > 0) {
        Toast.show({
          type: "error",
          text1: res.message,
          text2: res.errores.join("\n"),
          visibilityTime: 6000,
        });
      } else {
        Toast.show({
          type: "success",
          text1: res.message,
        });
      }
      return res;
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error al guardar",
        text2: err.message,
      });
      throw err;
    }
  }, []);

  return { planilla, loading, cargar, guardar };
}
