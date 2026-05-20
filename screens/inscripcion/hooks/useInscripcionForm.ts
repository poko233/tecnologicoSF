import { useState } from "react";

import {
  GrupoSeleccionado,
  InscripcionFormData,
} from "../types/inscripcion.types";

const initialForm: InscripcionFormData = {
  apellidoPaterno: "",
  apellidoMaterno: "",
  nombres: "",

  genero: "Masculino",

  carnet: "",

  expedidoEn: "Cochabamba",

  fechaNacimiento: "",

  direccion: "",

  celular: "",

  referenciaNombre: "",

  referenciaParentesco: "",

  referenciaNumero: "",

  gruposSeleccionados: [],
};

export function useInscripcionForm() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState<InscripcionFormData>(initialForm);

  const updateField = <K extends keyof InscripcionFormData>(
    field: K,
    value: InscripcionFormData[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const setGruposSeleccionados = (grupos: GrupoSeleccionado[]) => {
    setForm((prev) => ({
      ...prev,
      gruposSeleccionados: grupos,
    }));
  };

  const agregarGrupo = (grupo: GrupoSeleccionado) => {
    setForm((prev) => {
      const existe = prev.gruposSeleccionados.some(
        (g) => g.idGrupo === grupo.idGrupo
      );

      if (existe) {
        return prev;
      }

      return {
        ...prev,
        gruposSeleccionados: [
          ...prev.gruposSeleccionados,
          grupo,
        ],
      };
    });
  };

  const quitarGrupo = (idGrupo: number) => {
    setForm((prev) => ({
      ...prev,
      gruposSeleccionados: prev.gruposSeleccionados.filter(
        (grupo) => grupo.idGrupo !== idGrupo
      ),
    }));
  };

  const limpiarGrupos = () => {
    setForm((prev) => ({
      ...prev,
      gruposSeleccionados: [],
    }));
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const resetForm = () => {
    setForm(initialForm);
    setStep(1);
  };

  return {
    form,
    setForm,

    updateField,

    step,
    setStep,
    nextStep,
    prevStep,

    resetForm,

    setGruposSeleccionados,
    agregarGrupo,
    quitarGrupo,
    limpiarGrupos,
  };
}