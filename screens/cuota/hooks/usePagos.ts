// screens/cuota/hooks/usePagos.ts
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { pagoService } from "../services/pago.service";
import { Pago } from "../types/pago.types";

export const usePagos = (usuarioId: number | null) => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPagos = async () => {
    if (!usuarioId) {
      setPagos([]);
      return;
    }
    setLoading(true);
    try {
      const response = await pagoService.getPagos({
        idUsuario: usuarioId,
        per_page: 50,
      });
      // La respuesta del backend es { success, data: { data: Pago[] } }
      const data = (response as any).data?.data ?? (response as any).data ?? [];
      setPagos(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "No se pudieron cargar los pagos",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPagos();
  }, [usuarioId]);

  return { pagos, loading, refresh: loadPagos };
};
