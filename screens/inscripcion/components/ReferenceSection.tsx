import { View } from "react-native";

import {
  InscripcionErrors,
  InscripcionFormData,
} from "../types/inscripcion.types";

import FormInput from "./FormInput";
import SectionTitle from "./SectionTitle";

type Props = {
  isMobile: boolean;

  form: InscripcionFormData;

  errors: InscripcionErrors;

  updateField: (
    field: keyof InscripcionFormData,
    value: string
  ) => void;
};

export default function ReferenceSection({
  isMobile,
  form,
  errors,
  updateField,
}: Props) {
  return (
    <>
      <SectionTitle
        title="CONTACTO DE REFERENCIA"
        danger
      />

      <View
        style={{
          flexDirection: isMobile
            ? "column"
            : "row",

          gap: 16,
        }}
      >
        <FormInput
          required
          label="NOMBRE COMPLETO"
          placeholder="Nombre del contacto"
          value={form.referenciaNombre}
          error={errors.referenciaNombre}
          maxLength={80}
          onChangeText={(text) =>
            updateField(
              "referenciaNombre",
              text
            )
          }
        />

        <FormInput
          required
          label="PARENTESCO"
          placeholder="Ej. Madre, Padre, Tío"
          value={form.referenciaParentesco}
          error={
            errors.referenciaParentesco
          }
          maxLength={40}
          onChangeText={(text) =>
            updateField(
              "referenciaParentesco",
              text
            )
          }
        />

        <FormInput
          required
          label="NÚMERO DE REFERENCIA"
          placeholder="71234567"
          value={form.referenciaNumero}
          error={errors.referenciaNumero}
          keyboardType="phone-pad"
          onlyNumbers
          maxLength={8}
          onChangeText={(text) =>
            updateField(
              "referenciaNumero",
              text
            )
          }
        />
      </View>
    </>
  );
}