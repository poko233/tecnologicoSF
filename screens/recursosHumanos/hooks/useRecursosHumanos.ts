import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

import {
    actualizarUsuarioRRHH,
    listarUsuariosRRHH,
} from "../services/recursosHumanos.service";
import {
    UsuarioRRHH,
    UsuarioRRHHForm,
} from "../types/recursosHumanos.types";

export function useRecursosHumanos() {
  const [usuarios, setUsuarios] = useState<UsuarioRRHH[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listarUsuariosRRHH();
      setUsuarios(data);
    } catch (error: any) {
      console.log("ERROR RRHH:", error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudieron cargar los usuarios.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const guardarUsuario = async (id: number, form: UsuarioRRHHForm) => {
    try {
      setGuardando(true);

      const actualizado = await actualizarUsuarioRRHH(id, form);

      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? actualizado : u)),
      );

      Toast.show({
        type: "success",
        text1: "Usuario actualizado",
        text2: "Los datos fueron guardados correctamente.",
      });

      return true;
    } catch (error: any) {
      console.log("ERROR GUARDAR RRHH:", error);

      Toast.show({
        type: "error",
        text1: "Error al guardar",
        text2: error?.message || "Revisa los datos e intenta nuevamente.",
      });

      return false;
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  return {
    usuarios,
    loading,
    guardando,
    cargarUsuarios,
    guardarUsuario,
  };
}