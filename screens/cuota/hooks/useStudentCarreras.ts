// hooks/useStudentCarreras.ts
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { cuotaService } from "../services/cuota.service";
import { CarreraInscrita } from "../types/cuota.types";

export const useStudentCarreras = (usuarioId: number | null) => {
  const [carreras, setCarreras] = useState<CarreraInscrita[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCarrera, setSelectedCarrera] =
    useState<CarreraInscrita | null>(null);

  const loadCarreras = async () => {
    if (!usuarioId) return;
    setLoading(true);
    try {
      const data = await cuotaService.getCarrerasByStudent(usuarioId);
      // Normalizar: convertir strings a números
      const normalized = data.map((carr: any) => ({
        ...carr,
        cuota_mensual:
          typeof carr.cuota_mensual === "string"
            ? parseFloat(carr.cuota_mensual)
            : carr.cuota_mensual,
        costo_matricula:
          typeof carr.costo_matricula === "string"
            ? parseFloat(carr.costo_matricula)
            : carr.costo_matricula,
        costo:
          typeof carr.costo === "string" ? parseFloat(carr.costo) : carr.costo,
        duracion:
          typeof carr.duracion === "string"
            ? parseInt(carr.duracion, 10)
            : carr.duracion,
        cuotas_por_anio:
          typeof carr.cuotas_por_anio === "string"
            ? parseInt(carr.cuotas_por_anio, 10)
            : carr.cuotas_por_anio,
      }));
      setCarreras(normalized);
      if (normalized.length > 0 && !selectedCarrera)
        setSelectedCarrera(normalized[0]);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar las carreras",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuarioId) loadCarreras();
  }, [usuarioId]);

  return {
    carreras,
    loading,
    selectedCarrera,
    setSelectedCarrera,
    loadCarreras,
  };
};
