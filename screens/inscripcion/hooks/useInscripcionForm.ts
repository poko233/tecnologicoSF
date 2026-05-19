import { useState } from "react";

import { InscripcionFormData } from "../types/inscripcion.types";

export function useInscripcionForm() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState<InscripcionFormData>({
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
  });

  const updateField = (
    field: keyof InscripcionFormData,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };
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
};

const resetForm = () => {
  setForm(initialForm);
  setStep(1);
};
  return {
  form,
  updateField,
  step,
  setStep,
  nextStep,
  prevStep,
  resetForm,
  };
}