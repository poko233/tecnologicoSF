import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

import {
  actualizarFotoRRHH,
  actualizarUsuarioRRHH,
  getRolesRRHH,
  getUsuarioDetalleRRHH,
  getUsuariosRRHH,
  regenerarQrUsuarioRRHH,
} from "../services/recursosHumanos.service";
import {
  FotoUsuarioArchivo,
  RolRRHH,
  UsuarioFormRRHH,
  UsuarioRRHH,
} from "../types/recursosHumanos.types";

export function useRecursosHumanos() {
  const [usuarios, setUsuarios] = useState<UsuarioRRHH[]>([]);
  const [roles, setRoles] = useState<RolRRHH[]>([]);

  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const reemplazarUsuario = useCallback((actualizado: UsuarioRRHH) => {
    setUsuarios((prev) =>
      prev.map((usuario) =>
        usuario.id === actualizado.id ? actualizado : usuario,
      ),
    );
  }, []);

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getUsuariosRRHH();

      setUsuarios(data.usuarios || []);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error al cargar usuarios",
        text2: error?.message || "Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarRoles = useCallback(async () => {
    try {
      const data = await getRolesRRHH();

      setRoles(data.roles || []);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error al cargar roles",
        text2: error?.message || "No se pudieron cargar los roles.",
      });
    }
  }, []);

  const cargarDetalleUsuario = useCallback(async (id: number) => {
    try {
      setCargandoDetalle(true);

      const data = await getUsuarioDetalleRRHH(id);

      return data.usuario || null;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error al cargar detalle",
        text2: error?.message || "Intenta nuevamente.",
      });

      return null;
    } finally {
      setCargandoDetalle(false);
    }
  }, []);

  const guardarUsuario = useCallback(
    async (id: number, form: UsuarioFormRRHH) => {
      try {
        setGuardando(true);

        const data = await actualizarUsuarioRRHH(id, form);
        const actualizado = data.usuario;

        reemplazarUsuario(actualizado);

        Toast.show({
          type: "success",
          text1: "Usuario actualizado",
          text2: data.message || "Los datos se guardaron correctamente.",
        });

        return actualizado;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error al guardar usuario",
          text2: error?.message || "Revisa los datos ingresados.",
        });

        return null;
      } finally {
        setGuardando(false);
      }
    },
    [reemplazarUsuario],
  );

  const actualizarFotoUsuario = useCallback(
    async (id: number, archivo: FotoUsuarioArchivo) => {
      try {
        const data = await actualizarFotoRRHH(id, archivo);
        const actualizado = data.usuario;

        reemplazarUsuario(actualizado);

        return actualizado;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error al actualizar foto",
          text2: error?.message || "Intenta nuevamente.",
        });

        return null;
      }
    },
    [reemplazarUsuario],
  );

  const regenerarQrUsuario = useCallback(
    async (id: number) => {
      try {
        const data = await regenerarQrUsuarioRRHH(id);
        const actualizado = data.usuario;

        if (!actualizado) {
          throw new Error(
            "El servidor no devolvió el usuario con el nuevo QR.",
          );
        }

        reemplazarUsuario(actualizado);

        return actualizado;
      } catch (error: any) {
        console.error("Error al regenerar QR:", error);

        Toast.show({
          type: "error",
          text1: "No se pudo generar el QR",
          text2:
            error?.message ||
            "Ocurrió un error al generar el nuevo código QR.",
        });

        return null;
      }
    },
    [reemplazarUsuario],
  );

  useEffect(() => {
    void cargarUsuarios();
    void cargarRoles();
  }, [cargarUsuarios, cargarRoles]);

  return {
    usuarios,
    roles,

    loading,
    guardando,
    cargandoDetalle,

    cargarUsuarios,
    cargarRoles,
    cargarDetalleUsuario,

    guardarUsuario,
    actualizarFotoUsuario,
    regenerarQrUsuario,
  };
}