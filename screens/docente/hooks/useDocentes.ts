import { useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";

import { docenteService } from "../services/docenteService";
import { Docente, DocenteForm } from "../types/docente.types";

export type DocenteServerErrors = Partial<Record<keyof DocenteForm, string>>;

function getServerErrors(error: any): DocenteServerErrors {
  const serverErrors: DocenteServerErrors = {};

  const errors = error?.errors ?? error?.response?.data?.errors;
  const message = String(
    error?.message ?? error?.response?.data?.message ?? ""
  ).toLowerCase();

  if (errors?.ci?.[0]) {
    serverErrors.ci = "Este carnet ya está registrado.";
  }

  if (errors?.email?.[0]) {
    serverErrors.email = "Este correo ya está registrado.";
  }

  if (message.includes("ci") && message.includes("taken")) {
    serverErrors.ci = "Este carnet ya está registrado.";
  }

  if (message.includes("email") && message.includes("taken")) {
    serverErrors.email = "Este correo ya está registrado.";
  }

  return serverErrors;
}

export function useDocentes() {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDocente, setEditingDocente] = useState<Docente | null>(null);

  const [estadoLoadingId, setEstadoLoadingId] = useState<number | null>(null);
  const [serverErrors, setServerErrors] = useState<DocenteServerErrors>({});

  const docentesFiltrados = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) return docentes;

    return docentes.filter((docente) => {
      const usuario = docente.usuario;

      return (
        docente.profesion?.toLowerCase().includes(text) ||
        docente.abreviaturaProfesional?.toLowerCase().includes(text) ||
        usuario?.nombres?.toLowerCase().includes(text) ||
        usuario?.apellidoPaterno?.toLowerCase().includes(text) ||
        usuario?.apellidoMaterno?.toLowerCase().includes(text) ||
        usuario?.ci?.toLowerCase().includes(text)
      );
    });
  }, [docentes, search]);

  const cargarDocentes = async () => {
    try {
      setLoading(true);
      const response = await docenteService.listar();
      setDocentes(response.docentes ?? []);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los docentes",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDocentes();
  }, []);

  const abrirCrear = () => {
    setServerErrors({});
    setEditingDocente(null);
    setModalVisible(true);
  };

  const abrirEditar = (docente: Docente) => {
    setServerErrors({});
    setEditingDocente(docente);
    setModalVisible(true);
  };

  const clearServerError = (field: keyof DocenteForm) => {
    setServerErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const guardarDocente = async (data: DocenteForm) => {
    try {
      setSaving(true);
      setServerErrors({});

      if (editingDocente) {
        await docenteService.actualizar(editingDocente.idDocente, data);
        Toast.show({
          type: "success",
          text1: "Actualizado",
          text2: "Docente actualizado correctamente",
        });
      } else {
        await docenteService.crear(data);
        Toast.show({
          type: "success",
          text1: "Registrado",
          text2: "Docente registrado correctamente",
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
            : "Ocurrió un error al guardar el docente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const desactivarDocente = async (docente: Docente) => {
    try {
      setEstadoLoadingId(docente.idDocente);
      await docenteService.desactivar(docente.idDocente);
      await cargarDocentes();
    } finally {
      setEstadoLoadingId(null);
    }
  };

  const activarDocente = async (docente: Docente) => {
    try {
      setEstadoLoadingId(docente.idDocente);
      await docenteService.activar(docente.idDocente);
      await cargarDocentes();
    } finally {
      setEstadoLoadingId(null);
    }
  };

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

    abrirCrear,
    abrirEditar,
    guardarDocente,
    desactivarDocente,
    activarDocente,
    cargarDocentes,
  };
}