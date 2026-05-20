// hooks/useCarreraCuotas.ts
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { cuotaService } from "../services/cuota.service";
import { Cuota } from "../types/cuota.types";

export const useCarreraCuotas = (
  usuarioId: number | null,
  carreraId: number | null,
) => {
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCuotas = async () => {
    if (!usuarioId || !carreraId) return;
    setLoading(true);
    try {
      const data = await cuotaService.getCuotasByCarrera(usuarioId, carreraId);
      // Normalizar: convertir monto a número
      const normalized = data.map((cuota: any) => ({
        ...cuota,
        monto:
          typeof cuota.monto === "string"
            ? parseFloat(cuota.monto)
            : cuota.monto,
      }));
      setCuotas(normalized);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar las cuotas",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuarioId && carreraId) loadCuotas();
  }, [usuarioId, carreraId]);

  return { cuotas, loading, loadCuotas };
};
