import { InventarioVenta } from "@/screens/ventas/types/venta.types";
import { useCallback, useMemo, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { transaccionService } from "../services/transaccion.service";
import { Pago } from "../types/arqueo.types";
import { IngresoCombinado, Transaccion } from "../types/transaccion.types";

const tipoMap: Record<string, string> = {
  MATRICULA: "MATRICULA",
  MENSUAL: "MENSUALIDAD",
  CONVALIDACION: "CONVALIDACION",
};

export const useArqueoTransacciones = (
  arqueoId: number | null | undefined,
  pagos: Pago[] = [],
  ventas: InventarioVenta[] = [],
  cajeroUsername?: string | null,
) => {
  const [ingresos, setIngresos] = useState<Transaccion[]>([]);
  const [egresos, setEgresos] = useState<Transaccion[]>([]);
  const [loadingTransacciones, setLoadingTransacciones] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  const updateTransaccionEstado = useCallback(
    async (
      tipo: "INGRESO" | "EGRESO",
      id: number,
      nuevoEstado: "VALIDO" | "ANULADO",
    ) => {
      if (!arqueoId) return;
      setUpdatingId(id);
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
          text2: `Transacción ${
            nuevoEstado === "ANULADO" ? "anulada" : "validada"
          } correctamente`,
        });
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

  const ingresosCombinados = useMemo<IngresoCombinado[]>(() => {
    const list: IngresoCombinado[] = [];

    pagos.forEach((pago) => {
      const concepto =
        pago.cuotas && pago.cuotas.length > 0
          ? [
              ...new Set(pago.cuotas.map((c) => tipoMap[c.tipo] || c.tipo)),
            ].join(" + ")
          : "Pago";
      list.push({
        id: `pago-${pago.id}`,
        fecha: pago.fecha,
        fecha_registro: pago.fecha,
        concepto,
        metodo: pago.metodo,
        monto: pago.monto,
        estado: "VALIDO",
        tipo: "Pago Estudiante",
        origen: "pago",
        idOriginal: pago.id,
        usuario: cajeroUsername || "Cajero",
        comprobante: pago.comprobante,
        detalle: pago.observacion || null,
        tipo_transaccion: concepto,
      });
    });

    ingresos.forEach((ing) => {
      if (ing.estado === "ANULADO") return;
      list.push({
        id: `ingreso-${ing.id}`,
        fecha: ing.fecha_registro,
        fecha_registro: ing.fecha_registro,
        concepto: ing.tipo_transaccion || ing.detalle || "Sin concepto",
        metodo: ing.metodo,
        monto: ing.monto,
        estado: ing.estado,
        tipo: "Ingreso Manual",
        origen: "ingreso",
        idOriginal: ing.id,
        usuario: ing.usuario,
        comprobante: ing.comprobante,
        detalle: ing.detalle,
        tipo_transaccion: ing.tipo_transaccion,
      });
    });

    ventas.forEach((venta) => {
      if (venta.estado !== "PAGADO") return;
      const monto = parseFloat(venta.total.toString()) || 0;
      const concepto = "VENTA";
      const realId = venta.idVenta || venta.id || 0;

      list.push({
        id: `venta-${realId}`,
        fecha: venta.fechaVenta || venta.created_at || "",
        fecha_registro: venta.fechaVenta || venta.created_at || "",
        concepto,
        metodo: venta.metodo_pago,
        monto,
        estado: "VALIDO",
        tipo: "Venta",
        origen: "venta",
        idOriginal: realId,
        usuario: cajeroUsername || "Cajero",
        comprobante: null,
        detalle: venta.observacion || null,
        tipo_transaccion: concepto,
      });
    });

    return list.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
  }, [pagos, ingresos, ventas, cajeroUsername]);

  return {
    ingresos,
    egresos,
    ingresosCombinados,
    loadingTransacciones,
    updatingId,
    loadTransacciones,
    createTransaccion,
    updateTransaccionEstado,
  };
};
