import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Toast from "react-native-toast-message";

import { docenteService } from "../services/docenteService";
import {
  AsignarUsuarioExistentePayload,
  Docente,
  DocenteForm,
  PaginacionUsuarios,
  UsuarioDisponibleDocente,
} from "../types/docente.types";

export type DocenteServerErrors = Partial<
  Record<keyof DocenteForm, string>
>;

const paginacionInicial: PaginacionUsuarios = {
  paginaActual: 1,
  ultimaPagina: 1,
  porPagina: 10,
  total: 0,
  desde: 0,
  hasta: 0,
};

function normalizarTexto(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function compararTexto(a: unknown, b: unknown) {
  return String(a ?? "").localeCompare(String(b ?? ""), "es", {
    sensitivity: "base",
    numeric: true,
  });
}

function ordenarDocentesPorApellido(docentes: Docente[]) {
  return [...docentes].sort((a, b) => {
    const usuarioA = a.usuario;
    const usuarioB = b.usuario;

    const porApellidoPaterno = compararTexto(
      usuarioA?.apellidoPaterno,
      usuarioB?.apellidoPaterno,
    );

    if (porApellidoPaterno !== 0) {
      return porApellidoPaterno;
    }

    const porApellidoMaterno = compararTexto(
      usuarioA?.apellidoMaterno,
      usuarioB?.apellidoMaterno,
    );

    if (porApellidoMaterno !== 0) {
      return porApellidoMaterno;
    }

    const porNombres = compararTexto(
      usuarioA?.nombres,
      usuarioB?.nombres,
    );

    if (porNombres !== 0) {
      return porNombres;
    }

    return a.idDocente - b.idDocente;
  });
}

function getServerErrors(error: any): DocenteServerErrors {
  const serverErrors: DocenteServerErrors = {};

  const errors = error?.errors ?? error?.response?.data?.errors;

  const message = String(
    error?.message ?? error?.response?.data?.message ?? "",
  ).toLowerCase();

  /*
   * El correo no se controla en el formulario:
   * no se valida, no se marca y no impide guardar.
   * Solo se mantiene el control de carnet duplicado.
   */
  if (errors?.ci?.[0]) {
    serverErrors.ci = "Este carnet ya está registrado.";
  }

  if (
    message.includes("ci") &&
    (
      message.includes("taken") ||
      message.includes("duplicate") ||
      message.includes("unique")
    )
  ) {
    serverErrors.ci = "Este carnet ya está registrado.";
  }

  return serverErrors;
}

function getErrorMessage(error: any) {
  return (
    error?.message ??
    error?.response?.data?.message ??
    "Ocurrió un error al completar la operación."
  );
}

export function useDocentes() {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [editingDocente, setEditingDocente] =
    useState<Docente | null>(null);

  const [estadoLoadingId, setEstadoLoadingId] =
    useState<number | null>(null);

  const [serverErrors, setServerErrors] =
    useState<DocenteServerErrors>({});

  const [usuariosDisponibles, setUsuariosDisponibles] = useState<
    UsuarioDisponibleDocente[]
  >([]);

  const [paginacionUsuarios, setPaginacionUsuarios] =
    useState<PaginacionUsuarios>(paginacionInicial);

  const [cargandoUsuariosDisponibles, setCargandoUsuariosDisponibles] =
    useState(false);

  const [mensajeUsuarioExistente, setMensajeUsuarioExistente] =
    useState<string | null>(null);

  const cargarDocentes = useCallback(async () => {
    try {
      setLoading(true);

      const response = await docenteService.listar();

      setDocentes(
        ordenarDocentesPorApellido(response.docentes ?? []),
      );
    } catch {
      setDocentes([]);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los docentes.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarDocentes();
  }, [cargarDocentes]);

  const docentesFiltrados = useMemo(() => {
    const text = normalizarTexto(search);

    if (!text) {
      return docentes;
    }

    return docentes.filter((docente) => {
      const usuario = docente.usuario;

      const contenido = normalizarTexto(
        [
          docente.profesion,
          docente.abreviaturaProfesional,
          usuario?.nombres,
          usuario?.apellidoPaterno,
          usuario?.apellidoMaterno,
          usuario?.ci,
          usuario?.email,
        ].join(" "),
      );

      return contenido.includes(text);
    });
  }, [docentes, search]);

  const abrirCrear = useCallback(() => {
    setServerErrors({});
    setEditingDocente(null);
    setModalVisible(true);
  }, []);

  const abrirEditar = useCallback((docente: Docente) => {
    setServerErrors({});
    setEditingDocente(docente);
    setModalVisible(true);
  }, []);

  const clearServerError = useCallback(
    (field: keyof DocenteForm) => {
      setServerErrors((previous) => {
        const copy = { ...previous };

        delete copy[field];

        return copy;
      });
    },
    [],
  );

  const guardarDocente = useCallback(
    async (data: DocenteForm) => {
      try {
        setSaving(true);
        setServerErrors({});

        if (editingDocente) {
          await docenteService.actualizar(
            editingDocente.idDocente,
            data,
          );

          Toast.show({
            type: "success",
            text1: "Actualizado",
            text2: "Docente actualizado correctamente.",
          });
        } else {
          await docenteService.crear(data);

          Toast.show({
            type: "success",
            text1: "Registrado",
            text2: "Docente registrado correctamente.",
          });
        }

        setModalVisible(false);
        setEditingDocente(null);

        await cargarDocentes();
      } catch (error) {
        const parsedErrors = getServerErrors(error);

        setServerErrors(parsedErrors);

        Toast.show({
          type: "error",
          text1: "No se pudo guardar",
          text2:
            Object.keys(parsedErrors).length > 0
              ? "Revisa los campos marcados en rojo."
              : getErrorMessage(error),
        });
      } finally {
        setSaving(false);
      }
    },
    [cargarDocentes, editingDocente],
  );

  const desactivarDocente = useCallback(
    async (docente: Docente) => {
      try {
        setEstadoLoadingId(docente.idDocente);

        await docenteService.desactivar(docente.idDocente);
        await cargarDocentes();

        Toast.show({
          type: "success",
          text1: "Docente desactivado",
          text2: "El docente fue desactivado correctamente.",
        });
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "No se pudo desactivar",
          text2: getErrorMessage(error),
        });
      } finally {
        setEstadoLoadingId(null);
      }
    },
    [cargarDocentes],
  );

  const activarDocente = useCallback(
    async (docente: Docente) => {
      try {
        setEstadoLoadingId(docente.idDocente);

        await docenteService.activar(docente.idDocente);
        await cargarDocentes();

        Toast.show({
          type: "success",
          text1: "Docente activado",
          text2: "El docente fue activado correctamente.",
        });
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "No se pudo activar",
          text2: getErrorMessage(error),
        });
      } finally {
        setEstadoLoadingId(null);
      }
    },
    [cargarDocentes],
  );

  const cargarUsuariosDisponibles = useCallback(
    async (buscar = "", pagina = 1): Promise<void> => {
      try {
        setCargandoUsuariosDisponibles(true);

        const response =
          await docenteService.listarUsuariosDisponibles(
            buscar,
            pagina,
          );

        setUsuariosDisponibles(response.usuarios ?? []);
        setPaginacionUsuarios(
          response.paginacion ?? paginacionInicial,
        );
      } catch (error) {
        setUsuariosDisponibles([]);
        setPaginacionUsuarios(paginacionInicial);

        Toast.show({
          type: "error",
          text1: "No se pudieron buscar usuarios",
          text2: getErrorMessage(error),
        });
      } finally {
        setCargandoUsuariosDisponibles(false);
      }
    },
    [],
  );

  const limpiarMensajeUsuarioExistente = useCallback(() => {
    setMensajeUsuarioExistente(null);
  }, []);

  const asignarUsuarioExistente = useCallback(
    async (
      payload: AsignarUsuarioExistentePayload,
    ): Promise<boolean> => {
      try {
        setSaving(true);
        setMensajeUsuarioExistente(null);

        await docenteService.asignarUsuarioExistente(payload);

        await cargarDocentes();
        await cargarUsuariosDisponibles("", 1);

        Toast.show({
          type: "success",
          text1: "Docente asignado",
          text2:
            "El usuario fue registrado correctamente como docente.",
        });

        return true;
      } catch (error) {
        const message = getErrorMessage(error);

        setMensajeUsuarioExistente(message);

        Toast.show({
          type: "error",
          text1: "No se pudo asignar el docente",
          text2: message,
        });

        return false;
      } finally {
        setSaving(false);
      }
    },
    [cargarDocentes, cargarUsuariosDisponibles],
  );

  return {
    docentes,
    docentesFiltrados,
    loading,
    saving,
    estadoLoadingId,

    search,
    setSearch,

    modalVisible,
    setModalVisible,

    editingDocente,
    serverErrors,
    clearServerError,

    usuariosDisponibles,
    paginacionUsuarios,
    cargandoUsuariosDisponibles,
    mensajeUsuarioExistente,

    abrirCrear,
    abrirEditar,
    guardarDocente,
    desactivarDocente,
    activarDocente,
    cargarDocentes,

    cargarUsuariosDisponibles,
    asignarUsuarioExistente,
    limpiarMensajeUsuarioExistente,
  };
}