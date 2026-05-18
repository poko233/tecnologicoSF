import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { planPagoService } from "../services/planPago.service";
import { CrearPlanPagoData, PlanPago } from "../types/planPago.types";

// Función auxiliar para normalizar un plan (convertir strings a numbers)
const normalizePlan = (plan: any): PlanPago => {
  return {
    ...plan,
    monto_cuota_normal:
      typeof plan.monto_cuota_normal === "string"
        ? parseFloat(plan.monto_cuota_normal)
        : plan.monto_cuota_normal,
    matricula_economica:
      typeof plan.matricula_economica === "string"
        ? parseFloat(plan.matricula_economica)
        : plan.matricula_economica,
    monto_cuota_promocion:
      typeof plan.monto_cuota_promocion === "string"
        ? parseFloat(plan.monto_cuota_promocion)
        : plan.monto_cuota_promocion,
    resumen: {
      total_cuotas: plan.resumen?.total_cuotas || 0,
      cuotas_pagadas: plan.resumen?.cuotas_pagadas || 0,
      monto_total:
        typeof plan.resumen?.monto_total === "string"
          ? parseFloat(plan.resumen.monto_total)
          : plan.resumen?.monto_total || 0,
      monto_pagado:
        typeof plan.resumen?.monto_pagado === "string"
          ? parseFloat(plan.resumen.monto_pagado)
          : plan.resumen?.monto_pagado || 0,
      porcentaje_pagado: plan.resumen?.porcentaje_pagado || 0,
    },
    cuotas: (plan.cuotas || []).map((cuota: any) => ({
      ...cuota,
      monto:
        typeof cuota.monto === "string" ? parseFloat(cuota.monto) : cuota.monto,
    })),
  };
};

export const usePlanPagos = (usuarioId: number | null) => {
  const [planes, setPlanes] = useState<PlanPago[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanPago | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [crearModalVisible, setCrearModalVisible] = useState(false);

  const cargarPlanes = useCallback(async () => {
    if (!usuarioId) return;
    setLoading(true);
    try {
      const response = await planPagoService.listarPorEstudiante(usuarioId);
      const planesData = response?.data || [];
      const normalized = planesData.map(normalizePlan);
      setPlanes(normalized);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los planes de pago",
      });
      setPlanes([]);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    if (usuarioId) {
      cargarPlanes();
    }
  }, [usuarioId, cargarPlanes]);

  const crearPlan = async (data: CrearPlanPagoData) => {
    try {
      const response = await planPagoService.crear(data);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Éxito",
          text2: response.message,
        });
        setCrearModalVisible(false);
        await cargarPlanes();
        // Si el plan creado viene en la respuesta, normalizarlo y seleccionarlo
        if (response.data) {
          const nuevoPlanNormalizado = normalizePlan(response.data);
          setSelectedPlan(nuevoPlanNormalizado);
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "No se pudo crear el plan",
      });
    }
  };

  const eliminarPlan = async (planId: number) => {
    try {
      const response = await planPagoService.eliminar(planId);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Eliminado",
          text2: response.message,
        });
        if (selectedPlan?.id === planId) setSelectedPlan(null);
        await cargarPlanes();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "No se pudo eliminar el plan",
      });
    }
  };

  return {
    planes,
    loading,
    selectedPlan,
    setSelectedPlan,
    modalVisible,
    setModalVisible,
    crearModalVisible,
    setCrearModalVisible,
    cargarPlanes,
    crearPlan,
    eliminarPlan,
  };
};
