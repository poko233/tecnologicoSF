import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";

import {
  obtenerHistorialBajas,
  registrarBaja,
} from "../services/baja.service";
import {
  BajaPayload,
  InventarioBaja,
} from "../types/baja.types";

export function useBajas() {
  const [bajas, setBajas] = useState<InventarioBaja[]>([]);
  const [loading, setLoading] = useState(false);
  const [registrando, setRegistrando] = useState(false);

  const cargarHistorial = useCallback(async (filtros?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    concepto?: string;
    idProducto?: number;
  }) => {
    try {
      setLoading(true);

      const response = await obtenerHistorialBajas(filtros);

      setBajas(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "No se pudo cargar el historial",
        text2: error?.message || "Revisa la conexión con el servidor.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const crearBaja = useCallback(
    async (payload: BajaPayload): Promise<boolean> => {
      try {
        setRegistrando(true);

        const response = await registrarBaja(payload);

        Toast.show({
          type: "success",
          text1: "Baja registrada",
          text2: response.message || "La baja se registró correctamente",
        });

        await cargarHistorial();

        return true;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "No se pudo registrar la baja",
          text2: error?.message || "Verifica los datos e intenta nuevamente.",
        });

        return false;
      } finally {
        setRegistrando(false);
      }
    },
    [cargarHistorial],
  );

  return {
    bajas,
    loading,
    registrando,
    cargarHistorial,
    crearBaja,
  };
}
