// screens/arqueo/hooks/useArqueoTransacciones.ts
import { useCallback, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { transaccionService } from "../services/transaccion.service";
import { Transaccion } from "../types/transaccion.types";

export const useArqueoTransacciones = (arqueoId: number | null) => {
  const [ingresos, setIngresos] = useState<Transaccion[]>([]);
  const [egresos, setEgresos] = useState<Transaccion[]>([]);
  const [loadingTransacciones, setLoadingTransacciones] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null); //  Para saber qué fila está cargando

  const loadingRef = useRef(false);

  const loadTransacciones = useCallback(
    async (tipo: "ingresos" | "egresos" | "INGRESO" | "EGRESO") => {
      if (!arqueoId) {
        setIngresos([]);
        setEgresos([]);
        return;
      }

      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoadingTransacciones(true);

      try {
        const isIngreso = tipo === "ingresos" || tipo === "INGRESO";
        if (isIngreso) {
          const response = await transaccionService.getIngresos(arqueoId);
          setIngresos(response.data || []);
        } else {
          const response = await transaccionService.getEgresos(arqueoId);
          setEgresos(response.data || []);
        }
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: err.message || "Error al cargar transacciones",
        });
      } finally {
        setLoadingTransacciones(false);
        loadingRef.current = false;
      }
    },
    [arqueoId],
  );

  const createTransaccion = useCallback(
    async (tipo: "INGRESO" | "EGRESO", payload: any) => {
      if (!arqueoId) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No hay un arqueo abierto",
        });
        return;
      }
      try {
        if (tipo === "INGRESO") {
          await transaccionService.createIngreso(arqueoId, payload);
          Toast.show({
            type: "success",
            text1: "Éxito",
            text2: "Ingreso registrado correctamente",
          });
        } else {
          await transaccionService.createEgreso(arqueoId, payload);
          Toast.show({
            type: "success",
            text1: "Éxito",
            text2: "Egreso registrado correctamente",
          });
        }
        const target = tipo === "INGRESO" ? "ingresos" : "egresos";
        await loadTransacciones(target);
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: err.message || "Error al registrar transacción",
        });
      }
    },
    [arqueoId, loadTransacciones],
  );

  //  NUEVO: Actualizar estado de una transacción específica
  const updateTransaccionEstado = useCallback(
    async (
      tipo: "INGRESO" | "EGRESO",
      id: number,
      nuevoEstado: "VALIDO" | "ANULADO",
    ) => {
      if (!arqueoId) return;
      setUpdatingId(id); // Marcamos el ID que se está actualizando para deshabilitar el botón
      try {
        if (tipo === "INGRESO") {
          await transaccionService.updateIngresoEstado(
            arqueoId,
            id,
            nuevoEstado,
          );
        } else {
          await transaccionService.updateEgresoEstado(
            arqueoId,
            id,
            nuevoEstado,
          );
        }
        Toast.show({
          type: "success",
          text1: "Éxito",
          text2: `Transacción ${nuevoEstado === "ANULADO" ? "anulada" : "validada"} correctamente`,
        });
        // Recargar la lista correspondiente
        const target = tipo === "INGRESO" ? "ingresos" : "egresos";
        await loadTransacciones(target);
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            err.message || "No se pudo cambiar el estado de la transacción",
        });
      } finally {
        setUpdatingId(null);
      }
    },
    [arqueoId, loadTransacciones],
  );

  return {
    ingresos,
    egresos,
    loadingTransacciones,
    updatingId, //  Exponemos el ID que está cargando
    loadTransacciones,
    createTransaccion,
    updateTransaccionEstado, //  Exponemos la función de actualización
  };
};
