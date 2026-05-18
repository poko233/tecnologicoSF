import { useState } from "react";
import Toast from "react-native-toast-message";
import { matriculaService } from "../services/matricula.service";

export const useGenerarMatricula = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generarMatricula = async (
    estudianteId: number,
    requierePago: boolean,
    monto: number,
    observacion: string,
    onSuccess: () => void,
  ) => {
    setIsLoading(true);
    try {
      const response = await matriculaService.generarMatricula(
        estudianteId,
        requierePago,
        monto,
        observacion,
      );
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Matrícula generada",
          text2: `Código: ${response.data.codigo_matricula}`,
        });
        onSuccess(); // refrescar detalle
      } else {
        throw new Error(response.message || "Error desconocido");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "No se pudo generar la matrícula",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { generarMatricula, isLoading };
};
